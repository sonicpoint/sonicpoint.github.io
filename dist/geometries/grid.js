import { Geometry } from "./geometry.js";
export class Grid extends Geometry {
    constructor(xCellCount, xCellSize, yCellCount, yCellSize) {
        super(Grid.getVertexArray(xCellCount, xCellSize, yCellCount, yCellSize), Grid.getIndexArray(xCellCount, yCellCount), []);
    }
    //
    // Generate the array of vertices
    //
    static getVertexArray(xCellCount, xCellSize, yCellCount, yCellSize) {
        const vertexArray = [];
        for (let i = 0; i <= xCellCount; i++) {
            vertexArray.push(-xCellCount / 2 * xCellSize + i * xCellSize);
            vertexArray.push(-yCellCount / 2 * yCellSize);
            vertexArray.push(0);
            vertexArray.push(-xCellCount / 2 * xCellSize + i * xCellSize);
            vertexArray.push(yCellCount / 2 * yCellSize);
            vertexArray.push(0);
        }
        for (let i = 0; i <= yCellCount; i++) {
            vertexArray.push(-xCellCount / 2 * xCellSize);
            vertexArray.push(yCellCount / 2 * yCellSize - i * yCellSize);
            vertexArray.push(0);
            vertexArray.push(xCellCount / 2 * xCellSize);
            vertexArray.push(yCellCount / 2 * yCellSize - i * yCellSize);
            vertexArray.push(0);
        }
        return vertexArray;
    }
    static getIndexArray(xCellCount, yCellCount) {
        const indexArray = [];
        for (let i = 0; i <= xCellCount; i++) {
            indexArray.push(i * 2);
            indexArray.push(i * 2 + 1);
        }
        const displacement = xCellCount * 2 + 2;
        for (let i = 0; i <= yCellCount; i++) {
            indexArray.push(i * 2 + displacement);
            indexArray.push(i * 2 + 1 + displacement);
        }
        return indexArray;
    }
}
//# sourceMappingURL=grid.js.map