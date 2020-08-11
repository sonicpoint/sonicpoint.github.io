import { Geometry } from "./geometry.js";
//
// Quadrilateral geometry - this uses a 3D texture, due to non-right-angle corners, and
// needs an appropriate program to render it, such as SimpleTextureProgram3D.
//
export class Quad extends Geometry {
    constructor(topWidth, bottomWidth, height, isWireframe, textureRatio, showNormals) {
        const maintainTextureAspect = false;
        super(Quad.getVertexArray(topWidth, bottomWidth, height, showNormals), Quad.getIndexArray(isWireframe, showNormals), Quad.getNormalArray(), Quad.getTextureArray(topWidth, bottomWidth, height, textureRatio, maintainTextureAspect));
    }
    //
    // Generate the array of vertices
    //
    static getVertexArray(topWidth, bottomWidth, height, showNormals) {
        const vertexArray = [
            -topWidth / 2, height / 2, 0,
            -bottomWidth / 2, -height / 2, 0,
            bottomWidth / 2, -height / 2, 0,
            topWidth / 2, height / 2, 0,
        ];
        if (showNormals) {
            const normalsLength = 1 / 4;
            // Add normal vertices to array
            const normalArray = Quad.getNormalArray();
            for (let i = 0; i < normalArray.length; i += 3) {
                vertexArray.push(normalArray[i] * normalsLength + vertexArray[i]);
                vertexArray.push(normalArray[i + 1] * normalsLength + vertexArray[i + 1]);
                vertexArray.push(normalArray[i + 2] * normalsLength + vertexArray[i + 2]);
            }
        }
        return vertexArray;
    }
    static getIndexArray(isWireframe, showNormals) {
        return isWireframe ?
            (showNormals ? Quad.getNormalIndexArray() : [0, 1, 1, 2, 2, 3, 3, 0])
            : [2, 3, 1, 1, 3, 0];
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
    // Texture array is three-dimensional
    //
    static getTextureArray(topWidth, bottomWidth, height, textureRatio, maintainTextureAspect) {
        textureRatio = textureRatio ? textureRatio : 1;
        const aspectRatio = maintainTextureAspect ? height / topWidth : 1;
        return [
            0, 0, topWidth / bottomWidth,
            0, aspectRatio * textureRatio, 1,
            textureRatio, aspectRatio * textureRatio, 1,
            textureRatio * topWidth / bottomWidth, 0, topWidth / bottomWidth,
        ];
    }
}
//# sourceMappingURL=quad.js.map