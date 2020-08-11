import { VertexShader } from "./../../vertexShader.js";
import { FragmentShader } from './../../fragmentShader.js';
import { Program } from "./../program.js";
import * as mat4 from "./../../utils/gl-matrix/mat4.js";
export class SimpleToBufferProgram extends Program {
    constructor(glCtx, geometry, glFramebuffer, colour) {
        super(glCtx, new VertexShader(glCtx, SimpleToBufferProgram.vertexShaderSource), new FragmentShader(glCtx, SimpleToBufferProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.glFramebuffer = glFramebuffer;
        this.colour = colour;
        this.colour = colour || [1, 1, 1, 1];
        this.bindBuffers();
    }
    bindBuffers() {
        this.attributes.set("aVertexPosition", this.glCtx.getAttribLocation(this.glProgram, "aVertexPosition"));
        this.uniforms.set("uMvpMatrix", this.glCtx.getUniformLocation(this.glProgram, "uMvpMatrix"));
        this.uniforms.set("uColor", this.glCtx.getUniformLocation(this.glProgram, "uColor"));
        const vao = this.glCtx.createVertexArray();
        this.glCtx.bindVertexArray(vao);
        // Vertices
        const vertexBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, vertexBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.vertexArray), this.glCtx.STATIC_DRAW);
        const aVertexPosition = this.attributes.get("aVertexPosition");
        this.glCtx.enableVertexAttribArray(aVertexPosition);
        this.glCtx.vertexAttribPointer(aVertexPosition, 3, this.glCtx.FLOAT, false, 0, 0);
        // Indices
        const ibo = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, ibo);
        this.glCtx.bufferData(this.glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indexArray), this.glCtx.STATIC_DRAW);
        this.glVertexArrayObject = vao;
        this.glIndexBufferObject = ibo;
        // Unbind
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
    execute(viewMatrix, modelMatrix, lighting, camera, drawMode) {
        this.glCtx.useProgram(this.glProgram);
        const modelViewProjectionMatrix = [];
        mat4.multiply(modelViewProjectionMatrix, camera.projectionMatrix, viewMatrix);
        mat4.multiply(modelViewProjectionMatrix, modelViewProjectionMatrix, modelMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniform4fv(this.uniforms.get("uColor"), new Float32Array(this.colour));
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Bind to framebuffer to cause off-screen rendering
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, this.glFramebuffer);
        // // Tell WebGL we want to draw to 2 textures to a framebuffer
        // this.glCtx.drawBuffers([
        //   this.glCtx.COLOR_ATTACHMENT0,
        //   this.glCtx.COLOR_ATTACHMENT1
        // ]);
        // Draw geometry
        this.glCtx.drawElements(drawMode, this.geometry.indexArray.length, this.glCtx.UNSIGNED_SHORT, 0);
        // Unbind buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
    }
}
SimpleToBufferProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 lightSpaceMatrix;
    uniform mat4 model;

    in vec3 aPos;

    void main()
    {
        gl_Position = lightSpaceMatrix * model * vec4(aPos, 1.0);
    }`;
SimpleToBufferProgram.fragmentShaderSource = `#version 300 es
  precision mediump float;

  void main(void) {
  }`;
//# sourceMappingURL=shadowMapProgram.js.map