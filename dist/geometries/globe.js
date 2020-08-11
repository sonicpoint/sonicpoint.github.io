import { Geometry } from "./geometry.js";
export class Globe extends Geometry {
    constructor(radiusX, radiusY, segments, isWireframe, textureRatio, showNormals, isReversed) {
        super(Globe.getVertexArray(radiusX, radiusY, segments, isReversed, showNormals), Globe.getIndexArray(segments, isWireframe, showNormals), Globe.getNormalArray(radiusX, radiusY, segments, isReversed), Globe.getTextureArray(segments, textureRatio), Globe.getTangentArray(radiusX, radiusY, segments, isReversed), Globe.getBitangentArray(radiusX, radiusY, segments, isReversed));
    }
    static getVertexArray(radiusX, radiusY, segments, isReversed, showNormals) {
        const direction = isReversed ? -1 : 1;
        const vertexArray = [];
        // 'North pole'
        vertexArray.push(0);
        vertexArray.push(radiusY);
        vertexArray.push(0);
        // 'South pole'
        vertexArray.push(0);
        vertexArray.push(-radiusY);
        vertexArray.push(0);
        for (let i = 0; i <= segments; i++) {
            for (let j = 1; j < segments; j++) {
                let thetaV = (Math.PI / 2 - (Math.PI / segments * j));
                let thetaH = (Math.PI / 2 - (Math.PI * 2 / segments * i));
                // The first 'column' of vertices is repeated so that the texture can map to it
                if (i === segments) {
                    thetaV = (Math.PI / 2 - (Math.PI / segments * j));
                    thetaH = (Math.PI / 2);
                }
                vertexArray.push(Math.cos(thetaV) * Math.cos(thetaH) * radiusX);
                vertexArray.push(Math.sin(thetaV) * radiusY);
                vertexArray.push(-Math.cos(thetaV) * Math.sin(thetaH) * radiusX * direction);
            }
        }
        if (showNormals) {
            const normalsLength = 1 / 4;
            // Add normal vertices to array
            const normalArray = Globe.getNormalArray(radiusX, radiusY, segments, isReversed);
            for (let i = 0; i < normalArray.length; i += 3) {
                vertexArray.push(normalArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(normalArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(normalArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
            // Add Tangent vertices to array
            const tangentArray = Globe.getTangentArray(radiusX, radiusY, segments, isReversed);
            for (let i = 0; i < tangentArray.length; i += 3) {
                vertexArray.push(tangentArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(tangentArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(tangentArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
            // Add Bitangent vertices to array
            const bitangentArray = Globe.getBitangentArray(radiusX, radiusY, segments, isReversed);
            for (let i = 0; i < bitangentArray.length; i += 3) {
                vertexArray.push(bitangentArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(bitangentArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(bitangentArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
        }
        return vertexArray;
    }
    static getIndexArray(segments, isWireframe, showNormals) {
        return isWireframe ?
            (showNormals ? Globe.getNormalIndexArray(segments) : Globe.getWireframeIndexArray(segments))
            : Globe.getSolidIndexArray(segments);
    }
    static getNormalArray(radiusX, radiusY, segments, isReversed) {
        const direction = isReversed ? -1 : 1;
        const normalArray = [];
        normalArray.push(0, 1 * direction, 0);
        normalArray.push(0, -1 * direction, 0);
        for (let i = 0; i <= segments; i++) {
            for (let j = 1; j < segments; j++) {
                const thetaV = (Math.PI / 2 - (Math.PI / segments * j));
                const thetaH = (Math.PI / 2 - (Math.PI * 2 / segments * i));
                normalArray.push(Math.cos(thetaV) * Math.cos(thetaH) * radiusX * direction, Math.sin(thetaV) * radiusY * direction, -Math.cos(thetaV) * Math.sin(thetaH) * radiusX * direction);
            }
        }
        return normalArray;
    }
    static getNormalIndexArray(segments) {
        const indexArray = this.getWireframeIndexArray(segments);
        const normalOffset = (segments + 1) * (segments - 1) + 2;
        indexArray.push(0);
        indexArray.push(normalOffset);
        indexArray.push(1);
        indexArray.push(normalOffset + 1);
        for (let i = 0; i < segments; i++) {
            for (let j = 1; j <= segments; j++) {
                const vertexCount = j + i * (segments - 1);
                indexArray.push(vertexCount);
                indexArray.push(vertexCount + normalOffset);
            }
        }
        const tangentOffset = ((segments + 1) * (segments - 1) + 2) * 2;
        indexArray.push(0);
        indexArray.push(tangentOffset);
        indexArray.push(1);
        indexArray.push(tangentOffset + 1);
        for (let i = 0; i < segments; i++) {
            for (let j = 1; j <= segments; j++) {
                const vertexCount = j + i * (segments - 1);
                indexArray.push(vertexCount);
                indexArray.push(vertexCount + tangentOffset);
            }
        }
        const biTangentOffset = ((segments + 1) * (segments - 1) + 2) * 3;
        indexArray.push(0);
        indexArray.push(biTangentOffset);
        indexArray.push(1);
        indexArray.push(biTangentOffset + 1);
        for (let i = 0; i < segments; i++) {
            for (let j = 1; j <= segments; j++) {
                const vertexCount = j + i * (segments - 1);
                indexArray.push(vertexCount);
                indexArray.push(vertexCount + biTangentOffset);
            }
        }
        return indexArray;
    }
    static getWireframeIndexArray(segments) {
        const indexArray = [];
        for (let i = 0; i <= segments; i++) {
            indexArray.push(0);
            indexArray.push(2 + i * (segments - 1));
            for (let j = 2; j < segments; j++) {
                const vertexCount = j + i * (segments - 1);
                indexArray.push(vertexCount);
                indexArray.push(vertexCount + 1);
                if (i < segments - 1) {
                    indexArray.push(vertexCount);
                    indexArray.push(vertexCount + segments - 1);
                }
                else {
                    indexArray.push(vertexCount);
                    indexArray.push(j);
                }
            }
            indexArray.push(segments + (i * (segments - 1)));
            indexArray.push(1);
            indexArray.push(segments + (i * (segments - 1)));
            indexArray.push(1 + (i * (segments - 1)));
        }
        indexArray.push((segments * (segments - 1)) + 1);
        indexArray.push(segments);
        return indexArray;
    }
    static getSolidIndexArray(segments) {
        const indexArray = [];
        for (let i = 0; i <= segments - 1; i++) {
            indexArray.push(0);
            indexArray.push(2 + (i + 1) * (segments - 1));
            indexArray.push(2 + i * (segments - 1));
            for (let j = 2; j < segments; j++) {
                const vertexCount = j + i * (segments - 1);
                const nextVertexCount = j + i * (segments - 1) + (segments - 1);
                indexArray.push(vertexCount);
                indexArray.push(nextVertexCount + 1);
                indexArray.push(vertexCount + 1);
                indexArray.push(vertexCount);
                indexArray.push(nextVertexCount);
                indexArray.push(nextVertexCount + 1);
                if (i === 0) {
                    indexArray.push(vertexCount + (segments * (segments - 1)) - segments + 1);
                    indexArray.push(vertexCount + 1);
                    indexArray.push(vertexCount + (segments * (segments - 1)) - segments + 2);
                    indexArray.push(vertexCount + (segments * (segments - 1)) - (segments - 1));
                    indexArray.push(vertexCount);
                    indexArray.push(vertexCount + 1);
                    indexArray.push(0);
                    indexArray.push(2);
                    indexArray.push(vertexCount + (segments * (segments - 1)) - segments + 1);
                }
            }
            indexArray.push(1);
            indexArray.push(segments + i * (segments - 1));
            indexArray.push(segments + (i + 1) * (segments - 1));
        }
        indexArray.push(1);
        indexArray.push(segments * (segments - 1) + 1);
        indexArray.push(segments);
        return indexArray;
    }
    static getTextureArray(segments, textureRatio) {
        textureRatio = textureRatio ? textureRatio : 1;
        const textureArray = [
            0.5 * textureRatio, 0,
            0.5 * textureRatio, 1
        ];
        for (let i = 0; i <= segments; i++) {
            for (let j = 1; j < segments; j++) {
                textureArray.push(textureRatio - (1 / segments) * i * textureRatio);
                textureArray.push((textureRatio / segments) * j * textureRatio);
            }
        }
        return textureArray;
    }
    static getTangentArray(radiusX, radiusY, segments, isReversed) {
        const direction = isReversed ? -1 : 1;
        const tangentArray = [];
        tangentArray.push(-1, 0, 0);
        tangentArray.push(-1, 0, 0);
        for (let i = 0; i <= segments; i++) {
            for (let j = 1; j < segments; j++) {
                const thetaH = (Math.PI / 2 - ((Math.PI * 2 / segments) * i));
                tangentArray.push(Math.cos(thetaH + Math.PI / 2));
                tangentArray.push(0);
                tangentArray.push(Math.sin(thetaH - Math.PI / 2));
            }
        }
        return tangentArray;
    }
    static getBitangentArray(radiusX, radiusY, segments, isReversed) {
        const direction = isReversed ? -1 : 1;
        const bitangentArray = [];
        bitangentArray.push(0, 0, -1);
        bitangentArray.push(0, 0, 1);
        for (let i = 0; i <= segments; i++) {
            for (let j = 1; j < segments; j++) {
                const thetaV = (Math.PI / 2 - (Math.PI / segments * j));
                const thetaH = (Math.PI / 2 - (Math.PI * 2 / segments * i));
                bitangentArray.push(Math.cos(thetaV - Math.PI / 2) * Math.cos(thetaH));
                bitangentArray.push(Math.sin(thetaV - Math.PI / 2));
                bitangentArray.push(-Math.cos(thetaV - Math.PI / 2) * Math.sin(thetaH));
            }
        }
        return bitangentArray;
    }
}
//# sourceMappingURL=globe.js.map