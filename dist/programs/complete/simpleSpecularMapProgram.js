import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
//
// This uses camera position (model space) rather than camera angle (view space)
//
export class SimpleSpecularMapProgram extends Program {
    constructor(glCtx, geometry, material) {
        super(glCtx, new VertexShader(glCtx, SimpleSpecularMapProgram.vertexShaderSource), new FragmentShader(glCtx, SimpleSpecularMapProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.material = material;
        this.glTexDiffuse = this.glCtx.createTexture();
        this.glTexNormal = this.glCtx.createTexture();
        this.glTexSpecular = this.glCtx.createTexture();
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexNormal");
        this.createAttribute("aVertexTangent");
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
        this.createUniform("uTexNormal");
        this.createUniform("uTexSpecular");
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexDiffuse);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, this.material.texture);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexNormal);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, this.material.normalMap);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexSpecular);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, this.material.specularMap);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, null);
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
        // Tangents
        const tangentBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, tangentBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.tangentArray), this.glCtx.STATIC_DRAW);
        const tangent = this.attributes.get("aVertexTangent");
        this.glCtx.enableVertexAttribArray(tangent);
        this.glCtx.vertexAttribPointer(tangent, 3, this.glCtx.FLOAT, false, 0, 0);
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
        mat4.invert(normalMatrix, modelViewMatrix);
        // mat4.invert(normalMatrix, modelMatrix);
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
        this.glCtx.activeTexture(this.glCtx.TEXTURE1);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexNormal);
        this.glCtx.uniform1i(this.uniforms.get("uTexNormal"), 1);
        this.glCtx.activeTexture(this.glCtx.TEXTURE2);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexSpecular);
        this.glCtx.uniform1i(this.uniforms.get("uTexSpecular"), 2);
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
SimpleSpecularMapProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMvpMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec3 uLightPosition;

    in vec3 aVertexPosition;
    in vec3 aVertexNormal;
    in vec3 aVertexTangent;
    in vec2 aTextureCoords;

    out vec2 vTextureCoords;
    out vec3 vTangentLightRay;
    out vec3 vTangentEyeVector;
    out vec3 vTangentFragPos;

    void main(){
      vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);
      vec4 light = uViewMatrix * vec4(uLightPosition, 1.0);

      vec3 T = normalize(vec3(uNormalMatrix * vec4(aVertexTangent, 0.0)));
      vec3 N = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 0.0)));
      T = normalize(T - dot(T, N) * N); // ?
      vec3 B = cross(N, T);
//      vec3 B = normalize(vec3(model * vec4(aVertexBitangent, 0.0)));

      vec3 lightRay = vertex.xyz - light.xyz;
      vec3 eyeVector = -vec3(vertex.xyz);

      mat3 TBN = transpose(mat3(T, B, N));
      vTangentLightRay = TBN * lightRay;
      vTangentEyeVector = TBN * eyeVector;
      vTangentFragPos  = TBN * vertex.xyz;

      vTextureCoords = aTextureCoords;
      gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
    }`;
SimpleSpecularMapProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform vec4 uLightAmbient;
    uniform vec4 uLightDiffuse;
    uniform vec4 uLightSpecular;

    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialSpecular;
    uniform float uShininess;

    uniform sampler2D uTexDiffuse;
    uniform sampler2D uTexNormal;
    uniform sampler2D uTexSpecular;

    in vec2 vTextureCoords;
    in vec3 vTangentLightRay;
    in vec3 vTangentEyeVector;
    in vec3 vTangentFragPos;

    out vec4 fragColor;

    void main() {
      vec3 light = normalize(vTangentLightRay);

      vec3 normal = texture(uTexNormal, vTextureCoords).rgb;
      normal = normalize(normal * 2.0 - 1.0);  // this normal is in tangent space

      vec4 materialDiffuse = texture(uTexDiffuse, vTextureCoords);

      float lambertTerm = dot(normal, -light);

      vec4 ia = uLightAmbient * uMaterialAmbient * materialDiffuse;
      vec4 id = vec4(0.0, 0.0, 0.0, 1.0);
      vec4 is = vec4(0.0, 0.0, 0.0, 1.0);

      // vec3 lightDir = normalize(vTangentLightPos - vTangentFragPos);
      // float lambertTerm = max(dot(lightDir, normal), 0.0);

      if (lambertTerm > 0.0) {
        id = uLightDiffuse * lambertTerm * materialDiffuse;
        vec3 eye = normalize(vTangentEyeVector);

        // vec3 viewDir = normalize(vTangentViewPos - vTangentFragPos);
        vec3 halfwayDir = normalize(-light + eye);
        float specular = pow(max(dot(normal, halfwayDir), 0.0), uShininess);
        // is = uLightSpecular * uMaterialSpecular * specular * (texture(uTexSpecular, vTextureCoords) * 0.8 + 0.2);
        is = uLightSpecular * uMaterialSpecular * specular * texture(uTexSpecular, vTextureCoords);
      }

      // vec3 specular = vec3(0.2) * spec;
      fragColor = vec4(vec3(ia + id + is), 1.0);
      // fragColor = vec4(ambient + diffuse, 1.0);
    }`;
//# sourceMappingURL=simpleSpecularMapProgram.js.map