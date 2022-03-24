var scene, camera, renderer;

scene = new THREE.Scene();

var ambient = new THREE.AmbientLight("white", 0.3);
var point = new THREE.PointLight("white", 1);
point.castShadow = true;
point.position.set(100, 0, 0);
scene.add(ambient);
scene.add(point);

var fov = 70;
var width = window.innerWidth
var height = window.innerHeight
camera = new THREE.PerspectiveCamera(fov, width/height, 0.1, 100000);
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
var loader = new THREE.TextureLoader();
var texture = loader.load("/moon-texture");
var displacement = loader.load("/moon-displacement");
var cover = new THREE.MeshPhongMaterial({map:texture, displacementMap:displacement, displacementScale:3});
var mesh = new THREE.Mesh(geometry, cover);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// var coords = altaz2xyz(-0.259, 2.758, 50);

// camera.position.set(coords[0], coords[1], coords[2]);
// camera.lookAt(0,0,0);
// zoomToPoint(3600, 1300);
// smoothZoomToPoint(3000, 2048);
//make the presentation
var presentation = new Presentation({
    "stops":[
        {
            "coords": [3800, 1700]
        }, 
                {
            "coords": [400, 1300]
        },
                {
            "coords": [500, 3200]
        }, 
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