class TimeVisBuilder {
	constructor(vis){
		this.time = vis;
	}

	buildTimeLine(){
		var width = this.time.timeLineLayer.innerWidth();
		var height = this.time.timeLineLayer.innerHeight();

		this.time.timeLineLayer.find('table').remove();
		
		var colsNumber = this.time.exploration.granularity.COLS;
		var cellHeight = (height / (this.time.exploration.granularity.ROWS + 1)) * 0.91;
		var cellWidth = (width / (this.time.exploration.granularity.COLS + 1 ));

		var keys = Object.keys(this.time.exploration.crimes).sort();
		var subKeys = Object.keys(this.time.exploration.crimes[keys[0]]).sort();

		var redScale2 = d3.scaleSequential( d3.interpolateReds )
							.domain([this.time.exploration.crimes.minB, this.time.exploration.crimes.max]);

		var table = $('<table>').addClass('table table-striped table-hover');
		var rowHeader = $('<tr>').css({'height':cellHeight+'px'});
		rowHeader.append($('<th>').css({'width':cellWidth+'px'}).text(''));
		for (let j = 0; j < this.time.exploration.granularity.COLS; ++j){
			var col = $('<th>').css({'width':cellWidth+'px'}).text(subKeys[j]);
			rowHeader.append(col);
		}
		table.append(rowHeader);

		for(let i = 0; i < this.time.exploration.granularity.ROWS; ++i){
			var row = $('<tr>').css({'height':cellHeight+'px'});
			var rowHeader = $('<th>').css({'width':cellWidth+'px'}).text(keys[i]);
			row.append(rowHeader);
			for(let j = 0; j < this.time.exploration.granularity.COLS; ++j){
				var col = $('<td>').css({'width':cellWidth+'px'});
					var red;
					try{
						red = redScale2(this.time.exploration.crimes[keys[i]][subKeys[j]].crimes_count);
					}
					catch (err){
						red = "rgb(255,255,255)";
					}
					var cell = d3.select(col.get(0))
						.append("svg")
						.attr("width", cellWidth)
						.attr("height", cellHeight)
						.attr("class", "draggable "+this.time.exploration.id+' k'+keys[i]+' s'+subKeys[j])
						.attr('z-index', 10)
						.append("rect")
						.attr('x', cellWidth/2 - cellHeight/2)
						.attr('y', 0)
						.attr('width', cellHeight)
						.attr('height', cellHeight)
						.attr('fill', red);
				row.append(col);
			}
			table.append(row);
		}
		this.time.timeLineLayer.append(table);

	}
}