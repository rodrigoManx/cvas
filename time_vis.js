class TimeVis {
	constructor(exploration){
		this.exploration = exploration;
		this.vis = this.exploration.vis2;
		this.builder = new TimeVisBuilder(this);
		this.timeLineLayer = $('<div/>').addClass('time-line-layer');
		this.leftPanel = $('<div/>').addClass('tll-left-panel ' + this.exploration.id);
		this.rightPanel = $('<div/>').addClass('tll-right-panel ' + this.exploration.id);
		this.leftLabel = $('<div/>').addClass('tll-left-label');
		this.topLabel = $('<div/>').addClass('tll-top-label');
		this.vis.append(this.timeLineLayer);
		this.vis.append(this.rightPanel);
		this.vis.append(this.leftPanel);
		this.vis.append(this.leftLabel);
		this.vis.append(this.topLabel);
	}

	init() {
		this.leftLabel.append('<p>MONTHS</p>');
		this.topLabel.append('<p>DAYS</p>');

		this.builder.buildTimeLine();
		this.leftPanel.on('click', function(){
			var myClass = $(this).attr("class");
			var index = parseInt(myClass.split(' ')[1]);
			explorations[index].time.rightPanel.removeClass("hidden-element");
			if (explorations[index].granularity == GRANULARITY.MONTH){
				explorations[index].crimes = crimesByYear();
				explorations[index].map.crimes = explorations[index].crimes;
				explorations[index].granularity = GRANULARITY.YEAR;
				explorations[index].time.leftPanel.addClass("hidden-element");
				explorations[index].time.leftLabel.find('p').text('YEARS');
				explorations[index].time.topLabel.find('p').text('MONTHS');
			}
			else if (explorations[index].granularity == GRANULARITY.DAY){
				explorations[index].crimes = crimesByMonth();
				explorations[index].map.crimes = explorations[index].crimes;
				explorations[index].granularity = GRANULARITY.MONTH;
				explorations[index].time.leftLabel.find('p').text('MONTHS');
				explorations[index].time.topLabel.find('p').text('DAYS');
			}

			explorations[index].time.builder.buildTimeLine();
		});
		this.rightPanel.on('click', function(){
			var myClass = $(this).attr("class");
			var index = parseInt(myClass.split(' ')[1]);
			explorations[index].time.leftPanel.removeClass("hidden-element");
			if (explorations[index].granularity == GRANULARITY.MONTH){
				explorations[index].crimes = crimesByDay();
				explorations[index].map.crimes = explorations[index].crimes;
				explorations[index].granularity = GRANULARITY.DAY;
				explorations[index].time.rightPanel.addClass("hidden-element");
				explorations[index].time.leftLabel.find('p').text('DAYS');	
				explorations[index].time.topLabel.find('p').text('HOURS');
			}
			else if (explorations[index].granularity == GRANULARITY.YEAR){
				explorations[index].crimes = crimesByMonth();
				explorations[index].map.crimes = explorations[index].crimes;
				explorations[index].granularity = GRANULARITY.MONTH;	
				explorations[index].time.leftLabel.find('p').text('MONTHS');	
				explorations[index].time.topLabel.find('p').text('DAYS');
			}

			explorations[index].time.builder.buildTimeLine();
		});
	}
}