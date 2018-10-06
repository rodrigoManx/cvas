var explorationsCount = 0;
var explorations = [];
const VIS_NUMBER = 3;
explorationMenuOptions = ['>Large exploration', '>Especific exploration', 'disabled> Select data set'];
var crimes;
var explorationLevel = {year: 5, month: 12, day: 31}

var crimeCategories = ["OTHER OFFENSES", "VANDALISM", "LARCENY/THEFT", "DRUG/NARCOTIC", "ASSAULT", "BURGLARY", "NON-CRIMINAL", "SUSPICIOUS OCC", "LIQUOR LAWS", "WARRANTS", "EMBEZZLEMENT", "FORGERY/COUNTERFEITING", "VEHICLE THEFT", "ROBBERY", "MISSING PERSON", "DRUNKENNESS", "FAMILY OFFENSES", "DISORDERLY CONDUCT", "TRESPASS", "SECONDARY CODES", "WEAPON LAWS", "SEX OFFENSES, FORCIBLE", "STOLEN PROPERTY", "FRAUD", "PROSTITUTION", "LOITERING", "DRIVING UNDER THE INFLUENCE", "RUNAWAY", "KIDNAPPING", "RECOVERED VEHICLE", "ARSON", "EXTORTION", "BAD CHECKS", "BRIBERY", "SUICIDE", "PORNOGRAPHY/OBSCENE MAT", "SEX OFFENSES, NON FORCIBLE", "GAMBLING", "TREA", "OTHERS"];
var categoryColors = {};


$( document ).ready(function() {
	$.getJSON("backend/sf_crimes.json", function(result){
        crimes = result;
        console.log(crimes);
        explorationLevel.year = Object.keys(crimes).length;
        GRANULARITY.YEAR.ROWS = Object.keys(crimes).length;

        var colors = d3.scaleOrdinal(d3.schemeCategory20c).domain(crimeCategories.slice(0,20));
        for (let i = 0; i < 20; ++i)
        	categoryColors[crimeCategories[i]] = colors(crimeCategories[i]);
        
        colors = d3.scaleOrdinal(d3.schemeCategory20b).domain(crimeCategories.slice(20));
        for (let i = 20; i < crimeCategories.length; ++i)
        	categoryColors[crimeCategories[i]] = colors(crimeCategories[i]);

        $('.loading-modal').css({'display': 'none'});

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
	if (explorationsCount == 1 || explorationsCount == 2){
		$('.vis0').css({'width': '50%', 'height':'50%'}); 
		$('.vis1').css({'width': '50%', 'height':'50%'}); 
		$('.vis2').css({'width': '100%', 'height': '50%'});
	}
	else
		$('.vis').css({'width': '100%', 'height':'25%'}); 	
}


function modifyExplorationMenu() {
	if (explorationsCount == 1)
		$('.exploration-menu').css({'width': '24%', 'margin-left':'-12%'}); 	
	else if (explorationsCount == 2)
		$('.exploration-menu').css({'width': '48%', 'margin-left':'-24%'});
	else
		$('.exploration-menu').css({'width': '70%', 'margin-left':'-35%'}); 	
}


function modifyExplorationCss() {
	if (explorationsCount == 0) {
		$('.exploration').css({'width': '99.6%'});
	}
	else {
		$('.exploration').css({'width': (99.6 * (1 / (explorationsCount))).toString() + '%'}); 
	}
	modifyExplorationMenu();
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