import { VertexShader } from "../../vertexShader.js";
import { FragmentShader } from "../../fragmentShader.js";
import { Program } from "../program.js";
import * as mat4 from "../../utils/gl-matrix/mat4.js";
//
// Simplest (and fastest) of the lighting programs
//
export class SimpleGouraudLambertProgram extends Program {
    constructor(glCtx, geometry, colour) {
        super(glCtx, new VertexShader(glCtx, SimpleGouraudLambertProgram.vertexShaderSource), new FragmentShader(glCtx, SimpleGouraudLambertProgram.fragmentShaderSource));
        this.geometry = geometry;
        this.colour = colour;
        this.colour = colour || [1.0, 1.0, 1.0, 1.0];
        this.bindBuffers();
    }
    bindBuffers() {
        this.createAttribute("aVertexPosition");
        this.createAttribute("aVertexNormal");
        this.createUniform("uMvpMatrix");
        this.createUniform("uNormalMatrix");
        this.createUniform("uLightDirection");
        this.createUniform("uLightDiffuse");
        this.createUniform("uMaterialDiffuse");
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
        const modelViewProjectionMatrix = [];
        mat4.multiply(modelViewProjectionMatrix, camera.projectionMatrix, viewMatrix);
        mat4.multiply(modelViewProjectionMatrix, modelViewProjectionMatrix, modelMatrix);
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, modelMatrix);
        mat4.transpose(normalMatrix, normalMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uMvpMatrix"), false, modelViewProjectionMatrix);
        this.glCtx.uniformMatrix4fv(this.uniforms.get("uNormalMatrix"), false, normalMatrix);
        this.glCtx.uniform3fv(this.uniforms.get("uLightDirection"), new Float32Array(lighting.directionalLights[0].lightDirection));
        this.glCtx.uniform4fv(this.uniforms.get("uLightDiffuse"), new Float32Array(lighting.directionalLights[0].diffuse));
        this.glCtx.uniform4fv(this.uniforms.get("uMaterialDiffuse"), new Float32Array(this.colour));
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
SimpleGouraudLambertProgram.vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMvpMatrix;
    uniform mat4 uNormalMatrix;
    uniform vec3 uLightDirection;
    uniform vec4 uLightDiffuse;
    uniform vec4 uMaterialDiffuse;

    in vec4 aVertexPosition;
    in vec3 aVertexNormal;

    out vec4 vVertexColor;

    void main(void) {
      vec3 normal = normalize(vec3(uNormalMatrix * vec4(aVertexNormal, 1.0)));
      vec3 lightDir = normalize(uLightDirection);
      float lambertTerm = dot(normal, -lightDir);

      vec4 id = uMaterialDiffuse * uLightDiffuse * lambertTerm;
      vVertexColor = vec4(id.rgb, 1.0);

      gl_Position = uMvpMatrix * aVertexPosition;
    }`;
SimpleGouraudLambertProgram.fragmentShaderSource = `#version 300 es
    precision mediump float;

    in vec4 vVertexColor;

    out vec4 fragColor;

    void main(void)  {
      fragColor = vVertexColor;
    }`;
//# sourceMappingURL=simpleGouraudLambertProgram.js.map