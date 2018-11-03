var explorationsCount = 0;
var explorations = [];
const VIS_NUMBER = 2;
explorationMenuOptions = ['>Large exploration', '>Especific exploration', 'disabled> Select data set'];
var crimes;
var explorationLevel = {year: 5, month: 12, day: 31}

var crimeCategories = ["OTHER OFFENSES", "VANDALISM", "LARCENY/THEFT", "DRUG/NARCOTIC", "ASSAULT", "BURGLARY", "NON-CRIMINAL", "SUSPICIOUS OCC", "LIQUOR LAWS", "WARRANTS", "EMBEZZLEMENT", "FORGERY/COUNTERFEITING", "VEHICLE THEFT", "ROBBERY", "MISSING PERSON", "DRUNKENNESS", "FAMILY OFFENSES", "DISORDERLY CONDUCT", "TRESPASS", "SECONDARY CODES", "WEAPON LAWS", "SEX OFFENSES, FORCIBLE", "STOLEN PROPERTY", "FRAUD", "PROSTITUTION", "LOITERING", "DRIVING UNDER THE INFLUENCE", "RUNAWAY", "KIDNAPPING", "RECOVERED VEHICLE", "ARSON", "EXTORTION", "BAD CHECKS", "BRIBERY", "SUICIDE", "PORNOGRAPHY/OBSCENE MAT", "SEX OFFENSES, NON FORCIBLE", "GAMBLING", "TREA", "OTHERS"];
var categoryColors = {};
var time = undefined;
var granularity = GRANULARITY.MONTH;
var timeLineCrimes = undefined;

$( document ).ready(function() {
	$.getJSON("backend/sf_crimes.json", function(result){
		time = new TimeVis();
        crimes = result;
        explorationLevel.year = Object.keys(crimes).length;
        GRANULARITY.YEAR.ROWS = Object.keys(crimes).length;

        var colors = d3.scaleOrdinal(d3.schemeCategory20c).domain(crimeCategories.slice(0,20));
        for (let i = 0; i < 20; ++i)
        	categoryColors[crimeCategories[i]] = colors(crimeCategories[i]);
        
        colors = d3.scaleOrdinal(d3.schemeCategory20b).domain(crimeCategories.slice(20));
        for (let i = 20; i < crimeCategories.length; ++i)
        	categoryColors[crimeCategories[i]] = colors(crimeCategories[i]);

        $('.loading-modal').css({'display': 'none'});
    	timeLineCrimes = crimesByMonth();
    	time.init();
		addNewExploration();
	});
});


function removeExploration(exploration) {
	//alert("You're about to remove an exploration, are you sure?");
	if (confirm("You're about to remove an exploration, are you sure?")){
		explorations[parseInt($(exploration.parentNode).find('.index').text())] = null;
		exploration.parentNode.remove();
		explorationsCount-=1;
		modifyExplorationCss();
		modifyVisCss();
		onNewExploration(-1);
	}
}


function createExploration(exploration) {
	//append close button
	exploration.append('<button class="vis-close-button" onclick="removeExploration(this)">x</button>');
	exploration.append('<p class="index" style="display:none;">' + explorations.length + '</p>');

	//append vis
	for (var i = 0; i < VIS_NUMBER; ++i)
		exploration.append('<div class="vis vis' + i.toString() + '"></div>');

	exploration.find('.vis1').append('<p style="display:none;">' + explorations.length + '</p>');

	explorations.push(new Exploration(exploration, crimes, explorations.length));
}


function modifyVisCss() {
	$('.vis').css({'width': '50%', 'height': '100%'});
}


function modifyExplorationCss() {
	$('.exploration').css({'width': 99.6/explorationsCount + '%'})
}


function addNewExploration() {
	var newExploration = $('<div/>').addClass('exploration');
	$('#content').append(newExploration);
	
	createExploration(newExploration);
	
	explorationsCount+=1;
	modifyExplorationCss();
	modifyVisCss();
	onNewExploration(1);
	explorations[explorations.length - 1].initLargeExploration();
}