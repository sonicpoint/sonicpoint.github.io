import { Geometry } from "./geometry.js";
import { Transformation } from "./../transformation.js";
import * as vec3 from "./../utils/gl-matrix/vec3.js";
export class Torus extends Geometry {
    constructor(sectionRadiusX, sectionRadiusY, centreRadius, sectionSegments, pathSegments, isWireframe) {
        super(Torus.getVertexArray(sectionRadiusX, sectionRadiusY, centreRadius, sectionSegments, pathSegments), Torus.getIndexArray(sectionSegments, pathSegments, isWireframe), Torus.getNormalArray(sectionRadiusX, sectionRadiusY, sectionSegments, pathSegments), Torus.getTextureArray(sectionSegments, pathSegments));
    }
    static getVertexArray(sectionRadiusX, sectionRadiusY, centreRadius, sectionSegments, pathSegments) {
        const vertexArray = [];
        const transformation = new Transformation().translate(centreRadius, 0, 0);
        for (let i = 0; i <= pathSegments; i++) {
            this.addSection(vertexArray, sectionRadiusX, sectionRadiusY, sectionSegments, transformation);
            transformation.translate(-centreRadius, 0, 0).rotateY(Math.PI * 2 / pathSegments).translate(centreRadius, 0, 0);
        }
        return vertexArray;
    }
    static addSection(vertexArray, radiusX, radiusY, sectionSegments, transformation) {
        // Create section - one more than there are segments as the last vertex is the same as the first
        for (let i = 0; i <= sectionSegments; i++) {
            const theta = Math.PI * 2 / sectionSegments * i;
            const vertex = [];
            vertex.push(Math.cos(theta) * radiusX);
            vertex.push(Math.sin(theta) * radiusY);
            vertex.push(0);
            // Transform the section shape as per the input and add to the main vertex array
            vec3.transformMat4(vertex, vertex, transformation.matrix);
            vertexArray.push(vertex[0]);
            vertexArray.push(vertex[1]);
            vertexArray.push(vertex[2]);
        }
    }
    static getIndexArray(sectionSegments, pathSegments, isWireframe) {
        return isWireframe ?
            Torus.getWireframeIndexArray(sectionSegments, pathSegments)
            : Torus.getSolidIndexArray(sectionSegments, pathSegments);
    }
    static getNormalArray(radiusX, radiusY, sectionSegments, pathSegments) {
        const normalArray = [];
        const transformation = new Transformation();
        for (let i = 0; i <= pathSegments; i++) {
            this.addSectionNormals(normalArray, sectionSegments, transformation);
            transformation.rotateY(Math.PI * 2 / pathSegments);
        }
        return normalArray;
    }
    static addSectionNormals(normalArray, sectionSegments, transformation) {
        // Create section - one more than there are segments as the last vertex is the same as the first
        for (let i = 0; i <= sectionSegments; i++) {
            const theta = Math.PI * 2 / sectionSegments * i;
            const normal = [];
            normal.push(Math.cos(theta));
            normal.push(Math.sin(theta));
            normal.push(0);
            // Transform the section shape as per the input and add to the main vertex array
            vec3.transformMat4(normal, normal, transformation.matrix);
            normalArray.push(normal[0]);
            normalArray.push(normal[1]);
            normalArray.push(normal[2]);
        }
        ;
    }
    static getWireframeIndexArray(sectionSegments, pathSegments) {
        const indexArray = [];
        for (let i = 0; i < pathSegments; i++) {
            for (let j = 0; j < sectionSegments; j++) {
                indexArray.push(i * (sectionSegments + 1) + j);
                indexArray.push(i * (sectionSegments + 1) + j + 1);
                indexArray.push(i * (sectionSegments + 1) + j);
                indexArray.push(i * (sectionSegments + 1) + j + sectionSegments + 1);
            }
        }
        return indexArray;
    }
    static getSolidIndexArray(sectionSegments, pathSegments) {
        const indexArray = [];
        for (let i = 0; i < pathSegments; i++) {
            for (let j = 0; j < sectionSegments; j++) {
                indexArray.push(i * (sectionSegments + 1) + j);
                indexArray.push(i * (sectionSegments + 1) + j + sectionSegments + 1);
                indexArray.push(i * (sectionSegments + 1) + j + 1);
                indexArray.push(i * (sectionSegments + 1) + j + sectionSegments + 1);
                indexArray.push(i * (sectionSegments + 1) + j + sectionSegments + 2);
                indexArray.push(i * (sectionSegments + 1) + j + 1);
            }
        }
        return indexArray;
    }
    static getTextureArray(sectionSegments, pathSegments) {
        const textureArray = [];
        for (let i = 0; i <= pathSegments; i++) {
            for (let j = 0; j <= sectionSegments; j++) {
                textureArray.push((1 / (pathSegments + 1)) * i);
                textureArray.push((1 / (sectionSegments + 1)) * j);
            }
        }
        return textureArray;
    }
}
//# sourceMappingURL=torus.js.map