/**
 * Drone
 * @constructor
 */
 function Drone(scene) {
	 this.id = null;
 	CGFobject.call(this,scene);


	this.scene = scene;
	this.piramide = new Piramide(this.scene, 4);
	
 	this.initBuffers();
 };

 Drone.prototype = Object.create(CGFobject.prototype);
 Drone.prototype.constructor = Drone;

  Drone.prototype.setId = function(id){
  this.id = id;
}
 
 Drone.prototype.select = function(){
  console.log("You selected a queen with id=" + this.id);
}
 
 Drone.prototype.display = function() {

    CGFobject.prototype.display.call(this);
	this.scene.scale(0.8,0.8,0.8);
    this.piramide.display();
};
