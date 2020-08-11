import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { ProgramOld } from "../programOld.js";
export class DirectionalLightBufferProgram extends ProgramOld {
    constructor(glCtx, glFramebuffer, geometry, colour) {
        super(glCtx, new VertexShader(glCtx, DirectionalLightBufferProgram.vertexShaderSource), new FragmentShader(glCtx, DirectionalLightBufferProgram.fragmentShaderSource));
        this.glFramebuffer = glFramebuffer;
        this.geometry = geometry;
        this.colour = colour;
        this.colour = colour || [1.0, 1.0, 1.0, 1.0];
        this.bindBuffers();
    }
    bindBuffers() {
        this.attributes.set("aVertexPosition", this.glCtx.getAttribLocation(this.glProgram, "aVertexPosition"));
        this.attributes.set("aNormal", this.glCtx.getAttribLocation(this.glProgram, "aNormal"));
        this.uniforms.set("uMatrix", this.glCtx.getUniformLocation(this.glProgram, "uMatrix"));
        this.uniforms.set("uWorld", this.glCtx.getUniformLocation(this.glProgram, "uWorld"));
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
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMatrix"), false, matrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uWorld"), false, worldMatrix);
        this.glCtx.uniform3fv(this.uniforms.get("uLightSourceDirection"), new Float32Array(lighting.directionalLights[0].lightDirection));
        this.glCtx.uniform4fv(this.uniforms.get("uColor"), new Float32Array(this.colour));
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Bind to framebuffer to cause off-screen rendering
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, this.glFramebuffer);
        // Draw geometry
        this.glCtx.drawElements(drawMode, this.geometry.indexArray.length, this.glCtx.UNSIGNED_SHORT, 0);
        // Bind to framebuffer to cause off-screen rendering
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
        // Clean buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
DirectionalLightBufferProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec4 aVertexPosition;
    in vec3 aNormal;

    uniform mat4 uMatrix;
    uniform mat4 uWorld;

    out vec3 vNormal;

    void main(void) {
      gl_Position = uMatrix * aVertexPosition;

      // orientate the normals and pass to the fragment shader
      vNormal = mat3(uWorld) * aNormal;
    }`;
DirectionalLightBufferProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    in vec3 vNormal;

    uniform vec3 uLightSourceDirection;
    uniform vec4 uColor;

    layout (location = 0) out vec4 fragColor0;
    layout (location = 1) out vec4 fragColor1;

    void main(void) {
      vec3 normal = normalize(vNormal);
      float light = dot(normal, uLightSourceDirection);

      fragColor0 = vec4(uColor.rgb, 1.0);
      fragColor0.rgb *= light;
      fragColor1 = vec4(0.0, 0.0, 0.0, 1.0);
    }`;
//# sourceMappingURL=directionalLightBufferProgram.js.map