import { SimpleBufferProgram } from "./programs/simpleBufferProgram.js";
import { Program } from "./programs/program.js";
import { Material } from "./material.js";
import { Geometry } from "./geometries/geometry.js";
import { Cuboid } from "./geometries/cuboid.js";
import { Globe } from "./geometries/globe.js";
import { Tube } from "./geometries/tube.js";
import { Pyramid } from "./geometries/pyramid.js";
import { ScenePost } from "./scenepost.js";
import { MouseAnimator } from "./animators/mouseAnimator.js";
import { SceneItem } from "./sceneItem.js";
import { Transformation } from "./transformation.js";
import { TransformationPath } from "./transformationPaths/transformationPath.js";
import { TransformAnimator } from "./animators/transformAnimator.js";
import { CancelToken } from "./cancelToken.js";
import { TubePrism } from "./geometries/tubePrism.js";
import { Grid } from "./geometries/grid.js";
import { DirectionalLight } from "./lighting/directionalLight.js";
import { PositionalLight } from "./lighting/positionalLight.js";
import { Camera } from "./camera.js";
import { AngularTransformationSet } from "./transformationPaths/angularTransformationSet.js";
import { TransformationSet } from "./transformationPaths/transformationSet.js";
import { Lighting } from "./lighting/lighting.js";
const canvasElement = document.querySelector("#webGlCanvas");
const showGridCheckBox = document.getElementById("showGrid");
const showWireframeCheckBox = document.getElementById("showWireframe");
const showSolidCheckBox = document.getElementById("showSolid");
const autoRotateCheckBox = document.getElementById("autoRotate");
const animateCheckBox = document.getElementById("animate");
const perspectiveCheckBox = document.getElementById("perspective");
const bloomCheckBox = document.getElementById("bloom");
const fpsSpan = document.querySelector("#fps");
let showGrid = showGridCheckBox.checked;
let showWireframes = showWireframeCheckBox.checked;
let showSolids = showSolidCheckBox.checked;
let autoRotate = autoRotateCheckBox.checked;
let isPerspective = perspectiveCheckBox.checked;
let isBloom = bloomCheckBox.checked;
let cancelToken = new CancelToken();
const imagesGlobal = [];
loadImages([
    "./images/crate_texture.jpg",
    "./images/crate3_texture.jpg",
    "./images/earth.jpg",
    "./images/pyramid_texture.jpg",
    "./images/clouds.png",
    "./images/2k_moon.jpg"
], (images) => init(canvasElement, images));
function init(canvas, images) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const glCtx = canvas.getContext("webgl2");
    if (!glCtx) {
        console.error("Unable to obtain WebGL context");
        return;
    }
    const directionalLightSourceTransformationPath = new TransformationPath();
    directionalLightSourceTransformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / -2000).rotateX(Math.PI / -4000), 4000));
    const directionalLight = new DirectionalLight([0, 0, -1], [1, 1, 1, 1], [0, 0, 0, 0], [1, 1, 1, 1], directionalLightSourceTransformationPath);
    //  const directionalLight = new DirectionalLight([0.2, 0.4, 0.8], directionalLightSourceTransformationPath);
    const positionalLightTransformationPath = new TransformationPath();
    positionalLightTransformationPath.addTransformationSet(new AngularTransformationSet(Math.PI / 45, 90, (theta) => new Transformation().translate(0, 0, Math.cos(theta) * 6)));
    const positionalLight = new PositionalLight([0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [1, 1, 1, 1], positionalLightTransformationPath);
    const lighting = new Lighting();
    lighting.directionalLights.push(directionalLight);
    lighting.positionalLights.push(positionalLight);
    const sunTransformationPath = new TransformationPath();
    sunTransformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / -2000).rotateX(Math.PI / -4000), 4000));
    const pyramidTransformationPath = new TransformationPath();
    pyramidTransformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / 180), 60));
    const greenGlobeTransformationPath = new TransformationPath();
    greenGlobeTransformationPath.addTransformationSet(new AngularTransformationSet(Math.PI / 45, 90, (theta) => new Transformation().translate(0, 0, Math.cos(theta) * 6)));
    const earthTransformationPath = new TransformationPath();
    earthTransformationPath.addTransformationSet(new TransformationSet(new Transformation().rotateY(Math.PI / 2160), 60));
    const cloudGlobeTransformationPath = new TransformationPath();
    cloudGlobeTransformationPath.addTransformationSet(new TransformationSet(new Transformation().translate(0, 90, 0).rotateY(Math.PI / 2160).rotateX(Math.PI / 5000).translate(0, -90, 0), 60));
    const tubePrismSettings = {
        outerRadiusX: Math.sqrt(1800),
        outerRadiusY: Math.sqrt(1800),
        outerSegments: 4,
        isOuterSmooth: false,
        innerRadiusX: 25,
        innerRadiusY: 25,
        innerSegments: 32,
        isInnerSmooth: true,
        depth: 60
    };
    const geometrySun = new Geometry();
    const geometryRed = new Geometry();
    const geometryCrates = new Geometry();
    const geometryPyramid = new Geometry();
    const geometryGreenGlobe = new Geometry();
    const geometryEarth = new Geometry();
    const geometryMoon = new Geometry();
    const geometryCloudGlobe = new Geometry();
    const geometryBlue = new Geometry();
    {
        const isWireframe = false;
        geometrySun.applyTransformation(new Transformation().translate(directionalLight.lightDirection[0] * -1000, directionalLight.lightDirection[1] * -1000, directionalLight.lightDirection[2] * -1000));
        geometrySun.addGeometry(new Globe(100, 100, 40, isWireframe));
        geometrySun.applyTransformation(new Transformation().translate(directionalLight.lightDirection[0] * 1000, directionalLight.lightDirection[1] * 1000, directionalLight.lightDirection[2] * 1000));
        geometryRed.applyTransformation(new Transformation().rotateZ(Math.PI / -4));
        geometryRed.addGeometry(new TubePrism(tubePrismSettings, isWireframe));
        geometryRed.applyTransformation(new Transformation().rotateZ(Math.PI / 4));
        geometryRed.applyTransformation(new Transformation().scale(1.1, 1, 1));
        geometryCrates.applyTransformation(new Transformation().translate(0, 75, 0));
        geometryCrates.applyTransformation(new Transformation().rotateY(Math.PI / 10));
        geometryCrates.addGeometry(new Cuboid(90, 90, 90, isWireframe));
        geometryCrates.applyTransformation(new Transformation().rotateY(Math.PI / -10));
        geometryCrates.applyTransformation(new Transformation().translate(0, -75, 0));
        geometryPyramid.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryPyramid.applyTransformation(new Transformation().rotateZ(Math.PI / -6));
        geometryPyramid.applyTransformation(new Transformation().translate(0, 0, 45));
        geometryPyramid.addGeometry(new Pyramid(30, 30, 30, 4, isWireframe));
        geometryPyramid.applyTransformation(new Transformation().translate(0, 0, -45));
        geometryPyramid.applyTransformation(new Transformation().rotateZ(Math.PI / 6));
        geometryPyramid.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryGreenGlobe.addGeometry(new Globe(10, 10, 20, isWireframe));
        geometryEarth.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryEarth.applyTransformation(new Transformation().translate(0, 0, 90));
        geometryEarth.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryEarth.addGeometry(new Globe(30, 30, 40, isWireframe));
        geometryEarth.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryEarth.applyTransformation(new Transformation().translate(0, 0, -90));
        geometryEarth.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryMoon.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryMoon.applyTransformation(new Transformation().translate(0, 90, 90));
        geometryMoon.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryMoon.addGeometry(new Globe(10, 10, 30, isWireframe));
        geometryMoon.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryMoon.applyTransformation(new Transformation().translate(0, 90, -90));
        geometryMoon.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryCloudGlobe.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryCloudGlobe.applyTransformation(new Transformation().translate(0, 0, 90));
        geometryCloudGlobe.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryCloudGlobe.addGeometry(new Globe(30.4, 30.4, 40, isWireframe));
        geometryCloudGlobe.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryCloudGlobe.applyTransformation(new Transformation().translate(0, 0, -90));
        geometryCloudGlobe.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryBlue.applyTransformation(new Transformation().translate(0, 0, 35));
        geometryBlue.addGeometry(new Tube(28, 28, 10, 5, 32, isWireframe));
        geometryBlue.applyTransformation(new Transformation().translate(0, 0, -35));
        geometryBlue.addGeometry(new Tube(25, 25, 100, 5, 32, isWireframe));
        geometryBlue.applyTransformation(new Transformation().translate(0, 0, -35));
        geometryBlue.addGeometry(new Tube(28, 28, 10, 5, 32, isWireframe));
        geometryBlue.applyTransformation(new Transformation().translate(0, 0, 35));
    }
    // const outerGeometry = new Grid(1, 0, 1, 350);
    // outerGeometry.applyTransformation(new Transformation().rotateX(Math.PI / 2));
    // outerGeometry.addGeometry(new Grid(1, 0, 1, 350));
    // outerGeometry.applyTransformation(new Transformation().rotateZ(Math.PI / 2));
    // outerGeometry.addGeometry(new Grid(1, 0, 1, 350));
    const outerGeometry = new Cuboid(300, 300, 300, true);
    outerGeometry.addGeometry(new Grid(10, 30, 10, 30));
    outerGeometry.applyTransformation(new Transformation().rotateX(Math.PI / 2));
    // outerGeometry.addGeometry(new Grid(10, 30, 10, 30));
    // outerGeometry.applyTransformation(new Transformation().rotateY(Math.PI / 2));
    // outerGeometry.addGeometry(new Grid(10, 30, 10, 30));
    const geometryWireframe = new Geometry();
    const geometryWireframeCrates = new Geometry();
    const geometryWireframeSun = new Geometry();
    const geometryWireframePyramid = new Geometry();
    const geometryWireframeGlobe = new Geometry();
    const geometryWireframeEarth = new Geometry();
    const geometryWireframeMoon = new Geometry();
    {
        const isWireframe = true;
        geometryWireframeSun.applyTransformation(new Transformation().translate(directionalLight.lightDirection[0] * -1000, directionalLight.lightDirection[1] * -1000, directionalLight.lightDirection[2] * -1000));
        geometryWireframeSun.addGeometry(new Globe(100, 100, 40, isWireframe));
        geometryWireframeSun.applyTransformation(new Transformation().translate(directionalLight.lightDirection[0] * 1000, directionalLight.lightDirection[1] * 1000, directionalLight.lightDirection[2] * 1000));
        geometryWireframe.applyTransformation(new Transformation().rotateZ(Math.PI / -4));
        geometryWireframe.addGeometry(new TubePrism(tubePrismSettings, isWireframe));
        geometryWireframe.applyTransformation(new Transformation().rotateZ(Math.PI / 4));
        geometryWireframe.applyTransformation(new Transformation().scale(1.1, 1, 1));
        geometryWireframeCrates.applyTransformation(new Transformation().translate(0, 75, 0));
        geometryWireframeCrates.applyTransformation(new Transformation().rotateY(Math.PI / 10));
        geometryWireframeCrates.addGeometry(new Cuboid(90, 90, 90, isWireframe));
        geometryWireframeCrates.applyTransformation(new Transformation().rotateY(Math.PI / -10));
        geometryWireframeCrates.applyTransformation(new Transformation().translate(0, -75, 0));
        geometryWireframeGlobe.addGeometry(new Globe(10, 10, 20, isWireframe));
        geometryWireframeEarth.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryWireframeEarth.applyTransformation(new Transformation().translate(0, 0, 90));
        geometryWireframeEarth.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryWireframeEarth.addGeometry(new Globe(30, 30, 40, isWireframe));
        geometryWireframeEarth.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryWireframeEarth.applyTransformation(new Transformation().translate(0, 0, -90));
        geometryWireframeEarth.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryWireframeMoon.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryWireframeMoon.applyTransformation(new Transformation().translate(0, 90, 90));
        geometryWireframeMoon.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryWireframeMoon.addGeometry(new Globe(10, 10, 30, isWireframe));
        geometryWireframeMoon.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryWireframeMoon.applyTransformation(new Transformation().translate(0, 90, -90));
        geometryWireframeMoon.applyTransformation(new Transformation().rotateX(Math.PI / 2));
        geometryWireframe.applyTransformation(new Transformation().translate(0, 0, 35));
        geometryWireframe.addGeometry(new Tube(28, 28, 10, 5, 32, isWireframe));
        geometryWireframe.applyTransformation(new Transformation().translate(0, 0, -35));
        geometryWireframe.addGeometry(new Tube(25, 25, 100, 5, 32, isWireframe));
        geometryWireframe.applyTransformation(new Transformation().translate(0, 0, -35));
        geometryWireframe.addGeometry(new Tube(28, 28, 10, 5, 32, isWireframe));
        geometryWireframe.applyTransformation(new Transformation().translate(0, 0, 35));
        geometryWireframePyramid.applyTransformation(new Transformation().rotateX(Math.PI / -2));
        geometryWireframePyramid.applyTransformation(new Transformation().rotateZ(Math.PI / -6));
        geometryWireframePyramid.applyTransformation(new Transformation().translate(0, 0, 45));
        geometryWireframePyramid.addGeometry(new Pyramid(30, 30, 30, 4, isWireframe));
        geometryWireframePyramid.applyTransformation(new Transformation().translate(0, 0, -45));
        geometryWireframePyramid.applyTransformation(new Transformation().rotateZ(Math.PI / 6));
        geometryWireframePyramid.applyTransformation(new Transformation().rotateX(Math.PI / 2));
    }
    const materialPyramid = new Material([0.4, 0.8, 0.4, 1.0], [0.2, 0.2, 0.2, 1], [0.5, 0.5, 0.5, 1], 30);
    const materialEarth = new Material([0.4, 0.8, 0.4, 1.0], [0.2, 0.2, 0.2, 1], [1, 1, 1, 1], 10);
    const materialBlue = new Material([0.5, 0.5, 1.0, 1.0], [0.2, 0.2, 0.2, 1], [0.2, 0.2, 0.2, 1], 2);
    // Create framebuffer for all output
    const framebufferInfo = Program.createFramebuffer(glCtx, glCtx.canvas.width, glCtx.canvas.height, 2, true);
    const framebuffer = framebufferInfo.glFramebuffer;
    // const textureStd = framebufferInfo.glTextures[0];
    // const textureBloom = framebufferInfo.glTextures[1];
    const sceneItemSolidSun = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometrySun, [1.0, 1.0, 0.2, 1.0], true), glCtx.TRIANGLES, showSolids, null, sunTransformationPath);
    const sceneItemSolidRed = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryRed, [1.0, 0.5, 0.5, 1.0], false), glCtx.TRIANGLES, showSolids);
    const sceneItemSolidCrates = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryCrates, [0.5, 0.5, 0.5, 1], false), glCtx.TRIANGLES, showSolids);
    const sceneItemSolidPyramid = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryPyramid, [0.5, 0.5, 0.5, 1], false), glCtx.TRIANGLES, showSolids, null, pyramidTransformationPath);
    const sceneItemSolidGreenGlobe = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryGreenGlobe, [0.2, 1.0, 0.2, 1.0], true), glCtx.TRIANGLES, showSolids, null, greenGlobeTransformationPath);
    const sceneItemSolidEarth = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryEarth, [0.5, 0.5, 0.5, 1], false), glCtx.TRIANGLES, showSolids, null, earthTransformationPath);
    const sceneItemSolidMoon = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryMoon, [0.5, 0.5, 0.5, 1], false), glCtx.TRIANGLES, showSolids, null, earthTransformationPath);
    const sceneItemSolidBlue = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryBlue, [0.5, 0.5, 0.5, 1], false), glCtx.TRIANGLES, showSolids);
    const sceneItemOuterGrid = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, outerGeometry, [1.0, 1.0, 1.0, 1.0], true), glCtx.LINES, showGrid);
    const sceneItemWireframe = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryWireframe, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes);
    const sceneItemWireframeCrates = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeCrates, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes);
    const sceneItemWireframeSun = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeSun, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, sunTransformationPath);
    const sceneItemWireframePyramid = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryWireframePyramid, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, pyramidTransformationPath);
    const sceneItemWireframeGreenGlobe = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeGlobe, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, greenGlobeTransformationPath);
    const sceneItemWireframeEarth = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeEarth, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, earthTransformationPath);
    const sceneItemWireframeMoon = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeMoon, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, earthTransformationPath);
    const sceneItemCloudGlobe = new SceneItem(new SimpleBufferProgram(glCtx, framebuffer, geometryCloudGlobe, [0.5, 0.5, 0.5, 1], false), glCtx.TRIANGLES, showSolids, null, cloudGlobeTransformationPath);
    // const sceneItemSolidSun = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometrySun, [1.0, 1.0, 0.2, 1.0], true), glCtx.TRIANGLES, showSolids, null, sunTransformationPath);
    // const sceneItemSolidRed = new SceneItem(
    //   new DirectionalLightBufferProgram(glCtx, framebuffer, geometryRed, [1.0, 0.5, 0.5, 1.0]), glCtx.TRIANGLES, showSolids);
    // const sceneItemSolidCrates = new SceneItem(
    //   new TextureBufferProgram(glCtx, framebuffer, geometryCrates, images[0]), glCtx.TRIANGLES, showSolids);
    // const sceneItemSolidPyramid = new SceneItem(
    //   new TextureBufferProgram(glCtx, framebuffer, geometryPyramid, images[3]), glCtx.TRIANGLES, showSolids, null, pyramidTransformationPath);
    // const sceneItemSolidGreenGlobe = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryGreenGlobe, [0.2, 1.0, 0.2, 1.0], true), glCtx.TRIANGLES, showSolids, null, greenGlobeTransformationPath);
    // const sceneItemSolidEarth = new SceneItem(
    //   new TextureBufferProgram(glCtx, framebuffer, geometryEarth, images[2]), glCtx.TRIANGLES, showSolids, null, earthTransformationPath);
    // const sceneItemSolidMoon = new SceneItem
    // (new TextureBufferProgram(glCtx, framebuffer, geometryMoon, images[5]), glCtx.TRIANGLES, showSolids, null, earthTransformationPath);
    // const sceneItemSolidBlue = new SceneItem(
    //   new MixedLightBufferProgram(glCtx, framebuffer, geometryBlue, materialBlue), glCtx.TRIANGLES, showSolids);
    // const sceneItemOuterGrid = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, outerGeometry, [1.0, 1.0, 1.0, 1.0], true), glCtx.LINES, showGrid);
    // const sceneItemWireframe = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryWireframe, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes);
    // const sceneItemWireframeCrates = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeCrates, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes);
    // const sceneItemWireframeSun = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeSun, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, sunTransformationPath);
    // const sceneItemWireframePyramid = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryWireframePyramid, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, pyramidTransformationPath);
    // const sceneItemWireframeGreenGlobe = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeGlobe, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, greenGlobeTransformationPath);
    // const sceneItemWireframeEarth = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeEarth, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, earthTransformationPath);
    // const sceneItemWireframeMoon = new SceneItem(
    //   new SimpleBufferProgram(glCtx, framebuffer, geometryWireframeMoon, [0.3, 0.3, 0.3, 1.0], false), glCtx.LINES, showWireframes, null, earthTransformationPath);
    // const sceneItemCloudGlobe = new SceneItem(
    //   new TextureBufferProgram(glCtx, framebuffer, geometryCloudGlobe, images[4]), glCtx.TRIANGLES, showSolids, null, cloudGlobeTransformationPath);
    const camera = new Camera(glCtx, Math.PI / 4, 0.1, 20000, 600, isPerspective);
    const scene = new ScenePost(glCtx, framebufferInfo, camera, lighting, [
        //  const scene = new Scene(glCtx, camera, lighting, [
        sceneItemSolidSun,
        sceneItemSolidRed,
        sceneItemSolidCrates,
        sceneItemSolidPyramid,
        sceneItemSolidGreenGlobe,
        sceneItemSolidEarth,
        sceneItemSolidMoon,
        sceneItemSolidBlue,
        //    sceneItemOuterGrid2,
        sceneItemOuterGrid,
        sceneItemWireframe,
        sceneItemWireframeCrates,
        sceneItemWireframeSun,
        sceneItemWireframePyramid,
        sceneItemWireframeGreenGlobe,
        sceneItemWireframeEarth,
        sceneItemWireframeMoon,
        sceneItemCloudGlobe
    ], [
        sunTransformationPath,
        pyramidTransformationPath,
        greenGlobeTransformationPath,
        earthTransformationPath,
        cloudGlobeTransformationPath
    ], true);
    updateSceneItems();
    // Animate scene
    getAnimator().animate();
    autoRotateCheckBox.onclick = () => {
        autoRotate = autoRotateCheckBox.checked;
        cancelToken.cancelledByClient = true;
        cancelToken = new CancelToken();
        getAnimator().animate();
    };
    showGridCheckBox.onclick = () => {
        showGrid = showGridCheckBox.checked;
        updateSceneItems();
    };
    showWireframeCheckBox.onclick = () => {
        showWireframes = showWireframeCheckBox.checked;
        updateSceneItems();
    };
    showSolidCheckBox.onclick = () => {
        showSolids = showSolidCheckBox.checked;
        updateSceneItems();
    };
    animateCheckBox.onclick = () => {
        animateCheckBox.checked ? scene.resumeAnimation() : scene.suspendAnimation();
    };
    perspectiveCheckBox.onclick = () => {
        isPerspective = perspectiveCheckBox.checked;
        if (autoRotate) {
            cancelToken.cancelledByClient = true;
            cancelToken = new CancelToken();
            getAnimator().animate();
        }
        else {
            scene.camera.reset(isPerspective);
        }
    };
    bloomCheckBox.onclick = () => {
        isBloom = bloomCheckBox.checked;
        scene.isBloom = bloomCheckBox.checked;
        //    updateSceneItems();
    };
    return;
    function updateSceneItems() {
        sceneItemOuterGrid.isVisible = showGrid;
        sceneItemSolidSun.isVisible = showSolids;
        sceneItemSolidRed.isVisible = showSolids;
        sceneItemSolidCrates.isVisible = showSolids;
        sceneItemSolidPyramid.isVisible = showSolids;
        sceneItemSolidGreenGlobe.isVisible = showSolids;
        sceneItemSolidEarth.isVisible = showSolids;
        sceneItemSolidMoon.isVisible = showSolids;
        sceneItemCloudGlobe.isVisible = showSolids;
        sceneItemSolidBlue.isVisible = showSolids;
        sceneItemWireframe.isVisible = showWireframes;
        sceneItemWireframeCrates.isVisible = showWireframes;
        sceneItemWireframeSun.isVisible = showWireframes;
        sceneItemWireframePyramid.isVisible = showWireframes;
        sceneItemWireframeGreenGlobe.isVisible = showWireframes;
        sceneItemWireframeEarth.isVisible = showWireframes;
        sceneItemWireframeMoon.isVisible = showWireframes;
    }
    function getAnimator() {
        if (autoRotate) {
            scene.camera.reset(isPerspective);
        }
        return autoRotate ?
            new TransformAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, new Transformation().rotateY(Math.PI / 540), new Transformation()
                .rotateX(Math.PI / -8).rotateZ(Math.PI / -8)) :
            new MouseAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas);
    }
}
function loadImages(urls, callback) {
    let imagesToLoad = urls.length;
    // Called each time an image finished loading.
    const onImageLoad = () => {
        --imagesToLoad;
        // If all the images are loaded call the callback.
        if (imagesToLoad === 0) {
            callback(imagesGlobal);
        }
    };
    for (let i = 0; i < imagesToLoad; i++) {
        const image = loadImage(urls[i], onImageLoad);
        imagesGlobal.push(image);
    }
}
function loadImage(url, callback) {
    const image = new Image();
    image.src = url;
    image.onload = callback;
    return image;
}
//# sourceMappingURL=index.js.map