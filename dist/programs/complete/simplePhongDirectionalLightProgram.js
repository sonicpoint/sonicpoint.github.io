import { VertexShader } from "./../../vertexShader.js";
import { FragmentShader } from './../../fragmentShader.js';
import { Program } from "./../program.js";
import * as mat4 from "./../../utils/gl-matrix/mat4.js";
import * as vec3 from "./../../utils/gl-matrix/vec3.js";
export class SimplePhongDirectionalLightProgram extends Program {
    constructor(glCtx, geometry, material) {
        super(glCtx, new VertexShader(glCtx, SimplePhongDirectionalLightProgram.vertexShaderSource), new FragmentShader(glCtx, SimplePhongDirectionalLightProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.material = material;
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexNormal");
        this.createUniform("uMvpMatrix");
        this.createUniform("uModelViewMatrix");
        this.createUniform("uViewMatrix");
        this.createUniform("uNormalMatrix");
        this.createUniform("uLightDirection");
        this.createUniform("uLightAmbient");
        this.createUniform("uLightDiffuse");
        this.createUniform("uLightSpecular");
        this.createUniform("uMaterialAmbient");
        this.createUniform("uMaterialDiffuse");
        this.createUniform("uMaterialSpecular");
        this.createUniform("uShininess");
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
    //
    // World matrix will affect the normals (doesn't include projection or camera view)
    //
    execute(viewMatrix, modelMatrix, lighting, camera, drawMode) {
        this.glCtx.useProgram(this.glProgram);
        const modelViewMatrix = [];
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        const modelViewProjectionMatrix = [];
        mat4.multiply(modelViewProjectionMatrix, camera.projectionMatrix, modelViewMatrix);
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        const lightDirection = [];
        vec3.normalize(lightDirection, lighting.directionalLights[0].lightDirection);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uModelViewMatrix"), false, modelViewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uNormalMatrix"), false, normalMatrix);
        this.glCtx.uniform3fv(this.uniforms.get("uLightDirection"), lightDirection);
        this.glCtx.uniform4fv(this.uniforms.get("uLightAmbient"), lighting.directionalLights[0].ambient);
        this.glCtx.uniform4fv(this.uniforms.get("uLightDiffuse"), lighting.directionalLights[0].diffuse);
        this.glCtx.uniform4fv(this.uniforms.get("uLightSpecular"), lighting.directionalLights[0].specular);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialAmbient"), this.material.ambient);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialDiffuse"), this.material.diffuse);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialSpecular"), this.material.specular);
        this.glCtx.uniform1f(this.uniforms.get("uShininess"), this.material.shininess);
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
SimplePhongDirectionalLightProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMvpMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uNormalMatrix;

    in vec3 aVertexPosition;
    in vec3 aVertexNormal;

    out vec3 vNormal;
    out vec3 vEyeVector;

    void main(void) {
      vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);

      vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
      vEyeVector = -vec3(vertex.xyz);

      gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
    }`;
SimplePhongDirectionalLightProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform vec3 uLightDirection;
    uniform vec4 uLightAmbient;
    uniform vec4 uLightDiffuse;
    uniform vec4 uLightSpecular;
    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialDiffuse;
    uniform vec4 uMaterialSpecular;
    uniform float uShininess;

    in vec3 vNormal;
    in vec3 vEyeVector;

    out vec4 fragColor;

    void main(void) {
      vec3 normal = normalize(vNormal);

      float lambertTerm = dot(normal, -uLightDirection);
      vec4 ia = uLightAmbient * uMaterialAmbient;
      vec4 id = vec4(0.0, 0.0, 0.0, 1.0);
      vec4 is = vec4(0.0, 0.0, 0.0, 1.0);

      if (lambertTerm > 0.0) {
        id = uLightDiffuse * uMaterialDiffuse * lambertTerm;
        vec3 eye = normalize(vEyeVector);
        vec3 reflected = reflect(uLightDirection, normal);
        float specular = pow(max(dot(reflected, eye), 0.0), uShininess);
        is = uLightSpecular * uMaterialSpecular * specular;
      }

      fragColor = vec4(vec3(ia + id + is), 1.0);
    }`;
//# sourceMappingURL=simplePhongDirectionalLightProgram.js.map