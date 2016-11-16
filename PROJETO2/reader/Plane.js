function Plane(scene, dimX, dimY, partsX, partsY){
	
	this.scene = scene;
	this.dimX = dimX;
	this.dimY = dimY;
	this.partsX = partsX;
	this.partsY = partsY;
		
	var controlPoints = [
                    [0,this.dimY, 0,1],
                    [this.dimX, this.dimY ,0,1],
                    [0,0,0,1],
                    [this.dimX,0,0,1]
                    ];
					
	this.plane = new Patch(this.scene, 1 , 1, this.partsX, this.partsY, controlPoints);
}

Plane.prototype = Object.create(CGFnurbsObject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.display = function(){
	this.plane.display();
}
