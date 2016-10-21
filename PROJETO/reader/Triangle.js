/**
 * MyTriangle
 * @constructor
 */
 function MyTriangle(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
 	CGFobject.call(this,scene);

	x1 = typeof x1 !== 'undefined' ? x1 : 0.0;
	x2 = typeof x2 !== 'undefined' ? x2 : 1.0;
	x3 = typeof x3 !== 'undefined' ? x3 : 1.0;
	y1 = typeof y1 !== 'undefined' ? y1 : 0.0;
	y2 = typeof y2 !== 'undefined' ? y2 : 0.0;
	y3 = typeof y3 !== 'undefined' ? y3 : 1.0;
	z1 = typeof z1 !== 'undefined' ? z1 : 0.0;
	z2 = typeof z2 !== 'undefined' ? z2 : 0.0;
	z3 = typeof z3 !== 'undefined' ? z3 : 0.0;
	
	this.x1 = x1;
	this.x2 = x2;
	this.x3 = x3;
	this.y1 = y1;
	this.y2 = y2;
	this.y3 = y3;
	this.z1 = z1;
	this.z2 = z2;
	this.z3 = z3;

 	this.initBuffers();
 };

 MyQuad.prototype = Object.create(CGFobject.prototype);
 MyQuad.prototype.constructor = MyQuad;

 MyQuad.prototype.initBuffers = function() {

 	this.vertices = [
 	x1, y1, z1,
 	x2, y2, z2,
 	x3, y3, z3,
 	];

 	this.indices = [
 	0, 1, 2, 
 	];

 	this.primitiveType = this.scene.gl.TRIANGLES;

    this.normals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    ];

	];
    

    
 	this.initGLBuffers();
 };