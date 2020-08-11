import { Program } from './program.js';
export class PostProcProgram extends Program {
    constructor(glCtx, vertexShader, fragmentShader, frameBufferInfo) {
        super(glCtx, vertexShader, fragmentShader);
        this.glCtx = glCtx;
        this.frameBufferInfo = frameBufferInfo;
    }
}
//# sourceMappingURL=postProcProgram.js.map