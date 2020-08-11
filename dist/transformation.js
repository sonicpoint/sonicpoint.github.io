import * as mat4 from "./utils/gl-matrix/mat4.js";
export class Transformation {
    constructor(matrix) {
        if (matrix) {
            this._matrix = matrix;
        }
        else {
            this._matrix = mat4.create();
        }
    }
    get matrix() {
        return this._matrix;
    }
    setMatrix(m4) {
        mat4.copy(this._matrix, m4);
        return this;
    }
    applyMatrix(m4) {
        mat4.multiply(this._matrix, this._matrix, m4);
        return this;
    }
    translate(tx, ty, tz) {
        mat4.translate(this._matrix, this._matrix, [tx, ty, tz]);
        return this;
    }
    rotateX(angleInRadians) {
        mat4.rotateX(this._matrix, this._matrix, angleInRadians);
        return this;
    }
    rotateY(angleInRadians) {
        mat4.rotateY(this._matrix, this._matrix, angleInRadians);
        return this;
    }
    rotateZ(angleInRadians) {
        mat4.rotateZ(this._matrix, this._matrix, angleInRadians);
        return this;
    }
    scale(sx, sy, sz) {
        mat4.scale(this._matrix, this._matrix, [sx, sy, sz]);
        return this;
    }
    invert() {
        const temp = [];
        mat4.invert(temp, this._matrix);
        this._matrix = temp;
        return this;
    }
}
//# sourceMappingURL=transformation.js.map