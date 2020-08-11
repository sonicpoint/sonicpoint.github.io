import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from '../../fragmentShader.js';
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
export class HemisphereLightingProgram extends Program {
    constructor(glCtx, geometry, colour) {
        super(glCtx, new VertexShader(glCtx, HemisphereLightingProgram.vertexShaderSource), new FragmentShader(glCtx, HemisphereLightingProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.colour = colour;
        this.colour = colour || [1.0, 1.0, 1.0, 1.0];
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexNormal");
        this.createUniform("uMVMatrix");
        this.createUniform("uMvpMatrix");
        this.createUniform("uNormalMatrix");
        this.createUniform("uLightPosition");
        this.createUniform("uSkyColor");
        this.createUniform("uGroundColor");
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
        const vertexNormal = this.attributes.get("aVertexNormal");
        this.glCtx.enableVertexAttribArray(vertexNormal);
        this.glCtx.vertexAttribPointer(vertexNormal, 3, this.glCtx.FLOAT, false, 0, 0);
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
        const dirLight = lighting.directionalLights[0];
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMVMatrix"), false, modelViewMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uNormalMatrix"), false, normalMatrix);
        this.glCtx.uniform3fv(this.uniforms.get("uLightPosition"), new Float32Array([0, 100, 0]));
        this.glCtx.uniform3fv(this.uniforms.get("uSkyColor"), new Float32Array([0.7, 0.7, 1]));
        this.glCtx.uniform3fv(this.uniforms.get("uGroundColor"), new Float32Array([0, 0.2, 0]));
        // Bind vertices and indices
        this.glCtx.bindVertexArray(this.glVertexArrayObject);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, this.glIndexBufferObject);
        // Draw geometry
        this.glCtx.drawElements(drawMode, this.geometry.indexArray.length, this.glCtx.UNSIGNED_SHORT, 0);
        // Clean buffers
        this.glCtx.bindVertexArray(null);
        this.glCtx.bindBuffer(this.glCtx.ARRAY_BUFFER, null);
        this.glCtx.bindBuffer(this.glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
}
HemisphereLightingProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMVMatrix;
    uniform mat4 uMvpMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec3 uLightPosition;
    uniform vec3 uSkyColor;
    uniform vec3 uGroundColor;

    in vec4 aVertexPosition;
    in vec3 aVertexNormal;

    out vec3 vColor;

    void main()
    {
//        vec3 position = vec3(uMVMatrix * aVertexPosition);
        vec3 position = vec3(aVertexPosition);
        vec3 tnorm = vec3(normalize(uNormalMatrix * vec4(aVertexNormal, 1.0)));
        vec3 lightVec = normalize(uLightPosition - position);
        float costheta = dot(tnorm, lightVec);
        float a = costheta * 0.5 + 0.5;
        vColor = mix(uGroundColor, uSkyColor, a);
        gl_Position = uMvpMatrix * aVertexPosition;
    }`;
HemisphereLightingProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    in vec3 vColor;

    out vec4 fragColor;

    void main(void)  {
      fragColor = vec4(vColor, 1.0);
    }`;
//# sourceMappingURL=hemisphereLightingProgram.js.map