import * as mat4 from "./utils/gl-matrix/mat4.js";
export class SceneItem {
    constructor(program, drawMode, isVisible, material, transformationPath) {
        this.program = program;
        this.drawMode = drawMode;
        this.isVisible = isVisible;
        this.material = material;
        this.transformationPath = transformationPath;
        this.localMatrix = mat4.create();
    }
    draw(camera, lighting, viewMatrix, modelMatrix) {
        if (this.transformationPath) {
            // Apply TransformationPath to local transformation, even if scene item is not visible
            mat4.multiply(this.localMatrix, this.localMatrix, this.transformationPath.current.matrix);
        }
        if (this.isVisible) {
            mat4.multiply(modelMatrix, modelMatrix, this.localMatrix);
            this.program.execute(viewMatrix, modelMatrix, lighting, camera, this.drawMode);
        }
    }
    //
    // Apply a one-off transformation to the local matrix
    //
    applyTransformation(transformation) {
        mat4.multiply(this.localMatrix, this.localMatrix, transformation.matrix);
    }
}
//# sourceMappingURL=sceneItem.js.map