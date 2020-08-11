import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
export class NormalMapProgram extends Program {
    constructor(glCtx, geometry, material, lightCount) {
        super(glCtx, new VertexShader(glCtx, NormalMapProgram.getVertexShaderSource(lightCount)), new FragmentShader(glCtx, NormalMapProgram.getFragmentShaderSource(lightCount)));
        this.geometry = geometry;
        this.material = material;
        this.lightCount = lightCount;
        this.glTexDiffuse = this.glCtx.createTexture();
        this.glTexNormal = this.glCtx.createTexture();
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
        for (let i = 0; i < this.lightCount; i++) {
            this.createUniform(`uLightPosition[${i}]`);
            this.createUniform(`uLightInfo[${i}].Ia`);
            this.createUniform(`uLightInfo[${i}].Id`);
            this.createUniform(`uLightInfo[${i}].Is`);
        }
        this.createUniform("uMaterialDiffuse");
        this.createUniform("uMaterialAmbient");
        this.createUniform("uMaterialSpecular");
        this.createUniform("uShininess");
        this.createUniform("uTexDiffuse");
        this.createUniform("uTexNormal");
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexDiffuse);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, this.material.texture);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexNormal);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, this.material.normalMap);
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
        mat4.transpose(normalMatrix, normalMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uModelViewMatrix"), false, modelViewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uViewMatrix"), false, viewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uNormalMatrix"), false, normalMatrix);
        for (let i = 0; i < this.lightCount; i++) {
            this.glCtx.uniform3fv(this.uniforms.get(`uLightPosition[${i}]`), lighting.positionalLights[i].lightPosition);
            this.glCtx.uniform4fv(this.uniforms.get(`uLightInfo[${i}].Ia`), lighting.positionalLights[i].ambient);
            this.glCtx.uniform4fv(this.uniforms.get(`uLightInfo[${i}].Id`), lighting.positionalLights[i].diffuse);
            this.glCtx.uniform4fv(this.uniforms.get(`uLightInfo[${i}].Is`), lighting.positionalLights[i].specular);
        }
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialDiffuse"), this.material.diffuse);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialAmbient"), this.material.ambient);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialSpecular"), this.material.specular);
        this.glCtx.uniform1f(this.uniforms.get("uShininess"), this.material.shininess);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexDiffuse);
        this.glCtx.uniform1i(this.uniforms.get("uTexDiffuse"), 0);
        this.glCtx.activeTexture(this.glCtx.TEXTURE1);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexNormal);
        this.glCtx.uniform1i(this.uniforms.get("uTexNormal"), 1);
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
    static getVertexShaderSource(lightCount) {
        return `#version 300 es
    precision mediump float;

    uniform mat4 uMvpMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec3 uLightPosition[${lightCount}];

    in vec3 aVertexPosition;
    in vec3 aVertexNormal;
    in vec3 aVertexTangent;
    in vec2 aTextureCoords;

    out vec2 vTextureCoords;
    out vec3 vTangentLightRay[${lightCount}];
    out vec3 vTangentEyeVector;
    out vec3 vTangentFragPos;

    void main(){
      vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);

      vec3 T = normalize(vec3(uNormalMatrix * vec4(aVertexTangent, 0.0)));
      vec3 N = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 0.0)));
      T = normalize(T - dot(T, N) * N); // ?
      vec3 B = cross(N, T);
//      vec3 B = normalize(vec3(model * vec4(aVertexBitangent, 0.0)));

      vec3 eyeVector = -vec3(vertex.xyz);

      mat3 TBN = transpose(mat3(T, B, N));
      vTangentEyeVector = TBN * eyeVector;
      vTangentFragPos  = TBN * vertex.xyz;

      for (int i = 0; i < ${lightCount}; i++) {
        vec4 light = uViewMatrix * vec4(uLightPosition[i], 1.0);
        vec3 lightRay = vertex.xyz - light.xyz;
        vTangentLightRay[i] = TBN * lightRay;
      }

      vTextureCoords = aTextureCoords;
      gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
    }`;
    }
    static getFragmentShaderSource(lightCount) {
        return `#version 300 es
    precision mediump float;

    struct LightInfo {
      vec4 Ia;
      vec4 Id;
      vec4 Is;
    };
    uniform LightInfo uLightInfo[${lightCount}];

    uniform vec4 uMaterialDiffuse;
    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialSpecular;
    uniform float uShininess;

    uniform sampler2D uTexDiffuse;
    uniform sampler2D uTexNormal;

    in vec2 vTextureCoords;
    in vec3 vTangentLightRay[${lightCount}];
    in vec3 vTangentEyeVector;
    in vec3 vTangentFragPos;

    out vec4 fragColor;

    vec3 phongShading(int index) {
      vec3 light = normalize(vTangentLightRay[index]);

      vec3 normal = texture(uTexNormal, vTextureCoords).rgb;
      normal = normalize(normal * 2.0 - 1.0);  // this normal is in tangent space

      float lambertTerm = dot(normal, -light);

      vec4 ia = uLightInfo[index].Ia * uMaterialAmbient * uMaterialDiffuse * texture(uTexDiffuse, vTextureCoords);
      vec4 id = vec4(0.0, 0.0, 0.0, 1.0);
      vec4 is = vec4(0.0, 0.0, 0.0, 1.0);

      if (lambertTerm > 0.0) {
        id = uLightInfo[index].Id * lambertTerm * uMaterialDiffuse * texture(uTexDiffuse, vTextureCoords);
        vec3 eye = normalize(vTangentEyeVector);

        vec3 halfwayDir = normalize(-light + eye);
        float specular = pow(max(dot(normal, halfwayDir), 0.0), uShininess);

        is = uLightInfo[index].Is * uMaterialSpecular * specular;
      }

      return vec3(ia + id + is);
    }

    void main() {
      vec3 lightColor = vec3(0.0);

      for (int i = 0; i < ${lightCount}; i++) {
        lightColor += phongShading(i);
      }

      fragColor = vec4(lightColor, 1.0);
    }`;
    }
}
//# sourceMappingURL=normalMapProgram.js.map