/**
 * Queen
 * @constructor
 */
 function Queen(scene) {
 	CGFobject.call(this,scene);


	this.scene = scene;
	this.piramide = new Piramide(this.scene, 4);
	
 	this.initBuffers();
 };

 Queen.prototype = Object.create(CGFobject.prototype);
 Queen.prototype.constructor = Queen;

 
 Queen.prototype.display = function() {

    CGFobject.prototype.display.call(this);
    this.piramide.display();
};

