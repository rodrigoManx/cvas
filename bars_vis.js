lookAt = new THREE.Vector3(0,200,0);
side = 1000;
barsPerSide = 64;
scale = side / barsPerSide;
sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
yAxisHeight = 400;

class GridBar {
	constructor(kernelMapVoxel, position, bars, row, col) {
		this.label = kernelMapVoxel;
		var barHeight = bars.getBarHeight(kernelMapVoxel);
		this.bar = new THREE.Mesh( new THREE.BoxBufferGeometry( scale*0.9, barHeight, scale*0.9 ), 
								   new THREE.MeshStandardMaterial( { color: 0x00ff80, transparent: true, opacity:1, overdraw: 0.5 } ) );
		this.bar.position.copy( new THREE.Vector3( 
								(position.x * scale) + (scale / 2), 
								barHeight / 2, 
								(position.z * scale) + (scale / 2)) );
		this.row = row;
		this.col = col;
	}
}


class GridTick {
	constructor(height, width, ticksSpacing, i){
		this.tick = new THREE.Mesh(sphereGeometry,
								   new THREE.MeshBasicMaterial( {color: 0xf4c2c2} ));
		this.tick.position.copy(new THREE.Vector3(-((scale*width)/2), ticksSpacing * (i+1), (scale*height)/2));
	}
}

class BarsVis {
	constructor(element, exploration) {
		this.vis = element;
		this.zoom = 1300;
		this.mouseClickX;
		this.mouseClickY;
		this.mouseClicked = false;
		this.defx = 0;
		this.defy = -(Math.PI / 4);
		this.angleX = 0;
		this.angleY = Math.PI / 4;
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.bars = [];
		this.ticks = [];
		this.ticksForRaycasting = []
		this.exploration = exploration;
		this.raycaster = new THREE.Raycaster();
		this.currentTick = undefined;
		this.yAxis = undefined;
		this.labels = [];
		this.ticksSpacing = 0;
	}


	init() {
		this.camera = new THREE.PerspectiveCamera( 45, this.vis.innerWidth() / this.vis.innerHeight(), 1, 10000 );
		this.camera.position.set(this.zoom * Math.sin(this.angleX) * Math.cos(this.angleY),
								 this.zoom * Math.sin(this.angleY),
							 	 this.zoom * Math.cos(this.angleX) * Math.cos(this.angleY));
		this.camera.lookAt( lookAt );
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xf0f0f0 );
		
		// lights
		var ambientLight = new THREE.AmbientLight( 0x606060 );
		this.scene.add( ambientLight );
		
		var directionalLight = new THREE.DirectionalLight( 0xffffff );
		directionalLight.position.set( 0, 0.75, 1 ).normalize();
		this.scene.add( directionalLight );
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( this.vis.devicePixelRatio );
		this.renderer.setSize( this.vis.innerWidth(), this.vis.innerHeight() );
		
		this.render();
		this.vis.append( this.renderer.domElement );
	}


	getBarHeight(label){
		var index = 0;
		if (label !== 0)
			index = this.labels.indexOf(label) + 1;
		return index * this.ticksSpacing;
	}

	drawYAxis(height, width) {
		var material = new THREE.LineBasicMaterial({ color: 0xf4c2c2 });
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3( -((scale*width)/2), 0, (scale*height)/2 ),
			new THREE.Vector3( -((scale*width)/2), yAxisHeight, (scale*height)/2 ),
		);

		this.yAxis = new THREE.Line( geometry, material );
		this.scene.add( this.yAxis );
		this.drawTicks(height, width);
	}


	drawTicks(height, width) {
		this.labels = this.exploration.getLabels().sort();
		this.ticksSpacing = yAxisHeight / this.labels.length;
		for (var i = 0; i < this.labels.length; ++i){
			this.ticks.push( new GridTick(height, width, this.ticksSpacing, i));
			this.ticksForRaycasting.push(this.ticks[this.ticks.length - 1].tick);
			this.scene.add( this.ticks[this.ticks.length - 1].tick );
		}

	}

	drawBars(height, width) {
		var highestOrLowest = this.exploration.getHighest();

		for (let j = -height/2, row = height-1; j < height/2 ; ++j, --row){
			for (let i = -width/2, col = 0; i < width/2 ; ++i, ++col){
				this.bars.push(new GridBar(highestOrLowest[row][col], {'x': i, 'z': j}, this, row, col));
				this.scene.add(this.bars[this.bars.length - 1].bar);
			}
		}
	}


	updateScene(height, width) {
		//data=[];
		this.camera.aspect = this.vis.innerWidth() / this.vis.innerHeight();
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.vis.innerWidth(), this.vis.innerHeight() );
		this.updateYAxis(height, width);
		this.updateBars(height, width);
		this.render();
		this.vis.append( this.renderer.domElement );	
	}

	updateBars(height, width){
		for (var i = 0; i < this.bars.length; ++i) {
			this.scene.remove(this.bars[i].bar);
			this.bars[i].bar.material.dispose();
			this.bars[i].bar.geometry.dispose();
			this.bars[i] = undefined;
		}
		this.bars = [];
		this.drawBars(height, width);	
	}

	updateYAxis(height, width){
		this.scene.remove(this.yAxis);
		if (this.yAxis != undefined){
			this.yAxis.material.dispose();
			this.yAxis.geometry.dispose();
			this.yAxis = undefined;
		}
		this.currentTick = undefined;
		for (var i = 0; i < this.ticks.length; ++i) {
			this.scene.remove(this.ticks[i]);
			this.ticks[i].tick.material.dispose();
			this.ticks[i].tick.geometry.dispose();
			this.ticks[i] = undefined;
		}
		this.ticks = [];
		this.ticksForRaycasting = [];
		this.drawYAxis(height, width)
	}

	rotateVis(px, py) {	
		if (!this.mouseClicked)
			return;

		var dx = px - this.mouseClickX,
		    dy = this.mouseClickY - py;

		this.angleX = -((dx / 1000) * (Math.PI) + this.defx);
		this.angleY = -((dy / 1000) * (Math.PI) + this.defy);

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
		this.camera.lookAt( lookAt );
		this.render();
	}

	render() {
		this.renderer.render( this.scene, this.camera );
	}

	zoomVis(dy) {
		this.zoom += (Math.sign(dy) * 50);
		this.camera.position.set( this.zoom * Math.sin(-this.defx) * Math.cos(-this.defy) , 
							 this.zoom * Math.sin(-this.defy), 
					 		 this.zoom * Math.cos(-this.defx) * Math.cos(-this.defy));
		this.camera.lookAt( lookAt );
		this.render();
	}

	mouseDown() {
		this.mouseClicked = true;
		this.mouseClickX = event.clientX;
		this.mouseClickY = event.clientY;
		var sceneMouseX = ((this.mouseClickX - this.vis.position().left) / this.vis.width()) * 2 - 1,
			sceneMouseY = -((this.mouseClickY - this.vis.position().top) / this.vis.height()) * 2 + 1,
			mouse = new THREE.Vector3(sceneMouseX, sceneMouseY); 
		
		this.raycaster.setFromCamera(mouse, this.camera);
		var intersects = this.raycaster.intersectObjects( this.ticksForRaycasting );
		var regions = [];
		if( intersects.length > 0 ) {
			if (this.currentTick != undefined){
				this.currentTick.object.material.color.setHex( 0xf4c2c2 );
			}
			var index = this.ticksForRaycasting.indexOf(intersects[0].object);
			for (let i = 0; i < this.bars.length; ++i){
				if (this.bars[i].label != this.labels[index]){
					this.bars[i].bar.material.color.setHex( 0xffffff );
					this.bars[i].bar.material.opacity = 0.1;
				}
				else{
					regions.push([{row:this.bars[i].row, col:this.bars[i].col}]);
					this.bars[i].bar.material.color.setHex( 0xff0000 );// = 0.2;
					this.bars[i].bar.material.opacity = 1;
				}
			}
			this.currentTick = intersects[0];
			this.currentTick.object.material.color.setHex( 0xff0000 );
		}
		this.exploration.map.builder.drawHighlightedRegions( regions );
		this.render();
	}

	mouseUp() {
		this.mouseClicked = false;
		this.defx = -this.angleX;
		this.defy = -this.angleY;
	}
}