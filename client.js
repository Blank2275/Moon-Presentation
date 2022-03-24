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

var controls = new THREE.OrbitControls(camera);
controls.enablePan = false;
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
zoomToPoint(7400, 1600);

animate();

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function zoomToPoint(x, y, width = 8192, height = 4096, r = 50) {
    var angle = point2angle(x, y, width, height);
    var pos = altaz2xyz(angle[0], angle[1], r);
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(0, 0, 0);
}

function point2angle(x, y, width, height) {
    //var relativeX = x - width / -2;
    var relativeY = (y - height / 2) * -1;
    
    //console.log((x - width / 2) / width * 2 * Math.PI);
    var az = (x - width / 2) / width * 2 * Math.PI;
    var alt = Math.asin(relativeY / height * 2);
    return [alt, az];
}

function altaz2xyz(alt, az, r){
    var x = r;
    var y = 0;
    var z = 0;
    
    //z (alt) 
    var xp = x * Math.cos(alt) - y * Math.sin(alt);
    var yp = x * Math.sin(alt) + y * Math.cos(alt);
    var zp = z;
    
    //y (az)
    var zdp = zp * Math.cos(az) - xp * Math.sin(az);
    var xdp = zp * Math.sin(az) + xp * Math.cos(az);
    var ydp = yp;

    return [xdp, ydp, zdp];
}