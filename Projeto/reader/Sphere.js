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
    this.originalTexCoords = [];

    var theta = (2 * Math.PI) / this.slices; // 0-360 deg -- longitude
    var phi = (Math.PI) / this.stacks; // 0-180 deg -- latitude
    var n_verts = 0;


    for (var i = 0; i <= this.slices; i++) {
        for (var j = 0; j <= this.stacks; j++) {

            let x = Math.cos(theta * i) * Math.sin(phi * j);
            let y = Math.sin(theta * i) * Math.sin(phi * j);
            let z = Math.cos(phi * j);

            this.vertices.push(this.radius * x, this.radius * y, this.radius * z);
            n_verts++;

            this.normals.push(x, y, z);

            if (i > 0 && j > 0) {
                this.indices.push(n_verts - this.stacks - 1, n_verts - 1, n_verts - this.stacks - 2);
                this.indices.push(n_verts - 1, n_verts - 2, n_verts - this.stacks - 2);
            }

            this.originalTexCoords.push(0.5 * x + 0.5, 0.5 - 0.5 * y);
        }

    }

    this.texCoords = this.originalTexCoords.slice();
    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

