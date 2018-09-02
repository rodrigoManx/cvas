look_at = new THREE.Vector3(0,100,0);
side = 1000;
bars_per_side = 64;
scale = side/bars_per_side;
cubeGeometry = new THREE.BoxBufferGeometry( scale*0.8, scale, scale*0.8 );
cubeMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff80, overdraw: 0.5 } );
sphere_geometry = new THREE.SphereGeometry( 10, 32, 32 );
y_axis_height = 300;

class GridBar {
	constructor(kernel_map_voxel, position) {
		this.bar = new THREE.Mesh( cubeGeometry, 
								   cubeMaterial );
		this.bar.position.copy( new THREE.Vector3( 
								(position.x * scale) + (scale / 2), 
								scale / 2, 
								(position.z * scale) + (scale / 2)) );
	}

	fix() {

	}
}


class Grid {
	constructor(element, explorarion) {
		this.vis = element;
		this.size = 64;
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
		this.bars = [];
		this.ticks = [];
		this.explorarion = explorarion;
		this.raycaster = new THREE.Raycaster();
		this.current_tick = undefined;
	}


	init(height, width, data) {
		this.camera = new THREE.PerspectiveCamera( 45, this.vis.innerWidth() / this.vis.innerHeight(), 1, 10000 );
		this.camera.position.set(this.zoom * Math.sin(this.angleX) * Math.cos(this.angleY),
								 this.zoom * Math.sin(this.angleY),
							 	 this.zoom * Math.cos(this.angleX) * Math.cos(this.angleY));
		this.camera.lookAt( look_at );
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
		
		this.draw_bars(height, width, data);
		this.draw_y_axis();
		this.draw_ticks();
		//kmvi -> kernel map voxel index
		
		this.render();
		this.vis.append( this.renderer.domElement );
	}


	draw_y_axis() {
		var material = new THREE.LineBasicMaterial({
			color: 0xf4c2c2
		});

		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( -(side/2), 0, side/2 ),
			new THREE.Vector3( -(side/2), y_axis_height, side/2 ),
		);

		var line = new THREE.Line( geometry, material );
		this.scene.add( line );
	}


	draw_ticks() {
		var ticks_spacing = y_axis_height / this.explorarion.exploration_level;
		for (var i = 0; i < this.explorarion.exploration_level; ++i){
			this.ticks.push( new THREE.Mesh( sphere_geometry, new THREE.MeshBasicMaterial( {color: 0xf4c2c2} )) );
			this.ticks[this.ticks.length - 1].position.copy(new THREE.Vector3(-(side/2), ticks_spacing * (i+1), side/2));
			this.scene.add( this.ticks[this.ticks.length - 1] );
		}
	}

	draw_bars(height, width, data) {
		for (var i = -width/2, kmvi = 0; i < width/2 ; ++i){
			for (var j = -height/2; j < height/2 ; ++j, ++kmvi){
				this.bars.push(new GridBar(data[kmvi], {'x': i, 'z': j}));
				this.scene.add(this.bars[this.bars.length - 1].bar);
			}
		}
	}


	update_vis(height, width, data) {
		this.camera.aspect = this.vis.innerWidth() / this.vis.innerHeight();
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.vis.innerWidth(), this.vis.innerHeight() );
		for (var i = 0; i < this.bars.length; ++i) {
			this.scene.remove(this.bars[i].bar);
			this.bars[i].bar.material.dispose();
			this.bars[i].bar.geometry.dispose();
			this.bars[i] = undefined;
		}
		this.bars = [];
		this.draw_bars(height, width, data);
		this.render();
		this.vis.append( this.renderer.domElement );	
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
		this.camera.lookAt( look_at );
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
		this.camera.lookAt( look_at );
		this.render();
	}

	mouse_down() {
		this.mouseClicked = true;
		this.mouseClickX = event.clientX;
		this.mouseClickY = event.clientY;
		var sceneMouseX = ((this.mouseClickX - this.vis.position().left) / this.vis.width()) * 2 - 1,
			sceneMouseY = -((this.mouseClickY - this.vis.position().top) / this.vis.height()) * 2 + 1,
			mouse = new THREE.Vector3(sceneMouseX, sceneMouseY); 
		
		this.raycaster.setFromCamera(mouse, this.camera);
		var intersects = this.raycaster.intersectObjects( this.ticks );
		
		
		if( intersects.length > 0 ) {
			if (this.current_tick != undefined)
				this.current_tick.object.material.color.setHex( 0xf4c2c2 );
			this.current_tick = intersects[0];
			this.current_tick.object.material.color.setHex( 0xff0000 );
		}
		
		this.render();
	}

	mouse_up() {
		this.mouseClicked = false;
		this.defx = -this.angleX;
		this.defy = -this.angleY;
	}
}