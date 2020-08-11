import * as vec3 from "./../utils/gl-matrix/vec3.js";
import * as mat3 from "./../utils/gl-matrix/mat3.js";
export class Geometry {
    //
    // Constructor
    //
    constructor(vertexArray, indexArray, normalArray, textureArray, tangentArray, bitangentArray) {
        this.vertexArray = vertexArray;
        this.indexArray = indexArray;
        this.normalArray = normalArray;
        this.textureArray = textureArray;
        this.tangentArray = tangentArray;
        this.bitangentArray = bitangentArray;
        this.vertexArray = vertexArray || [];
        this.indexArray = indexArray || [];
        this.normalArray = normalArray || [];
        this.textureArray = textureArray || [];
        this.tangentArray = tangentArray || [];
        this.bitangentArray = bitangentArray || [];
    }
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
    // Create a deep copy of this Geometry
    //
    clone() {
        return new Geometry(this.vertexArray.slice(), this.indexArray.slice(), this.normalArray.slice(), this.textureArray.slice(), this.tangentArray.slice(), this.bitangentArray.slice());
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
            // Convert each normal to a vec4
            let vec4 = [
                this.normalArray[i],
                this.normalArray[i + 1],
                this.normalArray[i + 2],
                1
            ];
            // For a normal, we do not apply translations, so only use 3x3 matrix
            // Not sure yet about scaling
            vec4 = [
                vec4[0] * mat4[0] + vec4[1] * mat4[4] + vec4[2] * mat4[8],
                vec4[0] * mat4[1] + vec4[1] * mat4[5] + vec4[2] * mat4[9],
                vec4[0] * mat4[2] + vec4[1] * mat4[6] + vec4[2] * mat4[10],
            ];
            // Update geometry vertex coords
            const vec3 = Geometry.normalize(vec4);
            this.normalArray[i] = vec3[0];
            this.normalArray[i + 1] = vec3[1];
            this.normalArray[i + 2] = vec3[2];
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
    // Normalise a vec3
    static normalize(v) {
        const normalized = [];
        ;
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
            normalized[0] = v[0] / length;
            normalized[1] = v[1] / length;
            normalized[2] = v[2] / length;
        }
        return normalized;
    }
}
//# sourceMappingURL=geometry.js.map