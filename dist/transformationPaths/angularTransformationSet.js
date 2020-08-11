import { Transformation } from "../transformation.js";
import { TransformationSet } from "./transformationSet.js";
//
// Transformation Set that uses an incrementing circular angle
//
export class AngularTransformationSet extends TransformationSet {
    constructor(increment, count, func) {
        super(new Transformation(), count);
        this.increment = increment;
        this.func = func;
        this.theta = 0;
    }
    getNext() {
        if (this.currentCount++ < this.count) {
            this.theta += this.increment;
            if (this.theta > Math.PI * 2) {
                this.theta -= Math.PI * 2;
            }
            else if (this.theta < 0) {
                this.theta += Math.PI * 2;
            }
            return this.func(this.theta);
        }
        else {
            // Reset count so TransformationSet can be used again
            this.reset();
            return null;
        }
    }
    reset() {
        super.reset();
        this.theta = 0;
    }
}
//# sourceMappingURL=angularTransformationSet.js.map