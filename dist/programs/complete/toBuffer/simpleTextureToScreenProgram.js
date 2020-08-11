import { VertexShader } from "./../../../vertexShader.js";
import { FragmentShader } from './../../../fragmentShader.js';
import { PostProcProgram } from "../../postProcProgram.js";
//
// Assume texture is same size as screen
//
export class SimpleTextureToScreenProgram extends PostProcProgram {
    constructor(glCtx, frameBufferInfo) {
        super(glCtx, new VertexShader(glCtx, SimpleTextureToScreenProgram.vertexShaderSource), new FragmentShader(glCtx, SimpleTextureToScreenProgram.fragmentShaderSource), frameBufferInfo);
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aTextureCoords");
        this.createUniform("uTexInput");
        const vao = this.glCtx.createVertexArray();
        this.glCtx.bindVertexArray(vao);
        // Vertices
        const vertexBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, vertexBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array([-1, 1, 1, 1, 1, -1, -1, -1]), this.glCtx.STATIC_DRAW);
        const vertexPosition = this.attributes.get("aVertexPosition");
        this.glCtx.enableVertexAttribArray(vertexPosition);
        this.glCtx.vertexAttribPointer(vertexPosition, 2, this.glCtx.FLOAT, false, 0, 0);
        // Textures
        const textureBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, textureBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 1, 0, 0, 0]), this.glCtx.STATIC_DRAW);
        const textureCoords = this.attributes.get("aTextureCoords");
        this.glCtx.enableVertexAttribArray(textureCoords);
        this.glCtx.vertexAttribPointer(textureCoords, 2, this.glCtx.FLOAT, false, 0, 0);
        // Indices
        const ibo = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, ibo);
        this.glCtx.bufferData(this.glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 3, 2, 0, 2, 1]), this.glCtx.STATIC_DRAW);
        this.glVertexArrayObject = vao;
        this.glIndexBufferObject = ibo;
        // Unbind
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
    execute() {
        this.glCtx.useProgram(this.glProgram);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.frameBufferInfo.glTextures[0]);
        this.glCtx.uniform1i(this.uniforms.get("uTexInput"), 0);
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Draw geometry
        this.glCtx.drawElements(this.glCtx.TRIANGLES, 6, this.glCtx.UNSIGNED_SHORT, 0);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
        // Unbind buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
SimpleTextureToScreenProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec4 aVertexPosition;
    in vec2 aTextureCoords;

    out vec2 vTextureCoords;

    void main(void) {
      vTextureCoords = aTextureCoords;
      gl_Position = aVertexPosition;
    }`;
SimpleTextureToScreenProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform sampler2D uTexInput;

    in vec2 vTextureCoords;

    out vec4 fragColor;

    void main(void) {
      fragColor = texture(uTexInput, vTextureCoords);
    }`;
//# sourceMappingURL=simpleTextureToScreenProgram.js.map