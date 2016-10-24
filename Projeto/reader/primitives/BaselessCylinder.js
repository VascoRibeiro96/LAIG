/**
 * BaselessCylinder
 * @constructor
 */
function BaselessCylinder(scene, base, top, height, slices, stacks) {
    CGFobject.call(this, scene);

    this.slices = slices;
    this.stacks = stacks;
    this.height = height;
    this.base = base;
    this.top = top;

    this.initBuffers();
};

BaselessCylinder.prototype = Object.create(CGFobject.prototype);
BaselessCylinder.prototype.constructor = BaselessCylinder;

BaselessCylinder.prototype.initBuffers = function() {
    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.originalTexCoords = [];

    let multiplier = (this.base - this.top) / (this.stacks);
    var patchLengthx = 1 / this.slices;
    var patchLengthy = 1 / this.stacks;
    var xCoord = 0;
    var yCoord = 0;
    var ang = (2 * Math.PI) / this.slices;

    for (i = 0; i <= this.stacks; i++) {
        for (j = 0; j < this.slices; j++) {
            this.vertices.push(Math.cos(ang * j) * ((this.stacks - i) * multiplier + this.top), Math.sin(ang * j) * ((this.stacks - i) * multiplier + this.top), i / this.stacks * this.height);
            this.normals.push(Math.cos(ang * j), Math.sin(ang * j), 0);
            this.originalTexCoords.push(xCoord, yCoord);
            xCoord += patchLengthx;
        }
        xCoord = 0;
        yCoord += patchLengthy;
    }

    for (i = 0; i < this.stacks; i++) {
        for (j = 0; j < this.slices - 1; j++) {
            this.indices.push(i * this.slices + j, i * this.slices + j + 1, (i + 1) * this.slices + j);
            this.indices.push(i * this.slices + j + 1, (i + 1) * this.slices + j + 1, (i + 1) * this.slices + j);
        }

        this.indices.push(i * this.slices + this.slices - 1, i * this.slices, (i + 1) * this.slices + this.slices - 1);
        this.indices.push(i * this.slices, i * this.slices + this.slices, (i + 1) * this.slices + this.slices - 1);
    }

    this.texCoords = this.originalTexCoords.slice();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

/**
 * Amplifies the texture according to the s and t variables.
 * The cylinder body does not need amplifying as it is a quadric surface.
 * Even though it does not do anything, it needs to be present due to
 * inheritance.
 */
BaselessCylinder.prototype.amplifyTexture = function(amplifierS, amplifierT) {
  for (let i = 0; i < this.originalTexCoords.length; i += 2) {
      this.texCoords[i] = this.originalTexCoords[i] / amplifierS;
      this.texCoords[i + 1] = this.originalTexCoords[i + 1] / amplifierT;
  }

  this.updateTexCoordsGLBuffers();
}
