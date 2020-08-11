import { Geometry } from "./geometry.js";
import * as vec3 from "../utils/gl-matrix/vec3.js";
//
// Cuboid with rounded faces
//
export class RoundedCuboid extends Geometry {
    constructor(size, roundingRadius, segments, isWireframe, invert) {
        super(RoundedCuboid.getVertexArray(size, roundingRadius, segments, invert), RoundedCuboid.getIndexArray(isWireframe, segments, invert), RoundedCuboid.getNormalArray(segments, invert));
        this.showNormals = false;
    }
    //
    // Generate the array of vertices
    //
    static getVertexArray(size, roundingRadius, segments, invert) {
        const vertexArray = [];
        RoundedCuboid.addVertices(vertexArray, size, roundingRadius, segments);
        RoundedCuboid.transformVertexArray(vertexArray, 0, vertexArray.length, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], Math.PI));
        RoundedCuboid.addVertices(vertexArray, size, roundingRadius, segments);
        RoundedCuboid.transformVertexArray(vertexArray, 0, vertexArray.length, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        for (let i = 0; i < 4; i++) {
            RoundedCuboid.addVertices(vertexArray, size, roundingRadius, segments);
            RoundedCuboid.transformVertexArray(vertexArray, 0, vertexArray.length, (vertex) => vec3.rotateY(vertex, vertex, [0, 0, 0], Math.PI / 2));
        }
        // // Normals
        // {
        //   const normalsLength = 3;
        //   // Add normal vertices to array
        //   const normalArray = RoundedCuboid.getNormalArray(segments, invert);
        //   for (let i = 0; i < normalArray.length; i += 3) {
        //     vertexArray.push(normalArray[i] * normalsLength + vertexArray[i]);
        //     vertexArray.push(normalArray[i + 1] * normalsLength + vertexArray[i + 1]);
        //     vertexArray.push(normalArray[i + 2] * normalsLength + vertexArray[i + 2]);
        //   }
        // }
        return vertexArray;
    }
    static addVertices(vertexArray, size, roundingRadius, segments) {
        const vertextArrayOffset = vertexArray.length;
        for (let i = 0; i < 4; i++) {
            // Rounded corner
            let corner = {
                x: -size / 2 + roundingRadius,
                y: size / 2 - roundingRadius,
                z: size / 2
            };
            vertexArray.push(corner.x, corner.y, corner.z);
            for (let j = 0; j <= segments * 2; j++) {
                const theta = (Math.PI / 2) / (segments * 2) * j;
                vertexArray.push(corner.x - Math.cos(theta) * roundingRadius);
                vertexArray.push(corner.y + Math.sin(theta) * roundingRadius);
                vertexArray.push(corner.z);
            }
            // Line!
            const cornerRadius = Math.sqrt(roundingRadius * roundingRadius * 2);
            corner = {
                x: -size / 2 + roundingRadius,
                y: size / 2 - roundingRadius,
                z: size / 2 - roundingRadius,
            };
            const angle = Math.atan(Math.cos(Math.PI / 4));
            // TODO: Remove
            vertexArray.push(corner.x, corner.y, corner.z);
            for (let j = 0; j <= segments; j++) {
                const theta = (angle / segments) * j;
                vertexArray.push(corner.x - Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
                vertexArray.push(corner.y + Math.sin(theta) * cornerRadius);
                vertexArray.push(corner.z + Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
            }
            for (let j = 0; j <= segments; j++) {
                const theta = (angle / segments) * j;
                vertexArray.push(corner.x - Math.sin(theta) * cornerRadius);
                vertexArray.push(corner.y + Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
                vertexArray.push(corner.z + Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
            }
            const angle2 = Math.PI / 4 - Math.atan(Math.cos(Math.PI / 4));
            // TODO: Remove
            vertexArray.push(corner.x, corner.y, corner.z);
            for (let j = 0; j <= segments; j++) {
                const theta = Math.PI / 4 - (angle2 / segments) * j;
                vertexArray.push(corner.x - Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
                vertexArray.push(corner.y + Math.sin(theta) * cornerRadius);
                vertexArray.push(corner.z + Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
            }
            // Rotate corner/bevel
            RoundedCuboid.transformVertexArray(vertexArray, vertextArrayOffset, vertexArray.length - vertextArrayOffset, (vertex) => vec3.rotateZ(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        }
    }
    static getIndexArray(isWireframe, segments, invert) {
        invert = invert === undefined ? false : invert;
        return isWireframe ?
            RoundedCuboid.getWireframeIndexArray(segments) :
            RoundedCuboid.getSolidIndexArray(segments, invert);
    }
    static getWireframeIndexArray(segments) {
        const indexArray = [];
        const faces = 6;
        const faceSides = 4;
        for (let i = 0; i < faces; i++) {
            const iOffset = i * (faceSides * (segments * 5 + 7));
            for (let j = 0; j < faceSides; j++) {
                const jOffset = iOffset + (segments * 5 + 7) * j;
                // Rounded corner
                for (let k = 0; k < segments * 2; k++) {
                    indexArray.push(jOffset, jOffset + k + 1);
                    indexArray.push(jOffset + k + 1, jOffset + k + 2);
                }
                indexArray.push(jOffset, jOffset + segments * 2 + 1);
                indexArray.push(jOffset + 1, j < 3 ? jOffset + segments * 7 + 8 : iOffset + segments * 2 + 1);
                // Line
                let lineOffset = jOffset + (segments + 1) * 2;
                //        indexArray.push(lineOffset, lineOffset + 1);
                // indexArray.push(lineOffset, lineOffset + segments + 1);
                for (let k = 0; k < segments; k++) {
                    indexArray.push(lineOffset + k + 1, lineOffset + k + 2);
                    indexArray.push(jOffset + k + 2, lineOffset + k + 2);
                }
                lineOffset += segments + 2;
                for (let k = 0; k < segments; k++) {
                    indexArray.push(lineOffset + k, lineOffset + k + 1);
                    indexArray.push(jOffset + (segments - k) + segments + 1, lineOffset + k);
                }
                lineOffset += segments + 1;
                for (let k = 0; k < segments; k++) {
                    //          indexArray.push(lineOffset + k + 1, lineOffset + k + 2);
                }
            }
        }
        return indexArray;
    }
    static getSolidIndexArray(segments, invert) {
        const indexArray = [];
        const faces = 6;
        const faceSides = 4;
        const faceSideOffset = segments * 5 + 7;
        for (let i = 0; i < faces; i++) {
            const iOffset = i * (faceSides * faceSideOffset);
            for (let j = 0; j < faceSides; j++) {
                const jOffset = iOffset + faceSideOffset * j;
                // Rounded corner
                for (let k = 0; k < segments * 2; k++) {
                    this.pushTriangle(indexArray, jOffset, jOffset + k + 2, jOffset + k + 1, invert);
                }
                // Area between rounded corners
                this.pushTriangle(indexArray, jOffset + 1, j < 3 ? jOffset + faceSideOffset + segments * 2 + 1 : iOffset + segments * 2 + 1, jOffset, invert);
                this.pushTriangle(indexArray, j < 3 ? jOffset + faceSideOffset + segments * 2 + 1 : iOffset + segments * 2 + 1, j < 3 ? jOffset + faceSideOffset : iOffset, jOffset, invert);
                // Corner
                let lineOffset = jOffset + (segments + 1) * 2;
                for (let k = 0; k < segments; k++) {
                    this.pushTriangle(indexArray, jOffset + k + 1, lineOffset + k + 2, lineOffset + k + 1, invert);
                    this.pushTriangle(indexArray, jOffset + k + 1, jOffset + k + 2, lineOffset + k + 2, invert);
                }
                lineOffset += segments + 2;
                this.pushTriangle(indexArray, lineOffset, lineOffset + 1, jOffset + segments * 2, invert);
                for (let k = 0; k < segments - 1; k++) {
                    this.pushTriangle(indexArray, lineOffset + k + 1, lineOffset + k + 2, jOffset + (segments - k) + segments, invert);
                    this.pushTriangle(indexArray, jOffset + (segments - k) + segments, lineOffset + k + 2, jOffset + (segments - k) + segments - 1, invert);
                }
                lineOffset += segments + 1;
                for (let k = 0; k < segments; k++) {
                    //          indexArray.push(lineOffset + k + 1, lineOffset + k + 2);
                }
            }
            // Central square
            this.pushTriangle(indexArray, iOffset, iOffset + faceSideOffset, iOffset + 2 * faceSideOffset, invert);
            this.pushTriangle(indexArray, iOffset, iOffset + 2 * faceSideOffset, iOffset + 3 * faceSideOffset, invert);
        }
        return indexArray;
    }
    static getNormalIndexArray(segments) {
        const normalIndexArray = this.getWireframeIndexArray(segments);
        const normalOffset = 24 * (segments * 5 + 7);
        for (let i = 0; i < normalOffset; i++) {
            normalIndexArray.push(i, i + normalOffset);
        }
        return normalIndexArray;
    }
    static getNormalArray(segments, invert) {
        const normalArray = [];
        invert = invert === undefined ? false : invert;
        RoundedCuboid.addNormals(normalArray, segments, invert);
        RoundedCuboid.transformVertexArray(normalArray, 0, normalArray.length, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], Math.PI));
        RoundedCuboid.addNormals(normalArray, segments, invert);
        RoundedCuboid.transformVertexArray(normalArray, 0, normalArray.length, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        for (let i = 0; i < 4; i++) {
            RoundedCuboid.addNormals(normalArray, segments, invert);
            RoundedCuboid.transformVertexArray(normalArray, 0, normalArray.length, (vertex) => vec3.rotateY(vertex, vertex, [0, 0, 0], Math.PI / 2));
        }
        return normalArray;
    }
    static addNormals(normalArray, segments, invert) {
        const dir = invert ? -1 : 1;
        const normalArrayOffset = normalArray.length;
        for (let i = 0; i < 4; i++) {
            normalArray.push(0, 0, dir);
            for (let j = 0; j <= segments * 2; j++) {
                normalArray.push(0, 0, dir);
            }
            // TODO: Remove
            normalArray.push(0, 0, 0);
            const angle = Math.atan(Math.cos(Math.PI / 4));
            for (let j = 0; j <= segments; j++) {
                const theta = (angle / segments) * j;
                normalArray.push(-Math.cos(theta) * Math.cos(Math.PI / 4) * dir);
                normalArray.push(Math.sin(theta) * dir);
                normalArray.push(Math.cos(theta) * Math.cos(Math.PI / 4) * dir);
            }
            for (let j = 0; j <= segments; j++) {
                const theta = (angle / segments) * j;
                normalArray.push(-Math.sin(theta) * dir);
                normalArray.push(Math.cos(theta) * Math.cos(Math.PI / 4) * dir);
                normalArray.push(Math.cos(theta) * Math.cos(Math.PI / 4) * dir);
            }
            // TODO: Remove
            normalArray.push(0, 0, 0);
            const angle2 = Math.PI / 4 - Math.atan(Math.cos(Math.PI / 4));
            for (let j = 0; j <= segments; j++) {
                const theta = Math.PI / 4 - (angle2 / segments) * j;
                normalArray.push(-Math.cos(theta) * Math.cos(Math.PI / 4) * dir);
                normalArray.push(Math.sin(theta) * dir);
                normalArray.push(Math.cos(theta) * Math.cos(Math.PI / 4) * dir);
            }
            // Rotate Normals
            RoundedCuboid.transformVertexArray(normalArray, normalArrayOffset, normalArray.length - normalArrayOffset, (vertex) => vec3.rotateZ(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        }
    }
    static transformVertexArray(vertexArray, start, length, transformation) {
        for (let j = 0; j < length / 3; j++) {
            const vertex = [vertexArray[start + j * 3], vertexArray[start + j * 3 + 1], vertexArray[start + j * 3 + 2]];
            transformation(vertex);
            vertexArray[start + j * 3] = vertex[0];
            vertexArray[start + j * 3 + 1] = vertex[1];
            vertexArray[start + j * 3 + 2] = vertex[2];
        }
    }
    static pushTriangle(indexArray, first, second, third, isInverted) {
        if (isInverted) {
            indexArray.push(first, third, second);
        }
        else {
            indexArray.push(first, second, third);
        }
    }
}
//# sourceMappingURL=roundedCuboid.js.map