import { Geometry } from "./geometry.js";
export class Surface extends Geometry {
    constructor(width, height, isWireframe, textureRatio, showNormals) {
        const maintainTextureAspect = true;
        super(Surface.getVertexArray(width, height, showNormals), Surface.getIndexArray(isWireframe, showNormals), Surface.getNormalArray(), Surface.getTextureArray(width, height, textureRatio, maintainTextureAspect), Surface.getTangentArray(), Surface.getBitangentArray());
    }
    //
    // Generate the array of vertices
    //
    static getVertexArray(width, height, showNormals) {
        const vertexArray = [
            -width / 2, height / 2, 0,
            -width / 2, -height / 2, 0,
            width / 2, -height / 2, 0,
            width / 2, height / 2, 0
        ];
        if (showNormals) {
            const normalsLength = 1 / 4;
            // Add normal vertices to array
            const normalArray = Surface.getNormalArray();
            for (let i = 0; i < normalArray.length; i += 3) {
                vertexArray.push(normalArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(normalArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(normalArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
            // Add Tangent vertices to array
            const tangentArray = Surface.getTangentArray();
            for (let i = 0; i < tangentArray.length; i += 3) {
                vertexArray.push(tangentArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(tangentArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(tangentArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
            // Add Bitangent vertices to array
            const bitangentArray = Surface.getBitangentArray();
            for (let i = 0; i < bitangentArray.length; i += 3) {
                vertexArray.push(bitangentArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(bitangentArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(bitangentArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
        }
        return vertexArray;
    }
    static getIndexArray(isWireframe, showNormals) {
        return isWireframe ?
            (showNormals ? Surface.getNormalIndexArray() : [0, 1, 1, 2, 2, 3, 3, 0])
            : [0, 1, 2, 0, 2, 3];
    }
    static getNormalArray() {
        let normalArray = [];
        Array.from({ length: 4 }, () => normalArray = normalArray.concat([0, 0, 1]));
        return normalArray;
    }
    static getNormalIndexArray() {
        const indexArray = [];
        const normalOffset = 4;
        for (let i = 0; i < 4; i++) {
            indexArray.push(i);
            indexArray.push(i + normalOffset);
        }
        const tangentOffset = 8;
        for (let i = 0; i < 4; i++) {
            indexArray.push(i);
            indexArray.push(i + tangentOffset);
        }
        const bitangentOffset = 12;
        for (let i = 0; i < 4; i++) {
            indexArray.push(i);
            indexArray.push(i + bitangentOffset);
        }
        return indexArray;
    }
    //
    // maintainTextureAspect indicates that the texture should maintain its aspect ratio
    //
    static getTextureArray(width, height, textureRatio, maintainTextureAspect) {
        textureRatio = textureRatio ? textureRatio : 1;
        const aspectRatio = maintainTextureAspect ? height / width : 1;
        return [
            0, 0, 0, aspectRatio * textureRatio, textureRatio, aspectRatio * textureRatio, textureRatio, 0
        ];
    }
    static getTangentArray() {
        return [
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0
        ];
    }
    static getBitangentArray() {
        return [
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
        ];
    }
}
//# sourceMappingURL=surface.js.map