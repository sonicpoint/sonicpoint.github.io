import { Geometry } from "./geometry.js";
//
// A prism is like a cylinder, but doesn't have smooth sides
//
export class Prism extends Geometry {
    constructor(radiusX, radiusY, depth, segments, isWireframe) {
        super(Prism.getVertexArray(radiusX, radiusY, depth, segments), Prism.getIndexArray(segments, isWireframe), Prism.getNormalArray(radiusX, radiusY, segments));
    }
    static getVertexArray(radiusX, radiusY, depth, segments) {
        const vertexArray = [];
        // Front face - centre vertex only appears once
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
        // Rear face - centre vertex only appears once
        vertexArray.push(0);
        vertexArray.push(0);
        vertexArray.push(-depth / 2);
        for (let i = 0; i < segments; i++) {
            const theta = -Math.PI * 2 / segments * i;
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(-depth / 2);
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
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(-depth / 2);
            theta = Math.PI * 2 / segments * (i + 1);
            // Far
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(-depth / 2);
            // Near
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(depth / 2);
        }
        ;
        return vertexArray;
    }
    static getIndexArray(segments, isWireframe) {
        return isWireframe ?
            Prism.getWireframeIndexArray(segments)
            : Prism.getSolidIndexArray(segments);
    }
    static getNormalArray(radiusX, radiusY, segments) {
        let normalArray = [];
        Array.from({ length: segments + 1 }, () => normalArray = normalArray.concat([0, 0, 1]));
        Array.from({ length: segments + 1 }, () => normalArray = normalArray.concat([0, 0, -1]));
        for (let i = 0; i < segments; i++) {
            const theta = (Math.PI * 2 / segments * i) + (Math.PI / segments);
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
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
        // Rear face
        const bottomFaceDisplacement = segments + 1;
        for (let i = 1; i < segments; i++) {
            indexArray.push(i + bottomFaceDisplacement);
            indexArray.push(i + 1 + bottomFaceDisplacement);
        }
        ;
        indexArray.push(segments + bottomFaceDisplacement);
        indexArray.push(1 + bottomFaceDisplacement);
        // Sides
        const sideFaceDisplacement = (segments + 1) * 2;
        for (let i = 0; i < segments; i++) {
            indexArray.push(i * 4 + sideFaceDisplacement);
            indexArray.push(i * 4 + 1 + sideFaceDisplacement);
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
        // Rear face
        const bottomFaceDisplacement = segments + 1;
        for (let i = 0; i < segments - 1; i++) {
            indexArray.push(bottomFaceDisplacement);
            indexArray.push(i + 1 + bottomFaceDisplacement);
            indexArray.push(i + 2 + bottomFaceDisplacement);
        }
        ;
        indexArray.push(bottomFaceDisplacement);
        indexArray.push(segments + bottomFaceDisplacement);
        indexArray.push(1 + bottomFaceDisplacement);
        // Sides
        const sideFaceDisplacement = (segments + 1) * 2;
        for (let i = 0; i < segments; i++) {
            indexArray.push(i * 4 + sideFaceDisplacement);
            indexArray.push(i * 4 + 1 + sideFaceDisplacement);
            indexArray.push(i * 4 + 2 + sideFaceDisplacement);
            indexArray.push(i * 4 + sideFaceDisplacement);
            indexArray.push(i * 4 + 2 + sideFaceDisplacement);
            indexArray.push(i * 4 + 3 + sideFaceDisplacement);
        }
        ;
        return indexArray;
    }
}
//# sourceMappingURL=prism.js.map