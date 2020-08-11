import { FramebufferInfo } from '../framebufferInfo.js';
export class Program {
    constructor(glCtx, vertexShader, fragmentShader) {
        this.glCtx = glCtx;
        this.attributes = new Map();
        this.uniforms = new Map();
        this.glProgram = glCtx.createProgram();
        glCtx.attachShader(this.glProgram, vertexShader.glShader);
        glCtx.attachShader(this.glProgram, fragmentShader.glShader);
        glCtx.linkProgram(this.glProgram);
        if (!glCtx.getProgramParameter(this.glProgram, glCtx.LINK_STATUS)) {
            console.error('Could not initialize shaders');
        }
    }
    bindTexture(image) {
        const glTexture = this.glCtx.createTexture();
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, glTexture);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, image);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.LINEAR);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.LINEAR);
        return glTexture;
    }
    static createFramebuffer(glCtx, width, height, textureCount, hasRenderbuffer) {
        const framebuffer = glCtx.createFramebuffer();
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, framebuffer);
        const textures = [];
        for (let i = 0; i < textureCount; i++) {
            const texture = Program.createTexture(glCtx, width, height, null);
            glCtx.framebufferTexture2D(glCtx.FRAMEBUFFER, glCtx.COLOR_ATTACHMENT0 + i, glCtx.TEXTURE_2D, texture, 0);
            textures.push(texture);
        }
        let renderbuffer;
        if (hasRenderbuffer) {
            renderbuffer = Program.createRenderbuffer(glCtx, width, height);
            glCtx.framebufferRenderbuffer(glCtx.FRAMEBUFFER, glCtx.DEPTH_ATTACHMENT, glCtx.RENDERBUFFER, renderbuffer);
        }
        else {
            renderbuffer = null;
        }
        glCtx.bindTexture(glCtx.TEXTURE_2D, null);
        glCtx.bindRenderbuffer(glCtx.RENDERBUFFER, null);
        glCtx.bindFramebuffer(glCtx.FRAMEBUFFER, null);
        return new FramebufferInfo(framebuffer, textures, renderbuffer);
    }
    static createRenderbuffer(glCtx, width, height) {
        const renderbuffer = glCtx.createRenderbuffer();
        glCtx.bindRenderbuffer(glCtx.RENDERBUFFER, renderbuffer);
        glCtx.renderbufferStorage(glCtx.RENDERBUFFER, glCtx.DEPTH_COMPONENT16, width, height);
        return renderbuffer;
    }
    static createTexture(glCtx, width, height, image) {
        const texture = glCtx.createTexture();
        glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST);
        glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST);
        glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, width, height, 0, glCtx.RGBA, glCtx.UNSIGNED_BYTE, image);
        return texture;
    }
    createAttribute(attributeName) {
        this.attributes.set(attributeName, this.glCtx.getAttribLocation(this.glProgram, attributeName));
    }
    createUniform(uniformName) {
        this.uniforms.set(uniformName, this.glCtx.getUniformLocation(this.glProgram, uniformName));
    }
}
//# sourceMappingURL=program.js.map