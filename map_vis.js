var GRID_SIDE_SIZE = 64

var shiftPressed = false;
var kernelLayerHidden = undefined;
var clusterLayerHidden = undefined;
var hiddenLayer = undefined;

const redScale = d3.scaleSequential( d3.interpolateReds )
						 	.domain([0, 15]);


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
			hiddenLayer.removeClass('hidden-element');
			index = hiddenLayer.find('.index').text();
			explorations[index].map.bounds = explorations[index].map.map.getBounds();
			explorations[index].map.builder.buildKernelMapLayer();
			explorations[index].map.builder.buildClusters();
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
		this.heatmapLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%', 'z-index': '4', 'background-color': 'rgba(255,255,255,0)'});
		this.clusterLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%', 'z-index': '4', 'background-color': 'rgba(255,255,255,0)'}).addClass('hidden-element');
		this.layers = $('<div/>').addClass('map-layers dropzone');
		this.layers.append('<p class="index">' + this.exploration.id + '</p>');
		this.layers.append(this.clusterLayer);
		this.layers.append(this.heatmapLayer);
		this.vis.append(this.mapLayer);
		this.vis.append(this.layers);
		this.width = 0;
		this.height = 0;
		this.kernelMapLayers = {};
		this.kernelMapLayer = [];
		this.dataVisualizationMode = VISUALIZATION.CLUSTERS;
		this.bounds = undefined;
		this.crimes = undefined;
		this.regions = [];
		this.builder = new MapVisBuilder(this);
	}

	init() {
		this.crimes = this.exploration.crimes;
		
		var clusterLayer = this.clusterLayer;

		this.layers.append('<div class="dropzone-foreground">\
							   <p class="dropzone-text A">DRAG HERE</p>\
							   <p class="dropzone-text B">DROP</p>\
							</div>');

		this.menu = $('<div class="map-menu"></div>');
		this.buttons = $('<div class="map-menu-buttons"></div>');
		this.heatmapButton = $('<div class="map-icon ' + this.exploration.id + '">\
					                <img src="images/heatmap_icon.png">\
					                <p>HEATMAP</p>\
				              	</div>');
		this.clusteringButton = $('<div class="map-icon ' + this.exploration.id + '">\
					                <img src="images/clusters_icon.png">\
					                <p>CLUSTERS</p>\
				              	</div>');
		this.buttons.append(this.heatmapButton);
		this.buttons.append(this.clusteringButton);
		this.menu.append(this.buttons);


		this.clusteringButton.on( "click", function() {
  			var myClass = $(this).attr("class");
  			var index = parseInt(myClass.split(' ')[1]);
  			explorations[index].map.builder.buildClusters();
  			explorations[index].map.heatmapLayer.addClass('hidden-element');
  			explorations[index].map.clusterLayer.removeClass('hidden-element');
		});
		this.heatmapButton.on( "click", function() {
			var myClass = $(this).attr("class");
  			var index = parseInt(myClass.split(' ')[1]);
  			explorations[index].map.builder.buildKernelMapLayer();
  			explorations[index].map.heatmapLayer.removeClass('hidden-element');
  			explorations[index].map.clusterLayer.addClass('hidden-element');
		});

		this.vis.append(this.menu);

		this.layers.mouseover(function() {
			if (hiddenLayer != undefined){
				hiddenLayer.removeClass('hidden-element');
			}
			if (shiftPressed) {
				hiddenLayer = $(this);
				hiddenLayer.addClass('hidden-element');
			}
		});

		/*this.clusterLayer.mouseover(function() {
			if (hiddenLayer != undefined){
				hiddenLayer.removeClass('hidden-element');
			}
			if (shiftPressed) {
				hiddenLayer = $(this);
				hiddenLayer.addClass('hidden-element');
			}
		});*/

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

