export class TransformationSet {
    constructor(transformation, count) {
        this.transformation = transformation;
        this.count = count;
        this.currentCount = 0;
    }
    getNext() {
        if (this.currentCount++ < this.count) {
            return this.transformation;
        }
        else {
            // Reset  so TransformationSet can be used again
            this.reset();
            return null;
        }
    }
    reset() {
        this.currentCount = 0;
    }
}
//# sourceMappingURL=transformationSet.js.map