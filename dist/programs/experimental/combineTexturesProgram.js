import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { ProgramOld } from "../programOld.js";
export class CombineTexturesProgram extends ProgramOld {
    constructor(glCtx, glTexture0, glTexture1) {
        super(glCtx, new VertexShader(glCtx, CombineTexturesProgram.vertexShaderSource), new FragmentShader(glCtx, CombineTexturesProgram.fragmentShaderSource));
        this.glTexture0 = glTexture0;
        this.glTexture1 = glTexture1;
        this.bindBuffers();
    }
    bindBuffers() {
        this.attributes.set("aVertexPosition", this.glCtx.getAttribLocation(this.glProgram, "aVertexPosition"));
        this.attributes.set("aVertexTextureCoords", this.glCtx.getAttribLocation(this.glProgram, "aVertexTextureCoords"));
        this.uniforms.set("uSampler0", this.glCtx.getUniformLocation(this.glProgram, "uSampler0"));
        this.uniforms.set("uSampler1", this.glCtx.getUniformLocation(this.glProgram, "uSampler1"));
        this.uniforms.set("uTextureSize", this.glCtx.getUniformLocation(this.glProgram, "uTextureSize"));
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
    execute(camera, lighting, material, matrix, worldMatrix, drawMode) {
        this.glCtx.useProgram(this.glProgram);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexture0);
        this.glCtx.uniform1i(this.uniforms.get("uSampler0"), 0);
        this.glCtx.activeTexture(this.glCtx.TEXTURE1);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexture1);
        this.glCtx.uniform1i(this.uniforms.get("uSampler1"), 1);
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Draw geometry
        this.glCtx.drawElements(drawMode, 6, this.glCtx.UNSIGNED_SHORT, 0);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
        this.glCtx.activeTexture(this.glCtx.TEXTURE1);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
        // Clean buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
CombineTexturesProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec4 aVertexPosition;
    in vec2 aVertexTextureCoords;

    out vec2 vTextureCoords;

    void main(void) {
      vTextureCoords = aVertexTextureCoords;
      gl_Position = aVertexPosition;
    }`;
CombineTexturesProgram.fragmentShaderSource = `#version 300 es
  precision mediump float;

  uniform sampler2D uSampler0;
  uniform sampler2D uSampler1;

  in vec2 vTextureCoords;

  out vec4 fragColor;

  void main(void) {
    vec4 colour0 = texture(uSampler0, vTextureCoords);
    vec4 colour1 = texture(uSampler1, vTextureCoords);

    fragColor = colour0 + colour1;
//    fragColor = colour0;
  }`;
//# sourceMappingURL=combineTexturesProgram.js.map