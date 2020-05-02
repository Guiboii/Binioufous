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
    face;

var api = {
    state: 'idle'
};


init();
animate();

function init() {

    canvas = document.querySelector('#c');

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    // renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);


    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 10);

    // orbit controls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 0);
    controls.enableKeys = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.update();

    // colors
    let red = 0x9E0000;
    let red_wall = 0xFF553B;
    let yellow = 0xF2B233;
    let green = 0x1F6652;
    let white = 0xffffff;

    // lights
    //var light = new THREE.AmbientLight(white, 1);
    //scene.add(light);
    var light = new THREE.HemisphereLight(white, yellow);
    scene.add(light);

    light = new THREE.DirectionalLight(white, 0.2);
    light.position.set(0, 5, 5);
    // light.castShadow = true;
    scene.add(light);

    // walls
    var planeGeo = new THREE.PlaneBufferGeometry(20, 10);

    var planeTop = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: yellow }));
    planeTop.scale.y = 2;
    planeTop.position.y = 10;
    planeTop.rotateX(Math.PI / 2);
    scene.add(planeTop);

    var planeBottom = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: green }));
    planeBottom.scale.y = 2;
    planeBottom.rotateX(- Math.PI / 2);
    planeBottom.receiveShadow = true;
    scene.add(planeBottom);

    var planeFront = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeFront.position.z = 10;
    planeFront.position.y = planeFront.position.z / 2;
    planeFront.rotateY(Math.PI);
    scene.add(planeFront);

    var planeRight = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeRight.position.x = 10;
    planeRight.position.y = planeRight.position.x / 2;
    planeRight.rotateY(- Math.PI / 2);
    scene.add(planeRight);

    var planeBack = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeBack.position.z = - 10;
    planeBack.position.y = - planeBack.position.z / 2;
    scene.add(planeBack);

    var planeLeft = new THREE.Mesh(planeGeo, new THREE.MeshPhongMaterial({ color: red_wall }));
    planeLeft.position.x = - 10;
    planeLeft.position.y = - planeLeft.position.x / 2;
    planeLeft.rotateY(Math.PI / 2);
    scene.add(planeLeft);


    // model

    var loader = new GLTFLoader();
    loader.load('../build/images/Binioufou8.gltf', function (gltf) {

        model = gltf.scene;
        scene.add(model);

        model.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });

        model.scale.set(1, 1, 1);
        model.position.z = 1;
        createGUI(model, gltf.animations);

    }, undefined, function (e) {

        console.error(e);
    });


    window.addEventListener('resize', onWindowResize, false);



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

    activeAction = actions['Tada'];
    // activeAction.play();

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

}

//

function animate() {

    var dt = clock.getDelta();

    if (mixer) {
        mixer.update(dt);
    }


    requestAnimationFrame(animate);
    //controls.update();
    renderer.render(scene, camera);


}