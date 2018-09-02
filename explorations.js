var exploration_type = {'default': 0, 'large': 1, 'especific': 2}
var exploration_level = {'year': 5, 'month': 12, 'day': 31}

window.addEventListener( 'resize', onWindowResize, false );

class Exploration {
	constructor(exploration) {
		this.exploration_level = exploration_level.year;
		this.type = exploration_type.default;
		this.vis0 = exploration.find('.vis1');
		this.vis1 = exploration.find('.vis0');
		this.vis2 = exploration.find('.vis2');
		this.vis3 = exploration.find('.vis3');
		this.camera = null;
		this.scene = null;
		this.renderer = null;
		this.vis0_obj = new Grid(this.vis0, this);
		this.vis1_obj = new Kernelmap(this.vis1);
	}



	load_data() {
		switch(this.type) {
			case 1:
				this.init_large_exploration();
				break;
			case 2:
				break;
			default:
				break;
		}
	}

	free_memory () {
		this.vis0_obj.free_memory();
	}

	init_large_exploration() {
		this.vis1_obj.init();
		this.vis0_obj.init(this.vis1_obj.height, this.vis1_obj.width, []);
		this.vis0.bind( 'mousemove', onDocumentMouseMove);
		this.vis0.bind( 'mousedown', onDocumentMouseDown);
		this.vis0.bind( 'mouseup', onDocumentMouseUp);
		this.vis0.bind( 'mousewheel', onDocumentScroll);
	}

	init_especific_exploration() {
	}
}

function onWindowResize() {
	for (var i = 0; i < explorations.length; ++i){
		try {
			explorations[i].vis0_obj.camera.aspect = explorations[i].vis0.innerWidth() / explorations[i].vis0.innerHeight();
			explorations[i].vis0_obj.renderer.setSize( explorations[i].vis0.innerWidth(), explorations[i].vis0.innerHeight() );
			explorations[i].vis0_obj.camera.updateProjectionMatrix();
		}
		catch(err) {
		}
	}
}


function onNewExploration() {

	//for (var i = 0; i < explorations.length; ++i){
	//	try {
	//		explorations[i].free_memory();
	//	}
	//	catch(err) {
	//	}
	//}
	$('canvas').remove();
	for (var i = 0; i < explorations.length; ++i){
		try {
			if (explorations[i].type != 0){
				explorations[i].vis1_obj.init();
				explorations[i].vis0_obj.update_vis(explorations[i].vis1_obj.height, explorations[i].vis1_obj.width, []);
			}
		}
		catch(err) {
		}
	}
}


function onDocumentScroll( event ){
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].vis0_obj.zoom_vis(event.originalEvent.deltaY);

}

function onDocumentMouseUp( event ) {
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].vis0_obj.mouse_up();
}


function onDocumentMouseMove( event ) {
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].vis0_obj.rotate_vis(event.clientX, event.clientY);
}


function onDocumentMouseDown( event ) {
	var index = parseInt($(this).find('p').text());
	event.preventDefault();
	explorations[index].vis0_obj.mouse_down();
}