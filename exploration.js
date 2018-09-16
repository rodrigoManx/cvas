var EXPLORATION_TYPE = {'DEFAULT': 0, 'LARGE': 1, 'ESPECIFIC': 2}

window.addEventListener( 'resize', onWindowResize, false );

class Exploration {
	constructor(exploration, data, id) {
		this.id = id;
		this.vis0 = exploration.find('.vis1');
		this.vis1 = exploration.find('.vis0');
		this.vis2 = exploration.find('.vis2');
		this.bars = new BarsVis(this.vis0, this);
		this.map = new MapVis(this);
		this.time = new TimeVis(this);
		this.type = EXPLORATION_TYPE.DEFAULT;
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.crimes = crimesByYear();
	}

	getLabels() {
		var labels = [];
		for (let key in this.map.kernelMapLayers)
			labels.push(key);
		return labels;
	}


	getHighest(){
		var highest = [];

		for (let row = 0; row < this.map.height; ++row){
			highest[row] = [];
			for (let col = 0; col < this.map.width; ++col){
				highest[row][col] = 0;
				let highestValue = 0;
				for (let key in this.map.kernelMapLayers){
					if (this.map.kernelMapLayers[key][row][col] > highestValue){
						highestValue = this.map.kernelMapLayers[key][row][col];
						highest[row][col] = key;
					}
				}
			}
		}

		return highest;
	}


	loadData() {
		switch(this.type) {
			case 1:
				this.initLargeExploration();
				break;
			case 2:
				break;
			default:
				break;
		}
	}


	initLargeExploration() {
		this.map.init();
		this.bars.init();
		this.vis0.bind( 'mousemove', onDocumentMouseMove);
		this.vis0.bind( 'mousedown', onDocumentMouseDown);
		this.vis0.bind( 'mouseup', onDocumentMouseUp);
		this.vis0.bind( 'mousewheel', onDocumentScroll);
	}
}

function onWindowResize() {
	//for (var i = 0; i < explorations.length; ++i){
	//	try {
	//		explorations[i].bars.camera.aspect = explorations[i].vis0.innerWidth() / explorations[i].vis0.innerHeight();
	//		explorations[i].bars.renderer.setSize( explorations[i].vis0.innerWidth(), explorations[i].vis0.innerHeight() );
	//		explorations[i].bars.camera.updateProjectionMatrix();
	//	}
	//	catch(err) {
	//	}
	//}
}


function onNewExploration(action) {
	$('canvas').remove();
	for (var i = 0; i < explorations.length; ++i){
		try {
			if (explorations[i].type != 0){
				if (action>0)
					explorations[i].map.updateVis();
				else explorations[i].map.init();
			}
		}
		catch(err) {
		}
	}
}


function onDocumentScroll( event ){
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].bars.zoomVis(event.originalEvent.deltaY);

}

function onDocumentMouseUp( event ) {
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].bars.mouseUp();
}


function onDocumentMouseMove( event ) {
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].bars.rotateVis(event.clientX, event.clientY);
}


function onDocumentMouseDown( event ) {
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].bars.mouseDown();
}