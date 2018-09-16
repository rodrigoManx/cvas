var GRID_SIDE_SIZE = 64

var shiftPressed = false;
var kernelLayerHidden = undefined;
var clusterLayerHidden = undefined;

const redScale = d3.scaleSequential( d3.interpolateReds )
						 	.domain([0, 15])

document.onkeydown = function(event) {
	switch( event.keyCode ) {
		case 16: 
			shiftPressed = true; 
			break;
	}
}

document.onkeyup = function(event) {
	switch( event.keyCode ) {
		case 16:
			shiftPressed = false;
			kernelLayerHidden.show();
			clusterLayerHidden.show();
			index = kernelLayerHidden.find('.index').text();
			explorations[index].map.bounds = explorations[index].map.map.getBounds();
			explorations[index].map.builder.buildKernelMapLayers();
			break;
	}
}


VISUALIZATION = {
	KERNEL_MAP: 0,
	CLUSTERS: 1
}


class MapVis {
	constructor(exploration) {
		this.exploration = exploration;
		this.vis = this.exploration.vis1;
		this.map = null;
		this.mapLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%'});
		this.gridLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%', 'z-index': '4', 'background-color': 'rgba(255,255,255,0)'});
		this.clusterLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%', 'z-index': '4', 'background-color': 'rgba(255,255,255,0)'});
		this.gridLayer.append('<p class="index">' + explorations.length + '</p>');
		this.vis.append(this.mapLayer);
		this.vis.append(this.clusterLayer);
		this.vis.append(this.gridLayer);
		this.width = 0;
		this.height = 0;
		this.kernelMapLayers = {};
		this.dataVisualizationMode = VISUALIZATION.CLUSTERS;
		this.bounds = undefined;
		this.crimes = undefined;
		this.regions = [];
		this.builder = new MapVisBuilder(this);
	}

	init() {
		this.crimes = this.exploration.crimes;
		
		var clusterLayer = this.clusterLayer;
		this.gridLayer.mouseover(function() {
			if (kernelLayerHidden != undefined){
				kernelLayerHidden.show();
				clusterLayerHidden.show();
			}
			if (shiftPressed) {
				kernelLayerHidden = $(this);
				clusterLayerHidden = clusterLayer;
				clusterLayerHidden.hide();
				kernelLayerHidden.hide();
			}
		})

		this.setDimProperties();
		this.builder.buildMap(true);
	}

	updateVis(){
		this.setDimProperties()
		this.builder.buildMap(false);
	}


	setDimProperties() {
		var smallSide, bigSide, sss;

		if (this.vis.innerHeight() < this.vis.innerWidth()){
			smallSide = this.vis.innerHeight();
			bigSide = this.vis.innerWidth();
			this.width = GRID_SIDE_SIZE;
			this.height = Math.ceil(smallSide / (bigSide / GRID_SIDE_SIZE));
		}
		else {
			smallSide = this.vis.innerWidth();
			bigSide = this.vis.innerHeight();
			this.height = GRID_SIDE_SIZE;
			this.width = Math.ceil(smallSide / (bigSide / GRID_SIDE_SIZE));
		}

		this.sss = bigSide / GRID_SIDE_SIZE;
		this.data = [];

		for (var ypos = 0, row = 0; Math.ceil(ypos) < this.vis.innerHeight(); ypos+=this.sss, row++) {
			var r = []
			for (var xpos = 0, col = 0; Math.ceil(xpos) < this.vis.innerWidth(); xpos+=this.sss, ++col) {
				r.push({
					x: xpos,
					y: ypos,
					r: (this.height-1) - row,
					c: col
				})
			}
			this.data.push(r);
		}
	}
}