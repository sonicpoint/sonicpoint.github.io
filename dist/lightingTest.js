import { Camera } from "./camera.js";
import { SceneItem } from "./sceneItem.js";
import { Scene } from "./scene.js";
import { CancelToken } from "./cancelToken.js";
import { HtmlHelper } from "./htmlHelper.js";
import { TransformationPath } from "./transformationPaths/TransformationPath.js";
import { Transformation } from "./transformation.js";
import { Material } from "./material.js";
import { Lighting } from "./lighting/lighting.js";
import { PositionalLight } from "./lighting/positionalLight.js";
import { DirectionalLight } from "./lighting/directionalLight.js";
import { Surface } from "./geometries/surface.js";
import { Grid } from "./geometries/grid.js";
import { FrilledSurface } from "./geometries/frilledSurface.js";
import { FrilledTorus } from "./geometries/frilledTorus.js";
import { FrilledTube } from "./geometries/frilledTube.js";
import { Cuboid } from "./geometries/cuboid.js";
import { Globe } from "./geometries/globe.js";
import { Cylinder } from "./geometries/cylinder.js";
import { SimpleProgram } from "./programs/complete/simpleProgram.js";
import { SimpleBlinnPhongProgram } from "./programs/complete/simpleBlinnPhongProgram.js";
import { SpecularMapProgram } from "./programs/complete/SpecularMapProgram.js";
import { BlinnPhongProgram } from "./programs/complete/blinnPhongProgram.js";
import { PomProgram } from "./programs/complete/pomProgram.js";
import { TransformationSet } from "./transformationPaths/transformationSet.js";
import { OrbiterAnimator } from "./animators/orbiterAnimator.js";
import { BumpedTorus } from "./geometries/bumpedTorus.js";
import { SimplePbrProgram } from "./programs/experimental/simplePbrProgram.js";
import { PbrMaterial } from "./pbrMaterial.js";
import { NormalMapProgram } from "./programs/complete/normalMapProgram.js";
import { AngularTransformationSet } from "./transformationPaths/angularTransformationSet.js";
const fpsSpan = document.querySelector("#fps");
const canvas = document.querySelector("#webGlCanvas");
HtmlHelper.loadImages([
    { name: "reference_texture", url: "./images/reference_texture.jpg" },
    { name: "gate_texture", url: "./images/Wood_Gate_Fortified_002_basecolor.jpg" },
    { name: "gate_specular_map", url: "./images/Wood_Gate_Fortified_002_metallic.jpg" },
    { name: "gate_normal_map", url: "./images/Wood_Gate_Fortified_002_normal.jpg" },
    { name: "gate_height_map", url: "./images/Wood_Gate_Fortified_002_height.png" },
    { name: "brick_wall_6_texture", url: "./images/Brick_wall_006_COLOR.jpg" },
    { name: "brick_wall_6_specular_map", url: "./images/Brick_wall_006_SPEC.jpg" },
    { name: "brick_wall_6_normal_map", url: "./images/Brick_wall_006_NRM.jpg" },
    { name: "brick_wall_18_texture", url: "./images/Brick_Wall_018_basecolor.jpg" },
    { name: "brick_wall_18_specular_map", url: "./images/Brick_Wall_018_roughness.jpg" },
    { name: "brick_wall_18_normal_map", url: "./images/Brick_Wall_018_normal.jpg" },
    { name: "brick_wall_18_height_map", url: "./images/Brick_Wall_018_height.png" },
    { name: "red_marble_texture", url: "./images/Red_Marble_001_COLOR.jpg" },
    { name: "red_marble_specular_map", url: "./images/Red_Marble_001_SPEC.jpg" },
    { name: "red_marble_normal_map", url: "./images/Red_Marble_001_NRM.jpg" },
    { name: "wood_texture", url: "./images/bump_diffuse.png" },
    { name: "wood_normal_map", url: "./images/bump_normal.png" },
    { name: "wood_normal_map_flip", url: "./images/bump_normal_flip.png" },
    { name: "wood_depth_map", url: "./images/bump_depth.png" },
    { name: "padded_texture", url: "./images/Sci-Fi_Padded_Fabric_002_basecolor.jpg" },
    { name: "padded_specular_map", url: "./images/Sci-Fi_Padded_Fabric_002_metallic.jpg" },
    { name: "padded_normal_map", url: "./images/Sci-Fi_Padded_Fabric_002_normal.jpg" },
], (images) => init(images));
function init(imageInfos) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const glCtx = canvas.getContext("webgl2");
    if (!glCtx) {
        console.error("Unable to obtain WebGL context");
        return;
    }
    let showWireframes = false;
    let showSolids = true;
    const shinyMaterial = new Material([0.2, 0.2, 0.2, 1], [0.1, 0.1, 0.1, 1], [0.6, 0.6, 0.6, 1], 100);
    const dullMaterial = new Material([0.2, 0.2, 0.2, 1], [0.1, 0.1, 0.1, 1], [0.1, 0.1, 0.1, 1], 1);
    const curtainMaterial = new Material([0.7, 0.2, 0.2, 1], [0.1, 0.1, 0.1, 1], [0, 0, 0, 1], 10);
    const woodMaterial = new Material([1, 1, 1, 1], [0.1, 0.1, 0.1, 1], [0.1, 0.1, 0.1, 1], 1, HtmlHelper.getImage("wood_texture", imageInfos));
    woodMaterial.normalMap = HtmlHelper.getImage("wood_normal_map", imageInfos);
    woodMaterial.heightMap = HtmlHelper.getImage("wood_depth_map", imageInfos);
    const shinyWoodMaterial = new Material([0.8, 0.8, 0.8, 1], [0.1, 0.1, 0.1, 1], [1, 1, 1, 1], 255, HtmlHelper.getImage("wood_texture", imageInfos));
    shinyWoodMaterial.normalMap = HtmlHelper.getImage("wood_normal_map", imageInfos);
    shinyWoodMaterial.heightMap = HtmlHelper.getImage("wood_depth_map", imageInfos);
    const woodenGateMaterial = new Material([1, 1, 1, 1], [0.5, 0.5, 0.5, 1], [1, 1, 1, 1], 100, HtmlHelper.getImage("gate_texture", imageInfos));
    woodenGateMaterial.normalMap = HtmlHelper.getImage("gate_normal_map", imageInfos);
    woodenGateMaterial.specularMap = HtmlHelper.getImage("gate_specular_map", imageInfos);
    woodenGateMaterial.heightMap = HtmlHelper.getImage("gate_height_map", imageInfos);
    const brickWall18Material = new Material([1, 1, 1, 1], [0.5, 0.5, 0.5, 1], [0.1, 0.1, 0.1, 1], 100, HtmlHelper.getImage("brick_wall_18_texture", imageInfos));
    brickWall18Material.normalMap = HtmlHelper.getImage("brick_wall_18_normal_map", imageInfos);
    brickWall18Material.specularMap = HtmlHelper.getImage("brick_wall_18_specular_map", imageInfos);
    brickWall18Material.heightMap = HtmlHelper.getImage("brick_wall_18_height_map", imageInfos);
    const redMarbleMaterial = new Material([1, 1, 1, 1], [0.3, 0.3, 0.3, 1], [0.9, 0.9, 0.9, 1], 100, HtmlHelper.getImage("red_marble_texture", imageInfos));
    redMarbleMaterial.normalMap = HtmlHelper.getImage("red_marble_normal_map", imageInfos);
    redMarbleMaterial.specularMap = HtmlHelper.getImage("red_marble_specular_map", imageInfos);
    const paddedMaterial = new Material([0.9, 0.9, 0.9, 1], [0.1, 0.1, 0.1, 1], [0.7, 0.7, 0.7, 1], 20, HtmlHelper.getImage("padded_texture", imageInfos));
    paddedMaterial.normalMap = HtmlHelper.getImage("padded_normal_map", imageInfos);
    paddedMaterial.specularMap = HtmlHelper.getImage("padded_specular_map", imageInfos);
    const brickWall6Material = new Material([0.6, 0.6, 0.6, 1], [0.1, 0.1, 0.1, 1], [0.0, 0.0, 0.0, 1], 1, HtmlHelper.getImage("brick_wall_6_texture", imageInfos));
    brickWall6Material.normalMap = HtmlHelper.getImage("brick_wall_6_normal_map", imageInfos);
    brickWall6Material.specularMap = HtmlHelper.getImage("brick_wall_6_specular_map", imageInfos);
    const blobMaterial = new PbrMaterial([1, 1, 1, 1], 0.45, true);
    const camera = new Camera(glCtx, Math.PI / 4, 0.1, 10000, 40, true);
    const lighting = new Lighting();
    lighting.directionalLights.push(new DirectionalLight([-0.3, -0.7, -0.8], [1, 1, 1, 1], [0.1, 0.1, 0.1, 1]));
    lighting.directionalLights.push(new DirectionalLight([-0.4, -0.2, 0], [1, 0, 0, 1]));
    lighting.directionalLights.push(new DirectionalLight([0, 0.6, 0], [0, 0, 1, 1]));
    lighting.positionalLights.push(new PositionalLight([0, 0, 10], [1, 1, 1, 1], [0.2, 0.2, 0.2, 1], [1, 1, 1, 1]));
    lighting.positionalLights.push(new PositionalLight([0, 0, -10], [1, 1, 1, 1], [0.2, 0.2, 0.2, 1], [1, 1, 1, 1]));
    const gridInfo = createGridInfo(glCtx);
    const lightInfo1 = createLightInfo(glCtx, lighting.positionalLights[0].lightPosition, lighting.positionalLights[0].diffuse);
    const lightInfo2 = createLightInfo(glCtx, lighting.positionalLights[1].lightPosition, lighting.positionalLights[1].diffuse);
    const curtainInfo = createCurtainInfo(glCtx, curtainMaterial);
    const blobInfo = createBlobInfo(glCtx, blobMaterial);
    const containerInfo = createContainerInfo(glCtx, woodenGateMaterial);
    const surface1Info = createSurface1Info(glCtx, paddedMaterial);
    const surface2Info = createSurface2Info(glCtx, woodenGateMaterial);
    const surface3Info = createSurface3Info(glCtx, shinyWoodMaterial);
    const surface4Info = createSurface4Info(glCtx, brickWall18Material);
    const surfaceTopInfo = createSurfaceTopInfo(glCtx, dullMaterial);
    const floorInfo = createFloorInfo(glCtx, redMarbleMaterial);
    const wallsInfo = createWallsInfo(glCtx, brickWall6Material);
    const windowInfo = createWindowInfo(glCtx, shinyMaterial);
    const shapeInfo = createShapeInfo(glCtx);
    const scene = new Scene(glCtx, camera, lighting, [
        // gridInfo.sceneItem, gridInfo.sceneItemWireframe,
        // curtainInfo.sceneItem, curtainInfo.sceneItemWireframe,
        // windowInfo.sceneItem, windowInfo.sceneItemWireframe,
        // shapeInfo.sceneItem, shapeInfo.sceneItemWireframe,
        lightInfo1.sceneItem, lightInfo1.sceneItemWireframe,
        lightInfo2.sceneItem, lightInfo2.sceneItemWireframe,
        blobInfo.sceneItem, blobInfo.sceneItemWireframe,
        surface1Info.sceneItem, surface1Info.sceneItemWireframe,
        surface2Info.sceneItem, surface2Info.sceneItemWireframe,
        surface3Info.sceneItem, surface3Info.sceneItemWireframe,
        surface4Info.sceneItem, surface4Info.sceneItemWireframe,
        surfaceTopInfo.sceneItem, surfaceTopInfo.sceneItemWireframe,
        //    containerInfo.sceneItem, containerInfo.sceneItemWireframe,
        floorInfo.sceneItem, floorInfo.sceneItemWireframe,
        wallsInfo.sceneItem, wallsInfo.sceneItemWireframe,
    ], [
        blobInfo.transformationPath,
        surface1Info.transformationPath,
        surface2Info.transformationPath,
        surface3Info.transformationPath,
        surface4Info.transformationPath,
        surfaceTopInfo.transformationPath,
    ], true);
    scene.suspendAnimation();
    const cancelToken = new CancelToken();
    setupControls();
    const animator = getAnimator();
    animator.animate();
    //  scene.render(camera, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    function setupControls() {
        HtmlHelper.setUpSlider("pos1X", (value) => {
            lightInfo1.sceneItem.applyTransformation(new Transformation().translate(-lighting.positionalLights[0].lightPosition[0], 0, 0));
            lightInfo1.sceneItemWireframe.applyTransformation(new Transformation().translate(-lighting.positionalLights[0].lightPosition[0], 0, 0));
            lighting.positionalLights[0].lightPosition[0] = value;
            lightInfo1.sceneItem.applyTransformation(new Transformation().translate(lighting.positionalLights[0].lightPosition[0], 0, 0));
            lightInfo1.sceneItemWireframe.applyTransformation(new Transformation().translate(lighting.positionalLights[0].lightPosition[0], 0, 0));
        });
        HtmlHelper.setUpSlider("pos1Y", (value) => {
            lightInfo1.sceneItem.applyTransformation(new Transformation().translate(0, -lighting.positionalLights[0].lightPosition[1], 0));
            lightInfo1.sceneItemWireframe.applyTransformation(new Transformation().translate(0, -lighting.positionalLights[0].lightPosition[1], 0));
            lighting.positionalLights[0].lightPosition[1] = value;
            lightInfo1.sceneItem.applyTransformation(new Transformation().translate(0, lighting.positionalLights[0].lightPosition[1], 0));
            lightInfo1.sceneItemWireframe.applyTransformation(new Transformation().translate(0, lighting.positionalLights[0].lightPosition[1], 0));
        });
        HtmlHelper.setUpSlider("pos1Z", (value) => {
            lightInfo1.sceneItem.applyTransformation(new Transformation().translate(0, 0, -lighting.positionalLights[0].lightPosition[2]));
            lightInfo1.sceneItemWireframe.applyTransformation(new Transformation().translate(0, 0, -lighting.positionalLights[0].lightPosition[2]));
            lighting.positionalLights[0].lightPosition[2] = value;
            lightInfo1.sceneItem.applyTransformation(new Transformation().translate(0, 0, lighting.positionalLights[0].lightPosition[2]));
            lightInfo1.sceneItemWireframe.applyTransformation(new Transformation().translate(0, 0, lighting.positionalLights[0].lightPosition[2]));
        });
        HtmlHelper.setUpSlider("pos1Red", (value) => {
            lighting.positionalLights[0].diffuse[0] = value;
            lighting.positionalLights[0].specular[0] = value;
        });
        HtmlHelper.setUpSlider("pos1Green", (value) => {
            lighting.positionalLights[0].diffuse[1] = value;
            lighting.positionalLights[0].specular[1] = value;
        });
        HtmlHelper.setUpSlider("pos1Blue", (value) => {
            lighting.positionalLights[0].diffuse[2] = value;
            lighting.positionalLights[0].specular[2] = value;
        });
        HtmlHelper.setUpSlider("pos2X", (value) => {
            lightInfo2.sceneItem.applyTransformation(new Transformation().translate(-lighting.positionalLights[1].lightPosition[0], 0, 0));
            lightInfo2.sceneItemWireframe.applyTransformation(new Transformation().translate(-lighting.positionalLights[1].lightPosition[0], 0, 0));
            lighting.positionalLights[1].lightPosition[0] = value;
            lightInfo2.sceneItem.applyTransformation(new Transformation().translate(lighting.positionalLights[1].lightPosition[0], 0, 0));
            lightInfo2.sceneItemWireframe.applyTransformation(new Transformation().translate(lighting.positionalLights[1].lightPosition[0], 0, 0));
        });
        HtmlHelper.setUpSlider("pos2Y", (value) => {
            lightInfo2.sceneItem.applyTransformation(new Transformation().translate(0, -lighting.positionalLights[1].lightPosition[1], 0));
            lightInfo2.sceneItemWireframe.applyTransformation(new Transformation().translate(0, -lighting.positionalLights[1].lightPosition[1], 0));
            lighting.positionalLights[1].lightPosition[1] = value;
            lightInfo2.sceneItem.applyTransformation(new Transformation().translate(0, lighting.positionalLights[1].lightPosition[1], 0));
            lightInfo2.sceneItemWireframe.applyTransformation(new Transformation().translate(0, lighting.positionalLights[1].lightPosition[1], 0));
        });
        HtmlHelper.setUpSlider("pos2Z", (value) => {
            lightInfo2.sceneItem.applyTransformation(new Transformation().translate(0, 0, -lighting.positionalLights[1].lightPosition[2]));
            lightInfo2.sceneItemWireframe.applyTransformation(new Transformation().translate(0, 0, -lighting.positionalLights[1].lightPosition[2]));
            lighting.positionalLights[1].lightPosition[2] = value;
            lightInfo2.sceneItem.applyTransformation(new Transformation().translate(0, 0, lighting.positionalLights[1].lightPosition[2]));
            lightInfo2.sceneItemWireframe.applyTransformation(new Transformation().translate(0, 0, lighting.positionalLights[1].lightPosition[2]));
        });
        HtmlHelper.setUpSlider("pos2Red", (value) => {
            lighting.positionalLights[1].diffuse[0] = value;
            lighting.positionalLights[1].specular[0] = value;
        });
        HtmlHelper.setUpSlider("pos2Green", (value) => {
            lighting.positionalLights[1].diffuse[1] = value;
            lighting.positionalLights[1].specular[1] = value;
        });
        HtmlHelper.setUpSlider("pos2Blue", (value) => {
            lighting.positionalLights[1].diffuse[2] = value;
            lighting.positionalLights[1].specular[2] = value;
        });
        HtmlHelper.setUpCheckbox("animate", (value) => value ? scene.resumeAnimation() : scene.suspendAnimation());
        HtmlHelper.setUpCheckbox("blobIsMetal", (value) => blobMaterial.isMetal = value);
        HtmlHelper.setUpSlider("parallaxDepth", (value) => {
            surface3Info.program.depthScale = value;
        });
        HtmlHelper.setUpSlider("shininess", (value) => {
            const diffuse = 0.8 + 0.2 * (1 - value);
            shinyWoodMaterial.specular = [value, value, value, 1];
            shinyWoodMaterial.diffuse = [diffuse, diffuse, diffuse, 1];
            shinyWoodMaterial.shininess = 255 - 255 * (1 - value);
        });
        HtmlHelper.setUpCheckbox("showWireframes", (value) => {
            showWireframes = value;
            updateSceneItems();
        });
        HtmlHelper.setUpCheckbox("showSolids", (value) => {
            showSolids = value;
            updateSceneItems();
        });
    }
    function updateSceneItems() {
        lightInfo1.sceneItem.isVisible = showSolids;
        lightInfo1.sceneItemWireframe.isVisible = showWireframes;
        lightInfo2.sceneItem.isVisible = showSolids;
        lightInfo2.sceneItemWireframe.isVisible = showWireframes;
        blobInfo.sceneItem.isVisible = showSolids;
        blobInfo.sceneItemWireframe.isVisible = showWireframes;
        surface1Info.sceneItem.isVisible = showSolids;
        surface1Info.sceneItemWireframe.isVisible = showWireframes;
        surface2Info.sceneItem.isVisible = showSolids;
        surface2Info.sceneItemWireframe.isVisible = showWireframes;
        surface3Info.sceneItem.isVisible = showSolids;
        surface3Info.sceneItemWireframe.isVisible = showWireframes;
        surface4Info.sceneItem.isVisible = showSolids;
        surface4Info.sceneItemWireframe.isVisible = showWireframes;
        surfaceTopInfo.sceneItem.isVisible = showSolids;
        surfaceTopInfo.sceneItemWireframe.isVisible = showWireframes;
        floorInfo.sceneItem.isVisible = showSolids;
        floorInfo.sceneItemWireframe.isVisible = showWireframes;
        wallsInfo.sceneItem.isVisible = showSolids;
        wallsInfo.sceneItemWireframe.isVisible = showWireframes;
    }
    function getAnimator() {
        // const animator = new WalkerAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas);
        // animator.stepSize = 1;
        // camera.initialDistance = 0;
        // camera.reset();
        // const animator =
        //   new MouseAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas);
        const animator = new OrbiterAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas, 0.3);
        animator.setLimits({ minY: -Math.PI / 2, maxY: 0, minZ: 20, maxZ: 150 });
        animator.rotate(Math.PI / 4, 0);
        // const animator =
        //   new MixedAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas,
        //   [containerInfo.sceneItem, containerInfo.sceneItemWireframe, floorInfo.sceneItem, floorInfo.sceneItemWireframe]);
        // animator.setLimits({ minY: -Math.PI / 2, maxY: Math.PI / 2});
        return animator;
    }
}
function createCurtainInfo(glCtx, material) {
    const width = 10;
    const height = 29.5;
    const frillCount = 6;
    const frillAmplitude = 1;
    const segments = 80;
    const transformationPath = new TransformationPath();
    const shape = new FrilledSurface(width, height, frillCount, frillAmplitude, segments);
    shape.applyTransformation(new Transformation().translate(-12, 0, 0));
    shape.addGeometry(new FrilledSurface(width, height, frillCount, frillAmplitude, segments));
    shape.applyTransformation(new Transformation().translate(6, 10, -37));
    const program = new BlinnPhongProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new FrilledSurface(width, height, frillCount, frillAmplitude, segments);
    shapeWireframe.applyTransformation(new Transformation().translate(-12, 0, 0));
    shapeWireframe.addGeometry(new FrilledSurface(width, height, frillCount, frillAmplitude, segments));
    shapeWireframe.applyTransformation(new Transformation().translate(6, 10, -37));
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
function createShapeInfo(glCtx) {
    const shinyMaterial = new Material([0.7, 0.7, 0.7, 1], [0.1, 0.1, 0.1, 1], [1, 1, 1, 1], 255, null);
    const dullMaterial = new Material([0.8, 0.8, 0.8, 1], [0.1, 0.1, 0.1, 1], [0, 0, 0, 1], 1, null);
    const tubeLength = 20;
    const tubeNearRadius = 2;
    const tubeNearCap = true;
    const tubeFarRadius = 2;
    const tubeFarCap = true;
    const tubeFrillCount = 10;
    const tubeFrillAmplitude = 0.1;
    const tubeSegments = 200;
    const centreRadius = 6;
    const sectionRadius = 3;
    const sectionSegments = 200;
    const pathSegments = 200;
    const frillCount = 8;
    const frillAmplitude = 0.2;
    const transformationPath = new TransformationPath();
    // const shape = new Globe2(5, 5, 100);
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateX(Math.PI / 180).rotateY(Math.PI / 200), 180));
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateX(Math.PI / 180).rotateY(-Math.PI / 200), 180));
    const shape = new FrilledTube(tubeLength, tubeNearRadius, tubeNearCap, tubeFarRadius, tubeFarCap, tubeFrillCount, tubeFrillAmplitude, tubeSegments, false);
    shape.applyTransformation(new Transformation().rotateX(Math.PI / 2));
    shape.addGeometry(new FrilledTorus(centreRadius, sectionRadius, frillCount, frillAmplitude, sectionSegments, pathSegments));
    // const program = new LambertianReflectionProgram2(glCtx, shape, [0.8, 0.8, 0.8, 1]);
    // const program = new BlinnPhongProgram2(glCtx, shape, shinyMaterial);
    // const program = new SimpleGouraudLambertProgram(glCtx, shape);
    // const program = new HemisphereLightingProgram(glCtx, shape);
    // const program = new GouraudPhongSimpleProgram2(glCtx, shape, shinyMaterial);
    // const program = new SimplePhongDirectionalProgram(glCtx, shape, shinyMaterial);
    const program = new SimpleProgram(glCtx, shape, [0, 1, 0, 1]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    // const shapeWireframe = new Globe2(5, 5, 40, true, true);
    const shapeWireframe = new FrilledTube(tubeLength, tubeNearRadius, tubeNearCap, tubeFarRadius, tubeFarCap, tubeFrillCount, tubeFrillAmplitude, tubeSegments, true);
    shapeWireframe.applyTransformation(new Transformation().rotateX(Math.PI / 2));
    shapeWireframe.addGeometry(new FrilledTorus(centreRadius, sectionRadius, frillCount, frillAmplitude, sectionSegments, pathSegments, true));
    const programWireframe = new SimpleProgram(glCtx, shapeWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true, null, transformationPath);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
function createLightInfo(glCtx, lightPosition, lightDiffuse) {
    const size = 0.7;
    const transformationPath = new TransformationPath();
    const shape = new Globe(size, size, 50);
    shape.applyTransformation(new Transformation().translate(lightPosition[0], lightPosition[1], lightPosition[2]));
    const program = new SimpleProgram(glCtx, shape, lightDiffuse);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Globe(size, size, 20, true);
    shapeWireframe.applyTransformation(new Transformation().translate(lightPosition[0], lightPosition[1], lightPosition[2]));
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
function createContainerInfo(glCtx, material) {
    const size = 10;
    const transformationPath = new TransformationPath();
    // transformationPath.addTransformationSet(new TransformationSet(
    //   new Transformation().rotateY(Math.PI / 180), 180));
    const shape = new Cylinder(3, 3, 10, 30);
    shape.applyTransformation(new Transformation().rotateX(-Math.PI / 2));
    const program = new SimpleBlinnPhongProgram(glCtx, shape, material);
    //  const shape = new Cuboid(size, size, size);
    // const program = new SpecularMapProgram(glCtx, shape, material);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Cuboid(size, size, size, true);
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
function createBlobInfo(glCtx, pbrMaterial) {
    const centreRadius = 4;
    const sectionRadius = 2.5;
    const sectionSegments = 200;
    const pathSegments = 200;
    const frillCount = 5;
    const frillAmplitude = 0.3;
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new AngularTransformationSet(Math.PI / 180, 360, (theta) => {
        const scaleAmount = Math.cos(theta) / 200;
        return new Transformation()
            .translate(0, 12, 0)
            .rotateY(Math.PI / 90)
            .scale(1, 1 - scaleAmount / 2, 1 + scaleAmount)
            .rotateX(Math.PI / 720)
            .translate(0, -12, 0);
    }));
    const shape = new BumpedTorus(centreRadius, sectionRadius, frillCount, frillAmplitude, sectionSegments, pathSegments);
    shape.applyTransformation(new Transformation().translate(0, 12, 0));
    const program = new SimplePbrProgram(glCtx, shape, pbrMaterial, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new BumpedTorus(centreRadius, sectionRadius, frillCount, frillAmplitude, sectionSegments / 4, pathSegments / 4, true);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 12, 0));
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
function createSurface1Info(glCtx, material) {
    const size = 10;
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / 180), 180));
    const shape = new Surface(size, size, false, 0.5);
    shape.applyTransformation(new Transformation().rotateY(-Math.PI / 2).translate(0, 0, size / 2));
    const program = new SpecularMapProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(size, size, true);
    shapeWireframe.applyTransformation(new Transformation().rotateY(-Math.PI / 2).translate(0, 0, size / 2));
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
function createSurface2Info(glCtx, material) {
    const size = 10;
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / 180), 180));
    const shape = new Surface(size, size, false, 0.5);
    shape.applyTransformation(new Transformation().rotateY(Math.PI / 2).translate(0, 0, size / 2));
    const program = new SpecularMapProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(size, size, true);
    shapeWireframe.applyTransformation(new Transformation().rotateY(Math.PI / 2).translate(0, 0, size / 2));
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
function createSurface3Info(glCtx, material) {
    const size = 10;
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / 180), 180));
    const shape = new Surface(size, size);
    shape.applyTransformation(new Transformation().translate(0, 0, size / 2));
    const program = new PomProgram(glCtx, shape, material, 2, 32, 0.1, true);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(size, size, true);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, size / 2));
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
function createSurface4Info(glCtx, material) {
    const size = 10;
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / 180), 180));
    const shape = new Surface(size, size);
    shape.applyTransformation(new Transformation().rotateY(Math.PI).translate(0, 0, size / 2));
    const program = new SpecularMapProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(size, size, true);
    shapeWireframe.applyTransformation(new Transformation().rotateY(Math.PI).translate(0, 0, size / 2));
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
function createSurfaceTopInfo(glCtx, material) {
    const size = 10;
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / 180), 180));
    const shape = new Surface(size, size);
    shape.applyTransformation(new Transformation().rotateX(-Math.PI / 2).translate(0, 0, size / 2));
    const program = new BlinnPhongProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(size, size, true);
    shapeWireframe.applyTransformation(new Transformation().rotateX(-Math.PI / 2).translate(0, 0, size / 2));
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
function createFloorInfo(glCtx, material) {
    const size = 80;
    const transformationPath = new TransformationPath();
    const shape = new Surface(size, size, false, 4);
    shape.applyTransformation(new Transformation().translate(0, -5, 0).rotateX(-Math.PI / 2));
    const program = new SpecularMapProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(size, size, true);
    shapeWireframe.applyTransformation(new Transformation().translate(0, -5, 0).rotateX(-Math.PI / 2));
    const programWireframe = new SimpleProgram(glCtx, shapeWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true, null, transformationPath);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
function createWallsInfo(glCtx, material) {
    const size = 80;
    const height = 40;
    const transformationPath = new TransformationPath();
    const shape = new Surface(size, height, false, 4);
    shape.applyTransformation(new Transformation().translate(0, 0, size / 2).translate(-size / 2, 0, 0).rotateY(Math.PI / 2));
    shape.addGeometry(new Surface(size, height, false, 4));
    shape.applyTransformation(new Transformation().translate(0, 0, size / 2).translate(-size / 2, 0, 0).rotateY(Math.PI / 2));
    shape.addGeometry(new Surface(size, height, false, 4));
    shape.applyTransformation(new Transformation().translate(0, 0, size / 2).translate(-size / 2, 0, 0).rotateY(Math.PI / 2));
    shape.addGeometry(new Surface(size, height, false, 4));
    shape.applyTransformation(new Transformation().translate(0, 15, 0).translate(0, 0, -size / 2));
    // const program = new BlinnPhongTextureProgram(glCtx, shape, material, 2);
    const program = new NormalMapProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(size, height, true);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, size / 2).translate(-size / 2, 0, 0).rotateY(Math.PI / 2));
    shapeWireframe.addGeometry(new Surface(size, height, true));
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, size / 2).translate(-size / 2, 0, 0).rotateY(Math.PI / 2));
    shapeWireframe.addGeometry(new Surface(size, height, true));
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, size / 2).translate(-size / 2, 0, 0).rotateY(Math.PI / 2));
    shapeWireframe.addGeometry(new Surface(size, height, true));
    shapeWireframe.applyTransformation(new Transformation().translate(0, 15, 0).translate(0, 0, -size / 2));
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
function createWindowInfo(glCtx, material) {
    const width = 20;
    const height = 26;
    const frillCount = 8;
    const frillAmplitude = 1;
    const segments = 80;
    const transformationPath = new TransformationPath();
    const shape = new Surface(width, height);
    shape.applyTransformation(new Transformation().translate(0, 8, -39));
    const program = new BlinnPhongProgram(glCtx, shape, material, 2);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Surface(width, height);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 8, -39));
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
function createGridInfo(glCtx) {
    const length = 30;
    const cellCount = 10;
    const transformationPath = new TransformationPath();
    const shape = new Surface(length, length);
    shape.applyTransformation(new Transformation().translate(0, 0, length / 2).rotateY(Math.PI / 2).translate(0, 0, -length / 2));
    shape.addGeometry(new Surface(length, length));
    shape.applyTransformation(new Transformation().translate(0, 0, length / 2).rotateX(-Math.PI / 2).translate(0, 0, -length / 2));
    shape.addGeometry(new Surface(length, length));
    shape.applyTransformation(new Transformation().translate(0, 0, -length / 2));
    const program = new SimpleProgram(glCtx, shape, [0.6, 0.6, 0.6, 1]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    const shapeWireframe = new Grid(cellCount, (length - 0.1) / cellCount, cellCount, (length - 0.1) / cellCount);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, length / 2 - 0.05).rotateY(Math.PI / 2).translate(0, 0, -length / 2 + 0.05));
    shapeWireframe.addGeometry(new Grid(cellCount, (length - 0.1) / cellCount, cellCount, (length - 0.1) / cellCount));
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, length / 2 - 0.05).rotateX(-Math.PI / 2).translate(0, 0, -length / 2 + 0.05));
    shapeWireframe.addGeometry(new Grid(cellCount, (length - 0.1) / cellCount, cellCount, (length - 0.1) / cellCount));
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, -length / 2 + 0.05));
    const programWireframe = new SimpleProgram(glCtx, shapeWireframe, [1, 1, 1, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true, null, transformationPath);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe,
        transformationPath
    };
}
//# sourceMappingURL=lightingTest.js.map