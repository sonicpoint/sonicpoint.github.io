import * as vec3 from "../utils/gl-matrix/vec3.js";
import { TransformationPath } from "../transformationPaths/TransformationPath.js";
import { Light } from "./light.js";
export class PositionalLight extends Light {
    constructor(lightPosition, diffuse, ambient, specular, transformationPath) {
        super();
        this.lightPosition = lightPosition;
        this.diffuse = diffuse;
        this.ambient = ambient;
        this.specular = specular;
        this.transformationPath = transformationPath;
        this.ambient = ambient ? ambient : [0, 0, 0, 0];
        this.diffuse = diffuse ? diffuse : [1, 1, 1, 1];
        this.specular = specular ? specular : [1, 1, 1, 1];
        this.transformationPath = transformationPath ? transformationPath : new TransformationPath();
    }
    update() {
        if (this.transformationPath) {
            vec3.transformMat4(this.lightPosition, this.lightPosition, this.transformationPath.current.matrix);
            this.transformationPath.moveNext();
        }
    }
}
//# sourceMappingURL=positionalLight.js.map