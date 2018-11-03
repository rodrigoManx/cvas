class TimeVis {
	constructor(){
		this.vis = $('#time-line');
		this.timeLineLayer = $('<div/>').addClass('time-line-layer');
		this.leftPanel = $('<div/>').addClass('tll-left-panel');
		this.rightPanel = $('<div/>').addClass('tll-right-panel');
		this.leftLabel = $('<div/>').addClass('tll-left-label');
		this.topLabel = $('<div/>').addClass('tll-top-label');
		this.sliderContainer = $('<div/>').addClass('slider-container');
		this.slider = $('<input type="range" min="1" max="100" value="50" class="slider" id="myRange">');
		this.vis.append(this.timeLineLayer);
		this.vis.append(this.rightPanel);
		this.vis.append(this.leftPanel);
		this.vis.append(this.leftLabel);
		this.vis.append(this.topLabel);
		this.vis.append(this.sliderContainer);
		this.builder = new TimeVisBuilder(this);
	}

	init() {


		this.sliderContainer.append(this.slider);
		this.leftLabel.append('<p>MONTHS</p>');
		this.topLabel.append('<p>DAYS</p>');

		this.builder.buildTimeLine();
		this.leftPanel.on('click', function(){
			var myClass = $(this).attr("class");
			time.rightPanel.removeClass("hidden-element");
			if (granularity == GRANULARITY.MONTH){
				timeLineCrimes = crimesByYear();
				granularity = GRANULARITY.YEAR;
				time.leftPanel.addClass("hidden-element");
				time.leftLabel.find('p').text('YEARS');
				time.topLabel.find('p').text('MONTHS');
			}
			else if (granularity == GRANULARITY.DAY){
				timeLineCrimes = crimesByMonth();
				granularity = GRANULARITY.MONTH;
				time.leftLabel.find('p').text('MONTHS');
				time.topLabel.find('p').text('DAYS');
			}

			time.builder.buildTimeLine();
		});
		this.rightPanel.on('click', function(){
			var myClass = $(this).attr("class");
			time.leftPanel.removeClass("hidden-element");
			if (granularity == GRANULARITY.MONTH){
				timeLineCrimes = crimesByDay();
				granularity = GRANULARITY.DAY;
				time.rightPanel.addClass("hidden-element");
				time.leftLabel.find('p').text('DAYS');	
				time.topLabel.find('p').text('HOURS');
			}
			else if (granularity == GRANULARITY.YEAR){
				timeLineCrimes = crimesByMonth();
				granularity = GRANULARITY.MONTH;	
				time.leftLabel.find('p').text('MONTHS');	
				time.topLabel.find('p').text('DAYS');
			}

			time.builder.buildTimeLine();
		});
	}
}