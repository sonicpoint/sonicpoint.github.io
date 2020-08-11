import { Geometry2 } from "./geometry2.js";
import * as vec3 from "../utils/gl-matrix/vec3.js";
import { Transformation } from "../transformation.js";
export class BumpedTorus extends Geometry2 {
    constructor(centreRadius, sectionRadius, frillCount, frillAmplitude, sectionSegments, pathSegments, isWireframe, showNormals) {
        super(isWireframe, showNormals);
        this.centreRadius = centreRadius;
        this.sectionRadius = sectionRadius;
        this.frillCount = frillCount;
        this.frillAmplitude = frillAmplitude;
        this.sectionSegments = sectionSegments;
        this.pathSegments = pathSegments;
        this.isWireframe = isWireframe;
        this.showNormals = showNormals;
        this.tubeSections = 1;
        this.initialise();
    }
    getVertexArray() {
        const vertexArray = [];
        const transformation = new Transformation().translate(this.centreRadius, 0, 0);
        const bumpCount = 5;
        for (let i = 0; i <= this.pathSegments; i++) {
            let multiple = Math.sin(Math.PI * 2 / this.pathSegments * i * bumpCount);
            // if (multiple < 0) { multiple = 0; }
            this.addSection(vertexArray, transformation, multiple);
            transformation.translate(-this.centreRadius, 0, 0).rotateY(Math.PI * 2 / this.pathSegments).translate(this.centreRadius, 0, 0);
        }
        return vertexArray;
    }
    addSection(vertexArray, transformation, multiple) {
        // Create section - one more than there are segments as the last vertex is the same as the first
        for (let i = 0; i <= this.sectionSegments; i++) {
            const theta = Math.PI * 2 / this.sectionSegments * i;
            let t = Math.sin(theta * this.frillCount);
            // if (t < 0) { t = 0; }
            const radius = t * this.frillAmplitude * multiple;
            const vertex = [];
            vertex.push(Math.cos(theta) * (this.sectionRadius + radius), Math.sin(theta) * (this.sectionRadius + radius), 0);
            // Transform the section shape as per the input and add to the main vertex array
            vec3.transformMat4(vertex, vertex, transformation.matrix);
            vertexArray.push(vertex[0]);
            vertexArray.push(vertex[1]);
            vertexArray.push(vertex[2]);
        }
    }
    getWireframeIndexArray() {
        const indexArray = [];
        for (let i = 0; i < this.pathSegments; i++) {
            const iOffset = i * (this.sectionSegments + 1);
            for (let j = 0; j < this.sectionSegments; j++) {
                indexArray.push(iOffset + j, iOffset + j + 1);
                indexArray.push(iOffset + j, iOffset + j + this.sectionSegments + 1);
            }
        }
        if (this.showNormals) {
            const normalOffset = (this.pathSegments + 1) * (this.sectionSegments + 1);
            for (let i = 0; i < normalOffset; i++) {
                indexArray.push(i, i + normalOffset);
            }
        }
        return indexArray;
    }
    getSolidIndexArray() {
        const indexArray = [];
        for (let i = 0; i < this.pathSegments; i++) {
            const iOffset = i * (this.sectionSegments + 1);
            for (let j = 0; j < this.sectionSegments; j++) {
                indexArray.push(iOffset + j);
                indexArray.push(iOffset + j + this.sectionSegments + 1);
                indexArray.push(iOffset + j + 1);
                indexArray.push(iOffset + j + this.sectionSegments + 1);
                indexArray.push(iOffset + j + this.sectionSegments + 2);
                indexArray.push(iOffset + j + 1);
            }
        }
        return indexArray;
    }
    //
    // For each shape, we can merge custom normals (e.g. where two vertices are used to denote the edge of a texture)
    //
    customMergeNormals(normalArray) {
        for (let i = 0; i <= this.pathSegments; i++) {
            Geometry2.mergeNormals(normalArray, i * (this.sectionSegments + 1), (i + 1) * (this.sectionSegments + 1) - 1);
        }
        for (let i = 0; i <= this.sectionSegments; i++) {
            Geometry2.mergeNormals(normalArray, i, this.pathSegments * (this.sectionSegments + 1) + i);
        }
    }
}
//# sourceMappingURL=bumpedTorus.js.map