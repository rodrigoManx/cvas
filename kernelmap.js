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
		this.mapLayer = $('<div/>').css({'position': 'absolute', 'height': '100%', 'width': '100%', 'z-index': '3'});
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
			width = this.vis.innerWidth();

		this.map = new google.maps.Map(this.mapLayer.get(0), {
			zoom: 12,
			center: { lat: 33.754504, lng: -84.396582 },
			mapTypeId: 'roadmap'
		});

		
		var side = height > width? height : width;
		var smallside = height < width? height : width;

		//square side size
		var sss = side / GRID_SIDE_SIZE;

		var data = new Array();

		this.height = Math.ceil(height / sss);
		this.width = Math.ceil(width / sss);

		for (var xpos = 0, row = 0; xpos < width; xpos+=sss, row++) {
			data.push(new Array());
			for (var ypos = 0; ypos < height; ypos+=sss) {
				data[row].push({
					x: xpos,
					y: ypos,
					width: sss,
					height: sss,
				})
			}
		}

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
			.attr("width", function(d) { return d.width; })
			.attr("height", function(d) { return d.height; })
			.style("fill", "red")
			.style("fill-opacity", "0.4")
			.style("stroke", "white");

	}
}