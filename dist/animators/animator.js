import { FpsCounter } from "./fpsCounter.js";
export class Animator {
    constructor(scene, camera, updateMS, cancelToken, fpsFunc) {
        this.scene = scene;
        this.camera = camera;
        this.updateMS = updateMS;
        this.cancelToken = cancelToken;
        this.fpsFunc = fpsFunc;
        this.fpsCounter = new FpsCounter(5);
    }
    //
    // Start animation loop
    //
    animate() {
        this.oldTime = performance.now();
        this.doLoop(this.oldTime);
    }
    //
    // Perform the animation loop until the cancel token is set
    //
    doLoop(timestamp) {
        if (timestamp > this.oldTime + this.updateMS) {
            this.doRender();
            this.fpsCounter.addFps(1000 / (timestamp - this.oldTime));
            if (this.fpsFunc) {
                this.fpsFunc(Math.floor(this.fpsCounter.avgFps + 0.5));
            }
            this.oldTime = timestamp;
        }
        if (!this.cancelToken.cancelledByClient) {
            window.requestAnimationFrame(() => this.doLoop(performance.now()));
        }
        else {
            this.cancelToken.cancelledByServer = true;
            this.cancel();
        }
    }
    //
    // Called when the animator is cancelled
    //
    cancel() {
        return;
    }
}
//# sourceMappingURL=animator.js.map