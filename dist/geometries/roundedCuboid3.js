import { Geometry } from "./geometry.js";
import * as vec3 from "../utils/gl-matrix/vec3.js";
export class RoundedCuboid extends Geometry {
    constructor(width, height, depth, roundingRadius, roundingSegments, bevelRadius, bevelSegments, isWireframe) {
        super(RoundedCuboid.getVertexArray(width, height, depth, roundingRadius, roundingSegments, bevelRadius, bevelSegments, false), RoundedCuboid.getIndexArray(isWireframe, roundingSegments, bevelSegments), RoundedCuboid.getNormalArray(roundingSegments, bevelSegments), RoundedCuboid.getTextureArray(width, height, depth, roundingRadius, roundingSegments, bevelRadius, bevelSegments), RoundedCuboid.getTangentArray(roundingSegments, bevelSegments), RoundedCuboid.getBitangentArray(roundingSegments, bevelSegments));
        this.showNormals = false;
    }
    //
    // Generate the array of vertices
    //
    static getVertexArray(width, height, depth, roundingRadius, roundingSegments, bevelRadius, bevelSegments, includeNormals) {
        const vertexArray = [];
        // Vertices per face
        const faceOffset = 4 * (roundingSegments + 2) + (bevelSegments + 1) * 8;
        // Add bottom face
        this.addFaceVertices(vertexArray, width, depth, height, roundingRadius, roundingSegments, bevelRadius, bevelSegments);
        // Now rotate by 180 degrees about X before starting next side
        for (let j = 0; j < faceOffset; j++) {
            RoundedCuboid.transformVec3(vertexArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], Math.PI));
        }
        // Add top face
        this.addFaceVertices(vertexArray, width, depth, height, roundingRadius, roundingSegments, bevelRadius, bevelSegments);
        // Now rotate by -90 degrees about X before starting next side
        for (let j = 0; j < faceOffset * 2; j++) {
            RoundedCuboid.transformVec3(vertexArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        }
        // Add side faces
        for (let i = 0; i < 4; i++) {
            this.addFaceVertices(vertexArray, i % 2 === 0 ? depth : width, height, i % 2 === 0 ? width : depth, roundingRadius, roundingSegments, bevelRadius, bevelSegments);
            // Now rotate by 90 degrees about Y before starting next side
            for (let j = 0; j < (i + 2) * faceOffset; j++) {
                RoundedCuboid.transformVec3(vertexArray, j * 3, (vertex) => vec3.rotateY(vertex, vertex, [0, 0, 0], Math.PI / 2));
            }
        }
        if (includeNormals) {
            const normalsLength = 4;
            // Add normal vertices to array
            const normalArray = RoundedCuboid.getNormalArray(roundingSegments, bevelSegments);
            for (let i = 0; i < normalArray.length; i += 3) {
                vertexArray.push(normalArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(normalArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(normalArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
            // Add Tangent vertices to array
            const tangentArray = RoundedCuboid.getTangentArray(roundingSegments, bevelSegments);
            for (let i = 0; i < tangentArray.length; i += 3) {
                vertexArray.push(tangentArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(tangentArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(tangentArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
            // Add Bitangent vertices to array
            const bitangentArray = RoundedCuboid.getBitangentArray(roundingSegments, bevelSegments);
            for (let i = 0; i < bitangentArray.length; i += 3) {
                vertexArray.push(bitangentArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(bitangentArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(bitangentArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
        }
        return vertexArray;
    }
    static getIndexArray(isWireframe, roundingSegments, bevelSegments) {
        return isWireframe ? this.getWireframeIndexArray(roundingSegments, bevelSegments) :
            this.getSolidIndexArray(roundingSegments, bevelSegments);
    }
    static getWireframeIndexArray(roundingSegments, bevelSegments) {
        const indexArray = [];
        for (let i = 0; i < 6; i++) {
            const iOffset = i * (4 * (roundingSegments + 2) + ((bevelSegments + 1) * 8));
            for (let j = 0; j < 4; j++) {
                const jOffset = j * (roundingSegments + 2);
                for (let k = 0; k < roundingSegments; k++) {
                    const kOffset = k + 1;
                    indexArray.push(iOffset + jOffset, iOffset + jOffset + kOffset);
                    indexArray.push(iOffset + jOffset + kOffset, iOffset + jOffset + kOffset + 1);
                }
                indexArray.push(iOffset + jOffset, iOffset + jOffset + roundingSegments + 1);
                indexArray.push(iOffset + jOffset + roundingSegments + 1, j < 3 ? iOffset + jOffset + roundingSegments + 3 : iOffset + 1);
                indexArray.push(iOffset + jOffset, j < 3 ? iOffset + jOffset + roundingSegments + 2 : iOffset);
            }
            // Bevels
            const bevelOffset = iOffset + 4 * (roundingSegments + 2);
            for (let j = 0; j < (bevelSegments + 1) * 4; j++) {
                indexArray.push(bevelOffset + j * 2, bevelOffset + j * 2 + 1);
                if (j % (bevelSegments + 1) !== bevelSegments) {
                    indexArray.push(bevelOffset + j * 2, bevelOffset + j * 2 + 2);
                    indexArray.push(bevelOffset + j * 2 + 1, bevelOffset + j * 2 + 3);
                }
            }
        }
        return indexArray;
    }
    static getSolidIndexArray(roundingSegments, bevelSegments) {
        const indexArray = [];
        for (let i = 0; i < 6; i++) {
            const iOffset = i * (4 * (roundingSegments + 2) + ((bevelSegments + 1) * 8));
            for (let j = 0; j < 4; j++) {
                const jOffset = j * (roundingSegments + 2);
                for (let k = 0; k < roundingSegments; k++) {
                    const kOffset = k + 1;
                    indexArray.push(iOffset + jOffset, iOffset + jOffset + kOffset + 1, iOffset + jOffset + kOffset);
                }
                indexArray.push(iOffset + jOffset);
                indexArray.push(j < 3 ? iOffset + jOffset + roundingSegments + 2 : iOffset);
                indexArray.push(iOffset + jOffset + roundingSegments + 1);
                indexArray.push(j < 3 ? iOffset + jOffset + roundingSegments + 2 : iOffset);
                indexArray.push(j < 3 ? iOffset + jOffset + roundingSegments + 3 : iOffset + 1);
                indexArray.push(iOffset + jOffset + roundingSegments + 1);
            }
            indexArray.push(iOffset);
            indexArray.push(iOffset + roundingSegments * 4 + 4);
            indexArray.push(iOffset + roundingSegments * 3 + 3);
            indexArray.push(iOffset);
            indexArray.push(iOffset + roundingSegments * 3 + 3);
            indexArray.push(iOffset + roundingSegments * 2 + 2);
            // Bevels
            const bevelOffset = iOffset + 4 * (roundingSegments + 2);
            for (let j = 0; j < 4; j++) {
                const jOffset = j * 2 * (bevelSegments + 1);
                for (let k = 0; k < bevelSegments; k++) {
                    indexArray.push(bevelOffset + jOffset + k * 2 + 1, bevelOffset + jOffset + k * 2, bevelOffset + jOffset + k * 2 + 2);
                    indexArray.push(bevelOffset + jOffset + k * 2 + 1, bevelOffset + jOffset + k * 2 + 2, bevelOffset + jOffset + k * 2 + 3);
                }
            }
        }
        return indexArray;
    }
    static getNormalIndexArray(roundingSegments, bevelSegments) {
        const normalIndexArray = []; //RoundedCuboid.getWireframeIndexArray(roundingSegments, bevelSegments);
        const normalVertexOffset = 6 * (4 * (roundingSegments + 2) + 8 * (bevelSegments + 1));
        for (let j = 0; j < 6 * (4 * (roundingSegments + 2) + 8 * (bevelSegments + 1)); j++) {
            normalIndexArray.push(j);
            normalIndexArray.push(normalVertexOffset + j);
        }
        const tangentOffset = normalVertexOffset * 2;
        for (let j = 0; j < 6 * (4 * (roundingSegments + 2) + 8 * (bevelSegments + 1)); j++) {
            normalIndexArray.push(j);
            normalIndexArray.push(tangentOffset + j);
        }
        const bitangentOffset = normalVertexOffset * 3;
        for (let j = 0; j < 6 * (4 * (roundingSegments + 2) + 8 * (bevelSegments + 1)); j++) {
            normalIndexArray.push(j);
            normalIndexArray.push(bitangentOffset + j);
        }
        return normalIndexArray;
    }
    static getNormalArray(roundingSegments, bevelSegments) {
        const normalArray = [];
        // Vertices per face
        const faceOffset = 4 * (roundingSegments + 2) + (bevelSegments + 1) * 8;
        // Add bottom face normals
        this.addNormalVertices(normalArray, roundingSegments, bevelSegments);
        // Now rotate by 180 degrees about X before starting next side
        for (let j = 0; j < faceOffset; j++) {
            RoundedCuboid.transformVec3(normalArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], Math.PI));
        }
        // Add top face normals
        this.addNormalVertices(normalArray, roundingSegments, bevelSegments);
        // Now rotate by -90 degrees about X before starting next side
        for (let j = 0; j < faceOffset * 2; j++) {
            RoundedCuboid.transformVec3(normalArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        }
        // Add sides faces normals
        for (let i = 0; i < 4; i++) {
            this.addNormalVertices(normalArray, roundingSegments, bevelSegments);
            // Now rotate by 90 degrees about Y before starting next side
            for (let j = 0; j < (i + 2) * faceOffset; j++) {
                RoundedCuboid.transformVec3(normalArray, j * 3, (vertex) => vec3.rotateY(vertex, vertex, [0, 0, 0], Math.PI / 2));
            }
        }
        return normalArray;
    }
    static getTangentArray(roundingSegments, bevelSegments) {
        const tangentArray = [];
        // Vertices per face
        const faceOffset = 4 * (roundingSegments + 2) + (bevelSegments + 1) * 8;
        // Add bottom face tangents
        this.addTangentVertices(tangentArray, roundingSegments, bevelSegments);
        // Now rotate by 180 degrees about X before starting next side
        for (let j = 0; j < faceOffset; j++) {
            RoundedCuboid.transformVec3(tangentArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], Math.PI));
        }
        // Add top face tangents
        this.addTangentVertices(tangentArray, roundingSegments, bevelSegments);
        // Now rotate by -90 degrees about X before starting next side
        for (let j = 0; j < faceOffset * 2; j++) {
            RoundedCuboid.transformVec3(tangentArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        }
        // Add sides faces tangents
        for (let i = 0; i < 4; i++) {
            this.addTangentVertices(tangentArray, roundingSegments, bevelSegments);
            // Now rotate by 90 degrees about Y before starting next side
            for (let j = 0; j < (i + 2) * faceOffset; j++) {
                RoundedCuboid.transformVec3(tangentArray, j * 3, (vertex) => vec3.rotateY(vertex, vertex, [0, 0, 0], Math.PI / 2));
            }
        }
        return tangentArray;
    }
    static getBitangentArray(roundingSegments, bevelSegments) {
        const bitangentArray = [];
        const faceOffset = 4 * (roundingSegments + 2) + (bevelSegments + 1) * 8;
        // Add bottom face bitangents
        this.addBitangentVertices(bitangentArray, roundingSegments, bevelSegments);
        // Now rotate by 180 degrees about X before starting next side
        for (let j = 0; j < faceOffset; j++) {
            RoundedCuboid.transformVec3(bitangentArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], Math.PI));
        }
        // Add top face bitangents
        this.addBitangentVertices(bitangentArray, roundingSegments, bevelSegments);
        // Now rotate by -90 degrees about X before starting next side
        for (let j = 0; j < faceOffset * 2; j++) {
            RoundedCuboid.transformVec3(bitangentArray, j * 3, (vertex) => vec3.rotateX(vertex, vertex, [0, 0, 0], -Math.PI / 2));
        }
        // Add sides faces bitangents
        for (let i = 0; i < 4; i++) {
            this.addBitangentVertices(bitangentArray, roundingSegments, bevelSegments);
            // Now rotate by 90 degrees about Y before starting next side
            for (let j = 0; j < (i + 2) * faceOffset; j++) {
                RoundedCuboid.transformVec3(bitangentArray, j * 3, (vertex) => vec3.rotateY(vertex, vertex, [0, 0, 0], Math.PI / 2));
            }
        }
        return bitangentArray;
    }
    static getTextureArray(width, height, depth, roundingRadius, roundingSegments, bevelRadius, bevelSegments) {
        const textureArray = [];
        const faceLeft = 1 / width * bevelRadius;
        const faceTop = 1 / height * bevelRadius;
        const faceRight = 1 - 1 / width * bevelRadius;
        const faceBottom = 1 - 1 / height * bevelRadius;
        const edgeWidth = 1 / width * roundingRadius;
        const edgeHeight = 1 / height * roundingRadius;
        for (let i = 0; i < 6; i++) {
            textureArray.push(faceLeft + edgeWidth);
            textureArray.push(faceTop + edgeHeight);
            for (let j = 0; j <= roundingSegments; j++) {
                const theta = Math.PI / 2 / roundingSegments * j;
                textureArray.push(faceLeft + edgeWidth - Math.cos(theta) * edgeWidth);
                textureArray.push(faceTop + edgeHeight - Math.sin(theta) * edgeHeight);
            }
            textureArray.push(faceRight - edgeWidth);
            textureArray.push(faceTop + edgeHeight);
            for (let j = 0; j <= roundingSegments; j++) {
                const theta = Math.PI / 2 / roundingSegments * j;
                textureArray.push(faceRight - (edgeWidth - Math.sin(theta) * edgeWidth));
                textureArray.push(faceTop + edgeHeight - Math.cos(theta) * edgeHeight);
            }
            textureArray.push(faceRight - edgeWidth);
            textureArray.push(faceBottom - edgeHeight);
            for (let j = 0; j <= roundingSegments; j++) {
                const theta = Math.PI / 2 / roundingSegments * j;
                textureArray.push(faceRight - (edgeWidth - Math.cos(theta) * edgeWidth));
                textureArray.push(faceBottom - (edgeHeight - Math.sin(theta) * edgeHeight));
            }
            textureArray.push(faceLeft + edgeWidth);
            textureArray.push(faceBottom - edgeHeight);
            for (let j = 0; j <= roundingSegments; j++) {
                const theta = Math.PI / 2 / roundingSegments * j;
                textureArray.push(faceLeft + edgeWidth - Math.sin(theta) * edgeWidth);
                textureArray.push(faceBottom - (edgeHeight - Math.cos(theta) * edgeHeight));
            }
            // Top bevel
            for (let j = 0; j <= bevelSegments; j++) {
                textureArray.push(1 - 1 / width * (bevelRadius + roundingRadius), faceTop - (1 / height * bevelRadius) / bevelSegments * j);
                textureArray.push(1 / width * (bevelRadius + roundingRadius), faceTop - (1 / height * bevelRadius) / bevelSegments * j);
            }
            // Right
            for (let j = 0; j <= bevelSegments; j++) {
                textureArray.push(faceRight + (1 / width * bevelRadius) / bevelSegments * j, 1 - 1 / height * (bevelRadius + roundingRadius));
                textureArray.push(faceRight + (1 / width * bevelRadius) / bevelSegments * j, 1 / height * (bevelRadius + roundingRadius));
            }
            // Bottom bevel
            for (let j = 0; j <= bevelSegments; j++) {
                textureArray.push(1 / width * (bevelRadius + roundingRadius), faceBottom + (1 / height * bevelRadius) / bevelSegments * j);
                textureArray.push(1 - 1 / width * (bevelRadius + roundingRadius), faceBottom + (1 / height * bevelRadius) / bevelSegments * j);
            }
            // Left bevel
            for (let j = 0; j <= bevelSegments; j++) {
                textureArray.push(faceLeft - (1 / width * bevelRadius) / bevelSegments * j, 1 / height * (bevelRadius + roundingRadius));
                textureArray.push(faceLeft - (1 / width * bevelRadius) / bevelSegments * j, 1 - 1 / height * (bevelRadius + roundingRadius));
            }
        }
        return textureArray;
    }
    static addFaceVertices(vertexArray, width, height, depth, roundingRadius, roundingSegments, bevelRadius, bevelSegments) {
        const innerWidth = width - roundingRadius * 2 - bevelRadius * 2;
        const innerHeight = height - roundingRadius * 2 - bevelRadius * 2;
        const innerDepth = depth - roundingRadius * 2 - bevelRadius * 2;
        // Top left rounded square corner
        let corner = { x: -innerWidth / 2, y: innerHeight / 2, z: depth / 2 };
        vertexArray.push(corner.x, corner.y, corner.z);
        for (let j = 0; j <= roundingSegments; j++) {
            const theta = Math.PI / 2 / roundingSegments * j;
            vertexArray.push(corner.x - Math.cos(theta) * roundingRadius);
            vertexArray.push(corner.y + Math.sin(theta) * roundingRadius);
            vertexArray.push(corner.z);
        }
        // Top right rounded square corner
        corner = { x: innerWidth / 2, y: innerHeight / 2, z: depth / 2 };
        vertexArray.push(corner.x, corner.y, corner.z);
        for (let j = 0; j <= roundingSegments; j++) {
            const theta = Math.PI / 2 / roundingSegments * j;
            vertexArray.push(corner.x + Math.sin(theta) * roundingRadius);
            vertexArray.push(corner.y + Math.cos(theta) * roundingRadius);
            vertexArray.push(corner.z);
        }
        // Bottom right rounded square corner
        corner = { x: innerWidth / 2, y: -innerHeight / 2, z: depth / 2 };
        vertexArray.push(corner.x, corner.y, corner.z);
        for (let j = 0; j <= roundingSegments; j++) {
            const theta = Math.PI / 2 / roundingSegments * j;
            vertexArray.push(corner.x + Math.cos(theta) * roundingRadius);
            vertexArray.push(corner.y - Math.sin(theta) * roundingRadius);
            vertexArray.push(corner.z);
        }
        // Bottom left rounded square corner
        corner = { x: -innerWidth / 2, y: -innerHeight / 2, z: depth / 2 };
        vertexArray.push(corner.x, corner.y, corner.z);
        for (let j = 0; j <= roundingSegments; j++) {
            const theta = Math.PI / 2 / roundingSegments * j;
            vertexArray.push(corner.x - Math.sin(theta) * roundingRadius);
            vertexArray.push(corner.y - Math.cos(theta) * roundingRadius);
            vertexArray.push(corner.z);
        }
        // Top bevel
        corner = { x: 0, y: height / 2 - bevelRadius, z: depth / 2 - bevelRadius };
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            vertexArray.push(corner.x + innerWidth / 2);
            vertexArray.push(corner.y + Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
            vertexArray.push(corner.x - innerWidth / 2);
            vertexArray.push(corner.y + Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
        }
        // Right bevel
        corner = { x: width / 2 - bevelRadius, y: 0, z: depth / 2 - bevelRadius };
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            vertexArray.push(corner.x + Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.y - innerHeight / 2);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
            vertexArray.push(corner.x + Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.y + innerHeight / 2);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
        }
        // Bottom bevel
        corner = { x: 0, y: -height / 2 + bevelRadius, z: depth / 2 - bevelRadius };
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            vertexArray.push(corner.x - innerWidth / 2);
            vertexArray.push(corner.y - Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
            vertexArray.push(corner.x + innerWidth / 2);
            vertexArray.push(corner.y - Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
        }
        // Left bevel
        corner = { x: -width / 2 + bevelRadius, y: 0, z: depth / 2 - bevelRadius };
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            vertexArray.push(corner.x - Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.y + innerHeight / 2);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
            vertexArray.push(corner.x - Math.sin(theta) * bevelRadius);
            vertexArray.push(corner.y - innerHeight / 2);
            vertexArray.push(corner.z + Math.cos(theta) * bevelRadius);
        }
    }
    static addNormalVertices(normalArray, roundingSegments, bevelSegments) {
        // All normals on face are perpendicular (in actual fact only the inner four corners are,
        // but this will do for now)
        for (let j = 0; j < 4 * (roundingSegments + 2); j++) {
            normalArray.push(0);
            normalArray.push(0);
            normalArray.push(1);
        }
        // Top bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            normalArray.push(0, Math.sin(theta), Math.cos(theta));
            normalArray.push(0, Math.sin(theta), Math.cos(theta));
        }
        // Right bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            normalArray.push(Math.sin(theta), 0, Math.cos(theta));
            normalArray.push(Math.sin(theta), 0, Math.cos(theta));
        }
        // Bottom bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            normalArray.push(0, -Math.sin(theta), Math.cos(theta));
            normalArray.push(0, -Math.sin(theta), Math.cos(theta));
        }
        // Left bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            normalArray.push(-Math.sin(theta), 0, Math.cos(theta));
            normalArray.push(-Math.sin(theta), 0, Math.cos(theta));
        }
        return normalArray;
    }
    static addTangentVertices(tangentArray, roundingSegments, bevelSegments) {
        for (let j = 0; j < 4 * (roundingSegments + 2); j++) {
            tangentArray.push(1, 0, 0);
        }
        // Top bevel
        for (let j = 0; j <= bevelSegments; j++) {
            tangentArray.push(1, 0, 0);
            tangentArray.push(1, 0, 0);
        }
        // Right bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j + Math.PI / 2;
            tangentArray.push(Math.sin(theta), 0, Math.cos(theta));
            tangentArray.push(Math.sin(theta), 0, Math.cos(theta));
        }
        // Bottom bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j;
            tangentArray.push(1, 0, 0);
            tangentArray.push(1, 0, 0);
        }
        // Left bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j - Math.PI / 2;
            tangentArray.push(-Math.sin(theta), 0, Math.cos(theta));
            tangentArray.push(-Math.sin(theta), 0, Math.cos(theta));
        }
        return tangentArray;
    }
    static addBitangentVertices(biangentArray, roundingSegments, bevelSegments) {
        for (let j = 0; j < 4 * (roundingSegments + 2); j++) {
            biangentArray.push(0, -1, 0);
        }
        // Top bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j - Math.PI / 2;
            biangentArray.push(0, Math.sin(theta), Math.cos(theta));
            biangentArray.push(0, Math.sin(theta), Math.cos(theta));
        }
        // Right bevel
        for (let j = 0; j <= bevelSegments; j++) {
            biangentArray.push(0, -1, 0);
            biangentArray.push(0, -1, 0);
        }
        // Bottom bevel
        for (let j = 0; j <= bevelSegments; j++) {
            const theta = Math.PI / 4 / bevelSegments * j + Math.PI / 2;
            biangentArray.push(0, -Math.sin(theta), Math.cos(theta));
            biangentArray.push(0, -Math.sin(theta), Math.cos(theta));
        }
        // Left bevel
        for (let j = 0; j <= bevelSegments; j++) {
            biangentArray.push(0, -1, 0);
            biangentArray.push(0, -1, 0);
        }
    }
    static transformVec3(vertexArray, vertexIndex, transformation) {
        const vertex = [vertexArray[vertexIndex], vertexArray[vertexIndex + 1], vertexArray[vertexIndex + 2]];
        transformation(vertex);
        vertexArray[vertexIndex] = vertex[0];
        vertexArray[vertexIndex + 1] = vertex[1];
        vertexArray[vertexIndex + 2] = vertex[2];
    }
}
//# sourceMappingURL=roundedCuboid3.js.map