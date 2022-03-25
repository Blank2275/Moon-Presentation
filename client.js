function distance(x, y, z){
    return Math.sqrt(x * x + y * y + z * z);
}
var scene, camera, renderer;

scene = new THREE.Scene();

var ambient = new THREE.AmbientLight("white", 0.3);
var spotlight = new THREE.SpotLight("white", 1);
spotlight.castShadow = true;
spotlight.position.set(100, 0, 0);
spotlight.lookAt = new THREE.Vector3(0, 0, 0);
scene.add(ambient);
scene.add(spotlight);

//add sun
var size = 0.87 //size of sun at 100 units for 0.5 degrees of arc
var geometry = new THREE.SphereGeometry(size, 30, 30);
var cover = new THREE.MeshBasicMaterial({color: new THREE.Color(1, 1, 0.95)});
var mesh = new THREE.Mesh(geometry, cover);
mesh.position.set(100, 0, 0);
scene.add(mesh);

var loader = new THREE.TextureLoader();//texture loader

//add earth
var texture = loader.load("/earth-texture");
var size = 10 * 3.667;
var dist = 110.647 * 10;
var geometry = new THREE.SphereGeometry(size, 30, 30);
var cover = new THREE.MeshBasicMaterial({map:texture});
var mesh = new THREE.Mesh(geometry, cover);
mesh.position.set(0, 0, -dist);
scene.add(mesh);

var fov = 70;
var width = document.body.clientWidth;
var height = document.body.clientHeight;
camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 10000000);
camera.position.set(0, 0, 50);

//var controls = new THREE.OrbitControls(camera);
//controls.enablePan = false;
//controls.enableZoom = false;

renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

//populate scene
var geometry = new THREE.SphereGeometry(10, 90, 90);
var texture = loader.load("/moon-texture");
var displacement = loader.load("/moon-displacement");
var cover = new THREE.MeshPhongMaterial({map:texture, displacementMap:displacement, displacementScale:3});
var mesh = new THREE.Mesh(geometry, cover);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

//add stars

// var coords = altaz2xyz(-0.259, 2.758, 50);

// camera.position.set(coords[0], coords[1], coords[2]);
// camera.lookAt(0,0,0);
// zoomToPoint(3600, 1300);
// smoothZoomToPoint(3000, 2048);
//make the presentation
var presentation = new Presentation({
    "stops":[
        {
            "coords": [2700, 1700],
            "mode":"point"
        }, 
                {
            "coords": [400, 1300],
            "mode":"point"
        },
                {
            "coords": [500, 3200],
            "mode":"point", 
            "closeR": 15,
            "farR": 30
        }, 
        {
            "mode": "rotate"
        }
    ]
}, camera);
//presentation.smoothZoomToPoint(3000, 2048);

animate();

function animate() {
    renderer.render(scene, camera);
    presentation.update();
    requestAnimationFrame(animate);
}

function keyup(e){
    if (e.keyCode === 32){//space
        presentation.nextStop();
    }
}