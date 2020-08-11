import { Animator } from "./animator.js";
import { Transformation } from "../transformation.js";
import * as mat4 from "./../utils/gl-matrix/mat4.js";
export class WalkerAnimator extends Animator {
    constructor(scene, camera, cancelToken, fpsFunc, canvas, stepSize) {
        super(scene, camera, 30, cancelToken, fpsFunc);
        this.canvas = canvas;
        this.stepSize = stepSize;
        this.prevMouseLocation = { x: 0, y: 0 };
        this.totalRotation = { x: 0, y: 0 };
        this.limits = { minY: -Math.PI / 2, maxY: Math.PI / 2 };
        this.isMouseDown = false;
        this.stepSize = stepSize === undefined ? 10 : stepSize;
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
        this.keyPressEventHandler = (event) => this.onKeyPress(event);
        this.canvas.addEventListener("mousedown", this.mouseDownEventHandler, false);
        this.canvas.addEventListener("mouseup", this.mouseUpEventHandler, false);
        this.canvas.addEventListener("mousemove", this.mouseMoveEventHandler, false);
        window.addEventListener("keypress", this.keyPressEventHandler, false);
    }
    onMouseDown(event) {
        this.prevMouseLocation = { x: event.x, y: event.y };
        this.isMouseDown = true;
    }
    onMouseUp(event) {
        this.isMouseDown = false;
    }
    onMouseMove(event) {
        if (this.isMouseDown) {
            const x = this.prevMouseLocation.x - event.x;
            const y = this.prevMouseLocation.y - event.y;
            let amountToRotateX = x * Math.PI / 1440;
            let amountToRotateY = y * Math.PI / 1440;
            if (this.limits.maxX !== undefined && amountToRotateX + this.totalRotation.x >= this.limits.maxX) {
                amountToRotateX = this.limits.maxX - this.totalRotation.x;
            }
            else if (this.limits.minX !== undefined && amountToRotateX + this.totalRotation.x < this.limits.minX) {
                amountToRotateX = this.limits.minX - this.totalRotation.x;
            }
            if (this.limits.maxY !== undefined && amountToRotateY + this.totalRotation.y >= this.limits.maxY) {
                amountToRotateY = this.limits.maxY - this.totalRotation.y;
            }
            else if (this.limits.minY !== undefined && amountToRotateY + this.totalRotation.y < this.limits.minY) {
                amountToRotateY = this.limits.minY - this.totalRotation.y;
            }
            this.camera.transform(new Transformation()
                .rotateX(-this.totalRotation.y)
                .rotateY(amountToRotateX)
                .rotateX(amountToRotateY)
                .rotateX(this.totalRotation.y));
            this.totalRotation.x += amountToRotateX;
            this.totalRotation.y += amountToRotateY;
            this.prevMouseLocation = { x: event.x, y: event.y };
        }
    }
    removeMouseEvents() {
        this.canvas.removeEventListener("mousedown", this.mouseDownEventHandler, false);
        this.canvas.removeEventListener("mouseup", this.mouseUpEventHandler, false);
        this.canvas.removeEventListener("mousemove", this.mouseMoveEventHandler, false);
        window.removeEventListener("keypress", this.keyPressEventHandler, false);
    }
    onKeyPress(event) {
        switch (event.key) {
            case "w":
                if (!this.checkIfMoveValid([0, 0, -this.stepSize])) {
                    break;
                }
                this.camera.transform(this.translateFromHorizontal([0, 0, -this.stepSize]));
                break;
            case "s":
                if (!this.checkIfMoveValid([0, 0, this.stepSize])) {
                    break;
                }
                this.camera.transform(this.translateFromHorizontal([0, 0, this.stepSize]));
                break;
            case "a":
                if (!this.checkIfMoveValid([-this.stepSize, 0, 0])) {
                    break;
                }
                this.camera.moveX(-this.stepSize);
                break;
            case "d":
                if (!this.checkIfMoveValid([this.stepSize, 0, 0])) {
                    break;
                }
                this.camera.moveX(this.stepSize);
                break;
            default:
                break;
        }
    }
    // To avoid a change in the Y location, reset camera to origin before translation
    translateFromOrigin(translationVector) {
        const matrix = [];
        mat4.invert(matrix, this.camera.matrix);
        mat4.translate(matrix, matrix, translationVector);
        mat4.multiply(matrix, matrix, this.camera.matrix);
        return new Transformation(matrix);
    }
    // To avoid a change in the Y location, reset camera to horizontal before translation
    translateFromHorizontal(translationVector) {
        const matrix = mat4.create();
        mat4.rotateX(matrix, matrix, -this.totalRotation.y);
        mat4.translate(matrix, matrix, translationVector);
        mat4.rotateX(matrix, matrix, this.totalRotation.y);
        return new Transformation(matrix);
    }
    //
    // Very bespoke test for movement - need a generic way of doing this
    //
    checkIfMoveValid(movementVector) {
        const matrix = mat4.create();
        mat4.rotateX(matrix, this.camera.matrix, -this.totalRotation.y);
        mat4.rotateX(matrix, matrix, -this.totalRotation.y);
        mat4.translate(matrix, matrix, movementVector);
        mat4.rotateX(matrix, matrix, this.totalRotation.y);
        mat4.rotateX(matrix, matrix, this.totalRotation.y);
        const newLocationX = matrix[12];
        const newLocationZ = matrix[14];
        // Courtyard
        if ((newLocationX >= -400 && newLocationX <= 400 &&
            newLocationZ >= 170 && newLocationZ <= 720)) {
            return true;
        }
        // Room
        if ((newLocationX >= -150 && newLocationX <= 150 &&
            newLocationZ >= -150 && newLocationZ <= 170)) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=walkerAnimator.js.map