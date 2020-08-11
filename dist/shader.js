export class Shader {
    //
    // Constructor
    //
    constructor(glCtx, source, type) {
        this.glCtx = glCtx;
        this.source = source;
        if (!this.createShader(type)) {
            throw Error(`Failed to create shader: ${type}`);
        }
    }
    //
    // Create the WebGL shader object
    //
    createShader(type) {
        this.glShader = this.glCtx.createShader(type);
        this.glCtx.shaderSource(this.glShader, this.source);
        this.glCtx.compileShader(this.glShader);
        const isSuccess = this.glCtx.getShaderParameter(this.glShader, this.glCtx.COMPILE_STATUS);
        if (isSuccess) {
            return true;
        }
        console.log(this.glCtx.getShaderInfoLog(this.glShader));
        this.glCtx.deleteShader(this.glShader);
        return false;
    }
}
//# sourceMappingURL=shader.js.map