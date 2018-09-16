class TimeVisBuilder {
	constructor(vis){
		this.time = vis;
	}

	buildTimeLine(){
		var width = this.time.timeLineLayer.innerWidth();
		var height = this.time.timeLineLayer.innerHeight();

		this.map.gridLayer.find('svg').remove();

		var grid = d3.select(this.time.timeLineLayer.get(0))
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr('class', 'time-line-svg');
	}
}