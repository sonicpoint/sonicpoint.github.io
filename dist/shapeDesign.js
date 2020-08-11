import { SimpleProgram } from "./programs/complete/simpleProgram.js";
import { Camera } from "./camera.js";
import { Lighting } from "./lighting/lighting.js";
import { SceneItem } from "./sceneItem.js";
import { Scene } from "./scene.js";
import { CancelToken } from "./cancelToken.js";
import { OrbiterAnimator } from "./animators/orbiterAnimator.js";
import { HtmlHelper } from "./htmlHelper.js";
import { DirectionalLight } from "./lighting/directionalLight.js";
import { TransformationPath } from "./transformationPaths/transformationPath.js";
import { RoundedCuboid } from "./geometries/roundedCuboid.js";
import { PositionalLight } from "./lighting/positionalLight.js";
const fpsSpan = document.querySelector("#fps");
const canvas = document.querySelector("#webGlCanvas");
let size = parseFloat(document.getElementById("size").value);
let roundingRadius = parseFloat(document.getElementById("roundingRadius").value);
let segments = parseFloat(document.getElementById("segments").value);
HtmlHelper.loadImages([
    { name: "reference_texture", url: "./images/reference_texture.jpg" },
], (images) => init(images));
function init(imageInfos) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const glCtx = canvas.getContext("webgl2");
    if (!glCtx) {
        console.error("Unable to obtain WebGL context");
        return;
    }
    const camera = new Camera(glCtx, Math.PI / 4, 0.1, 10000, 80, true);
    const lighting = new Lighting();
    lighting.directionalLights.push(new DirectionalLight([-0.2, 0.6, 0.8]));
    lighting.positionalLights.push(new PositionalLight([-50, 60, 80]));
    let shapeInfo = createShapeInfo(glCtx);
    const scene = new Scene(glCtx, camera, lighting, [shapeInfo.sceneItem, shapeInfo.sceneItemWireframe], [], true);
    HtmlHelper.setUpSlider("size", (value) => { size = value; updateShape(); }, false);
    HtmlHelper.setUpSlider("roundingRadius", (value) => { roundingRadius = value; updateShape(); }, false);
    HtmlHelper.setUpSlider("segments", (value) => { segments = value; updateShape(); }, false);
    // HtmlHelper.setUpSlider("opacity", (value) => { shapeInfo.program.opacity = value; }, false);
    const cancelToken = new CancelToken();
    const animator = new OrbiterAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas);
    animator.setLimits({ minY: -Math.PI / 2, maxY: Math.PI / 2 });
    animator.animate();
    function updateShape() {
        let opacity = 1.0;
        if (shapeInfo !== undefined) {
            // opacity = shapeInfo.program.opacity;
        }
        console.log("Size: " + size);
        console.log("roundingRadius: " + roundingRadius);
        console.log("segments: " + segments);
        shapeInfo = createShapeInfo(glCtx);
        // shapeInfo.program.opacity = opacity;
        scene.sceneItems = [shapeInfo.sceneItem, shapeInfo.sceneItemWireframe];
    }
}
function createShapeInfo(glCtx) {
    const transformationPath = new TransformationPath();
    const shape = new RoundedCuboid(size, roundingRadius, segments, false, true);
    shape.addGeometry(new RoundedCuboid(size, roundingRadius, segments, false));
    // const program = new PhongPositionalProgram(glCtx, shape, [1, 0, 0, 0.5]);
    const program = new SimpleProgram(glCtx, shape, [1, 0, 0, 0.5]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new RoundedCuboid(size, roundingRadius, segments, true);
    const programWireframe = new SimpleProgram(glCtx, shapeWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, false, null, transformationPath);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
//# sourceMappingURL=shapeDesign.js.map