import { Geometry } from "./geometry.js";
export class Cylinder extends Geometry {
    constructor(radiusX, radiusY, depth, segments, isWireframe) {
        super(Cylinder.getVertexArray(radiusX, radiusY, depth, segments), Cylinder.getIndexArray(segments, isWireframe), Cylinder.getNormalArray(radiusX, radiusY, segments));
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
        // Sides
        for (let i = 0; i < segments; i++) {
            const theta = Math.PI * 2 / segments * i;
            // Near
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(depth / 2);
            // Far
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(-depth / 2);
        }
        ;
        return vertexArray;
    }
    static getIndexArray(segments, isWireframe) {
        return isWireframe ?
            Cylinder.getWireframeIndexArray(segments)
            : Cylinder.getSolidIndexArray(segments);
    }
    static getNormalArray(radiusX, radiusY, segments) {
        let normalArray = [];
        Array.from({ length: segments + 1 }, () => normalArray = normalArray.concat([0, 0, 1]));
        Array.from({ length: segments + 1 }, () => normalArray = normalArray.concat([0, 0, -1]));
        for (let i = 0; i < segments; i++) {
            const theta = Math.PI * 2 / segments * i;
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
        }
        return normalArray;
    }
    static getWireframeIndexArray(segments) {
        const indexArray = [];
        // Top face
        for (let i = 1; i < segments; i++) {
            indexArray.push(i);
            indexArray.push(i + 1);
        }
        ;
        indexArray.push(segments);
        indexArray.push(1);
        // Bottom face
        const bottomFaceDisplacement = segments + 1;
        for (let i = 1; i < segments; i++) {
            indexArray.push(i + bottomFaceDisplacement);
            indexArray.push(i + 1 + bottomFaceDisplacement);
        }
        ;
        indexArray.push(segments + bottomFaceDisplacement);
        indexArray.push(1 + bottomFaceDisplacement);
        // Show quarters
        const sideFaceDisplacement = (segments * 2) + 2;
        indexArray.push(sideFaceDisplacement);
        indexArray.push(sideFaceDisplacement + 1);
        indexArray.push(sideFaceDisplacement + segments / 2);
        indexArray.push(sideFaceDisplacement + segments / 2 + 1);
        indexArray.push(sideFaceDisplacement + segments);
        indexArray.push(sideFaceDisplacement + segments + 1);
        indexArray.push(sideFaceDisplacement + segments * 1.5);
        indexArray.push(sideFaceDisplacement + segments * 1.5 + 1);
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
        const rearFaceDisplacement = segments + 1;
        for (let i = 0; i < segments - 1; i++) {
            indexArray.push(rearFaceDisplacement);
            indexArray.push(i + 1 + rearFaceDisplacement);
            indexArray.push(i + 2 + rearFaceDisplacement);
        }
        ;
        indexArray.push(rearFaceDisplacement);
        indexArray.push(segments + rearFaceDisplacement);
        indexArray.push(1 + rearFaceDisplacement);
        // Sides
        const sideFaceDisplacement = (segments + 1) * 2;
        for (let i = 0; i < (segments - 1) * 2; i += 2) {
            indexArray.push(i + 2 + sideFaceDisplacement);
            indexArray.push(i + sideFaceDisplacement);
            indexArray.push(i + 1 + sideFaceDisplacement);
            indexArray.push(i + 2 + sideFaceDisplacement);
            indexArray.push(i + 1 + sideFaceDisplacement);
            indexArray.push(i + 3 + sideFaceDisplacement);
        }
        ;
        indexArray.push(sideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + sideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + sideFaceDisplacement);
        indexArray.push(sideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + sideFaceDisplacement);
        indexArray.push(sideFaceDisplacement + 1);
        return indexArray;
    }
}
//# sourceMappingURL=cylinder.js.map