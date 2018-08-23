class Grid {
	constructor(element) {
		this.vis = element;
		this.size = 64;
		this.scale = 1000/64;
		this.zoom = 1300;
		this.mouseClickX;
		this.mouseClickY;
		this.mouseClicked = false;
		this.dx = 0;
		this.dy = 0;
		this.defx = 0;
		this.defy = -(Math.PI / 4);
		this.angleX = 0;
		this.angleY = Math.PI / 4;
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.objs = [];
		this.cubeGeometry = new THREE.BoxBufferGeometry( this.scale*0.8, this.scale, this.scale*0.8 );
		this.cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff80, overdraw: 0.5 } );
	}


	init(height, width) {
		this.camera = new THREE.PerspectiveCamera( 45, this.vis.innerWidth() / this.vis.innerHeight(), 1, 10000 );
		this.camera.position.set(this.zoom * Math.sin(this.angleX) * Math.cos(this.angleY),
								 this.zoom * Math.sin(this.angleY),
							 	 this.zoom * Math.cos(this.angleX) * Math.cos(this.angleY));
		this.camera.lookAt( new THREE.Vector3(0,0,0) );
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xf0f0f0 );
		
		// lights
		var ambientLight = new THREE.AmbientLight( 0x606060 );
		this.scene.add( ambientLight );
		
		var directionalLight = new THREE.DirectionalLight( 0xffffff );
		directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
		this.scene.add( directionalLight );
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( this.vis.devicePixelRatio );
		this.renderer.setSize( this.vis.innerWidth(), this.vis.innerHeight() );
		
		for (var i = -width/2; i < width/2 ; ++i){
			for (var j = -height/2; j < height/2 ; ++j){
				var voxel = new THREE.Mesh( this.cubeGeometry, this.cubeMaterial );
				voxel.position.copy( new THREE.Vector3( (i * this.scale) + (this.scale / 2), 0.0 + this.scale / 2, (j * this.scale) + (this.scale / 2)) );
				this.scene.add( voxel );
				this.objs.push(voxel);
			}
		}
		this.render();
		this.vis.append( this.renderer.domElement );
	}

	update_vis(height, width) {
		this.camera.aspect = this.vis.innerWidth() / this.vis.innerHeight();
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.vis.innerWidth(), this.vis.innerHeight() );
		for (var i = 0; i < this.objs.length; ++i) {
			this.scene.remove(this.objs[i]);
			this.objs[i].material.dispose();
			this.objs[i].geometry.dispose();
			this.objs[i] = undefined;
		}
		this.objs = [];
		for (var i = -width/2; i < width/2 ; ++i){
			for (var j = -height/2; j < height/2 ; ++j){
				var voxel = new THREE.Mesh( this.cubeGeometry, this.cubeMaterial );
				voxel.position.copy( new THREE.Vector3( (i * this.scale) + (this.scale / 2), 0.0 + this.scale / 2, (j * this.scale) + (this.scale / 2)) );
				this.scene.add( voxel );
				this.objs.push(voxel);
			}
		}
		this.render();
		this.vis.append( this.renderer.domElement );	
	}


	free_memory() {
		for (var i = 0; i < this.objs.length; ++i){
			delete(this.objs[i]);
		}
		this.objs = [];
		this.camera = null;
		this.scene = null;
		this.renderer = null;

	}

	rotate_vis(px, py) {	
		if (!this.mouseClicked)
			return;

		this.dx = px - this.mouseClickX;
		this.dy = this.mouseClickY - py;

		this.angleX = -((this.dx / 1000) * (Math.PI) + this.defx);
		this.angleY = -((this.dy / 1000) * (Math.PI) + this.defy);

		if (this.angleY <= 0){
			this.angleY = 0;
			this.mouseClickY = py;
			this.defy = 0;
		}
		if (this.angleY >= Math.PI / 2){
			this.angleY = Math.PI / 2;
			this.mouseClickY = py;
			this.defy = -Math.PI / 2;
		}

		this.camera.position.set( this.zoom * Math.sin(this.angleX) * Math.cos(this.angleY) , 
							 this.zoom * Math.sin(this.angleY), 
					 		 this.zoom * Math.cos(this.angleX) * Math.cos(this.angleY));
		this.camera.lookAt( new THREE.Vector3(0,0,0) );
		this.render();
	}

	render() {
		this.renderer.render( this.scene, this.camera );
	}

	zoom_vis(dy) {
		this.zoom += (Math.sign(dy) * 50);
		this.camera.position.set( this.zoom * Math.sin(-this.defx) * Math.cos(-this.defy) , 
							 this.zoom * Math.sin(-this.defy), 
					 		 this.zoom * Math.cos(-this.defx) * Math.cos(-this.defy));
		this.camera.lookAt( new THREE.Vector3(0,0,0) );
		this.render();
	}

	mouse_down() {
		this.mouseClicked = true;
		this.mouseClickX = event.clientX;
		this.mouseClickY = event.clientY;
	}

	mouse_up() {
		this.mouseClicked = false;
		this.defx = -this.angleX;
		this.defy = -this.angleY;
	}
}