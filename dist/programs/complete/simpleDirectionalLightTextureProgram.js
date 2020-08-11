import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
//
// Simple program to render a geometry with a texture, lit with Gouraud/Lambert lighting
//
export class SimpleDirectionalLightTextureProgram extends Program {
    constructor(glCtx, geometry, material) {
        super(glCtx, new VertexShader(glCtx, SimpleDirectionalLightTextureProgram.vertexShaderSource), new FragmentShader(glCtx, SimpleDirectionalLightTextureProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.material = material;
        this.glTexture = this.glCtx.createTexture();
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexNormal");
        this.createAttribute("aTextureCoords");
        this.createUniform("uMvpMatrix");
        this.createUniform("uNormalMatrix");
        this.createUniform("uLightDirection");
        this.createUniform("uLightDiffuse");
        this.createUniform("uTexDiffuse");
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexture);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, this.material.texture);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
        const vao = this.glCtx.createVertexArray();
        this.glCtx.bindVertexArray(vao);
        // Vertices
        const vertexBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, vertexBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.vertexArray), this.glCtx.STATIC_DRAW);
        const aVertexPosition = this.attributes.get("aVertexPosition");
        this.glCtx.enableVertexAttribArray(aVertexPosition);
        this.glCtx.vertexAttribPointer(aVertexPosition, 3, this.glCtx.FLOAT, false, 0, 0);
        // Normals
        const normalBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, normalBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.normalArray), this.glCtx.STATIC_DRAW);
        const aNormal = this.attributes.get("aVertexNormal");
        this.glCtx.enableVertexAttribArray(aNormal);
        this.glCtx.vertexAttribPointer(aNormal, 3, this.glCtx.FLOAT, false, 0, 0);
        // Textures
        const textureBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, textureBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.textureArray), this.glCtx.STATIC_DRAW);
        const aTextureCoords = this.attributes.get("aTextureCoords");
        this.glCtx.enableVertexAttribArray(aTextureCoords);
        this.glCtx.vertexAttribPointer(aTextureCoords, 2, this.glCtx.FLOAT, false, 0, 0);
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
    execute(viewMatrix, modelMatrix, lighting, camera, drawMode) {
        this.glCtx.useProgram(this.glProgram);
        const modelViewProjectionMatrix = [];
        mat4.multiply(modelViewProjectionMatrix, camera.projectionMatrix, viewMatrix);
        mat4.multiply(modelViewProjectionMatrix, modelViewProjectionMatrix, modelMatrix);
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uNormalMatrix"), false, normalMatrix);
        this.glCtx.uniform3fv(this.uniforms.get("uLightDirection"), new Float32Array(lighting.directionalLights[0].lightDirection));
        this.glCtx.uniform4fv(this.uniforms.get("uLightDiffuse"), new Float32Array(lighting.directionalLights[0].diffuse));
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexture);
        this.glCtx.uniform1i(this.uniforms.get("uTexDiffuse"), 0);
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
SimpleDirectionalLightTextureProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMvpMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec3 uLightDirection;
    uniform vec4 uLightDiffuse;

    in vec4 aVertexPosition;
    in vec3 aVertexNormal;
    in vec2 aTextureCoords;

    out vec4 vVertexColor;
    out vec2 vTextureCoords;

    void main(void) {
      vec3 normal = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
      vec3 lightDir = normalize(uLightDirection);
      float lambertTerm = dot(normal, -lightDir);

      vec4 id = uLightDiffuse * lambertTerm;
      vVertexColor = vec4(id.rgb, 1.0);
      vTextureCoords = aTextureCoords;
      gl_Position = uMvpMatrix * aVertexPosition;
    }`;
SimpleDirectionalLightTextureProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform sampler2D uTexDiffuse;

    in vec4 vVertexColor;
    in vec2 vTextureCoords;

    out vec4 fragColor;

    void main(void) {
      fragColor = texture(uTexDiffuse, vTextureCoords) * vVertexColor;
    }`;
//# sourceMappingURL=simpleDirectionalLightTextureProgram.js.map