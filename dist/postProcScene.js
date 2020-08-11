import * as mat4 from "./utils/gl-matrix/mat4.js";
import { SceneBase } from "./sceneBase.js";
export class PostProcScene extends SceneBase {
    constructor(glCtx, camera, lighting, sceneItems, transformationPaths, framebufferInfo, postProcFunc, allowTransparency) {
        super();
        this.glCtx = glCtx;
        this.camera = camera;
        this.lighting = lighting;
        this.sceneItems = sceneItems;
        this.transformationPaths = transformationPaths;
        this.framebufferInfo = framebufferInfo;
        this.postProcFunc = postProcFunc;
        this.isBloom = false;
        this.matrixStack = [];
        // Turn on culling. By default backfacing triangles will be culled.
        this.glCtx.enable(this.glCtx.CULL_FACE);
        // Enable depth buffering - setting the depth function to LEQUAL makes
        // the wireframes more pronounced, as long as they are rendered last.
        this.glCtx.enable(this.glCtx.DEPTH_TEST);
        this.glCtx.depthFunc(this.glCtx.LEQUAL);
        // Flip texture images so that they're the correct way up
        this.glCtx.pixelStorei(this.glCtx.UNPACK_FLIP_Y_WEBGL, true);
        // polygon offset is used to make grid lines show up properly
        this.glCtx.enable(this.glCtx.POLYGON_OFFSET_FILL);
        if (allowTransparency) {
            // Enable alpha blending to allow for transparent objects
            this.glCtx.enable(this.glCtx.BLEND);
            this.glCtx.blendFunc(this.glCtx.SRC_ALPHA, this.glCtx.ONE_MINUS_SRC_ALPHA);
        }
    }
    render(camera, modelMatrix) {
        this.glCtx.clearColor(0.0, 0.0, 0.0, 0.0);
        // Clear screen and frame buffer
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, this.framebufferInfo.glFramebuffer);
        this.glCtx.clear(this.glCtx.COLOR_BUFFER_BIT | this.glCtx.DEPTH_BUFFER_BIT);
        this.glCtx.bindFramebuffer(this.glCtx.FRAMEBUFFER, null);
        this.glCtx.clear(this.glCtx.COLOR_BUFFER_BIT | this.glCtx.DEPTH_BUFFER_BIT);
        this.glCtx.viewport(0, 0, this.glCtx.canvas.width, this.glCtx.canvas.height);
        const viewMatrix = [];
        mat4.invert(viewMatrix, camera.matrix);
        this.sceneItems.forEach(sceneItem => {
            // Cache the world matrix so each SceneItem has its own copy
            const matrixClone = mat4.clone(modelMatrix);
            this.matrixStack.push(matrixClone);
            sceneItem.draw(this.camera, this.lighting, viewMatrix, modelMatrix);
            // Restore the cached world matrix
            modelMatrix = this.matrixStack.pop();
        });
        this.postProcFunc(this.framebufferInfo);
        // Progress all the TransformationPaths in the scene
        this.transformationPaths.forEach(tp => tp.moveNext());
    }
    suspendAnimation() {
        this.transformationPaths.forEach(tp => tp.suspend());
    }
    resumeAnimation() {
        this.transformationPaths.forEach(tp => tp.resume());
    }
}
//# sourceMappingURL=postProcScene.js.map