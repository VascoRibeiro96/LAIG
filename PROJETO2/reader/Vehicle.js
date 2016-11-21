function Vehicle(scene){
	CGFobject.call(this, scene);
	this.scene = scene;
	
	//create controlPoints
	
	var bodycontrolPoints = 
	[
	[0.5,0,-1],
	[0.5,0,0],
	[0.25,0,0],
	[0,0,1],

	[0.25,0,-1],
	[0.25,0.5,0],
	[0,0.5,0],
	[0,0,1],

	[-0.25,0,-1],
	[-0.25,0.5,0],
	[0,0.5,0],
	[0,0,1],

	[-0.5,0,-1],
	[-0.5,0,0],
	[-0.25,0,0],
	[0,0,1]
	];
	
	this.body = new Patch(scene,3,3,50,50, bodycontrolPoints);
	
	this.cylinder = new Cylinder(this.scene, 0.1, 0.1, 0.3,30,15);
	
	this.XPTriangle = new Triangle(this.scene, 0,0,0, 0,0,-1, 0,0.5,-1);
	this.XNTriangle = new Triangle(this.scene, 0,0,0, 0,0.5,-1, 0,0,-1);
	
};

Vehicle.prototype = Object.create(CGFobject.prototype);
Vehicle.prototype.constructor = Vehicle;

Vehicle.prototype.display = function(){
	
	this.body.display();
	
	this.scene.pushMatrix();
	this.scene.rotate(Math.PI, 0,0,1);
	this.body.display();
	this.scene.popMatrix();
	
	this.XPTriangle.display();
	this.XNTriangle.display();
	
	this.scene.pushMatrix();
	this.scene.translate(0.1,0.2,-1);
	this.cylinder.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
	this.scene.translate(-0.1,0.2,-1);
	this.cylinder.display();
	this.scene.popMatrix();
	
	
};

