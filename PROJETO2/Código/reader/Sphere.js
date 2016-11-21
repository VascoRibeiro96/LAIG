/**
 * Sphere
 * @constructor
 */
function Sphere(scene, radius, slices, stacks) {
    CGFobject.call(this, scene);

    this.slices = slices;
    this.stacks = stacks;
    this.radius = radius;

    this.initBuffers();
};

Sphere.prototype = Object.create(CGFobject.prototype);
Sphere.prototype.constructor = Sphere;

Sphere.prototype.initBuffers = function() {

    this.vertices = [];
    this.normals = [];
    this.indices = [];
    this.texCoords = [];

    var theta = (2 * Math.PI) / this.slices; // 0-360 deg -- longitude
    var phi = (Math.PI) / this.stacks; // 0-180 deg -- latitude
    var idvertices = 0;


    for (var i = 0; i <= this.slices; i++) {
        for (var j = 0; j <= this.stacks; j++) {


            this.vertices.push(
					this.radius * Math.cos(theta * i) * Math.sin(phi * j),
					this.radius * Math.sin(theta * i) * Math.sin(phi * j),
					this.radius * Math.cos(phi * j));
				
            idvertices++;

            this.normals.push(
					Math.cos(theta * i) * Math.sin(phi * j),
					Math.sin(theta * i) * Math.sin(phi * j),
					Math.cos(phi * j));

            if (i > 0 && j > 0) {
                this.indices.push(idvertices - this.stacks - 1, idvertices - 1, idvertices - this.stacks - 2);
                this.indices.push(idvertices - 1, idvertices - 2, idvertices - this.stacks - 2);
            }

            this.texCoords.push(0.5 * Math.cos(theta * i) * Math.sin(phi * j) + 0.5, 0.5 - 0.5 * Math.sin(theta * i) * Math.sin(phi * j));
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

