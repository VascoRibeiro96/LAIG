function Plane(scene, dimX, dimY, partsX, partsY){
	
	CGFobject.call(this,scene);
	this.scene = scene;
	this.dimX = dimX;
	this.dimY = dimY;
	this.partsX = partsX;
	this.partsY = partsY;
		
	this.ontrolPoints = [
                    [-this.dimX/2,-this.dimY/2,0],
                    [-this.dimX/2,this.dimY/2,0],
                    [this.dimX/2,-this.dimY/2,0],
                    [this.dimX/2,this.dimY/2,0]
                    ];
					
	this.plane = new Patch(this.scene, 1 , 1, this.partsX, this.partsY, this.controlPoints);
}

Plane.prototype = Object.create(CGFnurbsObject.prototype);
Plane.prototype.constructor = Plane;

Plane.prototype.display = function(){
	this.plane.display();
}
