import { VertexShader } from "./../../vertexShader.js";
import { FragmentShader } from './../../fragmentShader.js';
import { Program } from "./../program.js";
import * as mat4 from "./../../utils/gl-matrix/mat4.js";
export class SimplePhongPositionalProgram extends Program {
    constructor(glCtx, geometry, material) {
        super(glCtx, new VertexShader(glCtx, SimplePhongPositionalProgram.vertexShaderSource), new FragmentShader(glCtx, SimplePhongPositionalProgram.fragmentShaderSource));
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
        this.createUniform("uLightPosition");
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
        const vertexPosition = this.attributes.get("aVertexPosition");
        this.glCtx.enableVertexAttribArray(vertexPosition);
        this.glCtx.vertexAttribPointer(vertexPosition, 3, this.glCtx.FLOAT, false, 0, 0);
        // Normals
        const normalBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, normalBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.normalArray), this.glCtx.STATIC_DRAW);
        const normal = this.attributes.get("aVertexNormal");
        this.glCtx.enableVertexAttribArray(normal);
        this.glCtx.vertexAttribPointer(normal, 3, this.glCtx.FLOAT, false, 0, 0);
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
        const modelViewMatrix = [];
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        const modelViewProjectionMatrix = [];
        mat4.multiply(modelViewProjectionMatrix, camera.projectionMatrix, modelViewMatrix);
        const normalMatrix = mat4.create();
        //    mat4.invert(normalMatrix, modelMatrix);
        mat4.invert(normalMatrix, modelViewMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uModelViewMatrix"), false, modelViewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uViewMatrix"), false, viewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uNormalMatrix"), false, normalMatrix);
        this.glCtx.uniform3fv(this.uniforms.get("uLightPosition"), lighting.positionalLights[0].lightPosition);
        this.glCtx.uniform4fv(this.uniforms.get("uLightAmbient"), lighting.positionalLights[0].ambient);
        this.glCtx.uniform4fv(this.uniforms.get("uLightDiffuse"), lighting.positionalLights[0].diffuse);
        this.glCtx.uniform4fv(this.uniforms.get("uLightSpecular"), lighting.positionalLights[0].specular);
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
SimplePhongPositionalProgram.vertexShaderSource = `#version 300 es
  precision mediump float;

  uniform mat4 uMvpMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uNormalMatrix;
  uniform vec3 uLightPosition;

  in vec3 aVertexPosition;
  in vec3 aVertexNormal;

  out vec3 vNormal;
  out vec3 vLightRay;
  out vec3 vEyeVector;

  void main(void) {
    vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
//    vec4 light = uModelViewMatrix * vec4(uLightPosition, 1.0);
    vec4 light = uViewMatrix * vec4(uLightPosition, 1.0);

    // Set varyings to be used inside of fragment shader
    vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vLightRay = vertex.xyz - light.xyz;
    vEyeVector = -vec3(vertex.xyz);

    gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
  }`;
SimplePhongPositionalProgram.fragmentShaderSource = `#version 300 es
  precision mediump float;

  uniform vec4 uLightAmbient;
  uniform vec4 uLightDiffuse;
  uniform vec4 uLightSpecular;
  uniform vec4 uMaterialAmbient;
  uniform vec4 uMaterialDiffuse;
  uniform vec4 uMaterialSpecular;
  uniform float uShininess;

  in vec3 vNormal;
  in vec3 vLightRay;
  in vec3 vEyeVector;

  out vec4 fragColor;

  void main(void) {
    vec3 light = normalize(vLightRay);
    vec3 normal = normalize(vNormal);
    float lambertTerm = dot(normal, -light);

    vec4 ia = uLightAmbient * uMaterialAmbient;
    vec4 id = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 is = vec4(0.0, 0.0, 0.0, 1.0);

    if (lambertTerm > 0.0) {
      id = uLightDiffuse * uMaterialDiffuse * lambertTerm;
      vec3 eye = normalize(vEyeVector);
      vec3 reflected = reflect(light, normal);
      float specular = pow(max(dot(reflected, eye), 0.0), uShininess);
      is = uLightSpecular * uMaterialSpecular * specular;
    }

    // Final fragment color takes into account ambient, diffuse, and specular
    fragColor = vec4(vec3(ia + id + is), 1.0);
  }`;
//# sourceMappingURL=simplePhongPositionalProgram.js.map