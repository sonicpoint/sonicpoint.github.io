import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
export class SimpleBlinnPhongTextureProgram extends Program {
    constructor(glCtx, geometry, material) {
        super(glCtx, new VertexShader(glCtx, SimpleBlinnPhongTextureProgram.vertexShaderSource), new FragmentShader(glCtx, SimpleBlinnPhongTextureProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.material = material;
        this.glTexDiffuse = this.glCtx.createTexture();
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexNormal");
        this.createAttribute("aTextureCoords");
        this.createUniform("uMvpMatrix");
        this.createUniform("uModelViewMatrix");
        this.createUniform("uViewMatrix");
        this.createUniform("uNormalMatrix");
        this.createUniform("uLightPosition");
        this.createUniform("uLightAmbient");
        this.createUniform("uLightDiffuse");
        this.createUniform("uLightSpecular");
        this.createUniform("uMaterialAmbient");
        this.createUniform("uMaterialSpecular");
        this.createUniform("uShininess");
        this.createUniform("uTexDiffuse");
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexDiffuse);
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
        const textureCoords = this.attributes.get("aTextureCoords");
        this.glCtx.enableVertexAttribArray(textureCoords);
        this.glCtx.vertexAttribPointer(textureCoords, 2, this.glCtx.FLOAT, false, 0, 0);
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
        const modelViewMatrix = [];
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
        const modelViewProjectionMatrix = [];
        mat4.multiply(modelViewProjectionMatrix, camera.projectionMatrix, modelViewMatrix);
        const normalMatrix = [];
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
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialSpecular"), this.material.specular);
        this.glCtx.uniform1f(this.uniforms.get("uShininess"), this.material.shininess);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexDiffuse);
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
SimpleBlinnPhongTextureProgram.vertexShaderSource = `#version 300 es
  precision mediump float;

  uniform mat4 uMvpMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uViewMatrix;
  uniform mat4 uNormalMatrix;
  uniform vec3 uLightPosition;

  in vec3 aVertexPosition;
  in vec3 aVertexNormal;
  in vec2 aTextureCoords;

  out vec3 vNormal;
  out vec3 vLightRay;
  out vec3 vEyeVector;
  out vec2 vTextureCoords;

  void main(void) {
    vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
    vec4 light = uViewMatrix * vec4(uLightPosition, 1.0);

    // Set varyings to be used inside of fragment shader
    vNormal = vec3(uNormalMatrix * vec4(aVertexNormal, 1.0));
    vLightRay = vertex.xyz - light.xyz;
    vEyeVector = -vec3(vertex.xyz);

    vTextureCoords = aTextureCoords;
    gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
  }`;
SimpleBlinnPhongTextureProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform vec4 uLightAmbient;
    uniform vec4 uLightDiffuse;
    uniform vec4 uLightSpecular;
    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialSpecular;
    uniform float uShininess;
    uniform sampler2D uTexDiffuse;

    in vec3 vNormal;
    in vec3 vLightRay;
    in vec3 vEyeVector;
    in vec2 vTextureCoords;

    out vec4 fragColor;

    void main(void) {
      vec3 light = normalize(vLightRay);
      vec3 normal = normalize(vNormal);
      vec4 materialDiffuse = texture(uTexDiffuse, vTextureCoords);
      float lambertTerm = dot(normal, -light);

      // Ambient - updated so that ambient takes into account diffuse colour (otherwise it is grey)
      vec4 ia = uLightAmbient * uMaterialAmbient * materialDiffuse;
      vec4 id = vec4(0.0, 0.0, 0.0, 1.0);
      vec4 is = vec4(0.0, 0.0, 0.0, 1.0);

      if (lambertTerm > 0.0) {
        id = uLightDiffuse * lambertTerm * materialDiffuse;
        vec3 eye = normalize(vEyeVector);

        vec3 halfwayDir = normalize(-light + eye);
        float specular = pow(max(dot(normal, halfwayDir), 0.0), uShininess);

        is = uLightSpecular * uMaterialSpecular * specular;
      }

      // Final fragment color takes into account ambient, diffuse, and specular
      fragColor = vec4(vec3(ia + id + is), 1.0);
    }`;
//# sourceMappingURL=simpleBlinnPhongTextureProgram.js.map