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
	constructor(element) {
		this.vis = element;
		this.map = null;
		this.mapLayer = $('<div/>').css({'position': 'absolute'});
		this.gridLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%', 'z-index': '4', 'background-color': 'rgba(255,255,255,0)'});
		this.vis.append(this.mapLayer);
		this.vis.append(this.gridLayer);
		this.width = 0;
		this.height = 0;
	}

	init() {

		this.gridLayer.mouseover(function() {
			if (kernel_layer_hidden != undefined){
				kernel_layer_hidden.show();
			}

			if (shift_pressed) {
				kernel_layer_hidden = $(this);
				kernel_layer_hidden.hide();
			}
		})

		var height = this.vis.innerHeight(),
			width = this.vis.innerWidth(),
			small_side, big_side;


		if (height < width){
			small_side = height;
			big_side = width;
		}
		else {
			small_side = width;
			big_side = height;
		}
		this.mapLayer.css({'height': small_side.toString(), 'width': small_side.toString()});	


		this.map = new google.maps.Map(this.mapLayer.get(0), {
			zoom: 12,
			center: { lat: 33.754504, lng: -84.396582 },
			mapTypeId: 'roadmap'
		});

		var sss = small_side / GRID_SIDE_SIZE;

		var data = new Array();

		this.height = this.width = Math.ceil(small_side / sss);

		for (var xpos = 0, row = 0; xpos < small_side; xpos+=sss, row++) {
			data.push(new Array());
			for (var ypos = 0; ypos < small_side; ypos+=sss) {
				data[row].push({
					x: xpos,
					y: ypos,
				})
			}
		}

		while (this.gridLayer.get(0).firstChild) {
			this.gridLayer.get(0).removeChild(this.gridLayer.get(0).firstChild);
		}

		var grid = d3.select(this.gridLayer.get(0))
			.append("svg")
			.attr("width", small_side)
			.attr("height", small_side);
			
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