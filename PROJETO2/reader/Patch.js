function Patch(scene, orderU, orderV, partsU, partsV, controlPoints){

	CGFObject.call(this, scene);
	this.scene = scene;
	this.orderU = orderU;
	this.orderV = orderV;
	this.partsU = partsU;
	this.partsV = partsV;

	//Prepare knotsV and knotsU
	var knotsU;
	for (var i=0; i<=this.orderU; i++) {
		knotsU.push(0);
	}
	for (var i=0; i<=this.orderU; i++) {
		knotsU.push(1);
	}
	
	var knotsV;
	for (var i=0; i<=this.orderV; i++) {
		knotsV.push(0);
	}
	for (var i=0; i<=this.orderV; i++) {
		knotsV.push(1);
	}
	
	//Prepare controlPoints
	var vertex = 0;
	var controlvertexes;
	for(var i = 0; i < (order+1); ++i) {
		var temp = [];
		for(var j = 0; j < (order+1); ++j) {
			controlPoints[vertex].push(1);
			temp.push(this.controlPoints[vertex++]);
		}
		controlvertexes.push(temp);
	}
	
	//Create Surface
	this.nurbsSurface = new CGFnurbsSurface(this.orderU, this.orderV, knotsU, knotsV, this.controlvertexes); 	
	var nurbsSurface = this.nurbsSurface;
	Points = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	//Create Object
	this.patch = new CGFnurbsObject(this.scene, Points, this.partsU, this.partsV);	
	
	
}

Patch.prototype = Object.create(CGFObject.prototype);
Patch.prototype.constructor = Patch;

Patch.prototype.display = function ()
{
	this.patch.display();
};
