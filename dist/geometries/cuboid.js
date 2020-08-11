import { Geometry } from "./geometry.js";
export class Cuboid extends Geometry {
    constructor(width, height, depth, isWireframe, isReversed) {
        super(Cuboid.getVertexArray(width, height, depth, isReversed), Cuboid.getIndexArray(isWireframe), Cuboid.getNormalArray(), Cuboid.getTextureArray(width, height, depth), Cuboid.getTangentArray(), Cuboid.getBitangentArray());
    }
    //
    // Generate the array of vertices
    // If isReversed is true, the faces are reversed, thereby showing the 'inside' of the shape.
    //
    static getVertexArray(width, height, depth, isReversed) {
        const direction = isReversed ? -1 : 1;
        return [
            // Front face
            -width / 2, height / 2, depth / 2 * direction,
            -width / 2, -height / 2, depth / 2 * direction,
            width / 2, -height / 2, depth / 2 * direction,
            width / 2, height / 2, depth / 2 * direction,
            // Top face
            -width / 2, height / 2 * direction, -depth / 2,
            -width / 2, height / 2 * direction, depth / 2,
            width / 2, height / 2 * direction, depth / 2,
            width / 2, height / 2 * direction, -depth / 2,
            // Bottom face
            -width / 2, -height / 2 * direction, depth / 2,
            -width / 2, -height / 2 * direction, -depth / 2,
            width / 2, -height / 2 * direction, -depth / 2,
            width / 2, -height / 2 * direction, depth / 2,
            // Left face
            -width / 2 * direction, height / 2, -depth / 2,
            -width / 2 * direction, -height / 2, -depth / 2,
            -width / 2 * direction, -height / 2, depth / 2,
            -width / 2 * direction, height / 2, depth / 2,
            // Right face
            width / 2 * direction, height / 2, depth / 2,
            width / 2 * direction, -height / 2, depth / 2,
            width / 2 * direction, -height / 2, -depth / 2,
            width / 2 * direction, height / 2, -depth / 2,
            // Rear face
            width / 2, height / 2, -depth / 2 * direction,
            width / 2, -height / 2, -depth / 2 * direction,
            -width / 2, -height / 2, -depth / 2 * direction,
            -width / 2, height / 2, -depth / 2 * direction
        ];
    }
    static getIndexArray(isWireframe) {
        return isWireframe ? [
            0, 1, 1, 2, 2, 3, 3, 0,
            20, 21, 21, 22, 22, 23, 23, 20,
            0, 23, 1, 22, 2, 21, 3, 20
        ] : [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23,
        ];
    }
    static getNormalArray() {
        let normalArray = [];
        Array.from({ length: 4 }, () => normalArray = normalArray.concat([0, 0, 1]));
        Array.from({ length: 4 }, () => normalArray = normalArray.concat([0, 1, 0]));
        Array.from({ length: 4 }, () => normalArray = normalArray.concat([0, -1, 0]));
        Array.from({ length: 4 }, () => normalArray = normalArray.concat([-1, 0, 0]));
        Array.from({ length: 4 }, () => normalArray = normalArray.concat([1, 0, 0]));
        Array.from({ length: 4 }, () => normalArray = normalArray.concat([0, 0, -1]));
        return normalArray;
    }
    static getTextureArray(width, height, depth) {
        const textureRatio = 0.5;
        return [
            0, 0, 0, height / width * textureRatio, textureRatio, height / width * textureRatio, textureRatio, 0,
            0, 0, 0, depth / width * textureRatio, textureRatio, depth / width * textureRatio, textureRatio, 0,
            0, 0, 0, depth / width * textureRatio, textureRatio, depth / width * textureRatio, textureRatio, 0,
            0, 0, 0, height / depth * textureRatio, textureRatio, height / depth * textureRatio, textureRatio, 0,
            0, 0, 0, height / depth * textureRatio, textureRatio, height / depth * textureRatio, textureRatio, 0,
            0, 0, 0, height / width * textureRatio, textureRatio, height / width * textureRatio, textureRatio, 0,
        ];
    }
    static getTangentArray() {
        return [
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        ];
    }
    static getBitangentArray() {
        return [
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
            0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
            0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        ];
    }
}
//# sourceMappingURL=cuboid.js.map