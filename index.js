{
    const canvasElement = document.querySelector("#webGlCanvas");
    window.onload = () => init(canvasElement);
    function init(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const glCtx = canvas.getContext("webgl2");
        // Create the vertex shader
        const vertexShader = glCtx.createShader(glCtx.VERTEX_SHADER);
        glCtx.shaderSource(vertexShader, vertexShaderSource);
        glCtx.compileShader(vertexShader);
        // Create the fragment shader
        const fragmentShader = glCtx.createShader(glCtx.FRAGMENT_SHADER);
        glCtx.shaderSource(fragmentShader, fragmentShaderSource);
        glCtx.compileShader(fragmentShader);
        // Create and use the program
        const glProgram = glCtx.createProgram();
        glCtx.attachShader(glProgram, vertexShader);
        glCtx.attachShader(glProgram, fragmentShader);
        glCtx.linkProgram(glProgram);
        glCtx.useProgram(glProgram);
        const vertices = [
            -0.5, 0.5, 0,
            0.5, 0.5, 0,
            0.5, -0.5, 0,
            -0.5, -0.5, 0,
        ];
        const wireframeIndices = [
            0, 1,
            1, 2,
            2, 3,
            3, 0
        ];
        const vertexBuffer = glCtx.createBuffer();
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);
        glCtx.bufferData(glCtx.ARRAY_BUFFER, new Float32Array(vertices), glCtx.STATIC_DRAW);
        const wireframeIndexBuffer = glCtx.createBuffer();
        glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, wireframeIndexBuffer);
        glCtx.bufferData(glCtx.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireframeIndices), glCtx.STATIC_DRAW);
        // Unbind
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, null);
        glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, null);
        // Clear the scene
        glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);
        glCtx.viewport(0, 0, glCtx.canvas.width, glCtx.canvas.height);
        // Use the buffers we've constructed
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, vertexBuffer);
        const vertexPosition = glCtx.getAttribLocation(glProgram, "aVertexPosition");
        glCtx.vertexAttribPointer(vertexPosition, 3, glCtx.FLOAT, false, 0, 0);
        glCtx.enableVertexAttribArray(vertexPosition);
        // Get uniforms
        const uniformColour = glCtx.getUniformLocation(glProgram, "uColor");
        glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, wireframeIndexBuffer);
        glCtx.uniform4fv(uniformColour, new Float32Array([0, 0, 1, 1]));
        glCtx.drawElements(glCtx.LINES, wireframeIndices.length, glCtx.UNSIGNED_SHORT, 0);
        // Unbind buffers
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, null);
        glCtx.bindBuffer(glCtx.ELEMENT_ARRAY_BUFFER, null);
    }
    const vertexShaderSource = `#version 300 es
    precision mediump float;

    in vec4 aVertexPosition;

    void main(void) {
      gl_Position = aVertexPosition;
    }`;
    const fragmentShaderSource = `#version 300 es
    precision mediump float;

    uniform vec4 uColor;

    out vec4 fragColor;

    void main(void) {
      fragColor = uColor;
    }`;
}
