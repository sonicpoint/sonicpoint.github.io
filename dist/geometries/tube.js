import { Geometry } from "./geometry.js";
export class Tube extends Geometry {
    constructor(radiusX, radiusY, depth, thickness, segments, isWireframe) {
        super(Tube.getVertexArray(radiusX, radiusY, depth, thickness, segments), Tube.getIndexArray(segments, isWireframe), Tube.getNormalArray(radiusX, radiusY, segments));
    }
    static getVertexArray(radiusX, radiusY, depth, thickness, segments) {
        const vertexArray = [];
        const innerRadiusX = radiusX - thickness;
        const innerRadiusY = radiusY - thickness;
        // Front face
        for (let i = 0; i < segments; i++) {
            const theta = Math.PI * 2 / segments * i;
            vertexArray.push(Math.cos(theta) * innerRadiusX);
            vertexArray.push(Math.sin(theta) * innerRadiusY);
            vertexArray.push(depth / 2);
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(depth / 2);
        }
        ;
        // Rear face - centre vertex only appears once
        for (let i = 0; i < segments; i++) {
            const theta = -Math.PI * 2 / segments * i;
            vertexArray.push(Math.cos(theta) * innerRadiusX);
            vertexArray.push(Math.sin(theta) * innerRadiusY);
            vertexArray.push(-depth / 2);
            vertexArray.push(Math.cos(theta) * radiusX);
            vertexArray.push(Math.sin(theta) * radiusY);
            vertexArray.push(-depth / 2);
        }
        ;
        // Outer sides
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
        // Inner sides
        for (let i = 0; i < segments; i++) {
            const theta = Math.PI * 2 / segments * i;
            // Near
            vertexArray.push(Math.cos(theta) * innerRadiusX);
            vertexArray.push(Math.sin(theta) * innerRadiusY);
            vertexArray.push(depth / 2);
            // Far
            vertexArray.push(Math.cos(theta) * innerRadiusX);
            vertexArray.push(Math.sin(theta) * innerRadiusY);
            vertexArray.push(-depth / 2);
        }
        ;
        return vertexArray;
    }
    static getIndexArray(segments, isWireframe) {
        return isWireframe ?
            Tube.getWireframeIndexArray(segments)
            : Tube.getSolidIndexArray(segments);
    }
    static getNormalArray(radiusX, radiusY, segments) {
        let normalArray = [];
        Array.from({ length: segments * 2 }, () => normalArray = normalArray.concat([0, 0, 1]));
        Array.from({ length: segments * 2 }, () => normalArray = normalArray.concat([0, 0, -1]));
        for (let i = 0; i < segments; i++) {
            const theta = Math.PI * 2 / segments * i;
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
            normalArray = normalArray.concat([Math.cos(theta) * radiusX, Math.sin(theta) * radiusY, 0]);
        }
        for (let i = 0; i < segments; i++) {
            const theta = Math.PI * 2 / segments * i;
            normalArray = normalArray.concat([-Math.cos(theta) * radiusX, -Math.sin(theta) * radiusY, 0]);
            normalArray = normalArray.concat([-Math.cos(theta) * radiusX, -Math.sin(theta) * radiusY, 0]);
        }
        return normalArray;
    }
    static getWireframeIndexArray(segments) {
        const indexArray = [];
        // Front face
        for (let i = 0; i < segments - 1; i++) {
            indexArray.push(i * 2);
            indexArray.push(i * 2 + 2);
            indexArray.push(i * 2 + 1);
            indexArray.push(i * 2 + 3);
        }
        ;
        indexArray.push((segments - 1) * 2);
        indexArray.push(0);
        indexArray.push((segments - 1) * 2 + 1);
        indexArray.push(1);
        // Rear face
        const rearFaceDisplacement = segments * 2;
        for (let i = 0; i < segments - 1; i++) {
            indexArray.push(i * 2 + rearFaceDisplacement);
            indexArray.push(i * 2 + 2 + rearFaceDisplacement);
            indexArray.push(i * 2 + 1 + rearFaceDisplacement);
            indexArray.push(i * 2 + 3 + rearFaceDisplacement);
        }
        ;
        indexArray.push((segments - 1) * 2 + rearFaceDisplacement);
        indexArray.push(rearFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + rearFaceDisplacement);
        indexArray.push(1 + rearFaceDisplacement);
        // Show quarters
        const outerSideFaceDisplacement = segments * 4;
        indexArray.push(outerSideFaceDisplacement);
        indexArray.push(outerSideFaceDisplacement + 1);
        indexArray.push(outerSideFaceDisplacement + segments / 2);
        indexArray.push(outerSideFaceDisplacement + segments / 2 + 1);
        indexArray.push(outerSideFaceDisplacement + segments);
        indexArray.push(outerSideFaceDisplacement + segments + 1);
        indexArray.push(outerSideFaceDisplacement + segments * 1.5);
        indexArray.push(outerSideFaceDisplacement + segments * 1.5 + 1);
        const innerSideFaceDisplacement = segments * 6;
        indexArray.push(innerSideFaceDisplacement);
        indexArray.push(innerSideFaceDisplacement + 1);
        indexArray.push(innerSideFaceDisplacement + segments / 2);
        indexArray.push(innerSideFaceDisplacement + segments / 2 + 1);
        indexArray.push(innerSideFaceDisplacement + segments);
        indexArray.push(innerSideFaceDisplacement + segments + 1);
        indexArray.push(innerSideFaceDisplacement + segments * 1.5);
        indexArray.push(innerSideFaceDisplacement + segments * 1.5 + 1);
        return indexArray;
    }
    static getSolidIndexArray(segments) {
        const indexArray = [];
        // Front face
        for (let i = 0; i < (segments - 1) * 2; i += 2) {
            indexArray.push(i + 2);
            indexArray.push(i);
            indexArray.push(i + 1);
            indexArray.push(i + 2);
            indexArray.push(i + 1);
            indexArray.push(i + 3);
        }
        ;
        indexArray.push(0);
        indexArray.push((segments - 1) * 2);
        indexArray.push((segments - 1) * 2 + 1);
        indexArray.push(0);
        indexArray.push((segments - 1) * 2 + 1);
        indexArray.push(1);
        // Rear face
        const rearFaceDisplacement = segments * 2;
        for (let i = 0; i < (segments - 1) * 2; i += 2) {
            indexArray.push(i + 2 + rearFaceDisplacement);
            indexArray.push(i + rearFaceDisplacement);
            indexArray.push(i + 1 + rearFaceDisplacement);
            indexArray.push(i + 2 + rearFaceDisplacement);
            indexArray.push(i + 1 + rearFaceDisplacement);
            indexArray.push(i + 3 + rearFaceDisplacement);
        }
        ;
        indexArray.push(rearFaceDisplacement);
        indexArray.push((segments - 1) * 2 + rearFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + rearFaceDisplacement);
        indexArray.push(rearFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + rearFaceDisplacement);
        indexArray.push(1 + rearFaceDisplacement);
        // Outer sides
        const outerSideFaceDisplacement = segments * 4;
        for (let i = 0; i < (segments - 1) * 2; i += 2) {
            indexArray.push(i + 2 + outerSideFaceDisplacement);
            indexArray.push(i + outerSideFaceDisplacement);
            indexArray.push(i + 1 + outerSideFaceDisplacement);
            indexArray.push(i + 2 + outerSideFaceDisplacement);
            indexArray.push(i + 1 + outerSideFaceDisplacement);
            indexArray.push(i + 3 + outerSideFaceDisplacement);
        }
        ;
        indexArray.push(outerSideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + outerSideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + outerSideFaceDisplacement);
        indexArray.push(outerSideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + outerSideFaceDisplacement);
        indexArray.push(outerSideFaceDisplacement + 1);
        // Outer sides
        const innerSideFaceDisplacement = segments * 6;
        for (let i = 0; i < (segments - 1) * 2; i += 2) {
            indexArray.push(i + 2 + innerSideFaceDisplacement);
            indexArray.push(i + 1 + innerSideFaceDisplacement);
            indexArray.push(i + innerSideFaceDisplacement);
            indexArray.push(i + 1 + innerSideFaceDisplacement);
            indexArray.push(i + 2 + innerSideFaceDisplacement);
            indexArray.push(i + 3 + innerSideFaceDisplacement);
        }
        ;
        indexArray.push(innerSideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + 1 + innerSideFaceDisplacement);
        indexArray.push((segments - 1) * 2 + innerSideFaceDisplacement);
        indexArray.push(innerSideFaceDisplacement);
        indexArray.push(innerSideFaceDisplacement + 1);
        indexArray.push((segments - 1) * 2 + 1 + innerSideFaceDisplacement);
        return indexArray;
    }
}
//# sourceMappingURL=tube.js.map