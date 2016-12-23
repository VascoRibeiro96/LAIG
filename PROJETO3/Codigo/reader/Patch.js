

function Patch(scene, orderU, orderV, partsU, partsV, controlPoints){

	this.scene = scene;
	this.orderU = orderU;
	this.orderV = orderV;
	this.partsU = partsU;
	this.partsV = partsV;
	this.controlPoints = controlPoints;

	//Prepare knotsV and knotsU
	var knotsU = [];
	for (var i=0; i<=this.orderU; i++) {
		knotsU.push(0);
	}
	for (var i=0; i<=this.orderU; i++) {
		knotsU.push(1);
	}
	
	var knotsV = [];
	for (var i=0; i<=this.orderV; i++) {
		knotsV.push(0);
	}
	for (var i=0; i<=this.orderV; i++) {
		knotsV.push(1);
	}
	
	//Prepare controlPoints
	var vertex = 0;
	this.controlVertexes = [];
	for(var i = 0; i <= orderU; ++i) {
		var temp = [];
		for(var j = 0; j <= orderV; ++j) {
			this.controlPoints[vertex].push(1);
			temp.push(this.controlPoints[vertex++]);
		}
		this.controlVertexes.push(temp);
	}
	
	//Create Surface
	this.nurbsSurface = new CGFnurbsSurface(this.orderU, this.orderV, knotsU, knotsV, this.controlVertexes); 	
	var nurbsSurface = this.nurbsSurface;
	Points = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	//Create Object
	this.patch = new CGFnurbsObject(this.scene, Points, this.partsU, this.partsV);	
	
	
};
Patch.prototype = Object.create(CGFobject.prototype);
Patch.prototype.constructor = Patch;


Patch.prototype.display = function ()
{
	this.patch.display();
};




