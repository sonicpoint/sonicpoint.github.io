import * as vec3 from "../utils/gl-matrix/vec3.js";
import { TransformationPath } from "../transformationPaths/TransformationPath.js";
import { Light } from "./light.js";
export class DirectionalLight extends Light {
    constructor(lightDirection, diffuse, ambient, specular, transformationPath) {
        super();
        this.lightDirection = lightDirection;
        this.diffuse = diffuse;
        this.ambient = ambient;
        this.specular = specular;
        this.transformationPath = transformationPath;
        this.diffuse = diffuse === undefined ? [1, 1, 1, 1] : diffuse;
        this.ambient = ambient === undefined ? [0, 0, 0, 0] : ambient;
        this.specular = specular === undefined ? [1, 1, 1, 1] : ambient;
        this.transformationPath = transformationPath ? transformationPath : new TransformationPath();
    }
    update() {
        if (this.transformationPath) {
            vec3.transformMat4(this.lightDirection, this.lightDirection, this.transformationPath.current.matrix);
            this.transformationPath.moveNext();
        }
    }
}
//# sourceMappingURL=directionalLight.js.map