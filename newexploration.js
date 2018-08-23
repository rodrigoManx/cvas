var explorations_count = 0;
var explorations = [];
const VIS_NUMBER = 4;
exploration_menu_options = ['>Large exploration', '>Especific exploration', 'disabled> Select data set']

function remove_exploration(exploration) {
	//alert("You're about to remove an exploration, are you sure?");
	if (confirm("You're about to remove an exploration, are you sure?")){
		exploration.parentNode.remove();
		explorations_count-=1;
		modify_exploration_css();
		modify_vis_css();
		onNewExploration();
	}
}


function create_exploration_menu(exploration) {
	
	var content = $('<div/>').addClass('menu-content');
	var menu = $('<div/>').addClass('exploration-menu').css({'z-index' : '5'});

	for (var i = 0; i < 3; ++i){
		content.append('<button style="display: block; height: 9.324vh; width: 100%; margin: 3.007vh 0 3.007vh 0;"'
					   + ' name="' + explorations.length.toString() + '"'
					   + ' value="' + (i+1).toString() + '"'
					   + ' onclick="select_exploration_type(explorations[this.name], this.value, this.parentElement.parentElement)"'
					   + exploration_menu_options[i] 
					   + '</button>');
	}

	menu.append(content);
	exploration.append(menu);
}


function select_exploration_type(exploration, type, menu) {
	exploration.type = parseInt(type);
	exploration.load_data();
	$(menu).css({'display': 'none'});
}


function create_exploration(exploration) {
	//append close button
	exploration.append('<button class="vis-close-button" onclick="remove_exploration(this)">x</button>');

	//append exploration menu
	create_exploration_menu(exploration);

	//append vis
	for (var i = 0; i < VIS_NUMBER; ++i)
		exploration.append('<div class="vis vis' + i.toString() + '"></div>');

	exploration.find('.vis1').append('<p style="display:none;">' + explorations.length + '</p>');

	explorations.push(new Exploration(exploration));
}


function modify_vis_css() {
	if (explorations_count == 1 || explorations_count == 2)
		$('.vis').css({'width': '50%', 'height':'50%'}); 
	else
		$('.vis').css({'width': '100%', 'height':'25%'}); 	
}


function modify_exploration_menu() {
	if (explorations_count == 1)
		$('.exploration-menu').css({'width': '24%', 'margin-left':'-12%'}); 	
	else if (explorations_count == 2)
		$('.exploration-menu').css({'width': '48%', 'margin-left':'-24%'});
	else
		$('.exploration-menu').css({'width': '70%', 'margin-left':'-35%'}); 	
}


function modify_exploration_css() {
	if (explorations_count == 0) {
		$('.exploration').css({'width': '99.6%'});
	}
	else {
		$('.exploration').css({'width': (99.6 * (1 / (explorations_count))).toString() + '%'}); 
	}
	modify_exploration_menu();
}


function add_new_exploration() {
	var new_exploration = $('<div/>').addClass('exploration');
	$('#content').append(new_exploration);
	
	create_exploration(new_exploration);
	
	explorations_count+=1;
	modify_exploration_css();
	modify_vis_css();
	onNewExploration();
}


$(document).ready ( function(){
   add_new_exploration();
});