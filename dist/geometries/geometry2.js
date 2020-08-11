import * as vec3 from "./../utils/gl-matrix/vec3.js";
import * as mat3 from "./../utils/gl-matrix/mat3.js";
import { Geometry } from "./geometry.js";
export class Geometry2 extends Geometry {
    //
    // Constructor
    //
    constructor(isWireframe, showNormals) {
        super();
        this.isWireframe = isWireframe;
        this.showNormals = showNormals;
        this.vertexArray = [];
        this.indexArray = [];
        this.normalArray = [];
        this.textureArray = [];
        this.tangentArray = [];
        this.bitangentArray = [];
        this.isWireframe = isWireframe === undefined ? false : isWireframe;
        this.showNormals = showNormals === undefined ? false : showNormals;
    }
    initialise() {
        if (!this.isWireframe) {
            const vertexArray = this.getVertexArray();
            const solidIndexArray = this.getSolidIndexArray();
            const normalArray = this.getNormalArray(vertexArray, solidIndexArray);
            this.vertexArray = vertexArray;
            this.indexArray = solidIndexArray;
            this.normalArray = normalArray;
        }
        else {
            const vertexArray = this.getVertexArray();
            if (this.showNormals) {
                const solidIndexArray = this.getSolidIndexArray();
                const vertexArrayWithNormals = this.getVertexArrayWithNormals(vertexArray, solidIndexArray);
                this.vertexArray = vertexArrayWithNormals;
            }
            else {
                this.vertexArray = this.getVertexArray();
            }
            this.indexArray = this.getWireframeIndexArray();
        }
    }
    //
    // Calculate normals
    //
    getNormalArray(vertexArray, solidIndexArray) {
        // For each vertex we get the set of normals that apply. Then we remove any duplicates before adding
        const normalSetArray = [];
        for (let i = 0; i < vertexArray.length / 3; i++) {
            normalSetArray.push([]);
        }
        for (let i = 0; i < solidIndexArray.length / 3; i++) {
            const ix = i * 3;
            const vertex0 = [vertexArray[solidIndexArray[ix] * 3], vertexArray[solidIndexArray[ix] * 3 + 1], vertexArray[solidIndexArray[ix] * 3 + 2]];
            const vertex1 = [vertexArray[solidIndexArray[ix + 1] * 3], vertexArray[solidIndexArray[ix + 1] * 3 + 1], vertexArray[solidIndexArray[ix + 1] * 3 + 2]];
            const vertex2 = [vertexArray[solidIndexArray[ix + 2] * 3], vertexArray[solidIndexArray[ix + 2] * 3 + 1], vertexArray[solidIndexArray[ix + 2] * 3 + 2]];
            const vector1 = [];
            const vector2 = [];
            const normal = [];
            // First vertex
            {
                vec3.subtract(vector1, vertex1, vertex0);
                vec3.subtract(vector2, vertex2, vertex0);
                vec3.cross(normal, vector1, vector2);
                vec3.normalize(normal, normal);
                normalSetArray[solidIndexArray[ix]].push([
                    normal[0] === -0 ? 0 : Geometry2.roundDP(normal[0], 5),
                    normal[1] === -0 ? 0 : Geometry2.roundDP(normal[1], 5),
                    normal[2] === -0 ? 0 : Geometry2.roundDP(normal[2], 5)
                ]);
            }
            // Second vertex
            {
                vec3.subtract(vector1, vertex2, vertex1);
                vec3.subtract(vector2, vertex0, vertex1);
                vec3.cross(normal, vector1, vector2);
                vec3.normalize(normal, normal);
                normalSetArray[solidIndexArray[ix + 1]].push([
                    normal[0] === -0 ? 0 : Geometry2.roundDP(normal[0], 5),
                    normal[1] === -0 ? 0 : Geometry2.roundDP(normal[1], 5),
                    normal[2] === -0 ? 0 : Geometry2.roundDP(normal[2], 5)
                ]);
            }
            // Third vertex
            {
                vec3.subtract(vector1, vertex0, vertex2);
                vec3.subtract(vector2, vertex1, vertex2);
                vec3.cross(normal, vector1, vector2);
                vec3.normalize(normal, normal);
                normalSetArray[solidIndexArray[ix + 2]].push([
                    normal[0] === -0 ? 0 : Geometry2.roundDP(normal[0], 5),
                    normal[1] === -0 ? 0 : Geometry2.roundDP(normal[1], 5),
                    normal[2] === -0 ? 0 : Geometry2.roundDP(normal[2], 5)
                ]);
            }
        }
        const normalArray = [];
        // We now have an array where each element contains the set of normals for the corresponding vertex
        for (const valuesPerVertex of normalSetArray) {
            const normalsPerVertex = [];
            // Retrieve the normals for a vertex
            for (const vertexNormal of valuesPerVertex) {
                if (!Geometry2.checkArrayIncludesVector(normalsPerVertex, vertexNormal)) {
                    normalsPerVertex.push(vertexNormal);
                }
            }
            // normalsPerVertex now contains deduped set of normals for current vertex. Add them together and store
            // in the normalArray.
            const normal = [0, 0, 0];
            for (const normalOfVertex of normalsPerVertex) {
                vec3.add(normal, normal, normalOfVertex);
            }
            vec3.normalize(normal, normal);
            normalArray.push(normal[0], normal[1], normal[2]);
        }
        this.customMergeNormals(normalArray);
        return normalArray;
    }
    getVertexArrayWithNormals(vertexArray, solidIndexArray) {
        const normalLength = 2;
        const normalArray = this.getNormalArray(vertexArray, solidIndexArray);
        for (let i = 0; i < normalArray.length; i++) {
            vertexArray.push(vertexArray[i] + normalArray[i] * normalLength);
        }
        return vertexArray;
    }
    customMergeNormals(normalArray) { }
    //
    // Add a Geometry to this one
    //
    addGeometry(geometry) {
        const indexValueDisplacement = this.vertexArray.length / 3;
        for (const value of geometry.vertexArray) {
            this.vertexArray.push(value);
        }
        for (const value of geometry.indexArray) {
            this.indexArray.push(value + indexValueDisplacement);
        }
        for (const value of geometry.normalArray) {
            this.normalArray.push(value);
        }
        for (const value of geometry.textureArray) {
            this.textureArray.push(value);
        }
        for (const value of geometry.tangentArray) {
            this.tangentArray.push(value);
        }
        for (const value of geometry.bitangentArray) {
            this.bitangentArray.push(value);
        }
    }
    //
    // Reverse the faces of a Geometry
    //
    reverse() {
        if (!this.isWireframe) {
            // First swap the second and third vertices of each triangle
            for (let i = 0; i < this.indexArray.length / 3; i++) {
                const vertex2 = this.indexArray[i * 3 + 1];
                const vertex3 = this.indexArray[i * 3 + 2];
                this.indexArray[i * 3 + 1] = vertex3;
                this.indexArray[i * 3 + 2] = vertex2;
            }
            // Now reverse all the normals
            for (let i = 0; i < this.normalArray.length; i++) {
                this.normalArray[i] = this.normalArray[i] === 0 ? 0 : 0 - this.normalArray[i];
            }
        }
        else {
            // TODO: Reverse the normal wireframe vertices
        }
    }
    //
    // Apply a transformation in the form of a 4x4 matrix
    //
    applyTransformation(transformation) {
        const mat4 = transformation.matrix;
        for (let i = 0; i < this.vertexArray.length; i += 3) {
            let vec4 = [
                this.vertexArray[i],
                this.vertexArray[i + 1],
                this.vertexArray[i + 2],
                1
            ];
            vec4 = [
                vec4[0] * mat4[0] + vec4[1] * mat4[4] + vec4[2] * mat4[8] + vec4[3] * mat4[12],
                vec4[0] * mat4[1] + vec4[1] * mat4[5] + vec4[2] * mat4[9] + vec4[3] * mat4[13],
                vec4[0] * mat4[2] + vec4[1] * mat4[6] + vec4[2] * mat4[10] + vec4[3] * mat4[14],
                vec4[0] * mat4[3] + vec4[1] * mat4[7] + vec4[2] * mat4[11] + vec4[3] * mat4[15],
            ];
            // Update geometry vertex coords
            this.vertexArray[i] = vec4[0];
            this.vertexArray[i + 1] = vec4[1];
            this.vertexArray[i + 2] = vec4[2];
        }
        for (let i = 0; i < this.normalArray.length; i += 3) {
            let normal = [
                this.normalArray[i],
                this.normalArray[i + 1],
                this.normalArray[i + 2],
                1
            ];
            // For a normal, we do not apply translations, so only use 3x3 matrix
            // Not sure yet about scaling
            normal = [
                normal[0] * mat4[0] + normal[1] * mat4[4] + normal[2] * mat4[8],
                normal[0] * mat4[1] + normal[1] * mat4[5] + normal[2] * mat4[9],
                normal[0] * mat4[2] + normal[1] * mat4[6] + normal[2] * mat4[10],
            ];
            // Update geometry vertex coords
            vec3.normalize(normal, normal);
            this.normalArray[i] = normal[0];
            this.normalArray[i + 1] = normal[1];
            this.normalArray[i + 2] = normal[2];
        }
        if (this.tangentArray.length > 0) {
            for (let i = 0; i < this.tangentArray.length; i += 3) {
                const m3 = [];
                mat3.fromMat4(m3, transformation.matrix);
                {
                    // Transform tangent array
                    const v3 = [this.tangentArray[i], this.tangentArray[i + 1], this.tangentArray[i + 2]];
                    vec3.transformMat3(v3, v3, m3);
                    this.tangentArray[i] = v3[0];
                    this.tangentArray[i + 1] = v3[1];
                    this.tangentArray[i + 2] = v3[2];
                }
                {
                    // Transform bitangent array
                    const v3 = [this.bitangentArray[i], this.bitangentArray[i + 1], this.bitangentArray[i + 2]];
                    vec3.transformMat3(v3, v3, m3);
                    this.bitangentArray[i] = v3[0];
                    this.bitangentArray[i + 1] = v3[1];
                    this.bitangentArray[i + 2] = v3[2];
                }
            }
        }
    }
    //
    // Merge/Combine two normal vectors
    //
    static mergeNormals(normalArray, n1, n2) {
        const normal1 = [normalArray[n1 * 3], normalArray[n1 * 3 + 1], normalArray[n1 * 3 + 2]];
        const normal2 = [normalArray[n2 * 3], normalArray[n2 * 3 + 1], normalArray[n2 * 3 + 2]];
        const sumNormal = [];
        vec3.add(sumNormal, normal1, normal2);
        vec3.normalize(sumNormal, sumNormal);
        normalArray[n1 * 3] = sumNormal[0];
        normalArray[n1 * 3 + 1] = sumNormal[1];
        normalArray[n1 * 3 + 2] = sumNormal[2];
        normalArray[n2 * 3] = sumNormal[0];
        normalArray[n2 * 3 + 1] = sumNormal[1];
        normalArray[n2 * 3 + 2] = sumNormal[2];
    }
    //
    // Round a number to required decimal places
    //
    static roundDP(num, dp) {
        const multiplier = Math.pow(10, dp);
        num *= multiplier;
        num = Math.round(num);
        return num / multiplier;
    }
    //
    // Check that a vec3 vector is included in an array
    //
    static checkArrayIncludesVector(vectorArray, vectorToCheck) {
        for (const vectorElement of vectorArray) {
            if (vectorToCheck[0] === vectorElement[0] &&
                vectorToCheck[1] === vectorElement[1] &&
                vectorToCheck[2] === vectorElement[2]) {
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=geometry2.js.map