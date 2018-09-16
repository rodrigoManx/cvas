class MapVisBuilder {
	constructor(vis){
		this.map = vis;
	}

	buildKernelMapLayers() {
		this.map.kernelMapLayers = {};
		var height = this.map.bounds.f.f - this.map.bounds.f.b;
		var p1 = height / this.map.height;

		var width = this.map.bounds.b.f - this.map.bounds.b.b;
		var p2 = width / this.map.width;

		for (var key in this.map.crimes){
			this.map.kernelMapLayers[key] = [];
			for (let  i = 0; i < this.map.height; ++i){
				this.map.kernelMapLayers[key][i] = [];
				for (let j = 0; j < this.map.width; ++j)
					this.map.kernelMapLayers[key][i][j] = 0;
			}

			for (let category in this.map.crimes[key]){
				for (let crime in this.map.crimes[key][category]){
					let lat = parseFloat(this.map.crimes[key][category][crime].latitude);
					let lon = parseFloat(this.map.crimes[key][category][crime].longitude);
					if (lat > this.map.bounds.f.b && lat < this.map.bounds.f.f && lon > this.map.bounds.b.b && lon < this.map.bounds.b.f)
					{
						let indexI = Math.floor(( lat - this.map.bounds.f.b) / p1);
						let indexJ = Math.floor(( lon - this.map.bounds.b.b) / p2);
						this.map.kernelMapLayers[key][indexI][indexJ]+=1;
					}
				}
			}
		}
		this.buildGrid(this.map.vis.innerWidth(), this.map.vis.innerHeight());
	}


	buildMap() {
		this.map.map = new google.maps.Map(this.map.mapLayer.get(0), {
			zoom: 12,
			center: { lat: 37.763456, lng: -122.449214 },
			mapTypeId: 'roadmap',
			styles: [{
				featureType: "all",
			    elementType: "labels",
			    stylers: [{ visibility: "off" }]}
			],
		});

		var map = this.map;
		google.maps.event.addListener(this.map.map, 'bounds_changed', function() {
			map.bounds = this.getBounds();
			if (map.dataVisualizationMode == VISUALIZATION.KERNEL_MAP)
				map.builder.buildKernelMapLayers();
			else map.builder.buildClusters();
		});
	}


	buildGrid(width, height) {
		var kernelMapLayers = this.map.kernelMapLayers;
		var sss = this.map.sss;
		var data = this.map.data;

		this.map.gridLayer.find('svg').remove();
		
		var grid = d3.select(this.map.gridLayer.get(0))
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr('class', 'kernelMap-svg');
			
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
			.style("fill", function(d) { return redScale(kernelMapLayers['2010'][d.r][d.c]);})//"red")
			.style("fill-opacity", "0.8")
			.style("stroke", "white");

		this.map.exploration.bars.updateScene(this.map.height, this.map.width, this.map.kernelMapLayers);
		google.maps.event.clearListeners(this.map.map, 'bounds_changed');
	}

	buildClusters() {
		var data = [];
		var boundingBoxLeftLatitude = this.map.bounds.f.b;
		var boundingBoxBotLongitude = this.map.bounds.b.b;
		var visWidth = this.map.vis.innerWidth();		
		var visHeight = this.map.vis.innerHeight();

		var height = this.map.bounds.f.f - this.map.bounds.f.b;
		var p1 = height / visHeight;

		var width = this.map.bounds.b.f - this.map.bounds.b.b;
		var p2 = width / visWidth;

		var crimes = this.map.exploration.crimes;

		for (let category in crimes['2013'])
			for (let crime in crimes['2013'][category])
				data.push(crimes['2013'][category][crime]);

		var dbscanner = jDBSCAN().eps(0.4).minPts(5).exploration(0).data(data);
		dbscanner();
		var color = d3.scaleOrdinal(d3.schemeCategory20).domain(d3.range([0, d3.max(20)]));

		this.map.clusterLayer.find('svg').remove();

		var clusters = d3.select(this.map.clusterLayer.get(0))
			.append("svg")
			.attr("width", visWidth)
			.attr("height", visHeight)
			.attr('class', 'clusters-svg');

		var crime = clusters.selectAll(".crime")
			.data(data)
			.enter().append("circle")
			.attr("class", "crime")
			.attr("r", 5)
			.style("fill", function(d) {return color(d.clusters[0])})
			.style("fill-opacity", "0.5")
			.attr('cx', function (d) {
				return (d.longitude - boundingBoxBotLongitude) / p2;
			})
			.attr('cy', function (d) {
				return  visHeight - ((d.latitude - boundingBoxLeftLatitude) / p1);
			})
			.style("stroke", function(d) {return color(d.clusters[0])})
			.style("stroke-width", 2);
	}

	drawHighlightedRegions(regions) {
		if (regions.length == 0)
			return;

		this.map.gridLayer.find('.kernelMap-svg').find('.highlighted').remove();
		
		var height = this.map.height;
		var sss = this.map.sss;

		var grid = d3.select(this.map.gridLayer.get(0))
			.selectAll('.kernelMap-svg');

		var row = grid.selectAll(".highlighted")
			.data(regions)
			.enter().append("g")
			.attr("class", "highlighted");

		var column = row.selectAll(".square")
			.data(function(d) { return d; })
			.enter().append("rect")
			.attr("class","square")
			.attr("x", function(d) { 
				console.log(d);return d.col * sss; })
			.attr("y", function(d) { return (height - d.row) * sss; })
			.attr("width", sss.toString())
			.attr("height", sss.toString())
			.style("fill", 'yellow')
			.style("stroke", "#C49102");
	}
}