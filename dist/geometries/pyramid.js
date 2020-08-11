import { Geometry } from "./geometry.js";
//
// A pyramid is like a prism, but tapers to a point
//
export class Pyramid extends Geometry {
    constructor(radiusX, radiusY, depth, segments, isWireframe) {
        super(Pyramid.getVertexArray(radiusX, radiusY, depth, segments), Pyramid.getIndexArray(segments, isWireframe), Pyramid.getNormalArray(radiusX, radiusY, depth, segments), Pyramid.getTextureArray(segments));
    }
    static getVertexArray(radiusX, radiusY, depth, segments) {
        const vertexArray = [];
        // Near face - centre vertex only appears once
        vertexArray.push(0);
        vertexArray.push(0);
        vertexArray.push(depth / 2);
        for (let i = 0; i < segments; i++) {
            const theta = Math.PI * 2 / segments * i;
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(depth / 2);
        }
        ;
        // Sides - for normals to relate to a surface rather than a vertex, vertices cannot
        // be shared, so create all vertices for each surface
        for (let i = 0; i < segments; i++) {
            let theta = Math.PI * 2 / segments * i;
            // Near
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(depth / 2);
            // Far
            vertexArray.push(0);
            vertexArray.push(0);
            vertexArray.push(-depth / 2);
            theta = Math.PI * 2 / segments * (i + 1);
            // Near 2
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(depth / 2);
        }
        ;
        return vertexArray;
    }
    static getIndexArray(segments, isWireframe) {
        return isWireframe ?
            Pyramid.getWireframeIndexArray(segments)
            : Pyramid.getSolidIndexArray(segments);
    }
    static getNormalArray(radiusX, radiusY, depth, segments) {
        let normalArray = [];
        Array.from({ length: segments + 1 }, () => normalArray = normalArray.concat([0, 0, 1]));
        // Z will be the same for all vertices/surfaces - note that this only works where radiusX = radiusY
        const zHyp = Math.sqrt(radiusX * radiusX + depth * depth);
        const zTheta = Math.acos(radiusX / zHyp);
        const zNormal = -Math.cos(Math.PI / 2 - zTheta);
        for (let i = 0; i < segments; i++) {
            const theta = (Math.PI * 2 / segments * i) + (Math.PI / segments);
            normalArray = normalArray.concat([Math.cos(theta), Math.sin(theta), zNormal]);
            normalArray = normalArray.concat([Math.cos(theta), Math.sin(theta), zNormal]);
            normalArray = normalArray.concat([Math.cos(theta), Math.sin(theta), zNormal]);
        }
        return normalArray;
    }
    static getWireframeIndexArray(segments) {
        const indexArray = [];
        // Front face
        for (let i = 1; i < segments; i++) {
            indexArray.push(i);
            indexArray.push(i + 1);
        }
        ;
        indexArray.push(segments);
        indexArray.push(1);
        // Sides
        const sideFaceDisplacement = (segments + 1);
        for (let i = 0; i < segments; i++) {
            indexArray.push(i * 3 + sideFaceDisplacement);
            indexArray.push(i * 3 + 1 + sideFaceDisplacement);
        }
        ;
        return indexArray;
    }
    static getSolidIndexArray(segments) {
        const indexArray = [];
        // Front face
        for (let i = 0; i < segments - 1; i++) {
            indexArray.push(0);
            indexArray.push(i + 1);
            indexArray.push(i + 2);
        }
        ;
        indexArray.push(0);
        indexArray.push(segments);
        indexArray.push(1);
        // Sides
        const sideFaceDisplacement = segments + 1;
        for (let i = 0; i < segments; i++) {
            indexArray.push(i * 3 + sideFaceDisplacement);
            indexArray.push(i * 3 + 1 + sideFaceDisplacement);
            indexArray.push(i * 3 + 2 + sideFaceDisplacement);
        }
        ;
        return indexArray;
    }
    static getTextureArray(segments) {
        const textureArray = [];
        // Currently no strategy for base texture!
        for (let i = 0; i <= segments; i++) {
            textureArray.push(0);
            textureArray.push(0);
        }
        // For now have the same on each side
        for (let i = 0; i < segments; i++) {
            textureArray.push(1);
            textureArray.push(1);
            textureArray.push(0.5);
            textureArray.push(0);
            textureArray.push(0);
            textureArray.push(1);
        }
        return textureArray;
    }
}
//# sourceMappingURL=pyramid.js.map