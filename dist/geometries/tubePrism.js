import { Geometry } from "./geometry.js";
//
// A prism with a tube along the z-axis
// Note: segments and tubeSegments MUST be multiples of each other (e.g. 8/4, 4/4, 4/8, etc).
//
export class TubePrism extends Geometry {
    constructor(settings, isWireframe) {
        const radiusX = settings.outerRadiusX;
        const radiusY = settings.outerRadiusY;
        const depth = settings.depth;
        const segments = settings.outerSegments;
        const smoothOuter = settings.isOuterSmooth;
        const tubeRadiusX = settings.innerRadiusX;
        const tubeRadiusY = settings.innerRadiusY;
        const tubeSegments = settings.innerSegments;
        const smoothInner = settings.isInnerSmooth;
        super(TubePrism.getVertexArray(settings), TubePrism.getIndexArray(settings, isWireframe), TubePrism.getNormalArray(settings));
    }
    static getVertexArray(settings) {
        const vertexArray = [];
        // Near face - outer
        for (let i = 0; i < settings.outerSegments; i++) {
            const theta = ((Math.PI * 2) / settings.outerSegments) * i;
            vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
            vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
            vertexArray.push(settings.depth / 2);
        }
        // Near face - inner
        for (let i = 0; i < settings.innerSegments; i++) {
            const theta = ((Math.PI * 2) / settings.innerSegments) * i;
            vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
            vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
            vertexArray.push(settings.depth / 2);
        }
        // Far face - outer
        for (let i = 0; i < settings.outerSegments; i++) {
            const theta = ((Math.PI * 2) / settings.outerSegments) * i;
            vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
            vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
            vertexArray.push(-settings.depth / 2);
        }
        // Far face - inner
        for (let i = 0; i < settings.innerSegments; i++) {
            const theta = ((Math.PI * 2) / settings.innerSegments) * i;
            vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
            vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
            vertexArray.push(-settings.depth / 2);
        }
        // Outer sides
        if (settings.isOuterSmooth) {
            // Smooth sides - surfaces share vertices
            for (let i = 0; i < settings.outerSegments; i++) {
                const theta = Math.PI * 2 / settings.outerSegments * i;
                // Near
                vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
                vertexArray.push(settings.depth / 2);
                // Far
                vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
                vertexArray.push(-settings.depth / 2);
            }
            ;
        }
        else {
            // Outer sides - for normals to relate to a surface rather than a vertex, vertices cannot
            // be shared, so create all vertices for each surface
            for (let i = 0; i < settings.outerSegments; i++) {
                let theta = Math.PI * 2 / settings.outerSegments * i;
                // Near
                vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
                vertexArray.push(settings.depth / 2);
                // Far
                vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
                vertexArray.push(-settings.depth / 2);
                theta = Math.PI * 2 / settings.outerSegments * (i + 1);
                // Far
                vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
                vertexArray.push(-settings.depth / 2);
                // Near
                vertexArray.push(Math.cos(theta) * settings.outerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.outerRadiusY);
                vertexArray.push(settings.depth / 2);
            }
            ;
        }
        // Inner sides
        if (settings.isInnerSmooth) {
            // Smooth sides - surfaces share vertices
            for (let i = 0; i < settings.innerSegments; i++) {
                const theta = Math.PI * 2 / settings.innerSegments * i;
                // Near
                vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
                vertexArray.push(settings.depth / 2);
                // Far
                vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
                vertexArray.push(-settings.depth / 2);
            }
            ;
        }
        else {
            // Inner sides - for normals to relate to a surface rather than a vertex, vertices cannot
            // be shared, so create all vertices for each surface
            for (let i = 0; i < settings.innerSegments; i++) {
                let theta = Math.PI * 2 / settings.innerSegments * i;
                // Near
                vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
                vertexArray.push(settings.depth / 2);
                // Far
                vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
                vertexArray.push(-settings.depth / 2);
                theta = Math.PI * 2 / settings.innerSegments * (i + 1);
                // Far
                vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
                vertexArray.push(-settings.depth / 2);
                // Near
                vertexArray.push(Math.cos(theta) * settings.innerRadiusX);
                vertexArray.push(Math.sin(theta) * settings.innerRadiusY);
                vertexArray.push(settings.depth / 2);
            }
            ;
        }
        return vertexArray;
    }
    static getIndexArray(settings, isWireframe) {
        return isWireframe ?
            TubePrism.getWireframeIndexArray(settings)
            : TubePrism.getSolidIndexArray(settings);
    }
    static getNormalArray(settings) {
        let normalArray = [];
        // Near/far faces
        Array.from({ length: settings.outerSegments + settings.innerSegments }, () => normalArray = normalArray.concat([0, 0, 1]));
        Array.from({ length: settings.outerSegments + settings.innerSegments }, () => normalArray = normalArray.concat([0, 0, -1]));
        // Outer sides
        if (settings.isOuterSmooth) {
            for (let i = 0; i < settings.outerSegments; i++) {
                const theta = (Math.PI * 2 / settings.outerSegments * i);
                normalArray.push(Math.cos(theta));
                normalArray.push(Math.sin(theta));
                normalArray.push(0);
                normalArray.push(Math.cos(theta));
                normalArray.push(Math.sin(theta));
                normalArray.push(0);
            }
        }
        else {
            for (let i = 0; i < settings.outerSegments; i++) {
                const theta = (Math.PI * 2 / settings.outerSegments * i) + (Math.PI / settings.outerSegments);
                normalArray.push(Math.cos(theta));
                normalArray.push(Math.sin(theta));
                normalArray.push(0);
                normalArray.push(Math.cos(theta));
                normalArray.push(Math.sin(theta));
                normalArray.push(0);
                normalArray.push(Math.cos(theta));
                normalArray.push(Math.sin(theta));
                normalArray.push(0);
                normalArray.push(Math.cos(theta));
                normalArray.push(Math.sin(theta));
                normalArray.push(0);
            }
        }
        // Inner sides
        if (settings.isInnerSmooth) {
            for (let i = 0; i < settings.innerSegments; i++) {
                const theta = Math.PI * 2 / settings.innerSegments * i;
                normalArray.push(-Math.cos(theta));
                normalArray.push(-Math.sin(theta));
                normalArray.push(0);
                normalArray.push(-Math.cos(theta));
                normalArray.push(-Math.sin(theta));
                normalArray.push(0);
            }
        }
        else {
            for (let i = 0; i < settings.innerSegments; i++) {
                const theta = (Math.PI * 2 / settings.innerSegments * i) + (Math.PI / settings.innerSegments);
                normalArray.push(-Math.cos(theta));
                normalArray.push(-Math.sin(theta));
                normalArray.push(0);
                normalArray.push(-Math.cos(theta));
                normalArray.push(-Math.sin(theta));
                normalArray.push(0);
                normalArray.push(-Math.cos(theta));
                normalArray.push(-Math.sin(theta));
                normalArray.push(0);
                normalArray.push(-Math.cos(theta));
                normalArray.push(-Math.sin(theta));
                normalArray.push(0);
            }
        }
        return normalArray;
    }
    static getWireframeIndexArray(settings) {
        const indexArray = [];
        // Outer is a multiple of inner or vice versa
        if (settings.innerSegments % settings.outerSegments === 0 ||
            settings.outerSegments % settings.innerSegments === 0) {
            // Front face and rear face
            for (let face = 0; face < 2; face++) {
                const faceOffset = face * (settings.outerSegments + settings.innerSegments);
                for (let outerCount = 0; outerCount < settings.outerSegments; outerCount++) {
                    indexArray.push(outerCount + faceOffset);
                    indexArray.push(TubePrism.getOuterIdx(outerCount + 1, settings.outerSegments) + faceOffset);
                }
                for (let innerCount = 0; innerCount < settings.innerSegments; innerCount++) {
                    indexArray.push(innerCount + settings.outerSegments + faceOffset);
                    indexArray.push(TubePrism.getInnerIdx(innerCount + 1, settings.innerSegments) + settings.outerSegments + faceOffset);
                }
            }
        }
        else {
            throw Error("Outer and inner side count are not multiples!");
        }
        // Sides
        const sideFaceDisplacement = (settings.outerSegments + settings.innerSegments) * 2;
        // Outer sides
        if (settings.isOuterSmooth) {
            // Smooth - show quarters
            indexArray.push(0);
            indexArray.push(settings.outerSegments + settings.innerSegments);
            indexArray.push(settings.outerSegments * 0.75);
            indexArray.push(settings.outerSegments * 1.75 + settings.innerSegments);
            indexArray.push(settings.outerSegments * 0.5);
            indexArray.push(settings.outerSegments * 1.5 + settings.innerSegments);
            indexArray.push(settings.outerSegments * 0.25);
            indexArray.push(settings.outerSegments * 1.25 + settings.innerSegments);
        }
        else {
            for (let i = 0; i < settings.outerSegments; i++) {
                indexArray.push(i * 4 + sideFaceDisplacement);
                indexArray.push(i * 4 + 1 + sideFaceDisplacement);
            }
            ;
        }
        // Inner sides
        if (settings.isInnerSmooth) {
            // Smooth - show quarters
            indexArray.push(settings.outerSegments + 1);
            indexArray.push(settings.outerSegments * 2 + settings.innerSegments + 1);
            indexArray.push(settings.outerSegments + 1 + settings.innerSegments * 0.75);
            indexArray.push(settings.outerSegments * 2 + settings.innerSegments + 1 + settings.innerSegments * 0.75);
            indexArray.push(settings.outerSegments + 1 + settings.innerSegments / 2);
            indexArray.push(settings.outerSegments * 2 + settings.innerSegments + 1 + settings.innerSegments / 2);
            indexArray.push(settings.outerSegments + 1 + settings.innerSegments / 4);
            indexArray.push(settings.outerSegments * 2 + settings.innerSegments + 1 + settings.innerSegments / 4);
        }
        else {
            for (let i = 0; i < settings.innerSegments; i++) {
                indexArray.push(i + settings.outerSegments);
                indexArray.push(i + (settings.outerSegments * 2 + settings.innerSegments));
            }
            ;
        }
        return indexArray;
    }
    static getSolidIndexArray(settings) {
        const indexArray = [];
        // Each outer vertex connects to one or more inner vertices
        if (settings.innerSegments >= settings.outerSegments) {
            const trianglesPerVertex = Math.floor(settings.innerSegments / settings.outerSegments);
            // Outer is a multiple of inner
            if (settings.innerSegments % settings.outerSegments === 0) {
                // Near face
                for (let outerCount = 0; outerCount < settings.outerSegments; outerCount++) {
                    for (let innerCount = 0; innerCount < trianglesPerVertex; innerCount++) {
                        const innerIndex = (outerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2) - (innerCount);
                        indexArray.push(outerCount);
                        indexArray.push(TubePrism.getInnerIdx(innerIndex, settings.innerSegments) + settings.outerSegments);
                        indexArray.push(TubePrism.getInnerIdx(innerIndex - 1, settings.innerSegments) + settings.outerSegments);
                    }
                    // Fill triangle between outer vertices
                    const innerDisplacement = (outerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2);
                    indexArray.push(outerCount);
                    indexArray.push(TubePrism.getOuterIdx(outerCount + 1, settings.outerSegments));
                    indexArray.push(TubePrism.getInnerIdx(innerDisplacement, settings.innerSegments) + settings.outerSegments);
                }
                // Far face
                const faceOffset = settings.outerSegments + settings.innerSegments;
                for (let outerCount = 0; outerCount < settings.outerSegments; outerCount++) {
                    for (let innerCount = 0; innerCount < trianglesPerVertex; innerCount++) {
                        const innerIndex = (outerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2) - (innerCount);
                        indexArray.push(outerCount + faceOffset);
                        indexArray.push(TubePrism.getInnerIdx(innerIndex - 1, settings.innerSegments) + settings.outerSegments + faceOffset);
                        indexArray.push(TubePrism.getInnerIdx(innerIndex, settings.innerSegments) + settings.outerSegments + faceOffset);
                    }
                    // Fill triangle between outer vertices
                    const innerDisplacement = (outerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2);
                    indexArray.push(outerCount + faceOffset);
                    indexArray.push(TubePrism.getInnerIdx(innerDisplacement, settings.innerSegments) + settings.outerSegments + faceOffset);
                    indexArray.push(TubePrism.getOuterIdx(outerCount + 1, settings.outerSegments) + faceOffset);
                }
            }
            else {
                throw Error("Outer and inner side count are not multiples!");
            }
        }
        else {
            const trianglesPerVertex = Math.floor(settings.outerSegments / settings.innerSegments);
            // Inner is a multiple of outer
            if (settings.outerSegments % settings.innerSegments === 0) {
                // Near face
                for (let innerCount = 0; innerCount < settings.innerSegments; innerCount++) {
                    for (let outerCount = 0; outerCount < trianglesPerVertex; outerCount++) {
                        const outerIndex = (innerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2) - (outerCount);
                        indexArray.push(innerCount + settings.outerSegments);
                        indexArray.push(TubePrism.getOuterIdx(outerIndex - 1, settings.outerSegments));
                        indexArray.push(TubePrism.getOuterIdx(outerIndex, settings.outerSegments));
                    }
                    // Fill triangle between outer vertices
                    const outerDisplacement = (innerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2);
                    indexArray.push(innerCount + settings.outerSegments);
                    indexArray.push(TubePrism.getOuterIdx(outerDisplacement, settings.outerSegments));
                    indexArray.push(TubePrism.getInnerIdx(innerCount + 1, settings.innerSegments) + settings.outerSegments);
                }
                // Far face
                const faceOffset = settings.outerSegments + settings.innerSegments;
                for (let innerCount = 0; innerCount < settings.innerSegments; innerCount++) {
                    for (let outerCount = 0; outerCount < trianglesPerVertex; outerCount++) {
                        const outerIndex = (innerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2) - (outerCount);
                        indexArray.push(innerCount + settings.outerSegments + faceOffset);
                        indexArray.push(TubePrism.getOuterIdx(outerIndex, settings.outerSegments) + faceOffset);
                        indexArray.push(TubePrism.getOuterIdx(outerIndex - 1, settings.outerSegments) + faceOffset);
                    }
                    // Fill triangle between outer vertices
                    const outerDisplacement = (innerCount * trianglesPerVertex) + Math.floor(trianglesPerVertex / 2);
                    indexArray.push(innerCount + settings.outerSegments + faceOffset);
                    indexArray.push(TubePrism.getInnerIdx(innerCount + 1, settings.innerSegments) + settings.outerSegments + faceOffset);
                    indexArray.push(TubePrism.getOuterIdx(outerDisplacement, settings.outerSegments) + faceOffset);
                }
            }
            else {
                throw Error("Outer and inner side count are not multiples!");
            }
        }
        // Outer Sides
        if (settings.isOuterSmooth) {
            const sideFaceDisplacement = (settings.outerSegments + settings.innerSegments) * 2;
            for (let i = 0; i < settings.outerSegments - 1; i++) {
                indexArray.push(i * 2 + sideFaceDisplacement);
                indexArray.push(i * 2 + 1 + sideFaceDisplacement);
                indexArray.push(i * 2 + 2 + sideFaceDisplacement);
                indexArray.push(i * 2 + 1 + sideFaceDisplacement);
                indexArray.push(i * 2 + 3 + sideFaceDisplacement);
                indexArray.push(i * 2 + 2 + sideFaceDisplacement);
            }
            ;
            indexArray.push((settings.outerSegments - 1) * 2 + sideFaceDisplacement);
            indexArray.push((settings.outerSegments - 1) * 2 + 1 + sideFaceDisplacement);
            indexArray.push(sideFaceDisplacement);
            indexArray.push((settings.outerSegments - 1) * 2 + 1 + sideFaceDisplacement);
            indexArray.push(1 + sideFaceDisplacement);
            indexArray.push(sideFaceDisplacement);
        }
        else {
            const sideFaceDisplacement = (settings.outerSegments + settings.innerSegments) * 2;
            for (let i = 0; i < settings.outerSegments; i++) {
                indexArray.push(i * 4 + sideFaceDisplacement);
                indexArray.push(i * 4 + 1 + sideFaceDisplacement);
                indexArray.push(i * 4 + 2 + sideFaceDisplacement);
                indexArray.push(i * 4 + sideFaceDisplacement);
                indexArray.push(i * 4 + 2 + sideFaceDisplacement);
                indexArray.push(i * 4 + 3 + sideFaceDisplacement);
            }
            ;
        }
        // Inner Sides
        if (settings.isInnerSmooth) {
            const sideFaceDisplacement = (settings.outerSegments + settings.innerSegments) * 2 +
                settings.outerSegments * (settings.isOuterSmooth ? 2 : 4);
            for (let i = 0; i < settings.innerSegments - 1; i++) {
                indexArray.push(i * 2 + sideFaceDisplacement);
                indexArray.push(i * 2 + 2 + sideFaceDisplacement);
                indexArray.push(i * 2 + 1 + sideFaceDisplacement);
                indexArray.push(i * 2 + 1 + sideFaceDisplacement);
                indexArray.push(i * 2 + 2 + sideFaceDisplacement);
                indexArray.push(i * 2 + 3 + sideFaceDisplacement);
            }
            ;
            indexArray.push((settings.innerSegments - 1) * 2 + sideFaceDisplacement);
            indexArray.push(sideFaceDisplacement);
            indexArray.push((settings.innerSegments - 1) * 2 + 1 + sideFaceDisplacement);
            indexArray.push((settings.innerSegments - 1) * 2 + 1 + sideFaceDisplacement);
            indexArray.push(sideFaceDisplacement);
            indexArray.push(1 + sideFaceDisplacement);
        }
        else {
            const sideFaceDisplacement = (settings.outerSegments + settings.innerSegments) * 2 +
                settings.outerSegments * (settings.isOuterSmooth ? 2 : 4);
            for (let i = 0; i < settings.innerSegments; i++) {
                indexArray.push(i * 4 + sideFaceDisplacement);
                indexArray.push(i * 4 + 2 + sideFaceDisplacement);
                indexArray.push(i * 4 + 1 + sideFaceDisplacement);
                indexArray.push(i * 4 + sideFaceDisplacement);
                indexArray.push(i * 4 + 3 + sideFaceDisplacement);
                indexArray.push(i * 4 + 2 + sideFaceDisplacement);
            }
            ;
        }
        return indexArray;
    }
    // If array index goes 'round the clock', ensure we have a valid index
    static getOuterIdx(idx, outerSides) {
        if (idx >= outerSides) {
            idx -= outerSides;
        }
        if (idx < 0) {
            idx += outerSides;
        }
        return idx;
    }
    static getInnerIdx(idx, innerSides) {
        if (idx >= innerSides) {
            idx -= innerSides;
        }
        if (idx < 0) {
            idx += innerSides;
        }
        return idx;
    }
}
//# sourceMappingURL=tubePrism.js.map