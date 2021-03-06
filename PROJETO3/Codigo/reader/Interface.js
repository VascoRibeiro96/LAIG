
function Interface() {
	//call CGFinterface constructor
	CGFinterface.call(this);
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

Interface.prototype.init = function(application) {
	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);

	// init GUI. For more information on the methods, check:
	//  http://workshop.chromeexperiments.com/examples/gui

	this.gui = new dat.GUI();



	this.difficulty = 'Dumb';
	this.difficulties = [ 'Dumb', 'Smart'];

	this.type = 'P vs P';
	this.types = ['P vs P', 'P vs CPU', 'CPU vs CPU'];

	this.p1Points = 0;
	this.p2Points = 0;

	this.gui.autoListen = false;

	var self = this;

	this.defaultControls = [];

	this.game = this.gui.addFolder("Game");
	this.game.open();
	this.scores = this.gui.addFolder("Score");

	this.defaultControls[0] = this.game.add(this,'startGame').name('Start Game');
	this.defaultControls[2] = this.scores.add(this, 'p1Points', this.p1Points).name('Player 1: ').listen();
	this.defaultControls[3] = this.scores.add(this, 'p2Points', this.p2Points).name('Player 2: ').listen();
	this.defaultControls[4] = this.game.add(this, 'type', this.types).name('Type of game').listen();
	this.defaultControls[5] = this.game.add(this, 'difficulty', this.difficulties).name('Difficulty').listen();
	
	this.omnilights = this.gui.addFolder("Omnilights");
	this.spotlights = this.gui.addFolder("Spotlights");


	return true;
};


Interface.prototype.startGame = function(){
	this.scores.open();

	this.scene.board.history = new History(this.scene);
	this.scene.board.makeRequest('init');
	this.scene.setPickEnabled(true);
	if(this.scene.board.history.type == 3){
			if(this.scene.board.history.playing == this.scene.board.history.player1)
				this.points = this.scene.board.history.p1Points;
			else
				this.points = this.scene.board.history.p2Points;

			this.scene.board.makeRequest('bot_play(' + this.scene.board.boardToList() + ',' + this.scene.board.history.playing + ',' + this.points + ',' + this.scene.board.history.difficulty + ')');
	}
}

/*
* Adds a new light to the interface
*/
Interface.prototype.addLight = function(type, index, name){
	if(type == "omni")
  	this.omnilights.add(this.scene.lightStatus, index, this.scene.lightStatus[index]).name(name);
	else
		this.spotlights.add(this.scene.lightStatus, index, this.scene.lightStatus[index]).name(name);
}


Interface.prototype.processKeyboard = function(event) {
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyboard.call(this,event);

	// Check key codes e.g. here: http://www.asciitable.com/
	// or use String.fromCharCode(event.keyCode) to compare chars
	// for better cross-browser support, you may also check suggestions on using event.which in http://www.w3schools.com/jsref/event_key_keycode.asp
	switch (event.keyCode)
	{
		case (77):
		case (109): // 'm' and 'M' ascii code

			this.scene.updateMaterial();
			break;
		case (86):
		case (118): // 'v' and 'V' ascii code

			this.scene.updateViews();
			break;
		default:
			break;
	};
};

Interface.prototype.processKeyUp = function(event)
{
	CGFinterface.prototype.processKeyUp.call(this,event);
};
