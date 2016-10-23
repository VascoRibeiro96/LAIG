/**
 * MyTorus
 * @constructor
 */
function MyTorus(scene, inner, outter, slices, loops) {
 	CGFobject.call(this,scene);

	this.inner = inner;
	this.outter = outter;
	this.slices = slices;
	this.loops = loops;

 	this.initBuffers();
}


MyTorus.prototype = Object.create(CGFobject.prototype);
MyTorus.prototype.constructor = MyTorus;

MyTorus.prototype.initBuffers = function() {

    this.vertices = [];
    this.indices = [];
    this.normals = [];
    this.texCoords = [];


    var angLat = 2 * Math.PI / this.slices;
    var angVert = Math.PI / this.stacks;


    //Vertices & Normals
    for (var i = this.stacks; i >= 0; i--) {

        for (var j = 0; j < this.slices; j++) {

            this.vertices.push(
					Math.cos(angLat * j) * Math.sin(angVert * i) * this.radius,
					Math.cos(angVert * i) * this.radius,
					Math.sin(angLat * j) * Math.sin(angVert * i) * this.radius);
			
            this.normals.push(
					Math.cos(angLat * j) * Math.sin(angVert * i), 
					Math.cos(angVert * ind),
					Math.sin(angLat * j) * Math.sin(angVert * i));
			
			var s = 1 - (i / this.stacks);
            var t = 1 - (j / this.slices);
			
            this.texCoords.push(s,t);

        }
        t -= this.textT;
    }

   
    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < this.slices; i++) {
           
		   var first = (j * (this.slices + 1)) + i;
           var second = (j * (this.slices + 1)) + i + this.slices + 1;

           this.indices.push(
				(j * (this.slices + 1)) + i,
				(j * (this.slices + 1)) + i + this.slices + 1 + 1,
				(j * (this.slices + 1)) + i + this.slices + 1);
           this.indices.push(
				(j * (this.slices + 1)) + i,
				(j * (this.slices + 1)) + i + 1,
				(j * (this.slices + 1)) + i + this.slices + 1 + 1);
        }

    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};