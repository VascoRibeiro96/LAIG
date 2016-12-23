/**
 * Torus
 * @constructor
 */
function Torus(scene, inner, outer, slices, loops) {
    CGFobject.call(this, scene);

    this.inner = inner;
    this.outer = outer;
    this.slices = slices;
    this.loops = loops;

    this.initBuffers();
};


Torus.prototype = Object.create(CGFobject.prototype);
Torus.prototype.constructor = Torus;

Torus.prototype.initBuffers = function() {

    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];
	

    var angslices = 2 * Math.PI / this.slices;
    var angloops = 2 * Math.PI / this.loops;
    var idvertices = 0;

    for (var i = 0; i <= this.slices; i++) {
        for (var j = 0; j <= this.loops; j++) {

            this.vertices.push(
					(this.outer + this.inner * Math.cos(j * angloops)) * Math.cos(i * angslices),
					(this.outer + this.inner * Math.cos(j * angloops)) * Math.sin(i * angslices),
					this.inner * Math.sin(j * angslices));
					
					
            this.normals.push(
					(this.inner * Math.cos(j * angloops)) * Math.cos(i * angslices),
					(this.inner * Math.cos(j * angloops)) * Math.sin(i * angslices),
					this.inner * Math.sin(j * angslices));

            var xCoord = Math.acos((this.outer + this.inner * Math.cos(j * angloops)) * Math.cos(i * angslices) / this.inner) / (2 * Math.PI);
            var yCoord = 2 * Math.PI * Math.acos((this.inner * Math.sin(j * angslices)) / (this.inner + this.outer * Math.cos(2 * Math.PI * xCoord)));

            yCoord = i / this.slices;
            xCoord = (j % (this.loops + 1)) / this.slices;

            this.texCoords.push(xCoord, yCoord);

            idvertices++;

            if (i > 0 && j > 0) {
                this.indices.push(idvertices - this.loops - 2, idvertices - 2, idvertices - 1);
                this.indices.push(idvertices - 2, idvertices - this.loops - 2, idvertices - this.loops - 3);
            }
        }
    }

   
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();

}
