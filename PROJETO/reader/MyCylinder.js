/**
 * MyCylinder
 * @constructor
 */
 function MyCylinder(scene, base, top, height, slices, stacks) {
 	CGFobject.call(this,scene);

	//if slices not define, set to 6
 	slices = typeof slices !== 'undefined' ? slices : 6;

 	//if stacks not define, set to 5
 	stacks = typeof stacks !== 'undefined' ? stacks : 5;
	
	this.scene = scene;
	this.base = base;
	this.top = top;
	this.height = height;
	this.slices = slices;
	this.stacks = stacks;

	this.baseCircle = newMyCircle(this.scene, this.slices, this.base);
	this.topCircle = newMyCircle(this.scene, this.slices, this.top);
	
 	this.initBuffers();
 };

 MyCylinder.prototype = Object.create(CGFobject.prototype);
 MyCylinder.prototype.constructor = MyCylinder;

 MyCylinder.prototype.initBuffers = function() {
 	

	var n = 2*Math.PI / this.slices;

	var diference = (this.base - this.top) / this.stacks;
	this.vertices = [];
	this.normals = [];
	this.indices = [];
	this.texCoords = [];
	var z = 0;
	var tCoord = 1;
    var sUpdate = 1 / this.slices;
    var tUpdate = 1 / this.stacks;
	
	for(var q = 0; q < this.stacks+1; q++){
		
		var sCoord = 0;

		for(var i = 0; i < this.slices; i++)
		{
			this.vertices.push(
					Math.cos(i * n)*(this.base - diference * q),
					Math.sin(i * n)*(this.base - diference * q),
					z);
			
			this.normals.push(Math.cos(i * n),Math.sin(i * n), 0);
			
			this.texCoords.push(sCoord,tCoord);
			sCoord += sUpdate;
		}
		
		this.texCoords.push(sCoord,tCoord);
		tCoord -= tUpdate;
		var z += (this.height/this.stacks);

	}


    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < (this.slices); i++) {
            this.indices.push((i + 1) % (this.slices) + j * this.slices,
                i % (this.slices) + (j + 1) * this.slices,
                i % (this.slices) + j * this.slices);

            this.indices.push(i % (this.slices) + (j + 1) * this.slices,
                (i + 1) % (this.slices) + j * this.slices,
                (i + 1) % (this.slices) + (j + 1) * this.slices);
        }

    }


	

 	this.primitiveType = this.scene.gl.TRIANGLES;

 	this.initGLBuffers();
 };
 
 MyCylinder.prototype.display = function() {

    CGFobject.prototype.display.call(this);
    this.baseCircle.display();
    this.scene.rotate(Math.PI, 1, 0, 0);
    this.scene.translate(0, 0, -this.height);
    this.topCircle.display();
};
