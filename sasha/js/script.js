/*
   _____            __             _____     __
  / ___/____ ______/ /_  ____ _   |__  /____/ /
  \__ \/ __ `/ ___/ __ \/ __ `/    /_ </ __  / 
 ___/ / /_/ (__  ) / / / /_/ /   ___/ / /_/ /  
/____/\__,_/____/_/ /_/\__,_/   /____/\__,_/   

*/

/*----------  variables  ----------*/
var sasha, tete, yeux, materialTete, materialYeux, sphere, sphereMaterial, set3d, cubeCamera;
var textureYeux = new THREE.TextureLoader().load('img/yeux/yeux.jpg');
var textureTete = new THREE.TextureLoader().load('img/tetes/tete.jpg');
var textureFond = new THREE.TextureLoader().load('img/fonds/fond1.jpg');


/*----------  sky  ----------*/
cubeCamera = new THREE.CubeCamera(1, 1000, 256); // parameters: near, far, resolution
cubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter; // mipmap filter

/*
var urls = [ 'img/fonds/fond1.jpg','img/fonds/fond1.jpg','img/fonds/fond1.jpg','img/fonds/fond1.jpg','img/fonds/fond1.jpg','img/fonds/fond1.jpg' ];
var textureCube = THREE.ImageUtils.loadTextureCube(urls);
textureCube.format = THREE.RGBFormat;
*/



var matieres = [
	new THREE.MeshBasicMaterial({map: textureTete}),
	new THREE.MeshLambertMaterial({
		color: 0xffffff,
	}),
	new THREE.MeshPhongMaterial({
		color: 0xffffff,
		specular: 0xffffff,
		shininess: 20,
		vertexColors: THREE.FaceColors,
		shading: THREE.FlatShading
	}),
	new THREE.MeshPhongMaterial({
		color: 0x666666,
		specular: 0x666666,
		shininess: 10,
		shading: THREE.SmoothShading,
		map: textureTete,
		wireframe: true
	})
];


/*----------  Init  ----------*/

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById('scene').appendChild(renderer.domElement);
scene.add(cubeCamera);

var urls = [];
for (var i = 0; i < 6; i++) {
	urls[i] = 'img/fonds/fond1.jpg';
}
var cubemap = THREE.ImageUtils.loadTextureCube(urls);
cubemap.format = THREE.RGBFormat;
    var shader = THREE.ShaderLib['cube'];
    shader.uniforms['tCube'].value = cubemap;

    var SkyBoxMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    var skybox = new THREE.Mesh(
        new THREE.CubeGeometry(1000, 1000, 1000),
        SkyBoxMaterial);

    scene.add(skybox);



/*----------  Camera  ----------*/

var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 15;



/*==============================
=            LIGHTS            =
==============================*/

/*----------  hemilight  ----------*/

hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( 0, 500, 0 );
scene.add( hemiLight );


/*----------  dirLight  ----------*/

dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.position.set( -1, 1.75, .5 );
dirLight.position.multiplyScalar( 50 );
scene.add( dirLight );
dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

var d = 50;

dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = -0.0001;


/*=====  End of LIGHTS  ======*/



/*----------  Sphere background  ----------*/

var sphereGeometry = new THREE.SphereGeometry( 50, 60, 40 );
sphereGeometry.scale( - 1, 1, 1 );
sphereMaterial = new THREE.MeshBasicMaterial({map: textureFond});

sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

scene.add(sphere);



/*----------  Sasha mesh  ----------*/

sasha = new THREE.Group();

var loader = new THREE.JSONLoader();
loader.load("tete.json", function(geometry){
	materialTete = matieres[0];
	tete = new THREE.Mesh(geometry, materialTete);
	sasha.add(tete);
});
loader.load("yeux.json", function(geometry){
	materialYeux = new THREE.MeshBasicMaterial({
		envMaps: "reflection",
		reflectivity: 0.5,
		map: textureYeux
	});
	yeux = new THREE.Mesh(geometry, materialYeux);
	sasha.add(yeux);
});
scene.add(sasha);



/*----------  Orbit Control  ----------*/

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.2;
controls.minDistance = 3.5;
controls.maxDistance = 50;
controls.rotateSpeed = .2;
controls.enablePan = false;
controls.autoRotate = false; // switch to true to make it spin continually
controls.autoRotateSpeed = .5;


/*----------  Anaglyph init  ----------*/

var effect = new THREE.AnaglyphEffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);


/*----------  on window resize  ----------*/

window.onresize = function(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	effect.setSize( window.innerWidth, window.innerHeight );
};



/*----------  Render  ----------*/

function render(){
	controls.update(); // necessary for the damping of the orbit control to work
 	requestAnimationFrame( render );
	if(set3d)
		effect.render( scene, camera );
	else
		renderer.render( scene, camera );
  // hide an object before creating a cube map and show after
  sphere.visible = false;
  cubeCamera.updateCubeMap(renderer, scene);
  sphere.visible = true;
}
render();





/*===============================
=            DAT GUI            =
===============================*/

// Create an instance, which also creates a UI pane
var gui = new dat.GUI();

// My sample abject
var sashaCtrl = {
	couleurDesYeux: "yeux.jpg",
	visage: "tete.jpg",
	fond: "fond1.jpg",
	matiere: 0,
	activer3D: false
};

gui.add(sashaCtrl, "couleurDesYeux", {
	"couleur normale": "yeux.jpg",
	"yeux bleus": "yeux-bleus.jpg",
	"yeux verts": "yeux-verts.jpg",
	"yeux violets": "yeux-violets.jpg",
	"yeux oranges": "yeux-oranges.jpg",
	"yeux gris": "yeux-gris.jpg",
	"yeux rouges": "yeux-rouges.jpg",
	"yeux noirs": "yeux-noirs.jpg",
	"yeux de démon": "yeux-demon.jpg",
	"yeux du Diable": "yeux-diable.jpg"
}).onChange(function(newValueYeux){
	yeux.material.map = THREE.ImageUtils.loadTexture('img/yeux/' + newValueYeux);
});

gui.add(sashaCtrl, "visage", {
	"visage normal": "tete.jpg",
	"visage pâle": "tete-pale.jpg",
	"bronzé": "tete-bronze.jpg",
	"métisse": "tete-metisse.jpg",
	"noir": "tete-black.jpg",
	"martien": "tete-martien.jpg",
	"na'vi (avatar)": "tete-navi.jpg",
	"malade": "tete-malade.jpg",
	"pikachu": "tete-pikachu.jpg",
	"démon": "tete-demon.jpg",
	"Diable": "tete-diable.jpg"
}).onChange(function(newValueTete){
	tete.material.map = THREE.ImageUtils.loadTexture('img/tetes/' + newValueTete);
});

gui.add(sashaCtrl, "fond", {
	"ciel bleu": "fond1.jpg",
	"paysage ensoleillé": "fond2.jpg",
	"montagne nuageuse": "fond3.jpg",
	"tard dans la nuit": "fond4.jpg",
	"maison abandonnée": "fond5.jpg",
	"bâtiment abandonné": "fond6.jpg",
	"???": "fond7.jpg",
	"apocalypse": "fond8.jpg"
}).onChange(function(newValueFond){
	sphere.material.map = THREE.ImageUtils.loadTexture('img/fonds/' + newValueFond);
});

gui.add(sashaCtrl, "matiere", {
	"normal": 0,
	"blanc": 1,
	"brut": 2,
	"fil de fer": 3
}).onChange(function(newValueMat){
	if(newValueMat > 0){
		tete.material = matieres[newValueMat];
		yeux.material = matieres[newValueMat];
	}else{
		tete.material = materialTete;
		yeux.material = materialYeux;
	}
});

gui.add(sashaCtrl, "activer3D").onChange(function(newValue3d){
	set3d = newValue3d;
});


/*=====  End of DAT GUI  ======*/

