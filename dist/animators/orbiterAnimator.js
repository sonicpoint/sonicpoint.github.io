import { Animator } from "./animator.js";
import { Transformation } from "../transformation.js";
export class OrbiterAnimator extends Animator {
    constructor(scene, camera, cancelToken, fpsFunc, canvas, zStep) {
        super(scene, camera, 60, cancelToken, fpsFunc);
        this.canvas = canvas;
        this.zStep = zStep;
        this.prevMouseLocation = { x: 0, y: 0 };
        this.totalRotation = { x: 0, y: 0 };
        this.limits = { minX: -Math.PI / 2, maxX: Math.PI / 2, minY: -Math.PI / 2, maxY: Math.PI / 2 };
        // zStep is how far to move when moving in Z direction
        this.zStep = zStep ? zStep : 1;
        this.isMouseDown = false;
        this.addMouseEvents();
    }
    setLimits(limits) {
        this.totalRotation = { x: 0, y: 0 };
        this.camera.reset();
        if (limits.maxZ !== undefined && this.camera.initialDistance > limits.maxZ) {
            this.camera.moveZ(limits.maxZ - this.camera.initialDistance);
        }
        if (limits.minZ !== undefined && this.camera.initialDistance < limits.minZ) {
            this.camera.moveZ(limits.minZ - this.camera.initialDistance);
        }
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
        this.wheelEventHandler = (event) => this.onWheel(event);
        this.canvas.addEventListener("mousedown", this.mouseDownEventHandler, false);
        this.canvas.addEventListener("mouseup", this.mouseUpEventHandler, false);
        this.canvas.addEventListener("mousemove", this.mouseMoveEventHandler, false);
        this.canvas.addEventListener("wheel", this.wheelEventHandler, false);
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
            if (event.ctrlKey) {
                let toMoveZ = y * this.zStep;
                if (this.limits.maxZ !== undefined && this.camera.distance + y * this.zStep > this.limits.maxZ) {
                    toMoveZ = this.limits.maxZ - this.camera.distance;
                }
                if (this.limits.minZ !== undefined && this.camera.distance + y * this.zStep <= this.limits.minZ) {
                    toMoveZ = this.limits.minZ - this.camera.distance;
                }
                this.camera.moveZ(toMoveZ);
            }
            else {
                this.rotate(x * Math.PI / 360, y * Math.PI / 360);
            }
            this.prevMouseLocation = { x: event.x, y: event.y };
        }
    }
    onWheel(event) {
        let toMoveZ = event.deltaY * this.zStep * 0.1;
        if (this.limits.maxZ !== undefined && this.camera.distance + toMoveZ > this.limits.maxZ) {
            toMoveZ = this.limits.maxZ - this.camera.distance;
        }
        if (this.limits.minZ !== undefined && this.camera.distance + toMoveZ <= this.limits.minZ) {
            toMoveZ = this.limits.minZ - this.camera.distance;
        }
        this.camera.moveZ(toMoveZ);
    }
    rotate(angleInRadiansX, angleInRadiansY) {
        if (this.limits.maxX !== undefined && angleInRadiansX + this.totalRotation.x >= this.limits.maxX) {
            angleInRadiansX = this.limits.maxX - this.totalRotation.x;
        }
        else if (this.limits.minX !== undefined && angleInRadiansX + this.totalRotation.x < this.limits.minX) {
            angleInRadiansX = this.limits.minX - this.totalRotation.x;
        }
        if (this.limits.maxY !== undefined && angleInRadiansY + this.totalRotation.y >= this.limits.maxY) {
            angleInRadiansY = this.limits.maxY - this.totalRotation.y;
        }
        else if (this.limits.minY !== undefined && angleInRadiansY + this.totalRotation.y < this.limits.minY) {
            angleInRadiansY = this.limits.minY - this.totalRotation.y;
        }
        this.camera.transform(new Transformation()
            .rotateX(-this.totalRotation.y)
            .rotateY(angleInRadiansX)
            .rotateX(angleInRadiansY)
            .rotateX(this.totalRotation.y));
        this.totalRotation.x += angleInRadiansX;
        this.totalRotation.y += angleInRadiansY;
    }
}
//# sourceMappingURL=orbiterAnimator.js.map
