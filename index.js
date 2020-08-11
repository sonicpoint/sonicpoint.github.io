import * as mat4 from "./gl-matrix/mat4.js";
{
    const canvasElement2 = document.querySelector("#webGlCanvas");
    canvasElement2.style.background = "black";
    window.onload = () => init2(canvasElement2);
    function init2(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const glCtx = createGLContext(canvas);
        if (glCtx == null) {
            return null;
        }
        const glProgram = createAndUseProgram(glCtx);
        if (glProgram == null) {
            return;
        }
        const cubeInfo = createCube(0.3);
        const vertexBuffer = glCtx.createBuffer();
        const normalBuffer = glCtx.createBuffer();
        const solidIndexBuffer = glCtx.createBuffer();
        bindBuffers();
        // Get attributes and uniforms
        const attrVertexPosition = glCtx.getAttribLocation(glProgram, "aVertexPosition");
        const attrVertexNormal = glCtx.getAttribLocation(glProgram, "aVertexNormal");
        const uniformColour = glCtx.getUniformLocation(glProgram, "uColor");
        const uniformMatrix = glCtx.getUniformLocation(glProgram, "uMatrix");
        const uniformLightDir = glCtx.getUniformLocation(glProgram, "uLightDir");
        // Unbind
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, null);
        glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, null);
        let matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.5, 0, 0, 0, 1];
        // let matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0.5, 0, 0, 0, 1];
        // render();
        let rotation = 0;
        let oldTime = performance.now();
        doLoop(oldTime);
        function doLoop(timestamp) {
            if (timestamp > oldTime + 15) {
                render();
                oldTime = timestamp;
            }
            rotation = Math.PI / 720;
            matrix = mat4.rotateZ(matrix, matrix, rotation);
            matrix = mat4.rotateY(matrix, matrix, rotation);
            window.requestAnimationFrame(() => doLoop(performance.now()));
        }
        function render() {
            // Clear the scene
            glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);
            glCtx.viewport(0, 0, glCtx.canvas.width, glCtx.canvas.height);
            // Use the buffers we've constructed
            glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);
            glCtx.vertexAttribPointer(attrVertexPosition, 3, glCtx.FLOAT, false, 0, 0);
            glCtx.enableVertexAttribArray(attrVertexPosition);
            glCtx.bindBuffer(glCtx.ARRAY_BUFFER, normalBuffer);
            glCtx.vertexAttribPointer(attrVertexNormal, 3, glCtx.FLOAT, false, 0, 0);
            glCtx.enableVertexAttribArray(attrVertexNormal);
            // Matrix is used by both programs
            glCtx.uniformMatrix4fv(uniformMatrix, false, matrix);
            glCtx.uniform3fv(uniformLightDir, [-0.5, -0.5, 1]);
            // Draw solid to the scene
            glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, solidIndexBuffer);
            glCtx.uniform4fv(uniformColour, new Float32Array([0.9, 0.9, 1, 1]));
            glCtx.drawElements(glCtx.TRIANGLES, cubeInfo.solidIndices.length, glCtx.UNSIGNED_SHORT, 0);
            // Unbind buffers
            glCtx.bindBuffer(glCtx.ARRAY_BUFFER, null);
            glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, null);
        }
        function bindBuffers() {
            glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);
            glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(cubeInfo.vertices), glCtx.STATIC_DRAW);
            glCtx.bindBuffer(glCtx.ARRAY_BUFFER, normalBuffer);
            glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(cubeInfo.normals), glCtx.STATIC_DRAW);
            glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, solidIndexBuffer);
            glCtx.bufferData(glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeInfo.solidIndices), glCtx.STATIC_DRAW);
        }
    }
    function createGLContext(canvas) {
        const glCtx = canvas.getContext("webgl2");
        // Turn on culling. By default backfacing triangles will be culled.
        glCtx.enable(glCtx.CULL_FACE);
        // Enable depth buffering - setting the depth function to LEQUAL makes
        // the wireframes more pronounced, as long as they are rendered last.
        glCtx.enable(glCtx.DEPTH_TEST);
        glCtx.depthFunc(glCtx.LEQUAL);
        return glCtx;
    }
    function createAndUseProgram(glCtx) {
        if (!glCtx) {
            console.error("Unable to obtain WebGL context");
            return null;
        }
        // Create the vertex shader
        const vertexShader = glCtx.createShader(glCtx.VERTEX_SHADER);
        glCtx.shaderSource(vertexShader, vertexShaderSource);
        glCtx.compileShader(vertexShader);
        if (!glCtx.getShaderParameter(vertexShader, glCtx.COMPILE_STATUS)) {
            console.log(glCtx.getShaderInfoLog(vertexShader));
            glCtx.deleteShader(vertexShader);
            return null;
        }
        // Create the fragment shader
        const fragmentShader = glCtx.createShader(glCtx.FRAGMENT_SHADER);
        glCtx.shaderSource(fragmentShader, fragmentShaderSource);
        glCtx.compileShader(fragmentShader);
        if (!glCtx.getShaderParameter(fragmentShader, glCtx.COMPILE_STATUS)) {
            console.log(glCtx.getShaderInfoLog(fragmentShader));
            glCtx.deleteShader(fragmentShader);
            return null;
        }
        // Create the program
        const glProgram = glCtx.createProgram();
        glCtx.attachShader(glProgram, vertexShader);
        glCtx.attachShader(glProgram, fragmentShader);
        glCtx.linkProgram(glProgram);
        if (!glCtx.getProgramParameter(glProgram, glCtx.LINK_STATUS)) {
            console.error('Could not initialize shaders');
            return null;
        }
        glCtx.useProgram(glProgram);
        return glProgram;
    }
    const vertexShaderSource = `#version 300 es
    precision mediump float;

    uniform mat4 uMatrix;
    uniform vec3 uLightDir;

    in vec4 aVertexPosition;
    in vec3 aVertexNormal;

    out float vBrightness;

    void main(void) {
      vec3 normal = normalize(aVertexNormal);

      vBrightness = dot(mat3(uMatrix) * normal, -normalize(uLightDir));
      // vBrightness = dot(normal, -normalize(uLightDir));

      gl_Position = uMatrix * aVertexPosition;
    }`;
    const fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform vec4 uColor;

    in float vBrightness;

    out vec4 fragColor;

    void main(void) {
      fragColor = vec4(uColor.rgb * vBrightness, 1.0);
      // fragColor = vec4(uColor.rgb * (vBrightness * 0.5 + 0.5), 1.0);
    }`;
}
function createCube(size) {
    const vertices = [
        // Near
        -size, size, -size,
        size, size, -size,
        size, -size, -size,
        -size, -size, -size,
        // Top
        -size, size, size,
        size, size, size,
        size, size, -size,
        -size, size, -size,
        // Bottom
        -size, -size, -size,
        size, -size, -size,
        size, -size, size,
        -size, -size, size,
        // Left
        -size, size, size,
        -size, size, -size,
        -size, -size, -size,
        -size, -size, size,
        // Right
        size, size, -size,
        size, size, size,
        size, -size, size,
        size, -size, -size,
        // Far
        -size, size, size,
        size, size, size,
        size, -size, size,
        -size, -size, size,
    ];
    const solidIndices = [
        // Near
        0, 2, 1, 0, 3, 2,
        // Top
        4, 6, 5, 4, 7, 6,
        // Bottom
        8, 10, 9, 8, 11, 10,
        // Left
        12, 14, 13, 12, 15, 14,
        // Right
        16, 18, 17, 16, 19, 18,
        // Far
        20, 22, 21, 20, 23, 22,
    ];
    const wireframeIndices = [
        // Near
        0, 1, 1, 2, 2, 3, 3, 0,
        // Top
        4, 5, 5, 6, 6, 7, 7, 4,
        // Bottom
        8, 9, 9, 10, 10, 11, 11, 8,
        // Left
        12, 13, 13, 14, 14, 15, 15, 12,
        // Right
        16, 17, 17, 18, 18, 19, 19, 16,
        // Far
        20, 21, 21, 22, 22, 23, 23, 20
    ];
    const normals = [
        // Near
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // Top
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        // Bottom
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        // Left
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        // Right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // Far
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    ];
    return {
        vertices,
        normals,
        solidIndices,
        wireframeIndices,
    };
}
//# sourceMappingURL=index4.js.map