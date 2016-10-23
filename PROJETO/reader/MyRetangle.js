/**
 * MyRetangle
 * @constructor
 */
 function MyRetangle(scene, x1, y1, x2, y2) {
 	CGFobject.call(this,scene);

	x1 = typeof x1 !== 'undefined' ? x1 : 0.0;
	x2 = typeof x2 !== 'undefined' ? x2 : 1.0;
	y1 = typeof y1 !== 'undefined' ? y1 : 0.0;
	y2 = typeof y2 !== 'undefined' ? y2 : 1.0;
	this.x1 = x1;
	this.x2 = x2;
	this.y1 = y1;
	this.y2 = y2;

 	this.initBuffers();
 };

MyRetangle.prototype = Object.create(CGFobject.prototype);
MyRetangle.prototype.constructor = MyRetangle;

MyRetangle.prototype.initBuffers = function() {

 	this.vertices = [
 	this.x1, this.y1, 0,
 	this.x2, this.y1, 0,
 	this.x1, this.y2, 0,
 	this.x2, this.y2, 0
 	];

 	this.indices = [
 	0, 1, 2, 
 	3, 2, 1
 	];

 	this.primitiveType = this.scene.gl.TRIANGLES;

    this.normals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
    ];

    this.texCoords = [

	this.x2,this.y1,
	this.x2,this.y2,
	this.x1,this.y1,
	this.x1,this.y2
	
	];
    

    
 	this.initGLBuffers();
 };