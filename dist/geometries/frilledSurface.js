import { Geometry2 } from "./geometry2.js";
export class FrilledSurface extends Geometry2 {
    constructor(width, height, frillCount, frillAmplitude, segments, isWireframe, showNormals) {
        super(isWireframe, showNormals);
        this.width = width;
        this.height = height;
        this.frillCount = frillCount;
        this.frillAmplitude = frillAmplitude;
        this.segments = segments;
        this.tubeSections = 1;
        this.initialise();
    }
    getVertexArray() {
        const vertexArray = [];
        let ctr = 0;
        let fc = this.frillCount;
        let fa = this.frillAmplitude;
        for (let i = 0; i <= this.segments; i++) {
            // const z = (Math.PI * 2 * this.frillCount) / this.segments * i;
            const z = (Math.PI * 2 * this.frillCount) / this.segments * i;
            vertexArray.push(-this.width / 2 + this.width / this.segments * i, this.height / 2, Math.sin(ctr * (Math.PI * 2) / 360) * fa);
            vertexArray.push(-this.width / 2 + this.width / this.segments * i, -this.height / 2, Math.sin(ctr * (Math.PI * 2) / 360) * fa);
            ctr += (360 * fc) / this.segments;
            if (ctr > 360) {
                ctr -= 360;
                let rnd = Math.random();
                fc = this.frillCount + rnd * (this.frillCount / 2) - this.frillCount / 4;
                rnd = Math.random();
                fa = this.frillAmplitude + rnd * (this.frillAmplitude / 2) - this.frillAmplitude / 4;
            }
        }
        return vertexArray;
    }
    getWireframeIndexArray() {
        const indexArray = [];
        for (let i = 0; i <= this.segments; i++) {
            indexArray.push(i * 2, i * 2 + 1);
            if (i < this.segments) {
                indexArray.push(i * 2, i * 2 + 2);
                indexArray.push(i * 2 + 1, i * 2 + 3);
            }
        }
        if (this.showNormals) {
            const normalOffset = (this.segments + 1) * 2;
            for (let i = 0; i < normalOffset; i++) {
                indexArray.push(i, i + normalOffset);
            }
        }
        return indexArray;
    }
    getSolidIndexArray() {
        const indexArray = [];
        for (let i = 0; i < this.segments; i++) {
            indexArray.push(i * 2, i * 2 + 1, i * 2 + 2);
            indexArray.push(i * 2 + 1, i * 2 + 3, i * 2 + 2);
        }
        return indexArray;
    }
}
//# sourceMappingURL=frilledSurface.js.map