import { Animator } from "./animator.js";
import { Transformation } from "../transformation.js";
//
// Animator to move either the model or the camera
//
export class MixedAnimator extends Animator {
    constructor(scene, camera, cancelToken, fpsFunc, canvas, sceneItems) {
        super(scene, camera, 30, cancelToken, fpsFunc);
        this.canvas = canvas;
        this.sceneItems = sceneItems;
        this.prevMouseLocation = { x: 0, y: 0 };
        this.totalModelRotation = { x: 0, y: 0 };
        this.totalCameraRotation = { x: 0, y: 0 };
        this.limits = { minX: -Math.PI / 2, maxX: Math.PI / 2, minY: -Math.PI / 2, maxY: Math.PI / 2 };
        this.isMouseDown = false;
        this.addMouseEvents();
    }
    setLimits(limits) {
        this.totalCameraRotation = { x: 0, y: 0 };
        this.camera.reset();
        this.limits = limits;
    }
    //
    // Transform and render
    //
    doRender() {
        this.scene.render(this.camera, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    cancel() {
        this.removeMouseEvents();
    }
    addMouseEvents() {
        this.mouseDownEventHandler = (event) => this.onMouseDown(event);
        this.mouseUpEventHandler = (event) => this.onMouseUp(event);
        this.mouseMoveEventHandler = (event) => this.onMouseMove(event);
        this.canvas.addEventListener("mousedown", this.mouseDownEventHandler, false);
        this.canvas.addEventListener("mouseup", this.mouseUpEventHandler, false);
        this.canvas.addEventListener("mousemove", this.mouseMoveEventHandler, false);
    }
    onMouseDown(event) {
        this.prevMouseLocation = { x: event.x, y: event.y };
        this.isMouseDown = true;
    }
    onMouseUp(event) {
        this.isMouseDown = false;
    }
    removeMouseEvents() {
        this.canvas.removeEventListener("mousedown", this.mouseDownEventHandler, false);
        this.canvas.removeEventListener("mouseup", this.mouseUpEventHandler, false);
        this.canvas.removeEventListener("mousemove", (event) => this.mouseMoveEventHandler, false);
    }
    onMouseMove(event) {
        if (this.isMouseDown) {
            const x = this.prevMouseLocation.x - event.x;
            const y = this.prevMouseLocation.y - event.y;
            let amountToRotateX = x * Math.PI / 360;
            let amountToRotateY = y * Math.PI / 360;
            if (event.ctrlKey) {
                if (this.limits.maxY !== undefined && amountToRotateY + this.totalCameraRotation.y >= this.limits.maxY) {
                    amountToRotateY = this.limits.maxY - this.totalCameraRotation.y;
                }
                else if (this.limits.minY !== undefined && amountToRotateY + this.totalCameraRotation.y < this.limits.minY) {
                    amountToRotateY = this.limits.minY - this.totalCameraRotation.y;
                }
                this.camera.transform(new Transformation()
                    .rotateX(-this.totalCameraRotation.y)
                    .rotateY(amountToRotateX)
                    .rotateX(amountToRotateY)
                    .rotateX(this.totalCameraRotation.y));
                this.totalCameraRotation.x += amountToRotateX;
                this.totalModelRotation.x -= amountToRotateX;
                this.totalCameraRotation.y += amountToRotateY;
                this.totalModelRotation.y -= amountToRotateY;
                this.prevMouseLocation = { x: event.x, y: event.y };
            }
            else {
                // if (this.limits.maxX !== undefined && (amountToRotateX - this.totalModelRotation.x + this.totalCameraRotation.x) >= this.limits.maxX) {
                //   amountToRotateX = this.limits.maxX + this.totalModelRotation.x;
                // } else if (this.limits.minX !== undefined && (amountToRotateX - this.totalModelRotation.x  + this.totalCameraRotation.x) < this.limits.minX) {
                //   amountToRotateX = this.limits.minX + this.totalModelRotation.x;
                // }
                if (this.limits.maxY !== undefined && amountToRotateY - this.totalModelRotation.y - this.totalCameraRotation.y >= this.limits.maxY) {
                    amountToRotateY = this.limits.maxY + this.totalModelRotation.y + this.totalCameraRotation.y;
                }
                else if (this.limits.minY !== undefined && amountToRotateY - this.totalModelRotation.y - this.totalCameraRotation.y < this.limits.minY) {
                    amountToRotateY = this.limits.minY + this.totalModelRotation.y + this.totalCameraRotation.y;
                }
                this.sceneItems.forEach(sceneItem => {
                    sceneItem.applyTransformation(new Transformation()
                        .rotateY(-this.totalModelRotation.x));
                    sceneItem.applyTransformation(new Transformation()
                        .rotateY(-amountToRotateX)
                        .rotateX(-amountToRotateY));
                    sceneItem.applyTransformation(new Transformation()
                        .rotateY(this.totalModelRotation.x));
                });
                this.totalModelRotation.x -= amountToRotateX;
                this.totalModelRotation.y -= amountToRotateY;
                this.prevMouseLocation = { x: event.x, y: event.y };
            }
        }
    }
}
//# sourceMappingURL=mixedAnimator.js.map