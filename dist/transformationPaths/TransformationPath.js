import { Transformation } from "./../transformation.js";
//
// A class that steps through a series of Transformation Sets to provide
// a complex path of Transformations.
//
export class TransformationPath {
    constructor() {
        this._transformationSets = [];
        this._currentTransformationSet = 0;
        this._currentTransformation = new Transformation();
        this.isSuspended = false;
    }
    get current() {
        if (this._transformationSets.length === 0 || this.isSuspended) {
            return new Transformation();
        }
        return this._currentTransformation;
    }
    //
    // Move to the next Transformation on the path
    //
    moveNext() {
        if (this._transformationSets.length === 0 || this.isSuspended) {
            return;
        }
        let nextTransformation = this._transformationSets[this._currentTransformationSet].getNext();
        if (nextTransformation == null) {
            this._currentTransformationSet++;
            if (this._currentTransformationSet >= this._transformationSets.length) {
                this._currentTransformationSet = 0;
            }
            nextTransformation = this._transformationSets[this._currentTransformationSet].getNext();
        }
        this._currentTransformation = nextTransformation;
    }
    suspend() {
        this.isSuspended = true;
    }
    resume() {
        this.isSuspended = false;
    }
    reset() {
        this._currentTransformationSet = 0;
        this._transformationSets.forEach(ts => ts.reset());
    }
    //
    // Add a new TransformationSet to the path
    //
    addTransformationSet(transformationSet) {
        this._transformationSets.push(transformationSet);
    }
}
//# sourceMappingURL=TransformationPath.js.map