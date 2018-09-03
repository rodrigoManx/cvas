var GRID_SIDE_SIZE = 64

var shift_pressed = false;
var kernel_layer_hidden = undefined; 


document.onkeydown = function(event) {
	switch( event.keyCode ) {
		case 16: 
			shift_pressed = true; 
			break;
	}
}

document.onkeyup = function(event) {
	switch( event.keyCode ) {
		case 16:
			shift_pressed = false;
			kernel_layer_hidden.show();
			break;
	}
}

class Kernelmap {
	constructor(exploration) {
		this.exploration = exploration;
		this.vis = this.exploration.vis1;
		this.map = null;
		this.mapLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%'});
		this.gridLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%', 'z-index': '4', 'background-color': 'rgba(255,255,255,0)'});
		this.vis.append(this.mapLayer);
		this.vis.append(this.gridLayer);
		this.width = 0;
		this.height = 0;
		this.kernel_map_layers = {}
		this.bounds = undefined;
	}

	init() {

		this.gridLayer.mouseover(function() {
			if (kernel_layer_hidden != undefined)
				kernel_layer_hidden.show();
			if (shift_pressed) {
				kernel_layer_hidden = $(this);
				kernel_layer_hidden.hide();
			}
		})

		var small_side, big_side, sss;

		if (this.vis.innerHeight() < this.vis.innerWidth()){
			small_side = this.vis.innerHeight();
			big_side = this.vis.innerWidth();
			this.width = GRID_SIDE_SIZE;
			this.height = Math.ceil(small_side / (big_side / GRID_SIDE_SIZE));
		}
		else {
			small_side = this.vis.innerWidth();
			big_side = this.vis.innerHeight();
			this.height = GRID_SIDE_SIZE;
			this.width = Math.ceil(small_side / (big_side / GRID_SIDE_SIZE));
		}

		var sss = big_side / GRID_SIDE_SIZE;
		var data = new Array();

		for (var xpos = 0, row = 0; xpos < this.vis.innerWidth(); xpos+=sss, row++) {
			data.push(new Array());
			for (var ypos = 0; ypos < this.vis.innerHeight(); ypos+=sss) {
				data[row].push({
					x: xpos,
					y: ypos,
				})
			}
		}
		this.build_map();
		this.build_grid(this.vis.innerWidth(), this.vis.innerHeight(), data, sss);
	}


	build_kernel_map_layers() {
		var crimes = this.exploration.crimes;

		var height = this.bounds.f.f - this.bounds.f.b;
		var p1 = height / this.height;
		console.log(p1);

		var width = this.bounds.b.f - this.bounds.b.b;
		var p2 = width / this.width;
		console.log(p2);		

		console.log(crimes);
		for (var key in crimes){
			kernel_map_layers[key] = [];
			for (var category in crimes[key]){
				for (var crime in crimes[key][category]){
					Math.floor((crime.latitude - this.bounds.f.b) / p1)
				}
			}
		}
	}


	build_map() {
		this.map = new google.maps.Map(this.mapLayer.get(0), {
			zoom: 12,
			center: { lat: 37.763456, lng: -122.449214 },
			mapTypeId: 'roadmap'
		});

		var kernelMap = this;
		console.log(this.map);
		google.maps.event.addListener(this.map, 'bounds_changed', function() {
			kernelMap.bounds = this.getBounds();
			kernelMap.build_kernel_map_layers();
		});
	}


	build_grid(width, height, data, sss) {
		while (this.gridLayer.get(0).firstChild) {
			this.gridLayer.get(0).removeChild(this.gridLayer.get(0).firstChild);
		}

		var grid = d3.select(this.gridLayer.get(0))
			.append("svg")
			.attr("width", width)
			.attr("height", height);
			
		var row = grid.selectAll(".row")
			.data(data)
			.enter().append("g")
			.attr("class", "row");
			

		var column = row.selectAll(".square")
			.data(function(d) { return d; })
			.enter().append("rect")
			.attr("class","square")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("width", sss.toString())
			.attr("height", sss.toString())
			.style("fill", "red")
			.style("fill-opacity", "0.4")
			.style("stroke", "white");
	}
}