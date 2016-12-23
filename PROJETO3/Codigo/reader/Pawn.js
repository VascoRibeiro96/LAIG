/**
 * Pawn
 * @constructor
 */
 function Pawn(scene) {
 	CGFobject.call(this,scene);


	this.scene = scene;
	this.piramide = new Piramide(this.scene, 4);
	
 	this.initBuffers();
 };

 Pawn.prototype = Object.create(CGFobject.prototype);
 Pawn.prototype.constructor = Pawn;

 
 Pawn.prototype.display = function() {

    CGFobject.prototype.display.call(this);
	this.scene.scale(0.6,0.6,0.6);
    this.piramide.display();
};
