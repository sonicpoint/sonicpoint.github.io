import { SimpleProgram } from "./programs/complete/simpleProgram.js";
import { Camera } from "./camera.js";
import { Transformation } from "./transformation.js";
import { Globe } from "./geometries/globe.js";
import { Surface } from "./geometries/surface.js";
import { Lighting } from "./lighting/lighting.js";
import { DirectionalLight } from "./lighting/directionalLight.js";
import { SceneItem } from "./sceneItem.js";
import { Scene } from "./scene.js";
import { CancelToken } from "./cancelToken.js";
import { TransformationPath } from "./transformationPaths/transformationPath.js";
import { TransformationSet } from "./transformationPaths/transformationSet.js";
import { OrbiterAnimator } from "./animators/orbiterAnimator.js";
import { WalkerAnimator } from "./animators/walkerAnimator.js";
import { Torus } from "./geometries/torus.js";
import { PositionalLight } from "./lighting/positionalLight.js";
import { Material } from "./material.js";
import { Cuboid } from "./geometries/cuboid.js";
import { RoundedCuboid } from "./geometries/roundedCuboid.js";
import { SimpleBlinnPhongTextureProgram } from "./programs/complete/simpleBlinnPhongTextureProgram.js";
import { BlinnPhongOpacityProgram } from "./programs/experimental/blinnPhongOpacityProgram.js";
import { SimpleNormalMapProgram } from "./programs/complete/simpleNormalMapProgram.js";
import { SpecularMapPomProgram } from "./programs/complete/specularMapPomProgram.js";
const fpsSpan = document.querySelector("#fps");
const canvas = document.querySelector("#webGlCanvas");
const roomSize = 320;
const externalDepth = 250;
const imageInfosGlobal = [];
loadImages([
    { name: "poolBall", url: "./images/Ball11.jpg" },
    { name: "crate", url: "./images/crate3_texture.jpg" },
    { name: "beach_ball", url: "./images/BeachBallColor.jpg" },
    { name: "white", url: "./images/white.jpg" },
    { name: "externalwall_texture", url: "./images/Brick_Wall_017_basecolor.jpg" },
    { name: "externalwall_normal", url: "./images/Brick_Wall_017_normal.jpg" },
    { name: "externalfloor_texture", url: "./images/Grass_001_COLOR.jpg" },
    { name: "externalfloor_normal", url: "./images/Grass_001_NORM.jpg" },
    { name: "externalfloor_depth", url: "./images/Grass_001_DISP.png" },
    { name: "padded_texture", url: "./images/Sci-Fi_Padded_Fabric_002_basecolor.jpg" },
    { name: "padded_specular_map", url: "./images/Sci-Fi_Padded_Fabric_002_metallic.jpg" },
    { name: "padded_normal_map", url: "./images/Sci-Fi_Padded_Fabric_002_normal.jpg" },
    { name: "padded_height_map", url: "./images/Sci-Fi_Padded_Fabric_002_height.png" },
    { name: "marble", url: "./images/marble.jpg" },
    { name: "ceiling", url: "./images/ceiling.jpg" },
    { name: "tennisball_used", url: "./images/tennisball_used.jpg" },
    { name: "bump_texture", url: "./images/Wood_Pattern_Coffers_002_basecolor.jpg" },
    { name: "bump_normal", url: "./images/Wood_Pattern_Coffers_002_normal.jpg" },
    { name: "bump_depth", url: "./images/Wood_Pattern_Coffers_002_height.png" },
    { name: "floor_texture", url: "./images/Blue_Marble_002_COLOR.jpg" },
    { name: "floor_normal", url: "./images/Blue_Marble_002_NORM.jpg" },
    { name: "raisedfloor_texture", url: "./images/grey.jpg" },
    { name: "raisedfloor_normal", url: "./images/metal_normal.jpg" },
], (images) => init(images));
function init(imageInfos) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const glCtx = canvas.getContext("webgl2");
    if (!glCtx) {
        console.error("Unable to obtain WebGL context");
        return;
    }
    const material1 = new Material([0.8, 0.1, 0.1, 1], [0.4, 0.4, 0.4, 1], [0.8, 0.8, 0.8, 1], 100, getImage("poolBall", imageInfos));
    const material2 = new Material([0.1, 0.9, 0.1, 1], [0.4, 0.4, 0.4, 1], [0.3, 0.3, 0.3, 1], 20, getImage("beach_ball", imageInfos));
    const blueTransparentMaterial = new Material([0.6, 0.6, 1, 0.6], [0.1, 0.1, 0.1, 1], [0.7, 0.7, 0.7, 1], 200);
    const marble = new Material([0.7, 0.7, 0.7, 1], [0.2, 0.2, 0.2, 1], [4, 4, 4, 1], 250, getImage("marble", imageInfos));
    const externalWallMaterial = new Material([1, 1, 1, 1], [0.1, 0.1, 0.1, 0.1], [0, 0, 0, 0,], 1, getImage("externalwall_texture", imageInfos));
    externalWallMaterial.normalMap = getImage("externalwall_normal", imageInfos);
    const paddedMaterial = new Material([0.9, 0.9, 0.9, 1], [0.1, 0.1, 0.1, 1], [0.7, 0.7, 0.7, 1], 20, getImage("padded_texture", imageInfos));
    paddedMaterial.normalMap = getImage("padded_normal_map", imageInfos);
    paddedMaterial.specularMap = getImage("padded_specular_map", imageInfos);
    paddedMaterial.heightMap = getImage("padded_height_map", imageInfos);
    const skyInfo = createSkyInfo(glCtx, roomSize, externalDepth);
    const externalFrontWallInfo = createExternalFrontWallInfo(glCtx, roomSize, externalDepth, false, externalWallMaterial);
    const externalWallsInfo = createExternalWallsInfo(glCtx, roomSize, externalDepth, externalWallMaterial);
    const wallsInfo = createWallsInfo(glCtx, roomSize, paddedMaterial);
    const floorInfo = createFloorInfo(glCtx, roomSize, false, getImage("floor_texture", imageInfos), getImage("floor_normal", imageInfos));
    const extFloorInfo = createExternalFloorInfo(glCtx, roomSize, externalDepth, getImage("externalfloor_texture", imageInfos), getImage("externalfloor_normal", imageInfos), getImage("externalfloor_depth", imageInfos));
    const raisedFloorInfo = createRaisedFloorInfo(glCtx, roomSize, false, getImage("raisedfloor_texture", imageInfos), getImage("raisedfloor_normal", imageInfos));
    const ceilingInfo = createCeilingInfo(glCtx, roomSize, getImage("bump_texture", imageInfos), getImage("bump_normal", imageInfos), getImage("bump_depth", imageInfos));
    const shape1Info = createShape1Info(glCtx, 50, material1);
    const shape2Info = createShape2Info(glCtx, 50, material2);
    const shape3Info = createShape3Info(glCtx, 50, material1);
    const shape4Info = createShape4Info(glCtx, 50, material2);
    const shape5Info = createShape5Info(glCtx, 50, blueTransparentMaterial);
    const posLightInfo = createPosLightInfo(glCtx, 5, getImage("white", imageInfos));
    const camera = new Camera(glCtx, Math.PI / 4, 0.1, 20000, 0, true);
    const lighting = new Lighting();
    lighting.directionalLights.push(new DirectionalLight([0, 0, 1]));
    lighting.positionalLights.push(new PositionalLight([0, 0, 0], null, [0.4, 0.4, 0.4]));
    const scene = new Scene(glCtx, camera, lighting, [
        skyInfo.sceneItem, skyInfo.sceneItemWireframe,
        externalFrontWallInfo.sceneItem, externalFrontWallInfo.sceneItemWireframe,
        externalWallsInfo.sceneItem, externalWallsInfo.sceneItemWireframe,
        wallsInfo.sceneItem, wallsInfo.sceneItemWireframe,
        extFloorInfo.sceneItem, extFloorInfo.sceneItemWireframe,
        floorInfo.sceneItem, floorInfo.sceneItemWireframe,
        raisedFloorInfo.sceneItem, raisedFloorInfo.sceneItemWireframe,
        ceilingInfo.sceneItem, ceilingInfo.sceneItemWireframe,
        shape1Info.sceneItem, shape1Info.sceneItemWireframe,
        shape2Info.sceneItem, shape2Info.sceneItemWireframe,
        shape3Info.sceneItem, shape3Info.sceneItemWireframe,
        shape4Info.sceneItem, shape4Info.sceneItemWireframe,
        shape5Info.sceneItem, shape5Info.sceneItemWireframe,
        posLightInfo.sceneItem,
    ], [
        shape1Info.transformationPath,
        shape2Info.transformationPath,
        shape3Info.transformationPath,
        shape4Info.transformationPath,
        shape5Info.transformationPath,
    ], true);
    let cancelToken = new CancelToken();
    let showWireframe = true;
    let showTexture = true;
    let showSolids = true;
    let ambient = 0;
    setUpCheckbox("showWireframe", (value) => { showWireframe = value; updateSceneItems(); });
    setUpCheckbox("animate", (value) => value ? scene.resumeAnimation() : scene.suspendAnimation());
    setUpCheckbox("showTexture", (value) => { showTexture = value; updateSceneItems(); });
    setUpCheckbox("showSolids", (value) => { showSolids = value; updateSceneItems(); });
    setUpSlider("dirX", (value) => lighting.directionalLights[0].lightDirection[0] = value);
    setUpSlider("dirY", (value) => lighting.directionalLights[0].lightDirection[1] = value);
    setUpSlider("dirZ", (value) => lighting.directionalLights[0].lightDirection[2] = value);
    setUpSlider("posX", (value) => {
        posLightInfo.sceneItem.applyTransformation(new Transformation().translate(-lighting.positionalLights[0].lightPosition[0], 0, 0));
        lighting.positionalLights[0].lightPosition[0] = value * roomSize / 2;
        posLightInfo.sceneItem.applyTransformation(new Transformation().translate(lighting.positionalLights[0].lightPosition[0], 0, 0));
    });
    setUpSlider("posY", (value) => {
        posLightInfo.sceneItem.applyTransformation(new Transformation().translate(0, -lighting.positionalLights[0].lightPosition[1], 0));
        lighting.positionalLights[0].lightPosition[1] = value * roomSize / 2;
        posLightInfo.sceneItem.applyTransformation(new Transformation().translate(0, lighting.positionalLights[0].lightPosition[1], 0));
    });
    setUpSlider("posZ", (value) => {
        posLightInfo.sceneItem.applyTransformation(new Transformation().translate(0, 0, -lighting.positionalLights[0].lightPosition[2]));
        lighting.positionalLights[0].lightPosition[2] = value * roomSize / 2;
        posLightInfo.sceneItem.applyTransformation(new Transformation().translate(0, 0, lighting.positionalLights[0].lightPosition[2]));
    });
    setUpSlider("mat1Specular", (value) => material1.specular = [value, value, value, 1]);
    setUpSlider("mat1Shininess", (value) => material1.shininess = value);
    setUpSlider("mat2Specular", (value) => material2.specular = [value, value, value, 1]);
    setUpSlider("mat2Shininess", (value) => material2.shininess = value);
    setUpSlider("ambient", (value) => {
        ambient = value;
        lighting.positionalLights[0].ambient = [value, value, value, 1];
        material1.ambient = [value, value, value, 1];
        material2.ambient = [value, value, value, 1];
        marble.ambient = [value, value, value, 1];
        updateSceneItems();
    });
    setUpRadio("orbiter", value => {
        cancelToken.cancelledByClient = true;
        cancelToken = new CancelToken();
        getAnimator(value).animate();
        ;
    });
    setUpRadio("walker", value => {
        cancelToken.cancelledByClient = true;
        cancelToken = new CancelToken();
        getAnimator(!value).animate();
        ;
    });
    function getAnimator(isOrbiter) {
        camera.reset();
        if (isOrbiter) {
            camera.moveZ(600);
        }
        else {
            camera.transform(new Transformation().translate(0, -roomSize / 2 + 100, 600));
        }
        return isOrbiter ?
            new OrbiterAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas) :
            new WalkerAnimator(scene, camera, cancelToken, (fps) => { fpsSpan.textContent = fps.toString(); }, canvas);
    }
    function updateSceneItems() {
        skyInfo.sceneItemWireframe.isVisible = showWireframe;
        externalWallsInfo.sceneItemWireframe.isVisible = showWireframe;
        externalFrontWallInfo.sceneItemWireframe.isVisible = showWireframe;
        wallsInfo.sceneItemWireframe.isVisible = showWireframe;
        floorInfo.sceneItemWireframe.isVisible = showWireframe;
        extFloorInfo.sceneItemWireframe.isVisible = showWireframe;
        raisedFloorInfo.sceneItemWireframe.isVisible = showWireframe;
        ceilingInfo.sceneItemWireframe.isVisible = showWireframe;
        shape1Info.sceneItemWireframe.isVisible = showWireframe;
        shape2Info.sceneItemWireframe.isVisible = showWireframe;
        shape3Info.sceneItemWireframe.isVisible = showWireframe;
        shape4Info.sceneItemWireframe.isVisible = showWireframe;
        shape5Info.sceneItemWireframe.isVisible = showWireframe;
        skyInfo.sceneItem.isVisible = showSolids;
        externalWallsInfo.sceneItem.isVisible = showSolids;
        externalFrontWallInfo.sceneItem.isVisible = showSolids;
        wallsInfo.sceneItem.isVisible = showSolids;
        floorInfo.sceneItem.isVisible = showSolids;
        extFloorInfo.sceneItem.isVisible = showSolids;
        raisedFloorInfo.sceneItem.isVisible = showSolids;
        ceilingInfo.sceneItem.isVisible = showSolids;
        shape1Info.sceneItem.isVisible = showSolids;
        shape2Info.sceneItem.isVisible = showSolids;
        shape3Info.sceneItem.isVisible = showSolids;
        shape4Info.sceneItem.isVisible = showSolids;
        shape5Info.sceneItem.isVisible = showSolids;
        posLightInfo.sceneItem.isVisible = showSolids;
        // externalWallsInfo.program.showTexture = showTexture;
        // externalFrontWallInfo.program.showTexture = showTexture;
        // externalFrontWallInfo.program.ambient = ambient;
        // wallsInfo.program.showTexture = showTexture;
        // wallsInfo.program.ambient = ambient;
        // ceilingInfo.program.showTexture = showTexture;
        // ceilingInfo.program.ambient = ambient;
        // floorInfo.program.showTexture = showTexture;
        // extFloorInfo.program.showTexture = showTexture;
        // raisedFloorInfo.program.showTexture = showTexture;
        //    floorInfo.program.ambient = ambient;
        // shape1Info.program.showTexture = showTexture;
        // shape2Info.program.showTexture = showTexture;
        // shape3Info.program.showTexture = showTexture;
        // shape4Info.program.showTexture = showTexture;
    }
}
function loadImages(imageInfos, callback) {
    let imagesToLoad = imageInfos.length;
    // Called each time an image finished loading.
    const onImageLoad = () => {
        --imagesToLoad;
        // If all the images are loaded call the callback.
        if (imagesToLoad === 0) {
            callback(imageInfosGlobal);
        }
    };
    for (let i = 0; i < imagesToLoad; i++) {
        const image = loadImage(imageInfos[i].url, onImageLoad);
        imageInfosGlobal.push({
            name: imageInfos[i].name,
            image
        });
    }
}
function loadImage(url, callback) {
    const image = new Image();
    image.src = url;
    image.onload = callback;
    return image;
}
function getImage(name, imageInfos) {
    return imageInfos.find(imageInfo => imageInfo.name === name).image;
}
function setUpSlider(elementId, inputFunc, initialise) {
    const slider = document.getElementById(elementId);
    initialise = initialise === undefined ? true : initialise;
    // Perform any initialisation
    if (initialise) {
        inputFunc(parseFloat(slider.value));
    }
    slider.oninput = () => {
        inputFunc(parseFloat(slider.value));
    };
}
function setUpCheckbox(elementId, changeFunc, initialise) {
    const checkbox = document.getElementById(elementId);
    initialise = initialise === undefined ? true : initialise;
    // Perform any initialisation
    if (initialise) {
        changeFunc(checkbox.checked);
    }
    checkbox.onclick = () => {
        changeFunc(checkbox.checked);
    };
}
function setUpRadio(elementId, changeFunc, initialise) {
    const radio = document.getElementById(elementId);
    initialise = initialise === undefined ? true : initialise;
    // Perform any initialisation
    if (initialise) {
        changeFunc(radio.checked);
    }
    radio.onchange = () => {
        changeFunc(radio.checked);
    };
}
function createExternalFrontWallInfo(glCtx, size, width, isWireframe, material) {
    const external = createExternalFrontWall(size, width, false);
    const program = new SimpleNormalMapProgram(glCtx, external, material);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const externalWireframe = createExternalFrontWall(size, width, true);
    const programWireframe = new SimpleProgram(glCtx, externalWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createSkyInfo(glCtx, size, width) {
    const sky = new Surface(size + width * 2, size + width, false);
    sky.applyTransformation(new Transformation().rotateX(Math.PI / 2));
    sky.applyTransformation(new Transformation().translate(0, size / 2 + width, externalDepth / 2 + size));
    const program = new SimpleProgram(glCtx, sky, [0.8, 0.8, 1, 1]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const skyWireframe = new Surface(size + width * 2, size + width, true);
    skyWireframe.applyTransformation(new Transformation().rotateX(Math.PI / 2));
    skyWireframe.applyTransformation(new Transformation().translate(0, size / 2 + width, externalDepth / 2 + size));
    const programWireframe = new SimpleProgram(glCtx, skyWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createExternalWallsInfo(glCtx, size, depth, material) {
    const walls = createExternalWalls(size, depth, false);
    const program = new SimpleNormalMapProgram(glCtx, walls, material);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const wallsWireframe = createExternalWalls(size - 0.2, depth, true);
    const programWireframe = new SimpleProgram(glCtx, wallsWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createWallsInfo(glCtx, size, material) {
    const walls = createWalls(size, false);
    const program = new SpecularMapPomProgram(glCtx, walls, material, 1, 32, 0.05);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const wallsWireframe = createWalls(size - 0.2, true);
    const programWireframe = new SimpleProgram(glCtx, wallsWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createFloorInfo(glCtx, size, isWireframe, image, normalMap) {
    const floor = new Surface(size, size, false);
    floor.applyTransformation(new Transformation().translate(0, -size / 2, 0).rotateX(Math.PI / -2));
    const program = new SimpleProgram(glCtx, floor, [0.5, 0.5, 0.5, 1]);
    // const program = new NormalMapProgram(glCtx, floor, [0.5, 0.5, 0.5, 1], image, normalMap, null);
    //  const program = new BlinnPhongProgram(glCtx, floor, material);
    //  const program = new LambertianReflectionProgram(glCtx, floor, [0.9, 0.9, 0.9, 1], image);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const floorWireframe = new Surface(size, size, true);
    floorWireframe.applyTransformation(new Transformation().translate(0, -size / 2, 0).rotateX(Math.PI / -2));
    const programWireframe = new SimpleProgram(glCtx, floorWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createExternalFloorInfo(glCtx, size, externalDepth, image, normalMap, depthMap) {
    const externalFloorSize = size + externalDepth;
    const floor = new Surface(externalFloorSize + externalDepth, externalFloorSize, false, 5);
    floor.applyTransformation(new Transformation().translate(0, -size / 2, (externalFloorSize + size) / 2).rotateX(Math.PI / -2));
    // const program = new ParallaxOcclusionMapProgram(glCtx, floor, [0.5, 0.5, 0.5, 1], image, normalMap, depthMap, 32, 0.04);
    const program = new SimpleProgram(glCtx, floor, [0.5, 0.5, 0.5, 1]);
    //  const program = new BlinnPhongProgram(glCtx, floor, material);
    //  const program = new LambertianReflectionProgram(glCtx, floor, [0.9, 0.9, 0.9, 1], image);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const floorWireframe = new Surface(externalFloorSize + externalDepth, externalFloorSize, true);
    floorWireframe.applyTransformation(new Transformation().translate(0, -size / 2, (externalFloorSize + size) / 2).rotateX(Math.PI / -2));
    const programWireframe = new SimpleProgram(glCtx, floorWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createRaisedFloorInfo(glCtx, size, isWireframe, image, normalMap) {
    const floor = new Cuboid(size / 3, 1, size * 3, false);
    //  const floor = new Surface(size, size, false);
    floor.applyTransformation(new Transformation().translate(0, -size / 2 + 1, size));
    //  const program = new NormalMapProgram(glCtx, floor, [0.5, 0.5, 0.5, 1], image, normalMap, null);
    const program = new SimpleProgram(glCtx, floor, [0.5, 0.5, 0.5, 1]);
    //  const program = new BlinnPhongProgram(glCtx, floor, material);
    // const program = new LambertianReflectionProgram(glCtx, floor, [0.9, 0.9, 0.9, 1], image);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const floorWireframe = new Cuboid(size / 3, 1, size * 3, true);
    floorWireframe.applyTransformation(new Transformation().translate(0, -size / 2 + 1, size));
    const programWireframe = new SimpleProgram(glCtx, floorWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createCeilingInfo(glCtx, size, image, normalMap, depthMap) {
    const ceiling = new Surface(size, size, false, 2);
    ceiling.applyTransformation(new Transformation().rotateX(Math.PI / 2).translate(0, 0, -size / 2));
    // const program = new NormalMapProgram(glCtx, ceiling, [0.5, 0.5, 0.5, 1], image, normalMap, depthMap);
    const program = new SimpleProgram(glCtx, ceiling, [0.5, 0.5, 0.5, 1]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true);
    const ceilingWireframe = new Surface(size, size, true);
    ceilingWireframe.applyTransformation(new Transformation().rotateX(Math.PI / 2).translate(0, 0, -size / 2));
    const programWireframe = new SimpleProgram(glCtx, ceilingWireframe, [0, 0, 0, 1]);
    const sceneItemWireframe = new SceneItem(programWireframe, glCtx.LINES, true);
    return {
        program,
        sceneItem,
        programWireframe,
        sceneItemWireframe
    };
}
function createShape1Info(glCtx, size, material) {
    const shape = new Globe(size, size, 60, false);
    shape.applyTransformation(new Transformation().translate(-75, -75, -75));
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().translate(-75, -75, -75).rotateY(Math.PI / 900).rotateX(Math.PI / 360).translate(75, 75, 75), 1));
    const program = new SimpleBlinnPhongTextureProgram(glCtx, shape, material);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, material, transformationPath);
    const shapeWireframe = new Globe(size, size, 60, true);
    shapeWireframe.applyTransformation(new Transformation().translate(-75, -75, -75));
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
function createShape2Info(glCtx, size, material) {
    const shape = new Globe(size, size, 60, false);
    shape.applyTransformation(new Transformation().translate(75, -75, -75));
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().translate(75, -75, -75).rotateY(Math.PI / 900).rotateX(Math.PI / 360).translate(-75, 75, 75), 1));
    const program = new SimpleBlinnPhongTextureProgram(glCtx, shape, material);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, material, transformationPath);
    const shapeWireframe = new Globe(size, size, 60, true);
    shapeWireframe.applyTransformation(new Transformation().translate(75, -75, -75));
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
function createShape3Info(glCtx, size, material) {
    const shape = new Torus(20, 20, 40, 30, 50, false);
    shape.applyTransformation(new Transformation().translate(-75, 75, -75));
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().translate(-75, 75, -75).rotateX(Math.PI / -180).translate(75, -75, 75), 1));
    const program = new SimpleBlinnPhongTextureProgram(glCtx, shape, material);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, material, transformationPath);
    const shapeWireframe = new Torus(20, 20, 40, 30, 50, true);
    shapeWireframe.applyTransformation(new Transformation().translate(-75, 75, -75));
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
function createShape4Info(glCtx, size, material) {
    const shape = new Torus(20, 20, 40, 30, 50, false);
    shape.applyTransformation(new Transformation().translate(75, 75, -75));
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().translate(75, 75, -75).rotateY(Math.PI / -900).rotateX(Math.PI / -360).translate(-75, -75, 75), 1));
    const program = new SimpleBlinnPhongTextureProgram(glCtx, shape, material);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, material, transformationPath);
    const shapeWireframe = new Torus(20, 20, 40, 30, 50, true);
    shapeWireframe.applyTransformation(new Transformation().translate(75, 75, -75));
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
function createShape5Info(glCtx, size, material) {
    const shape = new RoundedCuboid(100, 30, 20, false, true);
    shape.addGeometry(new RoundedCuboid(100, 30, 20, false));
    shape.applyTransformation(new Transformation().translate(0, 0, 75));
    const transformationPath = new TransformationPath();
    transformationPath.addTransformationSet(new TransformationSet(new Transformation().translate(0, 0, 75).rotateY(Math.PI / -180).rotateZ(Math.PI / -720).translate(0, 0, -75), 1));
    const program = new BlinnPhongOpacityProgram(glCtx, shape, material);
    // program.opacity = 0.8;
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, material, transformationPath);
    const shapeWireframe = new RoundedCuboid(100, 30, 20, true);
    shapeWireframe.applyTransformation(new Transformation().translate(0, 0, 75));
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
function createPosLightInfo(glCtx, size, image) {
    const posLight = new Globe(size, size, 10, false);
    const transformationPath = new TransformationPath();
    const program = new SimpleProgram(glCtx, posLight, [1, 1, 1, 1]);
    const sceneItem = new SceneItem(program, glCtx.TRIANGLES, true, null, transformationPath);
    return {
        program,
        sceneItem,
        programWireframe: null,
        sceneItemWireframe: null,
        transformationPath
    };
}
function createExternalWalls(size, width, isWireframe) {
    const externalWallSize = size + width;
    const textureRatio = 7;
    // Left
    const walls = new Surface(externalWallSize, externalWallSize, isWireframe, textureRatio);
    walls.applyTransformation(new Transformation().translate(0, 0, -externalWallSize - width));
    walls.applyTransformation(new Transformation().rotateY(Math.PI));
    // Right
    walls.addGeometry(new Surface(externalWallSize, externalWallSize, isWireframe, textureRatio));
    walls.applyTransformation(new Transformation().rotateY(-Math.PI / 2));
    walls.applyTransformation(new Transformation().translate((externalWallSize + width) / 2, 0, externalWallSize / 2));
    // // Back
    walls.addGeometry(new Surface(externalWallSize + width, externalWallSize, isWireframe, textureRatio * ((externalWallSize + width) / externalWallSize)));
    walls.applyTransformation(new Transformation().rotateY(Math.PI));
    walls.applyTransformation(new Transformation().translate(0, width / 2, externalWallSize + size / 2));
    return walls;
}
function createWalls(size, isWireframe) {
    // Left
    const walls = new Surface(size, size, isWireframe, 1);
    walls.applyTransformation(new Transformation().rotateY(Math.PI));
    walls.applyTransformation(new Transformation().translate(0, 0, size));
    // Right
    walls.addGeometry(new Surface(size, size, isWireframe, 1));
    walls.applyTransformation(new Transformation().translate(0, 0, size / 2).rotateY(Math.PI / 2).translate(0, 0, -size / 2));
    // Far
    walls.addGeometry(new Surface(size, size, isWireframe, 1));
    walls.applyTransformation(new Transformation().translate(0, 0, size / -2));
    return walls;
}
function createExternalFrontWall(size, width, isWireframe) {
    const textureRatio = 10;
    // Left
    const external = new Surface(width, size, isWireframe, width / (size + width * 2) * textureRatio);
    external.applyTransformation(new Transformation().translate(-size - width, 0, 0));
    // Right
    external.addGeometry(new Surface(width, size, isWireframe, width / (size + width * 2) * textureRatio));
    external.applyTransformation(new Transformation().translate(size / 2 + width / 2, -size / 2 - width / 2, 0));
    // Top
    external.addGeometry(new Surface(size + width * 2, width, isWireframe, textureRatio));
    external.applyTransformation(new Transformation().translate(0, size / 2 + width / 2, size / 2));
    return external;
}
//# sourceMappingURL=design.js.map