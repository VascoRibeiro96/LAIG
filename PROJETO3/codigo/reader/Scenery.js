
function Scenery(scene) {

	this.scene = scene;


	this.materialA = new CGFappearance(this.scene);
	this.materialA.loadTexture("./resources/images/universe2.jpg")

	this.initSpace();

};

Scenery.prototype.display = function(){

	console.log("O CENARIO APARECE");

	this.scene.pushMatrix();
	this.scene.multMatrix(this.spaceWallsMatrix);

	this.materialA.apply();

	this.spaceW.display();
	this.scene.popMatrix();
}

Scenery.prototype.initSpace = function(){

	this.spaceWalls = new Cube(this.scene, 5, 5,5);
	this.initSpaceMatrixes();

	this.spaceW =	new UnitCubeQuad(this.scene);
}

Scenery.prototype.initSpaceMatrixes = function(){
	this.spaceWallsMatrix = mat4.create();
	mat4.identity(this.spaceWallsMatrix);
	mat4.translate(this.spaceWallsMatrix, this.spaceWallsMatrix, [12, 0,-8]);
	mat4.scale(this.spaceWallsMatrix, this.spaceWallsMatrix, [100, 100, 100]);
}
