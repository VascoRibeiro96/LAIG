
function BoardCell(scene, x, y, object, prevColor) {
	CGFobject.call(this, scene);

	this.id = null;
  this.scene = scene;
  this.cell = object;
  this.x = x;
  this.y = y;

  this.transfMat = mat4.create();
  mat4.identity(this.transfMat);
  var posx = 5 + 2 * this.x;
  var posy =  -(5 + 2 * this.y);

  this.appearance = new CGFappearance(this.scene);

  if(prevColor == "white"){
    this.appearance.setAmbient(1, 1, 1, 1);
    this.appearance.setDiffuse(1, 1, 1, 1);
    this.appearance.setSpecular(1, 1, 1, 1);
  }

  mat4.translate(this.transfMat, this.transfMat, [posx, 0, posy]);

	this.originalTransfMat = mat4.create();
	mat4.identity(this.originalTransfMat);
	mat4.copy(this.originalTransfMat, this.transfMat);

	this.type = "empty";
};

BoardCell.prototype = Object.create(CGFobject.prototype);
BoardCell.prototype.constructor=BoardCell;

BoardCell.prototype.setId = function(id){
	this.id = id;
}

BoardCell.prototype.select = function(){
	console.log("You selected a board cell in position: " + this.x + "/" + this.y);
}

BoardCell.prototype.display = function(){
  this.scene.pushMatrix();
  this.appearance.apply();
	this.scene.multMatrix(this.transfMat);
	this.cell.display();
	this.scene.popMatrix();
}
