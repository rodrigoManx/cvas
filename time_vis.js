class TimeVis {
	constructor(exploration){
		this.exploration = exploration;
		this.vis = this.exploration.vis2;
		this.builder = new TimeVisBuilder(this);
		this.timeLineLayer = $('<div/>').css({'position': 'absolute', 'height': '95%', 'width': '100%'});
	}
}