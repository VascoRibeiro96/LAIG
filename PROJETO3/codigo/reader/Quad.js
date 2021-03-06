
 function Quad(scene, minX, minY, maxX, maxY) {
  	CGFobject.call(this,scene);

   this.minS = 0;
   this.maxS = 1;
   this.minT = 0;
   this.maxT = 1;

   this.minX = minX;
   this.minY = minY;
   this.maxX = maxX;
   this.maxY = maxY;

  	this.initBuffers();
  };

  Quad.prototype = Object.create(CGFobject.prototype);
  Quad.prototype.constructor = Quad;

  Quad.prototype.initBuffers = function() {
   this.vertices = [ this.minX, this.minY, 0,
                     this.maxX, this.minY, 0,
                     this.minX, this.maxY, 0,
                     this.maxX, this.maxY, 0];

   this.indices = [  0, 1, 2,
                     2, 1, 0,
                     1, 2, 3,
                     3, 2, 1];

   this.normals = [ 0, 0, 1,
                    0, 0, 1,
                    0, 0, 1,
                    0, 0, 1];

   this.texCoords = [this.minS, this.maxT,
                     this.maxS, this.maxT,
                     this.minS, this.minT,
                     this.maxS, this.minT];

   this.primitiveType = this.scene.gl.TRIANGLES;
   this.initGLBuffers();
  };
