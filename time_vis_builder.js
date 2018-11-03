class TimeVisBuilder {
	constructor(vis){
		this.time = vis;
		this.width;
 		this.height;
		this.cellHeight;
		this.cellWidth;
		this.redScaleMin;
		this.redScaleMax;
	}

	aux() {
		this.time.timeLineLayer.find('svg').remove();
		var redScale2 = d3.scaleSequential( d3.interpolateReds )
					.domain([this.redScaleMin, this.redScaleMax]);

		var keys = Object.keys(timeLineCrimes).sort();
		var subKeys = Object.keys(timeLineCrimes[keys[0]]).sort();

		var heatMapWidth = 1800;//px 
		var heatMapHeight = 430;//px

		var svg = d3.select(this.time.timeLineLayer[0])
					.append("svg")
					.attr("width", heatMapWidth)
					.attr("height", heatMapHeight)
					.attr('z-index', 10);

		for(let i = 0; i < granularity.ROWS; ++i){
			var g = svg.append("g").attr("class", "row");
			for(let j = 0; j < granularity.COLS; ++j){
				var red;
				try{
					red = redScale2(timeLineCrimes[keys[i]][subKeys[j]].crimes_count);
				}
				catch (err){
					red = "rgb(255,255,255)";
				}
				g.append("rect")
					.attr("class", "draggable"+/*this.time.exploration.id+*/' k'+keys[i]+' s'+subKeys[j])	
					.attr('x', j * (heatMapWidth / granularity.COLS))
					.attr('y', i * (heatMapHeight / granularity.ROWS))
					.attr('width', (heatMapWidth / granularity.COLS))
					.attr('height', heatMapHeight / granularity.ROWS)
					.attr('fill', red);
			}
		}
	}

	buildTimeLine(){
		this.width = this.time.timeLineLayer.innerWidth();
 		this.height = this.time.timeLineLayer.innerHeight();
		this.cellHeight = (this.height / (granularity.ROWS + 1)) * 0.85;
		this.cellWidth = (this.width / (granularity.COLS + 1 ));
		this.redScaleMin = 0; 
		this.redScaleMax = 0;
		this.time.slider.get(0).min = timeLineCrimes.min;
		this.time.slider.get(0).max = timeLineCrimes.max;

		this.time.slider.change(function(){
			time.builder.redScaleMin = this.value;
			time.builder.aux();
		});
		
		this.redScaleMin = timeLineCrimes.min;
		this.redScaleMax = timeLineCrimes.max;
		this.aux();
	}
}