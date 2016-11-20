function Vehicle(scene){
	CGFObject.call(this, scene);
	this.scene = scene;
	
	//create controlPoints
	var controlPoints;
	
	//this.patch = new Patch(scene,value, value, value, value, controlPoints);
};

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor = Vehicle;

Vehicle.prototype.display = function(){
	this.patch.display();
};

