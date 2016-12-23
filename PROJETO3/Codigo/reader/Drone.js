/**
 * Drone
 * @constructor
 */
 function Drone(scene) {
 	CGFobject.call(this,scene);


	this.scene = scene;
	this.piramide = new Piramide(this.scene, 4);
	
 	this.initBuffers();
 };

 Drone.prototype = Object.create(CGFobject.prototype);
 Drone.prototype.constructor = Drone;

 
 Drone.prototype.display = function() {

    CGFobject.prototype.display.call(this);
	this.scene.scale(0.8,0.8,0.8);
    this.piramide.display();
};
