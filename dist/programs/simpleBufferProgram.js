import { VertexShader } from "../vertexShader.js";
import { FragmentShader } from '../fragmentShader.js';
import { Program } from "./program.js";
//
// Same as SimpleProgram, but outputs to framebuffer. Framebuffer
// must contain two textures.
//
export class SimpleBufferProgram extends Program {
    constructor(glCtx, glFramebuffer, geometry, colour, isBloom) {
        super(glCtx, new VertexShader(glCtx, SimpleBufferProgram.vertexShaderSource), new FragmentShader(glCtx, SimpleBufferProgram.fragmentShaderSource));
        this.glFramebuffer = glFramebuffer;
        this.geometry = geometry;
        this.colour = colour;
        this.isBloom = isBloom;
        this.bindBuffers();
    }
    bindBuffers() {
        this.attributes.set("aVertexPosition", this.glCtx.getAttribLocation(this.glProgram, "aVertexPosition"));
        this.uniforms.set("uMvpMatrix", this.glCtx.getUniformLocation(this.glProgram, "uMvpMatrix"));
        this.uniforms.set("uColor", this.glCtx.getUniformLocation(this.glProgram, "uColor"));
        this.uniforms.set("uIsBloom", this.glCtx.getUniformLocation(this.glProgram, "uIsBloom"));
        const vao = this.glCtx.createVertexArray();
        this.glCtx.bindVertexArray(vao);
        const vertexBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, vertexBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.vertexArray), this.glCtx.STATIC_DRAW);
        const aVertexPosition = this.attributes.get("aVertexPosition");
        this.glCtx.enableVertexAttribArray(aVertexPosition);
        this.glCtx.vertexAttribPointer(aVertexPosition, 3, this.glCtx.FLOAT, false, 0, 0);
        const ibo = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, ibo);
        this.glCtx.bufferData(this.glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indexArray), this.glCtx.STATIC_DRAW);
        this.glVertexArrayObject = vao;
        this.glIndexBufferObject = ibo;
        // Clean
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
    execute(modelViewProjectionMatrix, modelMatrix, lighting, camera, drawMode) {
        this.glCtx.useProgram(this.glProgram);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniform4fv(this.uniforms.get("uColor"), new Float32Array(this.colour));
        this.glCtx.uniform1i(this.uniforms.get("uIsBloom"), this.isBloom ? 1 : 0);
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Bind to framebuffer to cause off-screen rendering
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, this.glFramebuffer);
        // Tell WebGL we want to draw to 2 textures to a framebuffer
        this.glCtx.drawBuffers([
            this.glCtx.COLOR_ATTACHMENT0,
            this.glCtx.COLOR_ATTACHMENT1
        ]);
        // Draw geometry
        this.glCtx.drawElements(drawMode, this.geometry.indexArray.length, this.glCtx.UNSIGNED_SHORT, 0);
        // Unbind buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
    }
}
SimpleBufferProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMvpMatrix;

    in vec4 aVertexPosition;

    void main(void) {
      gl_Position = uMvpMatrix * aVertexPosition;
    }`;
SimpleBufferProgram.fragmentShaderSource = `#version 300 es
  precision mediump float;

  uniform bool uIsBloom;
  uniform vec4 uColor;

  layout (location = 0) out vec4 fragColor0;
  layout (location = 1) out vec4 fragColor1;

  void main(void) {
//    fragColor0 = uIsBloom ? vec4(0.0, 0.0, 0.0, 1.0) : uColor;
    fragColor0 = uColor;
    fragColor1 = uIsBloom ? uColor :  vec4(0.0, 0.0, 0.0, 1.0);
  }`;
//# sourceMappingURL=simpleBufferProgram.js.map