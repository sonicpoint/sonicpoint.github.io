import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { ProgramOld } from "../programOld.js";
export class BlurProgram extends ProgramOld {
    constructor(glCtx, glTextureInput, glTextureOutput, glFramebuffer, isVerticalBloom) {
        super(glCtx, new VertexShader(glCtx, BlurProgram.vertexShaderSource), new FragmentShader(glCtx, BlurProgram.fragmentShaderSource));
        this.glTextureInput = glTextureInput;
        this.glTextureOutput = glTextureOutput;
        this.glFramebuffer = glFramebuffer;
        this.isVerticalBloom = isVerticalBloom;
        this.bindBuffers();
    }
    bindBuffers() {
        this.attributes.set("aVertexPosition", this.glCtx.getAttribLocation(this.glProgram, "aVertexPosition"));
        this.attributes.set("aVertexTextureCoords", this.glCtx.getAttribLocation(this.glProgram, "aVertexTextureCoords"));
        this.uniforms.set("uImage", this.glCtx.getUniformLocation(this.glProgram, "uImage"));
        this.uniforms.set("uTextureSize", this.glCtx.getUniformLocation(this.glProgram, "uTextureSize"));
        this.uniforms.set("uIsHorizontal", this.glCtx.getUniformLocation(this.glProgram, "uIsHorizontal"));
        this.uniforms.set("uWeightMatrix", this.glCtx.getUniformLocation(this.glProgram, "uWeightMatrix[0]"));
        // Create framebuffer and texture to render to
        // const frameBufferInfo = this.createFramebuffer(this.glCtx.canvas.width, this.glCtx.canvas.height);
        // this.glFramebuffer = frameBufferInfo.framebuffer;
        // this.glTextureOutput = frameBufferInfo.texture;
        const vao = this.glCtx.createVertexArray();
        this.glCtx.bindVertexArray(vao);
        const vertexBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, vertexBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, 1, -1, -1, -1]), this.glCtx.STATIC_DRAW);
        const aVertexPosition = this.attributes.get("aVertexPosition");
        this.glCtx.enableVertexAttribArray(aVertexPosition);
        this.glCtx.vertexAttribPointer(aVertexPosition, 2, this.glCtx.FLOAT, false, 0, 0);
        // Textures
        const textureBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, textureBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), this.glCtx.STATIC_DRAW);
        const aVertexTextureCoords = this.attributes.get("aVertexTextureCoords");
        this.glCtx.enableVertexAttribArray(aVertexTextureCoords);
        this.glCtx.vertexAttribPointer(aVertexTextureCoords, 2, this.glCtx.FLOAT, false, 0, 0);
        // Indices
        const ibo = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, ibo);
        this.glCtx.bufferData(this.glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 3, 2, 0, 2, 1]), this.glCtx.STATIC_DRAW);
        this.glVertexArrayObject = vao;
        this.glIndexBufferObject = ibo;
        // Clean
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
    executeBlur(glTextureInput, glFramebuffer, drawMode) {
        this.glTextureInput = glTextureInput;
        this.glFramebuffer = glFramebuffer;
        this.execute(null, null, null, [], [], drawMode);
    }
    execute(camera, lighting, material, matrix, worldMatrix, drawMode) {
        this.glCtx.useProgram(this.glProgram);
        this.glCtx.uniform1i(this.uniforms.get("uImage"), 0);
        this.glCtx.uniform1i(this.uniforms.get("uIsHorizontal"), this.isVerticalBloom ? 0 : 1);
        this.glCtx.uniform2f(this.uniforms.get("uTextureSize"), this.glCtx.canvas.width, this.glCtx.canvas.height);
        const uWeightMatrix = [
            0.03, 0.07, 0.11098164, 0.25, 0.11098164, 0.07, 0.03
            //      1, 1, 1, 1, 1, 1, 1
        ];
        let weight = uWeightMatrix.reduce((prev, curr) => prev + curr);
        weight = weight <= 0 ? 1 : weight;
        this.glCtx.uniform1fv(this.uniforms.get("uWeightMatrix"), uWeightMatrix);
        // Bind to framebuffer to cause off-screen rendering
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, this.glFramebuffer);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTextureInput);
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Draw geometry
        this.glCtx.drawElements(drawMode, 6, this.glCtx.UNSIGNED_SHORT, 0);
        //    this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTextureOutput);
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
        // Clean buffers
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
BlurProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec4 aVertexPosition;
    in vec2 aVertexTextureCoords;

    out vec2 vTexCoords;

    void main(void) {
      vTexCoords = aVertexTextureCoords;
      gl_Position = aVertexPosition;
    }`;
BlurProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform sampler2D uImage;
    uniform vec2 uTextureSize;
    uniform bool uIsHorizontal;
    uniform float uWeightMatrix[7];

    in vec2 vTexCoords;

    out vec4 fragColor;

    void main() {
      vec2 texOffset = vec2(1.0, 1.0) / uTextureSize; // gets size of single texel
      vec4 result = vec4(0.0, 0.0, 0.0, 0.0); //texture(uImage, vTexCoords).rgb * uWeightMatrix[3];

      if(uIsHorizontal) {
        result +=
          texture(uImage, vTexCoords + vec2(texOffset.x * -6.0, 0.0)).rgba * uWeightMatrix[0] +
          texture(uImage, vTexCoords + vec2(texOffset.x * -4.0, 0.0)).rgba * uWeightMatrix[1] +
          texture(uImage, vTexCoords + vec2(texOffset.x * -2.0, 0.0)).rgba * uWeightMatrix[2] +
          texture(uImage, vTexCoords).rgba * uWeightMatrix[3] +
          texture(uImage, vTexCoords + vec2(texOffset.x * 2.0, 0.0)).rgba * uWeightMatrix[4] +
          texture(uImage, vTexCoords + vec2(texOffset.x * 4.0, 0.0)).rgba * uWeightMatrix[5];// +
          texture(uImage, vTexCoords + vec2(texOffset.x * 6.0, 0.0)).rgba * uWeightMatrix[6];
      } else {
        result +=
          texture(uImage, vTexCoords + vec2(0.0, texOffset.x * -6.0)).rgba * uWeightMatrix[0] +
          texture(uImage, vTexCoords + vec2(0.0, texOffset.x * -4.0)).rgba * uWeightMatrix[1] +
          texture(uImage, vTexCoords + vec2(0.0, texOffset.x * -2.0)).rgba * uWeightMatrix[2] +
          texture(uImage, vTexCoords).rgba * uWeightMatrix[3] +
          texture(uImage, vTexCoords + vec2(0.0, texOffset.x * 6.0)).rgba * uWeightMatrix[4] +
          texture(uImage, vTexCoords + vec2(0.0, texOffset.x * 4.0)).rgba * uWeightMatrix[5];// +
          texture(uImage, vTexCoords + vec2(0.0, texOffset.x * 2.0)).rgba * uWeightMatrix[6];
      }

//      fragColor = texture(uImage, vTexCoords);
        fragColor = result / 0.56;
//        fragColor = vec4(texture(uImage, vTexCoords).rgb, result.a / 0.54);
    }`;
//# sourceMappingURL=blurProgram.js.map