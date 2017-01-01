
function Queen(scene, x, y) {
  this.id = null;
  this.scene = scene;
  this.scene.pushMatrix();
	CGFobject.call(this,scene);
  this.pyramid = new CGFquadPyramid(scene, 3, 1.4);

  this.materialA = new CGFappearance(scene);
  this.materialA.setAmbient(1, 0, 1, 1.0);

  this.primitiveType = scene.gl.TRIANGLES;

  this.type = "queen";

  this.x = x;
  this.y = y;

  this.transfMat = mat4.create();
  mat4.identity(this.transfMat);
  var posx = 5 + 2 * this.x;
  var posy =  -(5 + 2 * this.y);

  mat4.translate(this.transfMat, this.transfMat, [posx, 0, posy]);

	this.originalTransfMat = mat4.create();
	mat4.identity(this.originalTransfMat);
	mat4.copy(this.originalTransfMat, this.transfMat);

  this.animation = null;
};

Queen.prototype = Object.create(CGFobject.prototype);
Queen.prototype.constructor = Queen;

Queen.prototype.setId = function(id){
  this.id = id;
}

Queen.prototype.select = function(){
  console.log("You selected a queen in cell: " + this.x + "/" + this.y);
}

Queen.prototype.updateMatrix = function(){
  this.transfMat = mat4.create();
  mat4.identity(this.transfMat);
  var posx = 5 + 2 * this.x;
  var posy =  -(5 + 2 * this.y);

  mat4.translate(this.transfMat, this.transfMat, [posx, 0, posy]);

	this.originalTransfMat = mat4.create();
	mat4.identity(this.originalTransfMat);
	mat4.copy(this.originalTransfMat, this.transfMat);
}

Queen.prototype.display = function() {
this.scene.pushMatrix();
this.updateMatrix();
this.scene.multMatrix(this.transfMat);
if(this.animation != null && this.moving){
  this.animation.apply();
}
this.scene.rotate(-Math.PI/2, 1, 0, 0);
this.materialA.apply();
this.pyramid.display();
this.scene.popMatrix();
}
