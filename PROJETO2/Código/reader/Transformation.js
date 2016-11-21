function Transformation(scene) {
    this.scene = scene;

    this.scene.pushMatrix();
    this.scene.loadIdentity();
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}

Transformation.prototype.constructor = Transformation;

Transformation.prototype.rotate = function(angle, x, y, z) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.rotate(angle*Math.PI/180, x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}

Transformation.prototype.translate = function(x, y, z) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.translate(x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}

Transformation.prototype.scale = function(x, y, z) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.scale(x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}

Transformation.prototype.multiply = function(transformation) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.multMatrix(transformation.getMatrix());
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}

Transformation.prototype.getMatrix = function() {
    return this.transformationMatrix;
}
