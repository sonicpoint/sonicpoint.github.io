import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
export class SpecularMapPomProgram extends Program {
    constructor(glCtx, geometry, material, lightCount, layers, depthScale, reverseHeightMap) {
        super(glCtx, new VertexShader(glCtx, SpecularMapPomProgram.getVertexShaderSource(lightCount)), new FragmentShader(glCtx, SpecularMapPomProgram.getFragmentShaderSource(lightCount)));
        this.geometry = geometry;
        this.material = material;
        this.lightCount = lightCount;
        this.layers = layers;
        this.depthScale = depthScale;
        this.reverseHeightMap = reverseHeightMap;
        this.layers = layers ? layers : 32;
        this.depthScale = depthScale ? depthScale : 0.1;
        this.reverseHeightMap = reverseHeightMap === undefined ? false : reverseHeightMap;
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexTangent");
        this.createAttribute("aVertexBitangent");
        this.createAttribute("aTextureCoords");
        this.createUniform("uMvpMatrix");
        this.createUniform("uViewMatrix");
        this.createUniform("uModelViewMatrix");
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
        this.createUniform("uReverseHeightMap");
        this.createUniform("uTexDiffuse");
        this.createUniform("uTexNormal");
        this.createUniform("uTexHeight");
        this.createUniform("uTexSpecular");
        this.createUniform("uDepthScale");
        this.createUniform("uLayerCount");
        this.createUniform("show_tex");
        // Bind textures
        this.glTexDiffuse = this.bindTexture(this.material.texture);
        this.glTexNormal = this.bindTexture(this.material.normalMap);
        this.glTexHeight = this.bindTexture(this.material.heightMap);
        this.glTexSpecular = this.bindTexture(this.material.specularMap);
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
        // Tangents
        const tangentBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, tangentBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.tangentArray), this.glCtx.STATIC_DRAW);
        const tangent = this.attributes.get("aVertexTangent");
        this.glCtx.enableVertexAttribArray(tangent);
        this.glCtx.vertexAttribPointer(tangent, 3, this.glCtx.FLOAT, false, 0, 0);
        // Bitangents
        const bitangentBufferObject = this.glCtx.createBuffer();
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, bitangentBufferObject);
        this.glCtx.bufferData(this.glCtx.ARRAY_BUFFER, new Float32Array(this.geometry.bitangentArray), this.glCtx.STATIC_DRAW);
        const bitangent = this.attributes.get("aVertexBitangent");
        this.glCtx.enableVertexAttribArray(bitangent);
        this.glCtx.vertexAttribPointer(bitangent, 3, this.glCtx.FLOAT, false, 0, 0);
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
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uViewMatrix"), false, viewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uModelViewMatrix"), false, modelViewMatrix);
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
        this.glCtx.uniform1i(this.uniforms.get("uReverseHeightMap"), this.reverseHeightMap ? 1 : 0);
        this.glCtx.activeTexture(this.glCtx.TEXTURE0);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexDiffuse);
        this.glCtx.uniform1i(this.uniforms.get("uTexDiffuse"), 0);
        this.glCtx.activeTexture(this.glCtx.TEXTURE1);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexNormal);
        this.glCtx.uniform1i(this.uniforms.get("uTexNormal"), 1);
        this.glCtx.activeTexture(this.glCtx.TEXTURE2);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexHeight);
        this.glCtx.uniform1i(this.uniforms.get("uTexHeight"), 2);
        this.glCtx.activeTexture(this.glCtx.TEXTURE3);
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, this.glTexSpecular);
        this.glCtx.uniform1i(this.uniforms.get("uTexSpecular"), 3);
        this.glCtx.uniform1f(this.uniforms.get("uDepthScale"), this.depthScale);
        this.glCtx.uniform1f(this.uniforms.get("uLayerCount"), this.layers);
        this.glCtx.uniform1i(this.uniforms.get("show_tex"), 1);
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
    uniform mat4 uViewMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec3 uLightPosition[${lightCount}];

    in vec3 aVertexPosition;
    in vec3 aVertexTangent;
    in vec3 aVertexBitangent;
    in vec2 aTextureCoords;

    out vec2 vTextureCoords;
    out vec3 vTangentFragPos;
    out vec3 vTangentEyeVector;
    out vec3 vTangentLightRay[${lightCount}];

    void main(void)
    {
      vec4 vertex = uModelViewMatrix * vec4(aVertexPosition, 1.0);

      vec3 vert_norm = cross(aVertexBitangent, aVertexTangent);

      vec3 T = normalize(mat3(uNormalMatrix) * aVertexTangent);
      vec3 B = normalize(mat3(uNormalMatrix) * aVertexBitangent);
      vec3 N = normalize(mat3(uNormalMatrix) * vert_norm);
      mat3 TBN = transpose(mat3(T, B, N));

      vec3 eyeVector = -vec3(vertex.xyz);

      vTangentEyeVector = TBN * eyeVector;
      vTangentFragPos = TBN * vertex.xyz;

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
    uniform bool uReverseHeightMap;

    uniform sampler2D uTexDiffuse;
    uniform sampler2D uTexNormal;
    uniform sampler2D uTexHeight;
    uniform sampler2D uTexSpecular;

    uniform int show_tex;
    uniform float uDepthScale;
    uniform float uLayerCount;

    in vec2 vTextureCoords;
    in vec3 vTangentFragPos;
    in vec3 vTangentEyeVector;
    in vec3 vTangentLightRay[${lightCount}];

    out vec4 fragColor;

    vec2 parallax_uv(vec2 uv, vec3 view_dir)
    {
      float layer_depth = 1.0 / uLayerCount;
      float cur_layer_depth = 0.0;
      vec2 delta_uv = view_dir.xy * uDepthScale / (view_dir.z * uLayerCount);
      vec2 cur_uv = uv;

      // float depth_from_tex = 1.0 - texture(uTexHeight, cur_uv).r;
      float depth_from_tex = uReverseHeightMap ? texture(uTexHeight, cur_uv).r : 1.0 - texture(uTexHeight, cur_uv).r;
      // float depth_from_tex = texture(uTexHeight, cur_uv).r;

      for (int i = 0; i < 32; i++) {
        cur_layer_depth += layer_depth;
        cur_uv -= delta_uv;
        depth_from_tex = uReverseHeightMap ? texture(uTexHeight, cur_uv).r : 1.0 - texture(uTexHeight, cur_uv).r;
//        depth_from_tex = texture(uTexHeight, cur_uv).r;
        if (depth_from_tex < cur_layer_depth) {
            break;
        }
      }

      // Parallax occlusion mapping
      vec2 prev_uv = cur_uv + delta_uv;
      float next = depth_from_tex - cur_layer_depth;
      float prev = texture(uTexHeight, prev_uv).r - cur_layer_depth + layer_depth;
      float weight = next / (next - prev);
      return mix(cur_uv, prev_uv, weight);
    }

    vec3 phongShading(int index, vec2 uv) {
      vec3 light = normalize(vTangentLightRay[index]);

      vec3 normal = texture(uTexNormal, uv).rgb;
      normal = normalize(normal * 2.0 - 1.0);  // this normal is in tangent space

      float lambertTerm = dot(normal, -light);
      vec4 textureDiffuse = texture(uTexDiffuse, uv);

      vec4 ia = uLightInfo[index].Ia * uMaterialAmbient * uMaterialDiffuse * textureDiffuse;
      vec4 id = vec4(0.0, 0.0, 0.0, 1.0);
      vec4 is = vec4(0.0, 0.0, 0.0, 1.0);

      if (lambertTerm > 0.0) {
        id = uLightInfo[index].Id * lambertTerm * uMaterialDiffuse * textureDiffuse;
        vec3 eye = normalize(vTangentEyeVector);

        vec3 halfwayDir = normalize(-light + eye);
        float specular = pow(max(dot(normal, halfwayDir), 0.0), uShininess);

        is = uLightInfo[index].Is * uMaterialSpecular * specular * texture(uTexSpecular, uv);
      }

      return vec3(ia + id + is);
    }

    void main(void)
    {
      vec3 eye = normalize(vTangentEyeVector);
      vec2 uv = parallax_uv(vTextureCoords, eye);
      vec3 lightColor = vec3(0.0);

      for (int i = 0; i < ${lightCount}; i++) {
        lightColor += phongShading(i, uv);
      }

      fragColor = vec4(lightColor, 1.0);
    }`;
    }
}
//# sourceMappingURL=specularMapPomProgram.js.map