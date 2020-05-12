import * as THREE from '../libs/three.module.js';
import { OrbitControls } from '../libs/OrbitControls.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';

var canvas,
    clock,
    mixer,
    actions,
    activeAction,
    previousAction,
    possibleAnims,
    currentlyAnimating,
    camera,
    scene,
    renderer,
    controls,
    model,
    idle,
    next,
    discoBall,
    raycaster = new THREE.Raycaster(),
    loaderAnim = document.querySelector('.loading');


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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    clock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera.position.set(0, 2, 12);
    camera.position.set(0, 4.3, 2);
    camera.rotateY(-Math.PI / 2);


    // lights
    var light = new THREE.HemisphereLight(white, yellow, 0.7);
    scene.add(light);

    light = new THREE.DirectionalLight(white, 0.5);
    light.position.set(-6, 2, 0);
    scene.add(light);

    light = new THREE.DirectionalLight(white, 0.05);
    light.position.set(6, 2, 0);
    scene.add(light);

    // room
    roomGeo(20, 10, 2);


    // flyer right
    var texture = new THREE.TextureLoader().load("../build/images/flyer002.png");
    var flyerRight = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(6, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture }));
    flyerRight.position.set(9.9, 4.5, 0);
    flyerRight.rotateY(- Math.PI / 2);
    flyerRight.name = "schedule";
    scene.add(flyerRight);


    // model

    var loader = new GLTFLoader();
    loader.load('../build/images/Binioufou_Final.gltf', function (gltf) {

        model = gltf.scene;
        let fileAnimations = gltf.animations;
        //model.scale.set(1, 1, 1);
        //model.position.z = 4;
        model.scale.set(0.4, 0.4, 0.4);
        model.position.set(9.5, 0, 7);
        model.rotateY(- Math.PI / 2);
        scene.add(model);
        //createMix(model, gltf.animations);

        mixer = new THREE.AnimationMixer(model);

        let clips = fileAnimations.filter(val => val.name !== 'walkturn');

        possibleAnims = clips.map(val => {
            let clip = THREE.AnimationClip.findByName(clips, val.name);
            clip = mixer.clipAction(clip);
            return clip;
        });
        let idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'walkturn');
        let nextAnim = THREE.AnimationClip.findByName(fileAnimations, 'knocked');
        idle = mixer.clipAction(idleAnim);
        next = mixer.clipAction(nextAnim);
        idle.play();

    }, undefined, function (e) {
        console.error(e);
    });

    // desk 
    var loader = new GLTFLoader();
    loader.load('../build/images/Desk1.gltf', function (gltf) {

        model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        model.position.set(6, 0.1, -6);
        model.rotateY(Math.PI);
        model.name = 'desk';
        scene.add(model);
        loaderAnim.className = "isloaded";
    }, undefined, function (e) {
        console.error(e);
    });

    window.addEventListener('resize', onWindowResize, false);

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
    planeRight.name = "planeRight"
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

function createMix(model, animations) {

    var anims = ['Waving_updated', 'Tada', 'shakefist_updated'];

    mixer = new THREE.AnimationMixer(model);

    actions = {};

    for (var i = 0; i < animations.length; i++) {
        var clip = animations[i];
        var action = mixer.clipAction(clip);
        actions[clip.name] = action;

        // if (anims.indexOf(clip.name) >= 0) {
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
        //    }
    }


    for (var i = 0; i < anims.length; i++) {
        createAnimCallback(anims[i]);
    }

    activeAction = actions['Tada'];
    activeAction.play();

}

function createAnimCallback(name) {

    api[name] = function () {

        fadeToAction(name, 0.2);

        mixer.addEventListener('finished', restoreState);

    };

}

function restoreState() {

    mixer.removeEventListener('finished', restoreState);

    fadeToAction(api.state, 0.2);

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
    console.log(intersects);
    if (intersects[0]) {
        var object = intersects[0].object;
        console.log(object.name);
        if (object.name === 'planeRight') {
            if (!currentlyAnimating) {
                currentlyAnimating = true;
                playModifierAnimation(idle, 0.25, next, 0.25);
            }
        }
        else if (object.name === 'schedule') {
            window.open('http://www.youtube.com', '_blank');
        }
        else if (object.name === 'disco') {
            location.href = "/";
        }
    }
}

function playOnClick() {
    let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
    playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
}

function playModifierAnimation(from, fSpeed, to, tSpeed) {
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    from.crossFadeTo(to, fSpeed, true);
    setTimeout(function () {
        from.enabled = true;
        to.crossFadeTo(from, tSpeed, true);
        currentlyAnimating = false;
    }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
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

    renderer.render(scene, camera);

}