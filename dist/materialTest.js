import { Camera } from "./camera.js";
import { SceneItem } from "./sceneItem.js";
import { Scene } from "./scene.js";
import { CancelToken } from "./cancelToken.js";
import { HtmlHelper } from "./htmlHelper.js";
import { TransformationPath } from "./transformationPaths/TransformationPath.js";
import { Transformation } from "./transformation.js";
import { Material } from "./material.js";
import { Lighting } from "./lighting/lighting.js";
import { DirectionalLight } from "./lighting/directionalLight.js";
import { Grid } from "./geometries/grid.js";
import { Surface } from "./geometries/surface.js";
import { SimpleProgram } from "./programs/complete/simpleProgram.js";
import { MixedAnimator } from "./animators/mixedAnimator.js";
import { PositionalLight } from "./lighting/positionalLight.js";
import { SimplePbrProgram } from "./programs/experimental/simplePbrProgram.js";
import { BumpedTorus } from "./geometries/bumpedTorus.js";
import { PbrMaterial } from "./pbrMaterial.js";
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
    const camera = new Camera(glCtx, Math.PI / 4, 0.1, 10000, 4, true);
    const lighting = new Lighting();
    lighting.directionalLights.push(new DirectionalLight([-0.3, -0.7, -0.8]));
    lighting.positionalLights.push(new PositionalLight([0, 0, 20, 0]));
    const gridInfo = createGridInfo(glCtx);
    const shapeInfo = createShapeInfo(glCtx);
    const scene = new Scene(glCtx, camera, lighting, [
        gridInfo.sceneItem, gridInfo.sceneItemWireframe,
        shapeInfo.sceneItem, shapeInfo.sceneItemWireframe,
    ], []);
    const cancelToken = new CancelToken();
    const animator = new MixedAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas, [shapeInfo.sceneItem, shapeInfo.sceneItemWireframe]);
    animator.setLimits({ minY: -Math.PI / 2, maxY: Math.PI / 2 });
    //  camera.rotateY(Math.PI / 4);
    setupControls();
    animator.animate();
    // scene.render(camera, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    function setupControls() {
        HtmlHelper.setUpSlider("pos1X", (value) => {
            lighting.positionalLights[0].lightPosition[0] = value;
        });
        HtmlHelper.setUpSlider("pos1Y", (value) => {
            lighting.positionalLights[0].lightPosition[1] = value;
        });
        HtmlHelper.setUpSlider("pos1Z", (value) => {
            lighting.positionalLights[0].lightPosition[2] = value;
        });
    }
}
function createShapeInfo(glCtx) {
    const centreRadius = 0.6;
    const sectionRadius = 0.3;
    const sectionSegments = 200;
    const pathSegments = 200;
    const frillCount = 5;
    const frillAmplitude = 0.05;
    const transformationPath = new TransformationPath();
    const material = new Material([0.1, 0.1, 0.1, 1], [0.2, 0.2, 0.2, 1], [0.8, 0.8, 0.8, 1], 40);
    const pbrMaterial = new PbrMaterial([1, 1, 1, 1], 0.5, true);
    // const shape = new FrilledTube(tubeLength, tubeNearRadius, tubeNearCap, tubeFarRadius, tubeFarCap, tubeFrillCount, tubeFrillAmplitude, tubeSegments);
    const shape = new BumpedTorus(centreRadius, sectionRadius, frillCount, frillAmplitude, sectionSegments, pathSegments);
    // const shape = new Globe(0.5, 0.5, 50);
    // const program = new SimpleGouraudLambertProgram(glCtx, shape);
    // const program = new SimpleBlinnPhongProgram(glCtx, shape, material);
    const program = new SimplePbrProgram(glCtx, shape, pbrMaterial, 3);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    // const shapeWireframe = new FrilledTube(tubeLength, tubeNearRadius, tubeNearCap, tubeFarRadius, tubeFarCap, tubeFrillCount, tubeFrillAmplitude, tubeSegments);
    const shapeWireframe = new BumpedTorus(centreRadius, sectionRadius, frillCount, frillAmplitude, sectionSegments, pathSegments);
    const programWireframe = new SimpleProgram(glCtx, shapeWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, false);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
function createGridInfo(glCtx) {
    const length = 3;
    const cellCount = 10;
    const transformationPath = new TransformationPath();
    const shape = new Surface(length, length);
    shape.applyTransformation(new Transformation().translate(0, 0, length / 2).rotateY(Math.PI / 2).translate(0, 0, -length / 2));
    shape.addGeometry(new Surface(length, length));
    shape.applyTransformation(new Transformation().translate(0, 0, length / 2).rotateX(-Math.PI / 2).translate(0, 0, -length / 2));
    shape.addGeometry(new Surface(length, length));
    shape.applyTransformation(new Transformation().translate(0, length / 6, -length / 2));
    const program = new SimpleProgram(glCtx, shape, [0.6, 0.6, 0.6, 1]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const shapeWireframe = new Grid(cellCount, (length - 0.01) / cellCount, cellCount, (length - 0.01) / cellCount);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, length / 2 - 0.005).rotateY(Math.PI / 2).translate(0, 0, -length / 2 + 0.005));
    shapeWireframe.addGeometry(new Grid(cellCount, (length - 0.01) / cellCount, cellCount, (length - 0.01) / cellCount));
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, length / 2 - 0.005).rotateX(-Math.PI / 2).translate(0, 0, -length / 2 + 0.005));
    shapeWireframe.addGeometry(new Grid(cellCount, (length - 0.01) / cellCount, cellCount, (length - 0.01) / cellCount));
    shapeWireframe.applyTransformation(new Transformation().translate(0, length / 6, -length / 2 + 0.005));
    const programWireframe = new SimpleProgram(glCtx, shapeWireframe, [1, 1, 1, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
//# sourceMappingURL=materialTest.js.map