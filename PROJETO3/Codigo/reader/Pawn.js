/**
 * Pawn
 * @constructor
 */
 function Pawn(scene) {
	  this.id = null;
 	CGFobject.call(this,scene);


	this.scene = scene;
	this.piramide = new Piramide(this.scene, 4);
	
 	this.initBuffers();
 };

 Pawn.prototype = Object.create(CGFobject.prototype);
 Pawn.prototype.constructor = Pawn;

  Pawn.prototype.setId = function(id){
  this.id = id;
}
 
 Pawn.prototype.select = function(){
  console.log("You selected a queen with id=" + this.id);
}
 
 Pawn.prototype.display = function() {

    CGFobject.prototype.display.call(this);
	this.scene.scale(0.6,0.6,0.6);
    this.piramide.display();
};
