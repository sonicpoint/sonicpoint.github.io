import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
import * as vec3 from "../../utils/gl-matrix/vec3.js";
//
// Physically-based rendering
//
export class SimplePbrProgram extends Program {
    constructor(glCtx, geometry, material, lightCount) {
        super(glCtx, new VertexShader(glCtx, SimplePbrProgram.getVertexShaderSource(lightCount)), new FragmentShader(glCtx, SimplePbrProgram.getFragmentShaderSource(lightCount)));
        this.geometry = geometry;
        this.material = material;
        this.lightCount = lightCount;
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexNormal");
        this.createUniform("uMvpMatrix");
        this.createUniform("uViewMatrix");
        this.createUniform("uModelViewMatrix");
        this.createUniform("uNormalMatrix");
        for (let i = 0; i < this.lightCount; i++) {
            this.createUniform(`uLightPosition[${i}]`);
            this.createUniform(`uLightInfo[${i}].L`);
        }
        this.createUniform(`uMaterialInfo.Rough`);
        this.createUniform(`uMaterialInfo.Metal`);
        this.createUniform(`uMaterialInfo.Color`);
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
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uViewMatrix"), false, viewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uModelViewMatrix"), false, modelViewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uNormalMatrix"), false, normalMatrix);
        this.glCtx.uniform3fv(this.uniforms.get(`uLightInfo[0].L`), vec3.clone(lighting.positionalLights[0].diffuse));
        this.glCtx.uniform3fv(this.uniforms.get(`uLightInfo[0].Position`), [lighting.positionalLights[0].lightPosition[0], lighting.positionalLights[0].lightPosition[1], lighting.positionalLights[0].lightPosition[2], 0]);
        this.glCtx.uniform4fv(this.uniforms.get(`uLightPosition[0]`), [lighting.positionalLights[0].lightPosition[0], lighting.positionalLights[0].lightPosition[1], lighting.positionalLights[0].lightPosition[2], 0]);
        this.glCtx.uniform3fv(this.uniforms.get(`uLightInfo[1].L`), vec3.clone(lighting.positionalLights[1].diffuse));
        // this.glCtx.uniform4fv(this.uniforms.get(`uLightInfo[1].Position`), [0, 0, 20, 1]);
        this.glCtx.uniform3fv(this.uniforms.get(`uLightInfo[1].Position`), [lighting.positionalLights[0].lightPosition[0], lighting.positionalLights[0].lightPosition[1], lighting.positionalLights[0].lightPosition[2], 0]);
        this.glCtx.uniform4fv(this.uniforms.get(`uLightPosition[1]`), [lighting.positionalLights[1].lightPosition[0], lighting.positionalLights[1].lightPosition[1], lighting.positionalLights[1].lightPosition[2], 0]);
        // this.glCtx.uniform3fv(this.uniforms.get(`uLightInfo[2].L`), [45, 45, 45]);
        // this.glCtx.uniform4fv(this.uniforms.get(`uLightInfo[2].Position`), [-7, 3, 7, 1]);
        // for (let i = 0; i < this.lightCount; i++) {
        //   this.glCtx.uniform3fv(this.uniforms.get(`uLightInfo[${i}].L`), [1, 1, 1]);
        // }
        this.glCtx.uniform1f(this.uniforms.get(`uMaterialInfo.Rough`), this.material.roughness);
        this.glCtx.uniform1i(this.uniforms.get("uMaterialInfo.Metal"), this.material.isMetal ? 1 : 0);
        this.glCtx.uniform3fv(this.uniforms.get(`uMaterialInfo.Color`), vec3.clone(this.material.colour));
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
    uniform vec4 uLightPosition[${lightCount}];

    in vec3 aVertexPosition;
    in vec3 aVertexNormal;

    out vec3 vPosition;
    out vec3 vNormal;
    out vec4 vLightPos[${lightCount}];

    void main() {
        vNormal = normalize(mat3(uNormalMatrix) * aVertexNormal);
        vPosition = (uModelViewMatrix * vec4(aVertexPosition,1.0)).xyz;

        for( int idx = 0; idx < ${lightCount}; idx++ ) {
          vLightPos[idx] = uViewMatrix * uLightPosition[idx];
        }

        gl_Position = uMvpMatrix * vec4(aVertexPosition, 1.0);
    }`;
    }
    static getFragmentShaderSource(lightCount) {
        return `#version 300 es
    precision mediump float;

    const float PI = 3.14159265358979323846;

    struct LightInfo {
      vec4 Position;  // Light position in cam. coords.
      vec3 L;         // Intensity
    };
    uniform LightInfo uLightInfo[${lightCount}];

    struct MaterialInfo {
        float Rough;     // Roughness
        bool Metal;      // Metallic (true) or dielectric (false)
        vec3 Color;      // Diffuse color for dielectrics, f0 for metallic
      };
    uniform MaterialInfo uMaterialInfo;

    in vec3 vPosition;
    in vec3 vNormal;
    in vec4 vLightPos[${lightCount}];

    out vec4 FragColor;

    float ggxDistribution( float nDotH ) {
      float alpha2 = uMaterialInfo.Rough * uMaterialInfo.Rough * uMaterialInfo.Rough * uMaterialInfo.Rough;
      float d = (nDotH * nDotH) * (alpha2 - 1.0) + 1.0;
      return alpha2 / (PI * d * d);
    }

    float geomSmith( float dotProd ) {
      float k = (uMaterialInfo.Rough + 1.0) * (uMaterialInfo.Rough + 1.0) / 8.0;
      float denom = dotProd * (1.0 - k) + k;
      return 1.0 / denom;
    }

    vec3 schlickFresnel( float lDotH ) {
      vec3 f0 = vec3(0.04);
      if( uMaterialInfo.Metal ) {
        f0 = uMaterialInfo.Color;
      }
      return f0 + (1.0 - f0) * pow(1.0 - lDotH, 5.0);
    }

    vec3 microfacetModel( int lightIdx, vec3 position, vec3 n ) {  
      vec3 diffuseBrdf = vec3(0.0);  // Metallic
      if( !uMaterialInfo.Metal ) {
        diffuseBrdf = uMaterialInfo.Color;
      }

      vec3 l = vec3(0.0),
        lightI = uLightInfo[lightIdx].L * 0.75;
          // l = normalize(uLightInfo[lightIdx].Position.xyz);
        l = normalize(vLightPos[lightIdx].xyz);

      // if( uLightInfo[lightIdx].Position.w == 0.0 ) { // Positional light
      //   l = normalize(uLightInfo[lightIdx].Position.xyz);
      // } else {                                  // Directional light
      //   l = uLightInfo[lightIdx].Position.xyz - position;
      //   float dist = length(l);
      //   l = normalize(l);
      //   lightI /= (dist * dist);
      // }

      vec3 v = normalize( -position );
      vec3 h = normalize( v + l );
      float nDotH = dot( n, h );
      float lDotH = dot( l, h );
      float nDotL = max( dot( n, l ), 0.0 );
      float nDotV = dot( n, v );
      vec3 specBrdf = 0.25 * ggxDistribution(nDotH) * schlickFresnel(lDotH) * geomSmith(nDotL) * geomSmith(nDotV);

      return (diffuseBrdf + PI * specBrdf) * lightI * nDotL;
    }

    void main() {
      vec3 sum = vec3(0);
      vec3 n = normalize(vNormal);
      for( int i = 0; i < ${lightCount}; i++ ) {
        sum += microfacetModel(i, vPosition, n);
      }

      // Gamma 
      sum = pow( sum, vec3(1.0/2.2) );

      FragColor = vec4(sum, 1);
    }`;
    }
}
//# sourceMappingURL=simplePbrProgram.js.map