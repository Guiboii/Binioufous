import '../main/app.css';
import * as THREE from '../libs/three.module.js';
import { OrbitControls } from '../libs/OrbitControls.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';
import { GUI } from '../libs/dat.gui.module.js';

var canvas,
    clock,
    gui,
    mixer,
    actions,
    activeAction,
    previousAction,
    camera,
    scene,
    renderer,
    controls,
    model,
    idle,
    discoBall,
    raycaster = new THREE.Raycaster(),
    loaderAnim = document.getElementById('js-loader');;


var api = { state: 'idle' };
var red = 0x9E0000;
var red_wall = 0xBC2727;
var yellow = 0xF2B233;
var green = 0x1F6652;
var white = 0xffffff;
var black = 0x000000;

init();
animate();

function init() {

    canvas = document.querySelector('#c');

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    //renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);


    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(12, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 3.4, 1.97);
    camera.rotateY(Math.PI / 2);



    // lights
    var light = new THREE.AmbientLight(white, 1);
    // scene.add(light);

    var light = new THREE.HemisphereLight(white, yellow, 0.7);
    scene.add(light);

    light = new THREE.DirectionalLight(white, 0.5);
    light.position.set(-6, 2, 0);
    scene.add(light);

    light = new THREE.DirectionalLight(white, 0.1);
    light.position.set(6, 2, 0);
    scene.add(light);

    roomGeo(20, 10, 2);

    var carpetGeo = new THREE.CircleGeometry(5, 64);
    var carpet = new THREE.Mesh(
        carpetGeo,
        new THREE.MeshPhongMaterial({ color: yellow }));
    carpet.position.y = 0.01;
    carpet.rotateX(- Math.PI / 2);
    //carpet.receiveShadow = true;
    scene.add(carpet);

    //var cubeCamera = new THREE.CubeCamera(1, 100000, 128);
    //cubeCamera.renderTarget.texture.generateMipmaps = true;
    //cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
    //scene.add(cubeCamera);
    var discoMaterial = new THREE.MeshPhysicalMaterial({
        color: white,
        emissive: 0x939393,
        metalness: 1,
        roughness: 0.5,
        flatShading: true,
        reflectivity: 1.0,
        premultipliedAlpha: true
    });
    var discoGeometry = new THREE.SphereBufferGeometry(1.2, 24, 24);
    discoBall = new THREE.Mesh(discoGeometry, discoMaterial);
    discoBall.position.y = 7;
    discoBall.name = "disco";
    scene.add(discoBall);

    // flyer back
    var video = document.getElementById('video');
    // video.play();
    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    var flyerBack = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(4.5, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture }));
    flyerBack.position.set(-5.5, 5, -9.9);
    flyerBack.name = "joinUS";
    scene.add(flyerBack);


    // flyer right
    var texture = new THREE.TextureLoader().load("../build/images/flyer002.png");
    var flyerRight = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(6, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture }));
    flyerRight.position.set(9.9, 5, 2);
    flyerRight.rotateY(- Math.PI / 2);
    flyerRight.name = "schedule";
    scene.add(flyerRight);


    // model

    var loader = new GLTFLoader();
    loader.load('../build/images/Binioufou8.gltf', function (gltf) {

        model = gltf.scene;
        let fileAnimations = gltf.animations;
        model.name = "binioufou";
        scene.add(model);
        model.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        model.scale.set(0.15, 0.15, 0.15);
        model.position.set(-7.5, 2.7, 3.2);
        model.rotateY(Math.PI / 2);
        createGUI(model, gltf.animations);
        let idleAnim = THREE.AnimationClip.findByName(gltf.animations, 'Waving_updated');
        idle = mixer.clipAction(idleAnim);
        idle.play();

    }, undefined, function (e) {
        console.error(e);
    });

    // desk 
    var loader = new GLTFLoader();
    loader.load('../build/images/Desk1.gltf', function (gltf) {

        model = gltf.scene;
        model.name = "desk";
        scene.add(model);
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(6, 0.1, -6);
        model.rotateY(Math.PI);
        model.name = 'desk'
    }, undefined, function (e) {
        console.error(e);
    });
    // sound system 
    var loader = new GLTFLoader();
    loader.load('../build/images/SoundSystem.gltf', function (gltf) {

        model = gltf.scene;
        model.name = "music";
        scene.add(model);
        model.scale.set(0.7, 0.7, 0.7);
        model.position.set(-6, 0, 2);
        model.rotateY(Math.PI / 2);
    }, undefined, function (e) {
        console.error(e);
    });

    window.addEventListener('resize', onWindowResize, false);
    loaderAnim.remove();


}

function roomGeo(width, height, scaleY) {

    // walls
    var planeGeo = new THREE.PlaneBufferGeometry(width, height);

    var planeTop = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: yellow }));
    planeTop.scale.y = scaleY;
    planeTop.position.y = height;
    planeTop.rotateX(Math.PI / 2);
    scene.add(planeTop);

    var planeBottom = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: green }));
    planeBottom.scale.y = scaleY;
    planeBottom.rotateX(- Math.PI / 2);
    planeBottom.receiveShadow = true;
    scene.add(planeBottom);

    var planeFront = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeFront.position.z = height;
    planeFront.position.y = planeFront.position.z / 2;
    planeFront.rotateY(Math.PI);
    scene.add(planeFront);

    var planeRight = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeRight.position.x = height;
    planeRight.position.y = planeRight.position.x / 2;
    planeRight.rotateY(- Math.PI / 2);
    scene.add(planeRight);

    var planeBack = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeBack.position.z = - height;
    planeBack.position.y = - planeBack.position.z / 2;
    scene.add(planeBack);

    var planeLeft = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeLeft.position.x = - height;
    planeLeft.position.y = - planeLeft.position.x / 2;
    planeLeft.rotateY(Math.PI / 2);
    scene.add(planeLeft);

}

function createGUI(model, animations) {

    var states = ['shakefist_updated', 'Tada'];
    var emotes = ['Waving_updated', 'Tada'];

    gui = new GUI();

    mixer = new THREE.AnimationMixer(model);


    actions = {};

    for (var i = 0; i < animations.length; i++) {
        var clip = animations[i];
        var action = mixer.clipAction(clip);
        actions[clip.name] = action;

        if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {

            action.clampWhenFinished = true;
            action.loop = THREE.LoopRepeat;

        }

    }

    // states

    var statesFolder = gui.addFolder('States');

    var clipCtrl = statesFolder.add(api, 'state').options(states);

    clipCtrl.onChange(function () {

        fadeToAction(api.state, 0.5);

    });

    statesFolder.open();

    // emotes

    var emoteFolder = gui.addFolder('Emotes');

    function createEmoteCallback(name) {

        api[name] = function () {

            fadeToAction(name, 0.2);

            mixer.addEventListener('finished', restoreState);

        };

        emoteFolder.add(api, name);

    }

    function restoreState() {

        mixer.removeEventListener('finished', restoreState);

        fadeToAction(api.state, 0.2);

    }

    for (var i = 0; i < emotes.length; i++) {

        createEmoteCallback(emotes[i]);

    }


    // expressions

    // face = model.getObjectByName('Head_2');
    // var expressions = Object.keys(face.morphTargetDictionary);
    // var expressionFolder = gui.addFolder('Expressions');
    // for (var i = 0; i < expressions.length; {expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i]);}

    activeAction = actions['Waving_updated'];
    activeAction.play();

    // expressionFolder.open();

}

function fadeToAction(name, duration) {

    previousAction = activeAction;
    activeAction = actions[name];

    if (previousAction !== activeAction) {

        previousAction.fadeOut(duration);

    }

    activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();

}

//
window.addEventListener('click', e => raycast(e));
window.addEventListener('touchend', e => raycast(e, true));

function raycast(e, touch = false) {
    var mouse = {};
    if (touch) {
        mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
        mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
        mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
        mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects[0]) {
        var object = intersects[0].object;
        console.log(object.name)
        if (object.name === 'joinUS') {
            location.href = "/join";
        }
        else if (object.name === 'schedule') {
            location.href = "/schedule";
        }
    }
}


function animate() {


    requestAnimationFrame(animate);
    render();


}

function render() {

    var delta = clock.getDelta();
    // controls.update();
    if (mixer) {
        mixer.update(delta);
    }
    discoBall.rotation.y += 0.005;


    renderer.render(scene, camera);

}