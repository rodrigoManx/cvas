function customSort(a, b) {
	return a.count - b.count;
}

class MapVisBuilder {
	constructor(vis){
		this.map = vis;
		this.currentKey;
		this.currentSubKey;
	}


	buildKernelMapLayer(key, subKey) {
		if (key != undefined && subKey != undefined){
			this.currentKey = key;
			this.currentSubKey = subKey;
		}
		if (this.currentKey == undefined || this.currentSubKey == undefined){
			return;
		}
		this.map.kernelMapLayer = [];
		var height = this.map.bounds.l.l - this.map.bounds.l.j;
		var p1 = height / this.map.height;

		var width = this.map.bounds.j.l - this.map.bounds.j.j;
		var p2 = width / this.map.width;

		for (let  i = 0; i < this.map.height; ++i){
			this.map.kernelMapLayer[i] = [];
			for (let j = 0; j < this.map.width; ++j)
				this.map.kernelMapLayer[i][j] = {count:0, categories:{}};
		}

		for (let category in timeLineCrimes[this.currentKey][this.currentSubKey].crimes){
			for (let crime in timeLineCrimes[this.currentKey][this.currentSubKey].crimes[category]){
				let lat = parseFloat(timeLineCrimes[this.currentKey][this.currentSubKey].crimes[category][crime].latitude);
				let lon = parseFloat(timeLineCrimes[this.currentKey][this.currentSubKey].crimes[category][crime].longitude);
				if (lat > this.map.bounds.l.j && lat < this.map.bounds.l.l && lon > this.map.bounds.j.j && lon < this.map.bounds.j.l)
				{
					let indexI = Math.floor(( lat - this.map.bounds.l.j) / p1);
					let indexJ = Math.floor(( lon - this.map.bounds.j.j) / p2);
					this.map.kernelMapLayer[indexI][indexJ].count+=1;
					if (this.map.kernelMapLayer[indexI][indexJ].categories[category] == undefined)
						this.map.kernelMapLayer[indexI][indexJ].categories[category] = 1;
					else this.map.kernelMapLayer[indexI][indexJ].categories[category]+=1;
					
				}
			}
		}

		for (let  i = 0; i < this.map.height; ++i){
			for (let j = 0; j < this.map.width; ++j){
				var old = this.map.kernelMapLayer[i][j];
				this.map.kernelMapLayer[i][j] = {count: old.count, categories: []};
				for (let key in old.categories){
					let value = old.categories[key];
					let obj = {name: key, count: value};
					this.map.kernelMapLayer[i][j].categories.push(obj);
				}
				this.map.kernelMapLayer[i][j].categories.sort(customSort).reverse();
			}	
		}
		//console.log(this.map.kernelMapLayer);
		this.buildGrid(this.map.vis.innerWidth(), this.map.vis.innerHeight());
	}


	buildMap() {
		this.map.map = new google.maps.Map(this.map.mapLayer.get(0), {
			zoom: 12,
			center: { lat: 37.763456, lng: -122.449214 },
		    disableDefaultUI: true,
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
			map.builder.buildKernelMapLayer();
			//if (map.dataVisualizationMode == VISUALIZATION.KERNEL_MAP)
			//	map.builder.buildKernelMapLayers();
			//else map.builder.buildClusters();
		});
	}


	buildGrid(width, height) {
		var kernelMapLayer = this.map.kernelMapLayer;
		var sss = this.map.sss;
		var data = this.map.data;

		this.map.heatmapLayer.find('svg').remove();
		
		var grid = d3.select(this.map.heatmapLayer.get(0))
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
			.style("fill", function(d) { return redScale(kernelMapLayer[d.r][d.c].count);})
			.style("fill-opacity", "0.8");
			//.style("stroke", "white");

		this.map.exploration.bars.updateScene(this.map.height, this.map.width, this.map.kernelMapLayers);
		google.maps.event.clearListeners(this.map.map, 'bounds_changed');
	}

	buildClusters(key, subKey) {
		if (key != undefined && subKey != undefined){
			this.currentKey = key;
			this.currentSubKey = subKey;
		}
		var data = [];
		var boundingBoxLeftLatitude = this.map.bounds.l.j;
		var boundingBoxBotLongitude = this.map.bounds.j.j;
		var visWidth = this.map.vis.innerWidth();		
		var visHeight = this.map.vis.innerHeight();

		var p1 = (this.map.bounds.l.l - this.map.bounds.l.j) / visHeight;
		var p2 = (this.map.bounds.j.l - this.map.bounds.j.j) / visWidth;

		for (let category in timeLineCrimes[this.currentKey][this.currentSubKey].crimes){
			for (let crime in timeLineCrimes[this.currentKey][this.currentSubKey].crimes[category]){
				let lat = parseFloat(timeLineCrimes[this.currentKey][this.currentSubKey].crimes[category][crime].latitude);
				let lon = parseFloat(timeLineCrimes[this.currentKey][this.currentSubKey].crimes[category][crime].longitude);
				if (lat > this.map.bounds.l.j && lat < this.map.bounds.l.l && lon > this.map.bounds.j.j && lon < this.map.bounds.j.l)
					data.push(timeLineCrimes[this.currentKey][this.currentSubKey].crimes[category][crime]);
			}
		}

		//console.log(data);
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

		this.map.heatmapLayer.find('.kernelMap-svg').find('.highlighted').remove();
		
		var height = this.map.height;
		var sss = this.map.sss;

		var grid = d3.select(this.map.heatmapLayer.get(0))
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