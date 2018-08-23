var camera, scene, renderer;
var plane;
var mouse, raycaster;


var size = 64;
var scale = 1000/64;
var zoom = 1300;
var cubeGeometry = new THREE.BoxBufferGeometry( scale, scale, scale );
var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff80, overdraw: 0.5 } );

var mouseClickX, mouseClickY;
var mouseClicked = false;
var dx = 0, dy = 0, defx = 0, defy = -(Math.PI / 4), angleX = 0, angleY = 0;



init();
render();

function init(element) {
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set(0, zoom * Math.sin(Math.PI / 4), zoom * Math.cos(Math.PI / 4));
	camera.lookAt( new THREE.Vector3(0,0,0) );
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xf0f0f0 );
	
	// grid
	var gridHelper = new THREE.GridHelper( 1000, 64 );
	scene.add( gridHelper );
	//
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();
	var geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
	geometry.rotateX( - Math.PI / 2 );
	plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
	scene.add( plane );
	// lights
	var ambientLight = new THREE.AmbientLight( 0x606060 );
	scene.add( ambientLight );
	var directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
	scene.add( directionalLight );
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	
	for (var i = -size/2; i < size/2 ; ++i){
		for (var j = -size/2; j < size/2 ; ++j){
			var voxel = new THREE.Mesh( cubeGeometry, cubeMaterial );
			voxel.position.copy( new THREE.Vector3( (i * scale) + (scale / 2), 0.0 + scale / 2, (j * scale) + (scale / 2)) );
			scene.add( voxel );
		}
	}

	element.appendChild( renderer.domElement );
	element.addEventListener( 'mousemove', onDocumentMouseMove, false );
	element.addEventListener( 'mousedown', onDocumentMouseDown, false );
	element.addEventListener( 'mouseup', onDocumentMouseUp, false );
	element.addEventListener( 'mousewheel', onDocumentScroll, false);
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseUp(event) {
	event.preventDefault();
	mouseClicked = false;
	defx = -angleX;
	defy = -angleY;
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	
	if (!mouseClicked)
		return;

	dx = event.clientX - mouseClickX;
	dy = mouseClickY - event.clientY;

	angleX = -((dx / 1000) * (Math.PI) + defx);
	angleY = -((dy / 1000) * (Math.PI) + defy);

	if (angleY <= 0){
		angleY = 0;
		mouseClickY = event.clientY;
		defy = 0;
	}
	if (angleY >= Math.PI / 2){
		angleY = Math.PI / 2;
		mouseClickY = event.clientY;
		defy = -Math.PI / 2;
	}

	camera.position.set( zoom * Math.sin(angleX) * Math.cos(angleY) , 
						 zoom * Math.sin(angleY), 
				 		 zoom * Math.cos(angleX) * Math.cos(angleY));
	camera.lookAt( new THREE.Vector3(0,0,0) );
	render();
}

function onDocumentScroll(event){
	event.preventDefault();
	zoom = zoom += (Math.sign(event.deltaY) * 50);
	camera.position.set( zoom * Math.sin(-defx) * Math.cos(-defy) , 
						 zoom * Math.sin(-defy), 
				 		 zoom * Math.cos(-defx) * Math.cos(-defy));
	camera.lookAt( new THREE.Vector3(0,0,0) );
	render();
}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	mouseClicked = true;
	mouseClickX = event.clientX;
	mouseClickY = event.clientY;
}

function render() {
	renderer.render( scene, camera );
}