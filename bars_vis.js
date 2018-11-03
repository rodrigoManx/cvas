lookAt = new THREE.Vector3(0,0,0);
side = 1000;
barsPerSide = 64;
scale = side / barsPerSide;
sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
yAxisHeight = 400;


function createBars(voxel, position, parent, row, col) {
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
		var height = parent.scale(finalVoxel.categories[i].count);
		parent.bars.push(new THREE.Mesh( new THREE.BoxBufferGeometry( scale*0.9, height, scale*0.9 ), 
						   			   new THREE.MeshStandardMaterial( { color: categoryColors[finalVoxel.categories[i].name], transparent: true, opacity:1, overdraw: 0.5 })));
		parent.bars[parent.bars.length-1].position.copy( new THREE.Vector3( 
													 (position.x * scale) + (scale/2), 
													 accumulateHeight + height/2, 
													 (position.z * scale) + (scale/2)) );
		parent.bars[parent.bars.length-1].userData = {voxel: voxel, row: row, col: col};
		parent.scene.add(parent.bars[parent.bars.length - 1]);
		accumulateHeight+=height;
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
		this.categoryColors = $('<div class="crimes-colors-panel"></div>');
		this.vis = element;
		this.vis.append(this.categoryColors);
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
		this.exploration = exploration;
		
		this.labels = [];
		this.ticksSpacing = 0;
		this.scale;
		this.directionalLight;
		this.items = {};
		this.sum = 0;
		this.selection = {};
		this.regions = [];
	}


	init() {
		console.log(this.categoryColors.innerHeight());
		
		this.camera = new THREE.PerspectiveCamera( 45, this.vis.innerWidth() / this.vis.innerHeight(), 1, 10000 );
		this.camera.position.set(this.zoom * Math.sin(this.angleX) * Math.cos(this.angleY),
								 this.zoom * Math.sin(this.angleY),
							 	 this.zoom * Math.cos(this.angleX) * Math.cos(this.angleY));
		this.camera.lookAt( lookAt );
		this.camera.updateMatrixWorld();
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


	drawBars(height, width) {
		var highestOrLowest = this.exploration.getHighest();

		for (let j = -height/2, row = height-1; j < height/2 ; ++j, --row){
			for (let i = -width/2, col = 0; i < width/2 ; ++i, ++col){
				var voxel = this.exploration.map.kernelMapLayer[row][col];
				createBars(voxel, {'x': i, 'z': j}, this, row, col);
			}
		}
	}


	updateScene(height, width) {
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
		this.regions = [];
		this.buildCategoryColors();
		this.scale = d3.scaleLinear().domain([min, max]).range([0, 400]);
		this.camera.aspect = this.vis.innerWidth() / this.vis.innerHeight();
		this.camera.updateProjectionMatrix();
		this.renderer.setSize( this.vis.innerWidth(), this.vis.innerHeight());
		this.updateBars(height, width);
		this.render();
		this.vis.append( this.renderer.domElement );	
	}


	updateBars(height, width){
		for (let i = 0; i < this.bars.length; ++i) {
			this.scene.remove(this.bars[i]);
			this.bars[i].material.dispose();
			this.bars[i].geometry.dispose();
			this.bars[i] = undefined;
		}
		this.bars = [];
		this.drawBars(height, width);	
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
		this.camera.updateMatrixWorld();
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
		this.camera.updateMatrixWorld();
		this.render();
	}

	calcPercentages() {
		var l = [];
		for (let category in this.selection){
			this.items[category].addClass("highlighted-item");
			let percentage = this.items[category].find('.percentage');
			percentage.removeClass('hidden-element');
			percentage.text(parseInt((this.selection[category] / this.sum) * 100) + '%');
			l.push({ count: this.selection[category], htmlObject: this.items[category]});
		}

		l.sort(compare);
		for (let i = 0; i < l.length; ++i)
			l[i].htmlObject.removeClass('trophy-place');

		l[0].htmlObject.addClass('trophy-place');
		l[1].htmlObject.addClass('trophy-place');
		l[2].htmlObject.addClass('trophy-place');
	}

	mouseDown() {
		var raycaster = new THREE.Raycaster();
		this.camera.updateMatrixWorld();
		this.mouseClicked = true;
		this.mouseClickX = event.clientX;
		this.mouseClickY = event.clientY;
		
		var sceneMouseX = ((this.mouseClickX - this.vis.offset().left) / this.vis.width()) * 2 - 1,
			sceneMouseY = -((this.mouseClickY - this.vis.offset().top) / this.vis.height()) * 2 + 1,
			mouse = new THREE.Vector3(sceneMouseX, sceneMouseY); 
		
		raycaster.setFromCamera(mouse, this.camera);
		var intersects = raycaster.intersectObjects( this.bars );
		
		if( intersects.length > 0 ) {
			console.log(intersects[0].object);
			this.sum+=intersects[0].object.userData.voxel.count;
			for (let index in intersects[0].object.userData.voxel.categories){
				let category = intersects[0].object.userData.voxel.categories[index];
				if (this.selection[category.name] == undefined)
					this.selection[category.name] = category.count;
				else this.selection[category.name]+=category.count;
			}
			this.calcPercentages();
			this.regions.push([{row: intersects[0].object.userData.row + 1, col: intersects[0].object.userData.col}]);
			//if (this.currentTick != undefined){
			//	this.currentTick.object.material.color.setHex( 0xf4c2c2 );
			//}
			//var index = this.ticksForRaycasting.indexOf(intersects[0].object);
			//for (let i = 0; i < this.bars.length; ++i){
			//	if (this.bars[i].label != this.labels[index]){
			//		this.bars[i].bar.material.color.setHex( 0xffffff );
			//		this.bars[i].bar.material.opacity = 0.1;
			//	}
			//	else{
			//		//regions.push([{row:this.bars[i].row, col:this.bars[i].col}]);
			//		this.bars[i].bar.material.color.setHex( 0xff0000 );// = 0.2;
			//		this.bars[i].bar.material.opacity = 1;
			//	}
			//}
			//this.currentTick = intersects[0];
			//this.currentTick.object.material.color.setHex( 0xff0000 );
		}
		this.exploration.map.builder.drawHighlightedRegions( this.regions );
		this.render();
		raycaster = null;
	}

	mouseUp() {
		this.mouseClicked = false;
		this.defx = -this.angleX;
		this.defy = -this.angleY;
	}


	buildCategoryColors() {
		var height = this.categoryColors.innerHeight();
		var itemHeight = height / (Object.keys(categoryColors).length - 1);
		var width = this.categoryColors.innerWidth();
		var aspectRatio = 18.5;

		this.categoryColors.find('div').remove();
		this.categoryColors.css({'width': itemHeight * aspectRatio + 'px'});

		for (let category in categoryColors) {
			if (category != 'OTHERS'){
				var item = $('<div class="category-colors-list-item"\
														style="width:' + itemHeight * aspectRatio +'px;\
					                                    height:' + itemHeight + 'px;">\
												<div style="background-color:' + categoryColors[category] + ';\
		                                    				width:' + 100/aspectRatio + '%;\
		                                    				height: 100%;\
		                                    				position:absolute"></div>\
	                            				<div style="font-size: 10px;\
	                            							left:' + (100/aspectRatio) * 1.2 + '%;\
	                            							width:' + (100/aspectRatio) * (aspectRatio - 4) + '%;\
		                                    				height: 100%;\
		                                    				position:absolute">'+category+'</div>\
	                            				<div class="percentage hidden-element" style="font-size: 10px;\
	                            							left:' + (100/aspectRatio) * 16 + '%;\
	                            							width:' + (100/aspectRatio) * 3 + '%;\
		                                    				height: 100%;\
		                                    				position:absolute">'+'200%'+'</div>\
		                                    </div>');

				this.items[category] = item;
				this.categoryColors.append(item);
			}
		}
		console.log(this.items);
	}

}


function compare(a,b) {
  if (a.count > b.count)
    return -1;
  if (a.count < b.count)
    return 1;
  return 0;
}
