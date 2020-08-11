import { Animator } from "./animator.js";
export class NullAnimator extends Animator {
    constructor(scene, camera, cancelToken, fpsFunc) {
        super(scene, camera, 30, cancelToken, fpsFunc);
    }
    doRender() {
        this.scene.render(this.camera, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
}
//# sourceMappingURL=nullAnimator.js.map