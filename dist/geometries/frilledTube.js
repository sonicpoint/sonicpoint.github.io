import { Geometry2 } from "./geometry2.js";
export class FrilledTube extends Geometry2 {
    constructor(length, nearRadius, nearCap, farRadius, farCap, frillCount, frillAmplitude, segments, isWireframe, showNormals) {
        super(isWireframe, showNormals);
        this.length = length;
        this.nearRadius = nearRadius;
        this.nearCap = nearCap;
        this.farRadius = farRadius;
        this.farCap = farCap;
        this.frillCount = frillCount;
        this.frillAmplitude = frillAmplitude;
        this.segments = segments;
        this.tubeSections = 1;
        this.initialise();
    }
    getVertexArray() {
        const vertexArray = [];
        for (let i = 0; i < this.segments; i++) {
            const theta = Math.PI * 2 / this.segments * i;
            const t = theta * this.frillCount;
            const radius = Math.sin(t) * this.frillAmplitude;
            vertexArray.push(Geometry2.roundDP(Math.cos(theta) * (this.nearRadius + radius), 7), Geometry2.roundDP(Math.sin(theta) * (this.nearRadius + radius), 7), this.length / 2);
            vertexArray.push(Geometry2.roundDP(Math.cos(theta) * (this.farRadius + radius), 7), Geometry2.roundDP(Math.sin(theta) * (this.farRadius + radius), 7), -this.length / 2);
        }
        if (this.nearCap) {
            vertexArray.push(0, 0, this.length / 2);
            for (let i = 0; i < this.segments; i++) {
                const theta = Math.PI * 2 / this.segments * i;
                const t = theta * this.frillCount;
                const radius = Math.sin(t) * this.frillAmplitude;
                vertexArray.push(Geometry2.roundDP(Math.cos(theta) * (this.nearRadius + radius), 7), Geometry2.roundDP(Math.sin(theta) * (this.nearRadius + radius), 7), this.length / 2);
            }
        }
        if (this.farCap) {
            vertexArray.push(0, 0, -this.length / 2);
            for (let i = 0; i < this.segments; i++) {
                const theta = Math.PI * 2 / this.segments * i;
                const t = theta * this.frillCount;
                const radius = Math.sin(t) * this.frillAmplitude;
                vertexArray.push(Geometry2.roundDP(Math.cos(theta) * (this.farRadius + radius), 7), Geometry2.roundDP(Math.sin(theta) * (this.farRadius + radius), 7), -this.length / 2);
            }
        }
        return vertexArray;
    }
    getWireframeIndexArray() {
        const indexArray = [];
        for (let i = 0; i < this.segments; i++) {
            indexArray.push(i * 2, i * 2 + 1);
            indexArray.push(i * 2, i < this.segments - 1 ? i * 2 + 2 : 0);
            indexArray.push(i * 2 + 1, i < this.segments - 1 ? i * 2 + 3 : 1);
        }
        let capOffset = this.segments * 2;
        if (this.nearCap) {
            for (let i = 0; i < this.segments; i++) {
                indexArray.push(capOffset, capOffset + i + 1);
            }
        }
        capOffset += this.segments + 1;
        if (this.farCap) {
            for (let i = 0; i < this.segments; i++) {
                indexArray.push(capOffset, capOffset + i + 1);
            }
        }
        if (this.showNormals) {
            const normalOffset = this.segments * 2 +
                (this.nearCap ? this.segments + 1 : 0) +
                (this.farCap ? this.segments + 1 : 0);
            for (let i = 0; i < normalOffset; i++) {
                indexArray.push(i, i + normalOffset);
            }
        }
        return indexArray;
    }
    getSolidIndexArray() {
        const indexArray = [];
        for (let i = 0; i < this.segments; i++) {
            indexArray.push(i * 2, i * 2 + 1, i < this.segments - 1 ? i * 2 + 2 : 0);
            indexArray.push(i * 2 + 1, i < this.segments - 1 ? i * 2 + 3 : 1, i < this.segments - 1 ? i * 2 + 2 : 0);
        }
        let capOffset = this.segments * 2;
        if (this.nearCap) {
            for (let i = 0; i < this.segments; i++) {
                indexArray.push(capOffset, capOffset + i + 1, i < this.segments - 1 ? capOffset + i + 2 : capOffset + 1);
            }
        }
        capOffset += this.segments + 1;
        if (this.farCap) {
            for (let i = 0; i < this.segments; i++) {
                indexArray.push(capOffset, i < this.segments - 1 ? capOffset + i + 2 : capOffset + 1, capOffset + i + 1);
            }
        }
        return indexArray;
    }
}
//# sourceMappingURL=frilledTube.js.map