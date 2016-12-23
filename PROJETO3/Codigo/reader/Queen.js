/**
 * Queen
 * @constructor
 */
 function Queen(scene) {
	  this.id = null;
 	CGFobject.call(this,scene);


	this.scene = scene;
	this.piramide = new Piramide(this.scene, 4);
	
 	this.initBuffers();
 };

 Queen.prototype = Object.create(CGFobject.prototype);
 Queen.prototype.constructor = Queen;

 Queen.prototype.setId = function(id){
  this.id = id;
}
 
 Queen.prototype.select = function(){
  console.log("You selected a queen with id=" + this.id);
}
 
 Queen.prototype.display = function() {

    CGFobject.prototype.display.call(this);
    this.piramide.display();
};

