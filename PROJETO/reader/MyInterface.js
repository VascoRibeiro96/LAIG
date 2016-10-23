/**
 * MyInterface
 * @constructor
 */
 
 
function MyInterface() {
	//call CGFinterface constructor 
	CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function(application) {
	// call CGFinterface init
	CGFinterface.prototype.init.call(this, application);
	
	// init GUI. For more information on the methods, check:
	//  http://workshop.chromeexperiments.com/examples/gui
	
	this.gui = new dat.GUI();
	

	// add a button:
	// the first parameter is the object that is being controlled (in this case the scene)
	// the identifier 'doSomething' must be a function declared as part of that object (i.e. a member of the scene class)
	// e.g. LightingScene.prototype.doSomething = function () { console.log("Doing something..."); }; 

	// add two check boxes to the group. The identifiers must be members variables of the scene initialized in scene.init as boolean
	// e.g. this.option1=true; this.option2=false;
	
	// add a slider
	// must be a numeric variable of the scene, initialized in scene.init e.g.
	// this.speed=3;
	// min and max values can be specified as parameters

	this.omniFolder = this.gui.addFolder("Lights");
	this.omniFolder.open();
	this.spotFolder = this.gui.addFolder("Lights");
	this.spotFolder.open();

	
	return true;
};

MyInterface.prototype.addScene = function(scene) {
    this.scene = scene;
    this.addLights();
};

MyInterface.prototype.addLights = function() {
    for (var i = 0; i < this.scene.lightsOn.length; i++) {
        var info = this.scene.lightsInfo[i];

        if (info.type === "omni") {
            this.omniFolder.add(this.scene.lightsOn, i, this.scene.lightsOn[i]).name(info.id);
        } else {
            this.spotFolder.add(this.scene.lightsOn, i, this.scene.lightsOn[i]).name(info.id);
        }
    }
};

/**
 * processKeyboard
 * @param event {Event}
 */
MyInterface.prototype.processKeyboard = function(event) {
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyboard.call(this,event);
	
	// Check key codes e.g. here: http://www.asciitable.com/
	// or use String.fromCharCode(event.keyCode) to compare chars
	
	// for better cross-browser support, you may also check suggestions on using event.which in http://www.w3schools.com/jsref/event_key_keycode.asp
	switch (event.keyCode || event.switch)
	{
		
        case (65):
            this.scene.switchPerspective();
            this.setActiveCamera(this.scene.camera);
            break;
        
        case (83):
            this.scene.incrementMaterials();
            break;
	};

};

MyInterface.prototype.processKeyUp = function(event) {
	// call CGFinterface default code (omit if you want to override)
	CGFinterface.prototype.processKeyUp.call(this,event);
};