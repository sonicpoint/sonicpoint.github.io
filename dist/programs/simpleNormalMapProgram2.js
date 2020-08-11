import { VertexShader } from "./../vertexShader.js";
import { FragmentShader } from './../fragmentShader.js';
import { Program } from "./program.js";
import * as mat4 from "./../utils/gl-matrix/mat4.js";
export class SimpleNormalMapProgram2 extends Program {
    constructor(glCtx, geometry, material) {
        super(glCtx, new VertexShader(glCtx, SimpleNormalMapProgram2.vertexShaderSource), new FragmentShader(glCtx, SimpleNormalMapProgram2.fragmentShaderSource));
        this.geometry = geometry;
        this.material = material;
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
SimpleNormalMapProgram2.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMvpMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uNormalMatrix;

    in vec3 aVertexPosition;
    in vec3 aVertexNormal;
    in vec3 aVertexTangent;
    in vec2 aTextureCoords;

    out vec2 vTextureCoords;
    out vec3 eyeCoord;
    out mat3 tangentSpace;

    void main(){
      vec3 norm = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
      vec3 tang = normalize(vec3(uNormalMatrix * vec4(aVertexTangent, 1.0)));

      // Compute the binormal
      vec3 binormal = cross(norm, tang);

      // Matrix for transformation to tangent space
      tangentSpace = mat3(tang.x, binormal.x, norm.x, tang.y, binormal.y, norm.y, tang.z, binormal.z, norm.z );

      // Transform view direction to tangent space
      eyeCoord = vec3(uModelViewMatrix * vec4(aVertexPosition, 1.0)) * tangentSpace;
      vTextureCoords = aTextureCoords;
      gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
    }`;
SimpleNormalMapProgram2.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform vec3 uLightPosition;
    uniform vec4 uLightAmbient;
    uniform vec4 uLightDiffuse;
    uniform vec4 uLightSpecular;

    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialSpecular;
    uniform float uShininess;

    uniform sampler2D uTexDiffuse;
    uniform sampler2D uTexNormal;

    in vec2 vTextureCoords;
    in vec3 eyeCoord;
    in mat3 tangentSpace;

    out vec4 fragColor;

    vec4 PhongShading(vec3 norm, vec4 materialDiffuse) {
      vec3 normalizeNormal = normalize(norm);
      vec3 normalizeEyeCoord = normalize(eyeCoord);
      vec3 normalizeLightVec = normalize((uLightPosition - eyeCoord) * tangentSpace);

      float cosAngle = max(0.0, dot(normalizeNormal, normalizeLightVec));

      vec3 V = -normalizeEyeCoord;
      vec3 R = reflect( -normalizeLightVec, normalizeNormal);
      float sIntensity = pow(max(0.0,dot(R,V)),uShininess);

      // ADS as result of Material & Light interaction
      vec4 ambient = uMaterialAmbient * uLightAmbient;
      vec4 diffuse = materialDiffuse; // * uLightDiffuse * cosAngle;
      vec4 specular = uMaterialSpecular * uLightSpecular * sIntensity;

      return ambient + diffuse + specular;
    }

    void main() {
      vec4 normalMap = texture(uTexNormal, vec2(1.0 - vTextureCoords.x, vTextureCoords.y));
      // vec4 normalMap = texture(uTexNormal, vTextureCoords);
      normalMap = (2.0 * normalMap - 1.0);
      vec4 texColor = texture(uTexDiffuse, vec2(1.0 - vTextureCoords.x, vTextureCoords.y));
      // vec4 texColor = texture(uTexDiffuse, vTextureCoords);

      fragColor = vec4(PhongShading(normalMap.xyz, texColor).rgb, 1.0);
    }`;
//# sourceMappingURL=simpleNormalMapProgram2.js.map