import { Program } from "../programs/program.js";
import { BlurProgram } from "../programs/experimental/blurProgram.js";
export class Bloom {
    constructor(glCtx, glTextureInput) {
        this.glCtx = glCtx;
        this.glTextureInput = glTextureInput;
    }
    //
    // 'Ping-pong' between frame buffers, adding to texture each time.
    //
    process() {
        const framebufferInfo1 = Program.createFramebuffer(this.glCtx, this.glCtx.canvas.width, this.glCtx.canvas.height, 1, false);
        const framebuffer1 = framebufferInfo1.glFramebuffer;
        const texture1 = framebufferInfo1.glTextures[0];
        const framebufferInfo2 = Program.createFramebuffer(this.glCtx, this.glCtx.canvas.width, this.glCtx.canvas.height, 1, false);
        const framebuffer2 = framebufferInfo2.glFramebuffer;
        const texture2 = framebufferInfo2.glTextures[0];
        this.glCtx.bindTexture(this.glCtx.TEXTURE_2D, texture2);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_WRAP_S, this.glCtx.CLAMP_TO_EDGE);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_WRAP_T, this.glCtx.CLAMP_TO_EDGE);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MIN_FILTER, this.glCtx.NEAREST);
        this.glCtx.texParameteri(this.glCtx.TEXTURE_2D, this.glCtx.TEXTURE_MAG_FILTER, this.glCtx.NEAREST);
        this.glCtx.texImage2D(this.glCtx.TEXTURE_2D, 0, this.glCtx.RGBA, this.glCtx.canvas.width, this.glCtx.canvas.height, 0, this.glCtx.RGBA, this.glCtx.UNSIGNED_BYTE, null);
        const blurProgramX = new BlurProgram(this.glCtx, this.glTextureInput, texture1, framebuffer1, false);
        blurProgramX.executeBlur(this.glTextureInput, framebuffer1, this.glCtx.TRIANGLES);
        const blurProgramY = new BlurProgram(this.glCtx, texture1, texture2, framebuffer2, true);
        blurProgramY.executeBlur(texture1, framebuffer2, this.glCtx.TRIANGLES);
        for (let i = 0; i < 5; i++) {
            blurProgramX.executeBlur(texture2, framebuffer1, this.glCtx.TRIANGLES);
            blurProgramY.executeBlur(texture1, framebuffer2, this.glCtx.TRIANGLES);
        }
        this.glTextureOutput = texture2;
        this.glCtx.deleteTexture(texture1);
        this.glCtx.deleteFramebuffer(framebuffer1);
        this.glCtx.deleteFramebuffer(framebuffer2);
    }
}
//# sourceMappingURL=bloom.js.map