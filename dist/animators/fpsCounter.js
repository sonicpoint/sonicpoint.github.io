//
// Manage the count of the Frames per Second
//
export class FpsCounter {
    constructor(fpsAvgSampleSize) {
        this.fpsAvgSampleSize = fpsAvgSampleSize;
        this.spotFps = 0;
        this.avgFps = 0;
        // Total of stored FPS values
        this.fpsTotal = 0;
        // Total position in array of FPS history values
        this.fpsCounter = 0;
        // Initialise stored FPS values
        this.fpsValues = [];
        for (let i = 0; i < fpsAvgSampleSize; i++) {
            this.fpsValues[i] = 0;
        }
    }
    addFps(fps) {
        this.fpsTotal += fps;
        this.spotFps = fps;
        this.avgFps = this.fpsTotal / this.fpsAvgSampleSize;
        this.fpsTotal -=
            this.fpsValues[(this.fpsCounter < this.fpsAvgSampleSize - 1) ? this.fpsCounter + 1 : 0];
        this.fpsValues[this.fpsCounter++] = fps;
        if (this.fpsCounter >= this.fpsAvgSampleSize) {
            this.fpsCounter = 0;
        }
    }
}
//# sourceMappingURL=fpsCounter.js.map