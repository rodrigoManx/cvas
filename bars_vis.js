lookAt = new THREE.Vector3(0,0,0);
side = 1000;
barsPerSide = 64;
scale = side / barsPerSide;
sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
yAxisHeight = 400;


class GridBar {
	constructor(voxel, position, bars, row, col) {
		var height = bars.scale(voxel.count);
		this.bars = [];
		this.createBars(voxel, position, bars);
		this.row = row;
		this.col = col;
	}


	createBars(voxel, position, bars) {
		var top = 3;
		var finalVoxel = {categories:[]};
		if (voxel.categories.length > top){
			var othersSum=0;
			for (let i = top; i < voxel.categories.length; ++i)
				othersSum+=voxel.categories[i].count;

			for (let i = 0; i < top; ++i)
				finalVoxel.categories.push(voxel.categories[i])
			finalVoxel.categories.push({name: 'OTHERS', count: othersSum});
		}
		else finalVoxel = voxel;

		var accumulateHeight = 0;
		for (let i = finalVoxel.categories.length-1; i >= 0; --i){
			var height = bars.scale(finalVoxel.categories[i].count);
			this.bars.push(new THREE.Mesh( new THREE.BoxBufferGeometry( scale*0.9, height, scale*0.9 ), 
							   			   new THREE.MeshStandardMaterial( { color: categoryColors[finalVoxel.categories[i].name], transparent: true, opacity:1, overdraw: 0.5 })));
			this.bars[this.bars.length-1].position.copy( new THREE.Vector3( 
														 (position.x * scale) + (scale/2), 
														 accumulateHeight + height/2, 
														 (position.z * scale) + (scale/2)) );
			accumulateHeight+=height;
		}
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
		this.scale;
		this.directionalLight;
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
		
		this.directionalLight = new THREE.DirectionalLight( 0xffffff );
		this.directionalLight.position.set( Math.sin(this.angleX), 0.5, Math.cos(this.angleX) ).normalize();
		this.scene.add( this.directionalLight );

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
				var voxel = this.exploration.map.kernelMapLayer[row][col];
				this.bars.push(new GridBar(voxel, {'x': i, 'z': j}, this, row, col));
				for (let c = 0; c < this.bars[this.bars.length - 1].bars.length; ++c)
					this.scene.add(this.bars[this.bars.length - 1].bars[c]);
			}
		}
	}


	updateScene(height, width) {
		console.log(this.exploration.map.kernelMapLayer);
		console.log(this.exploration.map.width);
		console.log(this.exploration.map.height);

		var min = 50000;
		var max = 0;
		var ii,jj;
		for (let i = 0; i < this.exploration.map.height; ++i){
			for (let j = 0; j < this.exploration.map.width; ++j){
				var c = this.exploration.map.kernelMapLayer[i][j].count;
				if (c != 0 && c < min)
					min = c;
				if (c > max){
					max = c;
					ii = i;
					jj = j;
				}
			}
		}
		this.scale = d3.scaleLinear().domain([min, max]).range([0, 400]);
		console.log(min);
		console.log(max);
		//data=[];
		this.camera.aspect = this.vis.innerWidth() / this.vis.innerHeight();
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.vis.innerWidth(), this.vis.innerHeight());
		//this.updateYAxis(height, width);
		this.updateBars(height, width);
		this.render();
		this.vis.append( this.renderer.domElement );	
	}

	updateBars(height, width){
		for (let i = 0; i < this.bars.length; ++i) {
			for (let j = 0; j < this.bars[i].bars.length; ++j){
				this.scene.remove(this.bars[i].bars[j]);
				this.bars[i].bars[j].material.dispose();
				this.bars[i].bars[j].geometry.dispose();
			}
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

		this.directionalLight.position.set( Math.sin(this.angleX), 0.5, Math.cos(this.angleX) ).normalize();


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