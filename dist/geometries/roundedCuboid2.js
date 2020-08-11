import { Geometry } from "./geometry.js";
export class RoundedCuboid2 extends Geometry {
    constructor(width, height, depth, isWireframe, bevelRadius, bevelSegments) {
        super(RoundedCuboid2.getVertexArray(width, height, depth, bevelRadius, bevelSegments), RoundedCuboid2.getIndexArray(isWireframe, bevelSegments), RoundedCuboid2.getNormalArray(bevelSegments), RoundedCuboid2.getTextureArray(bevelSegments));
    }
    //
    // Generate the array of vertices
    //
    static getVertexArray(width, height, depth, bevelRadius, bevelSegments) {
        const faceHeight = height - bevelRadius * 2;
        const faceWidth = width - bevelRadius * 2;
        const faceDepth = depth - bevelRadius * 2;
        const vertexArray = [];
        // Top-near-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 / (bevelSegments) * j;
                vertexArray.push(-faceWidth / 2 - Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(faceHeight / 2 + Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(faceDepth / 2 + Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(-faceWidth / 2);
        vertexArray.push(height / 2);
        vertexArray.push(faceDepth / 2);
        // Top-near-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / (bevelSegments) * j);
                vertexArray.push(faceWidth / 2 + Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(faceHeight / 2 + Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(faceDepth / 2 + Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(faceWidth / 2);
        vertexArray.push(height / 2);
        vertexArray.push(faceDepth / 2);
        // Top-far-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 / (bevelSegments) * j;
                vertexArray.push(faceWidth / 2 + Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(faceHeight / 2 + Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(-faceDepth / 2 - Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(faceWidth / 2);
        vertexArray.push(height / 2);
        vertexArray.push(-faceDepth / 2);
        // Top-far-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / (bevelSegments) * j);
                vertexArray.push(-faceWidth / 2 - Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(faceHeight / 2 + Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(-faceDepth / 2 - Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(-faceWidth / 2);
        vertexArray.push(height / 2);
        vertexArray.push(-faceDepth / 2);
        // Bottom-near-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / (bevelSegments) * j);
                vertexArray.push(-faceWidth / 2 - Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(-faceHeight / 2 - Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(faceDepth / 2 + Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(-faceWidth / 2);
        vertexArray.push(-height / 2);
        vertexArray.push(faceDepth / 2);
        // Bottom-near-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 / (bevelSegments) * j;
                vertexArray.push(faceWidth / 2 + Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(-faceHeight / 2 - Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(faceDepth / 2 + Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(faceWidth / 2);
        vertexArray.push(-height / 2);
        vertexArray.push(faceDepth / 2);
        // Bottom-far-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / (bevelSegments) * j);
                vertexArray.push(faceWidth / 2 + Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(-faceHeight / 2 - Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(-faceDepth / 2 - Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(faceWidth / 2);
        vertexArray.push(-height / 2);
        vertexArray.push(-faceDepth / 2);
        // Bottom-far-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / (bevelSegments) * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 / (bevelSegments) * j;
                vertexArray.push(-faceWidth / 2 - Math.cos(theta) * Math.cos(outerTheta) * bevelRadius);
                vertexArray.push(-faceHeight / 2 - Math.sin(outerTheta) * bevelRadius);
                vertexArray.push(-faceDepth / 2 - Math.sin(theta) * Math.cos(outerTheta) * bevelRadius);
            }
        }
        vertexArray.push(-faceWidth / 2);
        vertexArray.push(-height / 2);
        vertexArray.push(-faceDepth / 2);
        //    if(showNormals) {
        const normalsLength = 2;
        // Add normal vertices to array
        const normalArray = RoundedCuboid2.getNormalArray(bevelSegments);
        for (let i = 0; i < normalArray.length; i += 3) {
            vertexArray.push(normalArray[i] * normalsLength + vertexArray[i]);
            vertexArray.push(normalArray[i + 1] * normalsLength + vertexArray[i + 1]);
            vertexArray.push(normalArray[i + 2] * normalsLength + vertexArray[i + 2]);
        }
        //  }
        return vertexArray;
    }
    static getIndexArray(isWireframe, bevelSegments) {
        return isWireframe ? this.getNormalIndexArray(bevelSegments) : this.getSolidIndexArray(bevelSegments);
    }
    static getNormalIndexArray(bevelSegments) {
        const indexArray = this.getWireframeIndexArray(bevelSegments);
        const normalOffset = 8 * ((bevelSegments + 1) * bevelSegments + 1);
        // Corners
        for (let i = 0; i < 8; i++) {
            const iOffset = i * bevelSegments * (bevelSegments + 1) + i;
            for (let j = 0; j < bevelSegments; j++) {
                const jOffset = j * (bevelSegments + 1);
                for (let k = 0; k <= bevelSegments; k++) {
                    indexArray.push(iOffset + jOffset + k);
                    indexArray.push(normalOffset + iOffset + jOffset + k);
                }
            }
            indexArray.push(iOffset + bevelSegments * (bevelSegments + 1));
            indexArray.push(normalOffset + iOffset + bevelSegments * (bevelSegments + 1));
        }
        return indexArray;
    }
    static getSolidIndexArray(bevelSegments) {
        const indexArray = [];
        // Add top bevels
        for (let i = 0; i < 4; i++) {
            const iOffset = i * (bevelSegments + 1) * bevelSegments + i;
            for (let j = 0; j < bevelSegments - 1; j++) {
                const jOffset = j * (bevelSegments + 1);
                const nextCornerOffset = i < 3 ?
                    bevelSegments * bevelSegments + 1 :
                    -iOffset - bevelSegments;
                this.addFaceSolid(indexArray, iOffset + jOffset + bevelSegments * 2 + 1, iOffset + jOffset + nextCornerOffset + bevelSegments * 2 + 1, iOffset + jOffset + nextCornerOffset + bevelSegments, iOffset + jOffset + bevelSegments);
            }
            this.addFaceSolid(indexArray, iOffset + bevelSegments * (bevelSegments + 1), i < 3 ?
                iOffset + bevelSegments * (bevelSegments + 1) * 2 + 1 :
                bevelSegments * (bevelSegments + 1), i < 3 ?
                iOffset + bevelSegments * (bevelSegments + 1) + bevelSegments * bevelSegments :
                bevelSegments * bevelSegments - 1, iOffset + bevelSegments * (bevelSegments + 1) - 1);
        }
        // Add bottom bevels
        const bottomBevelOffset = (bevelSegments + 1) * (bevelSegments) * 4 + 4;
        for (let i = 0; i < 4; i++) {
            const iOffset = i * (bevelSegments + 1) * bevelSegments + i;
            const nextCornerOffset = i < 3 ?
                (bevelSegments + 2) * bevelSegments + 1 :
                -iOffset + bevelSegments;
            for (let j = 0; j < bevelSegments - 1; j++) {
                this.addFaceSolid(indexArray, bottomBevelOffset + iOffset + j * (bevelSegments + 1), bottomBevelOffset + iOffset + nextCornerOffset + j * (bevelSegments + 1), bottomBevelOffset + iOffset + nextCornerOffset + (j + 1) * (bevelSegments + 1), bottomBevelOffset + iOffset + (j + 1) * (bevelSegments + 1));
            }
            this.addFaceSolid(indexArray, bottomBevelOffset + iOffset + (bevelSegments - 1) * (bevelSegments + 1), bottomBevelOffset + iOffset + nextCornerOffset + (bevelSegments - 1) * (bevelSegments + 1), bottomBevelOffset + iOffset + nextCornerOffset + (bevelSegments - 1) * (bevelSegments + 1) + 1, bottomBevelOffset + iOffset + (bevelSegments - 1) * (bevelSegments + 1) + bevelSegments + 1);
        }
        // Add side bevels
        for (let i = 0; i < 4; i++) {
            const iOffset = i * (bevelSegments + 1) * bevelSegments + i;
            for (let j = 0; j < bevelSegments; j++) {
                const nextCornerOffset = bottomBevelOffset;
                this.addFaceSolid(indexArray, iOffset + j, iOffset + j + 1, iOffset + nextCornerOffset + bevelSegments - j - 1, iOffset + nextCornerOffset + bevelSegments - j);
            }
        }
        const topNearLeftOffset = 0;
        const topNearRightOffset = (bevelSegments + 1) * bevelSegments + 1;
        const topFarRightOffset = 2 * (bevelSegments + 1) * bevelSegments + 2;
        const topFarLeftOffset = 3 * (bevelSegments + 1) * bevelSegments + 3;
        const bottomNearLeftOffset = 4 * (bevelSegments + 1) * bevelSegments + 4;
        const bottomNearRightOffset = 5 * (bevelSegments + 1) * bevelSegments + 5;
        const bottomFarRightOffset = 6 * (bevelSegments + 1) * bevelSegments + 6;
        const bottomFarLeftOffset = 7 * (bevelSegments + 1) * bevelSegments + 7;
        // Add all faces
        this.addFaceSolid(indexArray, topNearLeftOffset + bevelSegments, topNearRightOffset, bottomNearRightOffset + bevelSegments, bottomNearLeftOffset);
        this.addFaceSolid(indexArray, topNearRightOffset + bevelSegments, topFarRightOffset, bottomFarRightOffset + bevelSegments, bottomNearRightOffset);
        this.addFaceSolid(indexArray, topFarRightOffset + bevelSegments, topFarLeftOffset, bottomFarLeftOffset + bevelSegments, bottomFarRightOffset);
        this.addFaceSolid(indexArray, topFarLeftOffset + bevelSegments, topNearLeftOffset, bottomNearLeftOffset + bevelSegments, bottomFarLeftOffset);
        this.addFaceSolid(indexArray, topFarLeftOffset + bevelSegments * (bevelSegments + 1), topFarRightOffset + bevelSegments * (bevelSegments + 1), topNearRightOffset + bevelSegments * (bevelSegments + 1), topNearLeftOffset + bevelSegments * (bevelSegments + 1));
        this.addFaceSolid(indexArray, bottomNearLeftOffset + bevelSegments * (bevelSegments + 1), bottomNearRightOffset + bevelSegments * (bevelSegments + 1), bottomFarRightOffset + bevelSegments * (bevelSegments + 1), bottomFarLeftOffset + bevelSegments * (bevelSegments + 1));
        // Add corners
        for (let i = 0; i < 8; i++) {
            const iOffSet = i * (bevelSegments + 1) * bevelSegments + i;
            for (let j = 0; j < bevelSegments - 1; j++) {
                const jOffset = j * (bevelSegments + 1);
                for (let k = 0; k < bevelSegments; k++) {
                    this.addFaceSolid(indexArray, iOffSet + jOffset + k + bevelSegments + 1, iOffSet + jOffset + k + bevelSegments + 2, iOffSet + jOffset + k + 1, iOffSet + jOffset + k);
                }
            }
            for (let k = 0; k < bevelSegments; k++) {
                indexArray.push(iOffSet + (bevelSegments + 1) * (bevelSegments - 1) + k);
                indexArray.push(iOffSet + (bevelSegments + 1) * (bevelSegments - 1) + k + 1);
                indexArray.push(iOffSet + (bevelSegments + 1) * (bevelSegments - 1) + bevelSegments + 1);
            }
        }
        return indexArray;
    }
    static getWireframeIndexArray(bevelSegments) {
        const indexArray = [];
        // Add top bevels
        for (let i = 0; i < 4; i++) {
            const iOffset = i * (bevelSegments + 1) * bevelSegments + i;
            const nextCornerOffset = i < 3 ? (bevelSegments + 1) * bevelSegments + 1 : -iOffset;
            for (let j = 0; j < bevelSegments; j++) {
                indexArray.push(iOffset + j * (bevelSegments + 1) + bevelSegments);
                indexArray.push(iOffset + nextCornerOffset + j * (bevelSegments + 1));
            }
            indexArray.push(iOffset + bevelSegments * (bevelSegments + 1));
            indexArray.push(iOffset + nextCornerOffset + bevelSegments * (bevelSegments + 1));
        }
        // Add bottom bevels
        const bottomBevelOffset = ((bevelSegments + 1) * bevelSegments + 1) * 4;
        for (let i = 0; i < 4; i++) {
            const iOffset = i * (bevelSegments + 1) * bevelSegments + i;
            const nextCornerOffset = i < 3 ? (bevelSegments + 1) * bevelSegments + 1 : -iOffset;
            for (let j = 0; j < bevelSegments; j++) {
                indexArray.push(bottomBevelOffset + iOffset + j * (bevelSegments + 1));
                indexArray.push(bottomBevelOffset + iOffset + nextCornerOffset + j * (bevelSegments + 1) + bevelSegments);
            }
            indexArray.push(bottomBevelOffset + iOffset + bevelSegments * (bevelSegments + 1));
            indexArray.push(bottomBevelOffset + iOffset + nextCornerOffset + bevelSegments * (bevelSegments + 1));
        }
        // Add side bevels
        for (let i = 0; i < 4; i++) {
            const iOffset = i * (bevelSegments + 1) * bevelSegments + i;
            const nextCornerOffset = bottomBevelOffset;
            for (let j = 0; j <= bevelSegments; j++) {
                indexArray.push(iOffset + j);
                indexArray.push(iOffset + nextCornerOffset + bevelSegments - j);
            }
        }
        // Add corners
        for (let i = 0; i < 8; i++) {
            const iOffset = i * (bevelSegments * (bevelSegments + 1) + 1);
            for (let j = 0; j < bevelSegments - 1; j++) {
                const jOffset = j * (bevelSegments + 1);
                for (let k = 0; k < bevelSegments; k++) {
                    indexArray.push(iOffset + jOffset + k);
                    indexArray.push(iOffset + jOffset + k + 1);
                    indexArray.push(iOffset + jOffset + k);
                    indexArray.push(iOffset + jOffset + k + bevelSegments + 1);
                }
                indexArray.push(iOffset + jOffset + bevelSegments);
                indexArray.push(iOffset + jOffset + bevelSegments + bevelSegments + 1);
            }
            for (let k = 0; k < bevelSegments; k++) {
                indexArray.push(iOffset + bevelSegments * bevelSegments + k);
                indexArray.push(iOffset + bevelSegments * bevelSegments + k - 1);
                indexArray.push(iOffset + bevelSegments * bevelSegments + k - 1);
                indexArray.push(iOffset + bevelSegments * (bevelSegments + 1));
            }
            indexArray.push(iOffset + bevelSegments * (bevelSegments + 1) - 1);
            indexArray.push(iOffset + bevelSegments * (bevelSegments + 1));
        }
        return indexArray;
    }
    static getNormalArray(bevelSegments) {
        const normalArray = [];
        // Top-near-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = j === 0 ? Math.PI / 2 / bevelSegments * 0.5 :
                    j === bevelSegments ? Math.PI / 2 / bevelSegments * (bevelSegments - 0.5) :
                        Math.PI / 2 / bevelSegments * j;
                normalArray.push(-Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(Math.sin(outerTheta));
                normalArray.push(Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(1);
        normalArray.push(0);
        // Top-near-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / bevelSegments * j);
                normalArray.push(Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(Math.sin(outerTheta));
                normalArray.push(Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(1);
        normalArray.push(0);
        // Top-far-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 / bevelSegments * j;
                normalArray.push(Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(Math.sin(outerTheta));
                normalArray.push(-Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(1);
        normalArray.push(0);
        // Top-far-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / (bevelSegments) * j);
                normalArray.push(-Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(Math.sin(outerTheta));
                normalArray.push(-Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(1);
        normalArray.push(0);
        // Bottom-near-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / bevelSegments * j);
                normalArray.push(-Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(-Math.sin(outerTheta));
                normalArray.push(Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(-1);
        normalArray.push(0);
        // Bottom-near-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 / bevelSegments * j;
                normalArray.push(Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(-Math.sin(outerTheta));
                normalArray.push(Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(-1);
        normalArray.push(0);
        // Bottom-far-right corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 - (Math.PI / 2 / bevelSegments * j);
                normalArray.push(Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(-Math.sin(outerTheta));
                normalArray.push(-Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(-1);
        normalArray.push(0);
        // Bottom-far-left corner
        for (let i = 0; i < bevelSegments; i++) {
            const outerTheta = Math.PI / 2 / bevelSegments * i;
            for (let j = 0; j <= bevelSegments; j++) {
                const theta = Math.PI / 2 / bevelSegments * j;
                normalArray.push(-Math.cos(theta) * Math.cos(outerTheta));
                normalArray.push(-Math.sin(outerTheta));
                normalArray.push(-Math.sin(theta) * Math.cos(outerTheta));
            }
        }
        normalArray.push(0);
        normalArray.push(-1);
        normalArray.push(0);
        return normalArray;
    }
    static getTextureArray(bevelSegments) {
        const textureArray = [];
        const topNearLeftOffset = bevelSegments;
        const topNearRightOffset = (bevelSegments + 1) * bevelSegments + 1;
        const bottomNearLeftOffset = 4 * (bevelSegments + 1) * bevelSegments + 4;
        const bottomNearRightOffset = 5 * (bevelSegments + 1) * bevelSegments + 5 + bevelSegments;
        for (let i = 0; i <= topNearLeftOffset; i++) {
            textureArray.push(0);
            textureArray.push(0);
        }
        for (let i = 0; i < topNearRightOffset - topNearLeftOffset; i++) {
            textureArray.push(1);
            textureArray.push(0);
        }
        for (let i = 0; i < bottomNearLeftOffset; i++) {
            textureArray.push(0);
            textureArray.push(1);
        }
        for (let i = 0; i < bottomNearRightOffset; i++) {
            textureArray.push(1);
            textureArray.push(1);
        }
        // // Put texture on each corner
        // for (let i = 0; i < 8; i++) {
        //   for (let j = 0; j < bevelSegments; j++) {
        //     for (let k = 0; k <= bevelSegments; k++) {
        //       textureArray.push((1 / bevelSegments) * k);
        //       textureArray.push((1 / bevelSegments) * j);
        //     }
        //   }
        //   textureArray.push(0.5);
        //   textureArray.push(1);
        // }
        return textureArray;
    }
    static addFaceSolid(indexArray, topLeft, topRight, bottomRight, bottomLeft) {
        indexArray.push(topLeft);
        indexArray.push(bottomLeft);
        indexArray.push(topRight);
        indexArray.push(bottomLeft);
        indexArray.push(bottomRight);
        indexArray.push(topRight);
    }
}
//# sourceMappingURL=roundedCuboid2.js.map