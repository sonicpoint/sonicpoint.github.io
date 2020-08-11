import { VertexShader } from "../vertexShader.js";
import { FragmentShader } from '../fragmentShader.js';
import { ProgramOld } from "./programOld.js";
export class MixedLightBufferProgram extends ProgramOld {
    constructor(glCtx, glFramebuffer, geometry, material) {
        super(glCtx, new VertexShader(glCtx, MixedLightBufferProgram.vertexShaderSource), new FragmentShader(glCtx, MixedLightBufferProgram.fragmentShaderSource));
        this.glFramebuffer = glFramebuffer;
        this.geometry = geometry;
        this.material = material;
        this.bindBuffers();
    }
    bindBuffers() {
        this.attributes.set("aVertexPosition", this.glCtx.getAttribLocation(this.glProgram, "aVertexPosition"));
        this.attributes.set("aNormal", this.glCtx.getAttribLocation(this.glProgram, "aNormal"));
        this.uniforms.set("uMatrix", this.glCtx.getUniformLocation(this.glProgram, "uMatrix"));
        this.uniforms.set("uWorld", this.glCtx.getUniformLocation(this.glProgram, "uWorld"));
        this.uniforms.set("uMaterialAmbient", this.glCtx.getUniformLocation(this.glProgram, "uMaterialAmbient"));
        this.uniforms.set("uMaterialDiffuse", this.glCtx.getUniformLocation(this.glProgram, "uMaterialDiffuse"));
        this.uniforms.set("uMaterialSpecular", this.glCtx.getUniformLocation(this.glProgram, "uMaterialSpecular"));
        this.uniforms.set("uShininess", this.glCtx.getUniformLocation(this.glProgram, "uShininess"));
        this.uniforms.set("uLightAmbient", this.glCtx.getUniformLocation(this.glProgram, "uLightAmbient"));
        this.uniforms.set("uLightDiffuse", this.glCtx.getUniformLocation(this.glProgram, "uLightDiffuse"));
        this.uniforms.set("uLightSpecular", this.glCtx.getUniformLocation(this.glProgram, "uLightSpecular"));
        this.uniforms.set("uLightPosition", this.glCtx.getUniformLocation(this.glProgram, "uLightPosition"));
        this.uniforms.set("uLightSourceDirection", this.glCtx.getUniformLocation(this.glProgram, "uLightSourceDirection"));
        this.uniforms.set("uColor", this.glCtx.getUniformLocation(this.glProgram, "uColor"));
        const vao = this.glCtx.createVertexArray();
        this.glCtx.bindVertexArray(vao);
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
        const aNormal = this.attributes.get("aNormal");
        this.glCtx.enableVertexAttribArray(aNormal);
        this.glCtx.vertexAttribPointer(aNormal, 3, this.glCtx.FLOAT, false, 0, 0);
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
        const lightColor = [0.5, 0.8, 0.5, 1];
        const lightAmbient = [0.1, 0.1, 0.1, 1];
        const lightSpecular = [0.7, 0.7, 0.7, 1];
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMatrix"), false, matrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uWorld"), false, worldMatrix);
        this.glCtx.uniform4fv(this.uniforms.get("uLightDiffuse"), lightColor);
        this.glCtx.uniform4fv(this.uniforms.get("uLightAmbient"), lightAmbient);
        this.glCtx.uniform4fv(this.uniforms.get("uLightSpecular"), lightSpecular);
        this.glCtx.uniform3fv(this.uniforms.get("uLightPosition"), lighting.positionalLights[0].lightPosition);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialDiffuse"), [0.3, 0.8, 1.0, 1.0]);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialAmbient"), this.material.ambient);
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialSpecular"), this.material.specular);
        this.glCtx.uniform1f(this.uniforms.get("uShininess"), this.material.shininess);
        this.glCtx.uniform3fv(this.uniforms.get("uLightSourceDirection"), new Float32Array(lighting.directionalLights[0].lightDirection));
        this.glCtx.uniform4fv(this.uniforms.get("uColor"), new Float32Array([0.3, 0.3, 0.7, 1]));
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Bind to framebuffer to cause off-screen rendering
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, this.glFramebuffer);
        // Draw geometry
        this.glCtx.drawElements(drawMode, this.geometry.indexArray.length, this.glCtx.UNSIGNED_SHORT, 0);
        // Unbind buffers
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
MixedLightBufferProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uWorld;
    uniform mat4 uMatrix;
    uniform vec3 uLightPosition;

    in vec3 aVertexPosition;
    in vec3 aNormal;

    out vec3 vNormal;
    out vec3 vLightRay;
    out vec3 vEyeVector;

    void main(void) {
      vec4 vertex = uWorld * vec4(aVertexPosition, 1.0);
      vec4 light = uWorld * vec4(uLightPosition, 1.0);

      // Set varyings to be used inside of fragment shader
      vNormal = mat3(uWorld) * aNormal;
      vLightRay = vertex.xyz - light.xyz;
      vEyeVector = -vec3(vertex.xyz);

      gl_Position = uMatrix * uWorld * vec4(aVertexPosition, 1.0);
    }`;
MixedLightBufferProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform vec4 uLightAmbient;
    uniform vec4 uLightDiffuse;
    uniform vec4 uLightSpecular;
    uniform vec4 uMaterialAmbient;
    uniform vec4 uMaterialDiffuse;
    uniform vec4 uMaterialSpecular;
    uniform float uShininess;

    // Colour reflected for directional light
    uniform vec4 uColor;
    uniform vec3 uLightSourceDirection;

    in vec3 vNormal;
    in vec3 vLightRay;
    in vec3 vEyeVector;

    layout (location = 0) out vec4 fragColor0;
    layout (location = 1) out vec4 fragColor1;

    void main(void) {
      vec3 L = normalize(vLightRay);
      vec3 N = normalize(vNormal);
      float lambertTerm = dot(N, -L);

      // Ambient
      vec4 ia = uLightAmbient * uMaterialAmbient;
      // Diffuse
      vec4 id = vec4(0.0, 0.0, 0.0, 1.0);
      // Specular
      vec4 is = vec4(0.0, 0.0, 0.0, 1.0);

      if (lambertTerm > 0.0) {
        // Update diffuse
        id = uLightDiffuse * uMaterialDiffuse * lambertTerm;
        vec3 E = normalize(vEyeVector);
        vec3 R = reflect(L, N);
        float specular = pow( max(dot(R, E), 0.0), uShininess);
        // Update specular
        is = uLightSpecular * uMaterialSpecular * specular;
      }

      float directionalLight = dot(N, uLightSourceDirection);

      // Final fragment color takes into account ambient, diffuse, and specular
      fragColor0 = vec4(vec3(ia + id + is), 1.0);

      // Add in directional light
      vec4 vTempColor = uColor * directionalLight;
//      fragColor += uColor;
      fragColor0.rgb += vTempColor.rgb;
      fragColor1 = vec4(0.0, 0.0, 0.0, 1.0);
    }`;
//# sourceMappingURL=mixedLightBufferProgram.js.map