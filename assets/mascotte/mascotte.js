import * as THREE from '../libs/three.module.js';
import { GLTFLoader } from '../libs/GLTFLoader.js';
import { GUI } from '../libs/dat.gui.module.js';
import mascotteTxt from './img/ch14.jpg';

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
    model,
    face;

var api = {
    state: 'idle'
};

init();
animate();

function init() {

    canvas = document.querySelector('#c');

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.25, 100);
    camera.position.set(-3, 4, 12);
    camera.lookAt(new THREE.Vector3(0, 2, 0));

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe0e0e0);
    scene.fog = new THREE.Fog(0xe0e0e0, 20, 100);

    clock = new THREE.Clock();

    // lights

    var light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 50, 0);
    scene.add(light);

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 150, -150);
    scene.add(light);

    // ground

    var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    var grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);


    // sphere
    let geometry = new THREE.SphereGeometry(8, 32, 32);
    let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e
    let sphere = new THREE.Mesh(geometry, material);

    sphere.position.z = -15;
    sphere.position.y = 3;
    sphere.position.x = 1;
    scene.add(sphere);

    // model
    let mascotte_txt = new THREE.TextureLoader().load(mascotteTxt);
    mascotte_txt.flipY = false;
    const mascotte_mtl = new THREE.MeshPhongMaterial({ map: mascotte_txt, color: 0xffffff, skinning: true });

    var loader = new GLTFLoader();
    loader.load('../build/images/mascotte5.glb', function (gltf) {

        model = gltf.scene;
        scene.add(model);

        model.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                o.material = mascotte_mtl;
            }
        });

        model.scale.set(4, 4, 4);
        model.position.y = 1;
        createGUI(model, gltf.animations);

    }, undefined, function (e) {

        console.error(e);
    });


    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize, false);

}


function createGUI(model, animations) {

    var states = ['idle', 'samba'];
    var emotes = ['idle', 'samba'];

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

    activeAction = actions['idle'];
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

}

//

function animate() {

    var dt = clock.getDelta();

    if (mixer) {
        mixer.update(dt);
    }


    requestAnimationFrame(animate);

    renderer.render(scene, camera);


}