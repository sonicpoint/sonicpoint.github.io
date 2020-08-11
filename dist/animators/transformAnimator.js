import { Animator } from "./animator.js";
import { Transformation } from "./../transformation.js";
export class TransformAnimator extends Animator {
    //
    // Constructor
    //
    constructor(scene, camera, cancelToken, fpsFunc, transformation, startTransformation) {
        super(scene, camera, 30, cancelToken, fpsFunc);
        this.transformation = transformation;
        this.startTransformation = startTransformation;
        this.startTransformation = startTransformation ||
            new Transformation([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        this.startTransformationInverse = new Transformation(this.startTransformation.matrix).invert();
        this.camera.transform(this.startTransformation);
    }
    //
    // Transform and render
    //
    doRender() {
        this.camera.transform(this.startTransformationInverse);
        this.camera.transform(this.transformation);
        this.camera.transform(this.startTransformation);
        this.scene.render(this.camera, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
}
//# sourceMappingURL=transformAnimator.js.map