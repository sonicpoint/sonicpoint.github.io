import { Geometry } from "./geometry.js";
import * as vec3 from "../utils/gl-matrix/vec3.js";
export class Corner extends Geometry {
    constructor(size, roundingRadius, bevelRadius, bevelAngle, segments, isWireframe) {
        super(Corner.getVertexArray(size, roundingRadius, 0, Math.PI / 2, segments), Corner.getIndexArray(isWireframe, segments));
        this.showNormals = false;
    }
    //
    // Generate the array of vertices
    //
    static getVertexArray(size, roundingRadius, bevelRadius, bevelAngle, segments) {
        const vertexArray = [];
        Corner.addVertices(vertexArray, size, roundingRadius, bevelRadius, bevelAngle, segments);
        Corner.transformVertexArray(vertexArray, 0, vertexArray.length, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], Math.PI));
        Corner.addVertices(vertexArray, size, roundingRadius, bevelRadius, bevelAngle, segments);
        Corner.transformVertexArray(vertexArray, 0, vertexArray.length, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        for (let i = 0; i < 4; i++) {
            Corner.addVertices(vertexArray, size, roundingRadius, bevelRadius, bevelAngle, segments);
            Corner.transformVertexArray(vertexArray, 0, vertexArray.length, (vertex) => vec3.rotateY(vertex, vertex, [0, 0, 0], Math.PI / 2));
        }
        return vertexArray;
    }
    static addVertices(vertexArray, size, roundingRadius, bevelRadius, bevelAngle, segments) {
        const vertextArrayOffset = vertexArray.length;
        for (let i = 0; i < 4; i++) {
            // Rounded corner
            let corner = {
                x: -size / 2 + roundingRadius + bevelRadius,
                y: size / 2 - roundingRadius - bevelRadius,
                z: size / 2
            };
            vertexArray.push(corner.x, corner.y, corner.z);
            for (let j = 0; j <= segments * 2; j++) {
                const theta = (Math.PI / 2) / (segments * 2) * j;
                vertexArray.push(corner.x - Math.cos(theta) * roundingRadius);
                vertexArray.push(corner.y + Math.sin(theta) * roundingRadius);
                vertexArray.push(corner.z);
            }
            // Bevel
            const chordLength = Math.sqrt(bevelRadius * bevelRadius * 2);
            const radius = ((chordLength / 2) / Math.sin(bevelAngle / 2));
            corner = {
                x: -(size) / 2 + roundingRadius + bevelRadius,
                y: size / 2 - bevelRadius - radius * Math.sin((Math.PI / 2 - bevelAngle) / 2),
                z: size / 2 - bevelRadius - radius * Math.sin((Math.PI / 2 - bevelAngle) / 2),
            };
            for (let j = 0; j <= segments; j++) {
                const theta = bevelAngle / (segments * 2) * j + (Math.PI / 4 - bevelAngle / 2);
                vertexArray.push(corner.x);
                vertexArray.push(corner.y + Math.sin(theta) * radius);
                vertexArray.push(corner.z + Math.cos(theta) * radius);
                vertexArray.push(-corner.x);
                vertexArray.push(corner.y + Math.sin(theta) * radius);
                vertexArray.push(corner.z + Math.cos(theta) * radius);
            }
            // Line!
            const cornerRadius = Math.sqrt(roundingRadius * roundingRadius * 2);
            corner = {
                x: -size / 2 + roundingRadius,
                y: size / 2 - roundingRadius,
                z: size / 2 - roundingRadius,
            };
            const angle = Math.atan(Math.cos(Math.PI / 4));
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
            // corner = {
            //   x: -size / 2 + bevelRadius + roundingRadius - Math.cos(Math.PI / 4) * roundingRadius,
            //   y: size / 2 - bevelRadius - roundingRadius + Math.cos(Math.PI / 4) * roundingRadius,
            //   z: size / 2 - bevelRadius - roundingRadius,
            // };
            // const lineRadius =
            //   Math.sqrt(roundingRadius * roundingRadius * 2) - roundingRadius + bevelRadius;
            // const yRadius = bevelRadius + roundingRadius;
            // let angle = Math.PI / 4;
            // let ratio = lineRadius / yRadius;
            // angle *= ratio;
            // angle += Math.PI / 20;
            // for(let j = 0; j <= segments; j++) {
            //   const theta = (Math.PI / 2) - angle / segments * j;
            //   vertexArray.push(corner.x - Math.cos(theta) * Math.cos(Math.PI / 4) * lineRadius);
            //   vertexArray.push(corner.y + Math.cos(theta) * Math.cos(Math.PI / 4) * lineRadius);
            //   vertexArray.push(corner.z + Math.sin(theta) * yRadius);
            // }
            const angle2 = Math.PI / 4 - Math.atan(Math.cos(Math.PI / 4));
            vertexArray.push(corner.x, corner.y, corner.z);
            for (let j = 0; j <= segments; j++) {
                const theta = Math.PI / 4 - (angle2 / segments) * j;
                vertexArray.push(corner.x - Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
                vertexArray.push(corner.y + Math.sin(theta) * cornerRadius);
                vertexArray.push(corner.z + Math.cos(theta) * Math.cos(Math.PI / 4) * cornerRadius);
            }
            // Rotate corner/bevel
            Corner.transformVertexArray(vertexArray, vertextArrayOffset, vertexArray.length - vertextArrayOffset, (vertex) => vec3.rotateZ(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        }
    }
    static getIndexArray(isWireframe, segments) {
        return isWireframe ? this.getWireframeIndexArray(segments) : [];
    }
    static getWireframeIndexArray(segments) {
        const indexArray = [];
        const faces = 6;
        const faceSides = 4;
        for (let i = 0; i < faces; i++) {
            const iOffset = i * (faceSides * (segments * 7 + 9));
            for (let j = 0; j < faceSides; j++) {
                const jOffset = iOffset + (segments * 7 + 9) * j;
                // Rounded corner
                for (let k = 0; k < segments * 2; k++) {
                    indexArray.push(jOffset, jOffset + k + 1);
                    indexArray.push(jOffset + k + 1, jOffset + k + 2);
                }
                indexArray.push(jOffset, jOffset + segments * 2 + 1);
                // Bevel
                const bevelOffset = jOffset + segments * 2 + 2;
                for (let k = 0; k < segments; k++) {
                    indexArray.push(bevelOffset + k * 2, bevelOffset + k * 2 + 1);
                    indexArray.push(bevelOffset + k * 2, bevelOffset + (k + 1) * 2);
                    indexArray.push(bevelOffset + k * 2 + 1, bevelOffset + (k + 1) * 2 + 1);
                }
                indexArray.push(bevelOffset + segments * 2, bevelOffset + segments * 2 + 1);
                // Line
                let lineOffset = bevelOffset + (segments + 1) * 2;
                // indexArray.push(lineOffset, lineOffset + 1);
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
                    //         indexArray.push(lineOffset + k + 1, lineOffset + k + 2);
                }
            }
        }
        return indexArray;
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
}
//# sourceMappingURL=corner.js.map