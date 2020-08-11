import * as mat4 from "./utils/gl-matrix/mat4.js";
export class Camera {
    constructor(glCtx, fieldOfView, zNear, zFar, initialDistance, isPerspective) {
        this.fieldOfView = fieldOfView;
        this.zNear = zNear;
        this.zFar = zFar;
        this.initialDistance = initialDistance;
        this.matrix = mat4.create();
        this.projectionMatrix = [];
        this.perspectiveMatrix = [];
        this.orthoMatrix = [];
        mat4.perspective(this.perspectiveMatrix, fieldOfView, glCtx.canvas.width / glCtx.canvas.height, zNear, zFar);
        // Arbitrarily set the ortho dimensions to 150x150 - needs some calculation
        // to determine a general formula for this, that fits on the screen
        mat4.ortho(this.orthoMatrix, -150, 150, -150, 150, zNear, zFar);
        this.orthoMatrix[0] *= glCtx.canvas.height / glCtx.canvas.width;
        this.reset(isPerspective);
    }
    reset(isPerspective) {
        // Default perspective to true
        isPerspective = !(isPerspective === false);
        this.distance = this.initialDistance;
        mat4.identity(this.matrix);
        mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
        mat4.copy(this.projectionMatrix, isPerspective ? this.perspectiveMatrix : this.orthoMatrix);
    }
    transform(transformation) {
        mat4.translate(this.matrix, this.matrix, [0, 0, -this.distance]);
        mat4.multiply(this.matrix, this.matrix, transformation.matrix);
        mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    }
    rotateX(angle) {
        mat4.translate(this.matrix, this.matrix, [0, 0, -this.distance]);
        mat4.rotate(this.matrix, this.matrix, angle, [1, 0, 0]);
        mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    }
    rotateY(angle) {
        mat4.translate(this.matrix, this.matrix, [0, 0, -this.distance]);
        mat4.rotate(this.matrix, this.matrix, angle, [0, 1, 0]);
        mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    }
    rotateZ(angle) {
        mat4.translate(this.matrix, this.matrix, [0, 0, -this.distance]);
        mat4.rotate(this.matrix, this.matrix, angle, [0, 0, 1]);
        mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    }
    moveZ(distance) {
        mat4.translate(this.matrix, this.matrix, [0, 0, -this.distance]);
        this.distance += distance;
        mat4.translate(this.matrix, this.matrix, [0, 0, this.distance]);
    }
    moveX(distance) {
        mat4.translate(this.matrix, this.matrix, [distance, 0, 0]);
    }
}
//# sourceMappingURL=camera.js.map