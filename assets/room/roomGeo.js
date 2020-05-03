import * as THREE from '../libs/three.module.js';

var scene;

// colors
var red = 0x9E0000;
var red_wall = 0xFF553B;
var yellow = 0xF2B233;
var green = 0x1F6652;
var white = 0xffffff;

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

// export { roomGeo };