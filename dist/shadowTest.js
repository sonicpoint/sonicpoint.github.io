import { Camera } from "./camera.js";
import { SceneItem } from "./sceneItem.js";
import { CancelToken } from "./cancelToken.js";
import { HtmlHelper } from "./htmlHelper.js";
import { TransformationPath } from "./transformationPaths/TransformationPath.js";
import { Transformation } from "./transformation.js";
import { Lighting } from "./lighting/lighting.js";
import { DirectionalLight } from "./lighting/directionalLight.js";
import { Cuboid } from "./geometries/cuboid.js";
import { Grid } from "./geometries/grid.js";
import { Surface } from "./geometries/surface.js";
import { Program } from "./programs/program.js";
import { OrbiterAnimator } from "./animators/orbiterAnimator.js";
import { SimpleToBufferProgram } from "./programs/complete/toBuffer/simpleToBufferProgram.js";
import { PostProcScene } from "./postProcScene.js";
import { SimpleTextureToScreenProgram } from "./programs/complete/toBuffer/simpleTextureToScreenProgram.js";
import { SimpleGouraudLambertToBufferProgram } from "./programs/complete/toBuffer/simpleGouraudLambertToBufferProgram.js";
const fpsSpan = document.querySelector("#fps");
const canvas = document.querySelector("#webGlCanvas");
HtmlHelper.loadImages([], (images) => init(images));
function init(imageInfos) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const glCtx = canvas.getContext("webgl2");
    if (!glCtx) {
        console.error("Unable to obtain WebGL context");
        return;
    }
    const camera = new Camera(glCtx, Math.PI / 4, 0.1, 10000, 40, true);
    const lighting = new Lighting();
    lighting.directionalLights.push(new DirectionalLight([-0.3, -0.7, -0.8]));
    const framebufferInfo = Program.createFramebuffer(glCtx, glCtx.canvas.width, glCtx.canvas.height, 1, true);
    const framebuffer = framebufferInfo.glFramebuffer;
    const gridInfo = createGridInfo(glCtx, framebuffer);
    const shapeInfo = createShapeInfo(glCtx, framebuffer);
    const scene = new PostProcScene(glCtx, camera, lighting, [
        gridInfo.sceneItem, gridInfo.sceneItemWireframe,
        shapeInfo.sceneItem, shapeInfo.sceneItemWireframe,
    ], [], framebufferInfo, (fb) => {
        const prog = new SimpleTextureToScreenProgram(glCtx, fb);
        prog.execute();
    });
    const cancelToken = new CancelToken();
    const animator = new OrbiterAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas);
    animator.setLimits({ minY: -Math.PI / 2, maxY: Math.PI / 2, minZ: 40, maxZ: 40 });
    animator.animate();
    // scene.render(camera, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}
function createShapeInfo(glCtx, framebuffer) {
    const size = 10;
    const transformationPath = new TransformationPath();
    const shape = new Cuboid(size, size, size);
    const program = new SimpleGouraudLambertToBufferProgram(glCtx, shape, framebuffer);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const shapeWireframe = new Cuboid(size, size, size, true);
    const programWireframe = new SimpleToBufferProgram(glCtx, shapeWireframe, framebuffer, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
function createGridInfo(glCtx, framebuffer) {
    const length = 30;
    const cellCount = 10;
    const transformationPath = new TransformationPath();
    const shape = new Surface(length, length);
    shape.applyTransformation(new Transformation().translate(0, 0, length / 2).rotateY(Math.PI / 2).translate(0, 0, -length / 2));
    shape.addGeometry(new Surface(length, length));
    shape.applyTransformation(new Transformation().translate(0, 0, length / 2).rotateX(-Math.PI / 2).translate(0, 0, -length / 2));
    shape.addGeometry(new Surface(length, length));
    shape.applyTransformation(new Transformation().translate(0, length / 4, -length / 2));
    const program = new SimpleToBufferProgram(glCtx, shape, framebuffer, [0.6, 0.6, 0.6, 1]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const shapeWireframe = new Grid(cellCount, (length - 0.1) / cellCount, cellCount, (length - 0.1) / cellCount);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, length / 2 - 0.05).rotateY(Math.PI / 2).translate(0, 0, -length / 2 + 0.05));
    shapeWireframe.addGeometry(new Grid(cellCount, (length - 0.1) / cellCount, cellCount, (length - 0.1) / cellCount));
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, length / 2 - 0.05).rotateX(-Math.PI / 2).translate(0, 0, -length / 2 + 0.05));
    shapeWireframe.addGeometry(new Grid(cellCount, (length - 0.1) / cellCount, cellCount, (length - 0.1) / cellCount));
    shapeWireframe.applyTransformation(new Transformation().translate(0, length / 4, -length / 2));
    const programWireframe = new SimpleToBufferProgram(glCtx, shapeWireframe, framebuffer, [1, 1, 1, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
//# sourceMappingURL=shadowTest.js.map