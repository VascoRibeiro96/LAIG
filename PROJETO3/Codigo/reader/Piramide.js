/**
 * MyPiramide
 * @constructor
 */
 function Piramide(scene, slices) {
 	CGFobject.call(this,scene);
	
	this.slices = slices;

 	this.initBuffers();
 };

 Piramide.prototype = Object.create(CGFobject.prototype);
 Piramide.prototype.constructor = Piramide;

 Piramide.prototype.initBuffers = function() {

	var xCoord = 1;
	var yCoord = 0;
	var zCoord = 0;
	var ang = 0;
	var dAng = 2 * Math.PI / this.slices;

 	this.vertices = [];
 	this.indices = [];
	this.normals = [];
	this.texCoords = [];

	for(var i = 0; i <= this.slices; i++){
		this.vertices.push(0, 1, 0);
		this.vertices.push(xCoord, yCoord, zCoord);
		
		ang += dAng;
		xCoord = Math.cos(ang);
		zCoord = Math.sin(ang);
		
		this.vertices.push(xCoord, yCoord, zCoord);
		
		this.normals.push(Math.cos(Math.cos( ang + (dAng / 2))), Math.sin(Math.atan(1)), Math.sin( ang + (dAng / 2))); //atan(1) porque se está a usar xCoord = 1, se xCoord=0.5 -> atan(0.5)
		this.normals.push(Math.cos(Math.cos( ang + (dAng / 2))), Math.sin(Math.atan(1)), Math.sin( ang + (dAng / 2)));
		this.normals.push(Math.cos(Math.cos( ang + (dAng / 2))), Math.sin(Math.atan(1)), Math.sin( ang + (dAng / 2)));
		
		this.texCoords.push(1,1);
		this.texCoords.push(1,1);
		this.texCoords.push(1,1);
		
		this.indices.push(3*i+2, 3*i+1, 3*i);
	}
	
	xCoord = 1;
	yCoord = 0;
	zCoord = 0;
	
	ang = 0;
	
	var nI = this.vertices.length / 3 ;
	
	this.vertices.push(0, 0, 0);
	this.normals.push(0, -1, 0);
	this.texCoords.push(1,1);
	
	for(var j = 0; j < this.slices; j++){
		this.vertices.push(xCoord, yCoord, zCoord);

		
		this.normals.push(0, -1, 0);
		this.normals.push(0, -1, 0);
		
		this.texCoords.push(1,1);
		this.texCoords.push(1,1);
		
		if(j > 0) {
			this.indices.push(nI+j+1, nI, nI+j);
			console.debug(nI + j + 1);
			console.debug(nI + j);
			console.debug(nI);
			
			console.debug("-------");
		}
		
		if(j == this.slices-1)
			this.indices.push(nI+1, nI, nI+j+1);
				
		ang += dAng;
		xCoord = Math.cos(ang);
		zCoord = Math.sin(ang);
	}
	
 	this.primitiveType = this.scene.gl.TRIANGLES;
 	this.initGLBuffers();
 };