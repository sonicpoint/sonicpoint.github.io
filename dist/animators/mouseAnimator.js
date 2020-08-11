import { Animator } from "./animator.js";
import { Transformation } from "./../transformation.js";
export class MouseAnimator extends Animator {
    constructor(scene, camera, cancelToken, fpsFunc, canvas, zStep) {
        super(scene, camera, 30, cancelToken, fpsFunc);
        this.canvas = canvas;
        this.zStep = zStep;
        this.transformation = new Transformation();
        this.prevMouseLocation = { x: 0, y: 0 };
        // zStep is how far to move when moving in Z direction
        this.zStep = zStep ? zStep : 1;
        this.isMouseDown = false;
        this.addMouseEvents();
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
            if (event.ctrlKey) {
                const y = this.prevMouseLocation.y - event.y;
                this.camera.moveZ(y * this.zStep);
                const x = this.prevMouseLocation.x - event.x;
                this.camera.rotateZ(x * Math.PI / (event.y < this.canvas.clientHeight / 2 ? -360 : 360));
                this.prevMouseLocation = { x: event.x, y: event.y };
            }
            else {
                const x = this.prevMouseLocation.x - event.x;
                const y = this.prevMouseLocation.y - event.y;
                this.transformation.rotateY(x * Math.PI / 360).rotateX(y * Math.PI / 360);
                this.camera.transform(new Transformation().rotateY(x * Math.PI / 360).rotateX(y * Math.PI / 360));
                this.prevMouseLocation = { x: event.x, y: event.y };
            }
        }
    }
}
//# sourceMappingURL=mouseAnimator.js.map