var explorationsCount = 0;
var explorations = [];
const VIS_NUMBER = 3;
explorationMenuOptions = ['>Large exploration', '>Especific exploration', 'disabled> Select data set']
var crimes;
var explorationLevel = {year: 5, month: 12, day: 31}

$( document ).ready(function() {
	$.getJSON("backend/sf_crimes.json", function(result){
        crimes = result;
        console.log(crimes);
        explorationLevel.year = Object.keys(crimes).length;
        $('.loading-modal').css({'display': 'none'});

        addNewExploration();
	});
});



/*

class ClassA{
	constructor(){}
	foo(){
		return dict;
	}
}

class ClassB{
	constructor(padre){this.padre = padre; this.layers = {};}
	init(){
		var dict_b = this.padre.foo();
		dict_b['2018'].b = 'zzzzz';
	}
}

var obj = new ClassA();
var obj2 = new ClassB(obj);
obj2.init();
console.log(dict);
*/

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


function createExplorationMenu(exploration) {
	
	var content = $('<div/>').addClass('menu-content');
	var menu = $('<div/>').addClass('exploration-menu').css({'z-index' : '5'});

	for (var i = 0; i < 3; ++i){
		content.append('<button style="display: block; height: 9.324vh; width: 100%; margin: 3.007vh 0 3.007vh 0;"'
					   + ' name="' + explorations.length.toString() + '"'
					   + ' value="' + (i+1).toString() + '"'
					   + ' onclick="selectExplorationType(explorations[this.name], this.value, this.parentElement.parentElement)"'
					   + explorationMenuOptions[i] 
					   + '</button>');
	}

	menu.append(content);
	exploration.append(menu);
}


function selectExplorationType(exploration, type, menu) {
	exploration.type = parseInt(type);
	exploration.loadData();
	$(menu).css({'display': 'none'});
}


function createExploration(exploration) {
	//append close button
	exploration.append('<button class="vis-close-button" onclick="removeExploration(this)">x</button>');
	exploration.append('<p class="index" style="display:none;">' + explorations.length + '</p>');
	//append exploration menu
	createExplorationMenu(exploration);

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
}

