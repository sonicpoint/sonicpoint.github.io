import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { ProgramOld } from "../programOld.js";
//
// Simple program to render a 3D texture
//
export class SimpleTextureProgram3D extends ProgramOld {
    constructor(glCtx, geometry, image) {
        super(glCtx, new VertexShader(glCtx, SimpleTextureProgram3D.vertexShaderSource), new FragmentShader(glCtx, SimpleTextureProgram3D.fragmentShaderSource));
        this.geometry = geometry;
        this.image = image;
        this.glTexture = this.glCtx.createTexture();
        this.bindBuffers();
    }
    bindBuffers() {
        this.attributes.set("aVertexPosition", this.glCtx.getAttribLocation(this.glProgram, "aVertexPosition"));
        this.attributes.set("aVertexTextureCoords", this.glCtx.getAttribLocation(this.glProgram, "aVertexTextureCoords"));
        this.uniforms.set("uMatrix", this.glCtx.getUniformLocation(this.glProgram, "uMatrix"));
        this.uniforms.set("uWorld", this.glCtx.getUniformLocation(this.glProgram, "uWorld"));
        this.uniforms.set("uSampler", this.glCtx.getUniformLocation(this.glProgram, "uSampler"));
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexture);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, this.image);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
        const vao = this.glCtx.createVertexArray();
        this.glCtx.bindVertexArray(vao);
        const vertexBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, vertexBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.vertexArray), this.glCtx.STATIC_DRAW);
        const aVertexPosition = this.attributes.get("aVertexPosition");
        this.glCtx.enableVertexAttribArray(aVertexPosition);
        this.glCtx.vertexAttribPointer(aVertexPosition, 3, this.glCtx.FLOAT, false, 0, 0);
        // Textures
        const textureBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, textureBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.textureArray), this.glCtx.STATIC_DRAW);
        const aVertexTextureCoords = this.attributes.get("aVertexTextureCoords");
        this.glCtx.enableVertexAttribArray(aVertexTextureCoords);
        this.glCtx.vertexAttribPointer(aVertexTextureCoords, 3, this.glCtx.FLOAT, false, 0, 0);
        // Indices
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
    //
    // World matrix will affect the normals (doesn't include projection or camera view)
    //
    execute(camera, lighting, material, matrix, worldMatrix, drawMode) {
        this.glCtx.useProgram(this.glProgram);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMatrix"), false, matrix);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexture);
        this.glCtx.uniform1i(this.uniforms.get("uSampler"), 0);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uWorld"), false, worldMatrix);
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Draw geometry
        this.glCtx.drawElements(drawMode, this.geometry.indexArray.length, this.glCtx.UNSIGNED_SHORT, 0);
        // Unbind buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
SimpleTextureProgram3D.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMatrix;
    uniform mat4 uWorld;

    in vec4 aVertexPosition;
    in vec3 aVertexTextureCoords;

    out vec3 vTextureCoords;

    void main(void) {
      vTextureCoords = aVertexTextureCoords;
      gl_Position = uMatrix * aVertexPosition;
    }`;
SimpleTextureProgram3D.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform sampler2D uSampler;

    in vec3 vTextureCoords;

    out vec4 fragColor;

    void main(void) {
      fragColor = textureProj(uSampler, vTextureCoords);
    }`;
//# sourceMappingURL=simpleTextureProgram3D.js.map