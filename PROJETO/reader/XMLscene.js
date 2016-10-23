function XMLscene() {
    CGFscene.call(this);
	
	
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

XMLscene.prototype.init = function (application) {
    CGFscene.prototype.init.call(this, application);

    this.primitives = {};
    this.components = {};
    this.parentComponent = null;
	this.perspectiveind = 0;

    this.initCameras();
    this.initLights();


    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

	this.axis=new CGFaxis(this);
};

XMLscene.prototype.initLights = function () {

	this.lights[0].setPosition(5, 5, 3, 1);
    this.lights[0].setDiffuse(1.0,1.0,1.0,1.0);
    this.lights[0].update();


    //Default Lights
    this.lights[0].setVisible(true);
    this.lights[0].enable();
};

XMLscene.prototype.initCameras = function () {
    this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
};

XMLscene.prototype.setDefaultAppearance = function () {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);	
};

// Handler called when the graph is finally loaded. 
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function () 
{
	this.gl.clearColor(this.graph.illumination[3][0],this.graph.illumination[3][1],this.graph.illumination[3][2],this.graph.illumination[3][3]);
	this.setAmbient(this.graph.illumination[2][0],this.graph.illumination[2][1],this.graph.illumination[2][2],this.graph.illumination[2][3]);
	
	this.parentComponent = this.graph.parentComponent;
	this.primitives = this.graph.primitives;
	this.components = this.graph.loadedComponents;

	this.graphLights();
	this.loadPrimitives();
};

XMLscene.prototype.display = function () {
	// ---- BEGIN Background, camera and axis setup
	
	// Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	// Initialize Model-View matrix as identity (no transformation
	this.updateProjectionMatrix();
    this.loadIdentity();

	// Apply transformations corresponding to the camera position relative to the origin
	this.applyViewMatrix();

	// Draw axis
	this.axis.display();


	this.setDefaultAppearance();
	
	// ---- END Background, camera and axis setup

	// it is important that things depending on the proper loading of the graph
	// only get executed after the graph has loaded correctly.
	// This is one possible way to do it
	if (this.graph.loadedOk){
		this.updateAllLights();
		this.components['torso'].display();
	}
};

XMLscene.prototype.updateAllLights = function() {
	for (var i = 0; i < this.lights.length; ++i)
    this.lights[i].update();
}

XMLscene.prototype.graphLights = function() {

	var omniLights = this.graph.lights[0];
	var j = 0;

	for(i = 0; i < omniLights.length; ++i, ++j){
		var light = omniLights[i];

		var id = light[0];
		var enabled = light[1];

		var x = light[2][0];
		var y = light[2][1];
		var z = light[2][2];
		var w = light[2][3];

		var rA = light[3][0];
		var gA = light[3][1];
		var bA = light[3][2];
		var aA = light[3][3];

		var rD = light[4][0];
		var gD = light[4][1];
		var bD = light[4][2];
		var aD = light[4][3];

		var rS = light[5][0];
		var gS = light[5][1];
		var bS = light[5][2];
		var aS = light[5][3];

		this.lights[i].setPosition(x, y, z, w);
		this.lights[i].setAmbient(rA, gA, bA, aA);
		this.lights[i].setDiffuse(rD, gD, bD, aD);
		this.lights[i].setSpecular(rS, gS, bS, aS);


		if(enabled)
			this.lights[i].enable();
		else
			this.lights[i].disable();

		this.lights[i].setVisible(true);
		this.lights[i].update();

		// Add to Interface
		// this.interface.newLight("omni", id);
	}

	var spotLights = this.graph.lights[1];

	for(var k = 0; k < spotLights.length; ++k){
		var light = spotLights[i];

		var id = light[0];
		var enabled = light[1];
		var angle = light[2];
		var exponent = light[3];

		var xT = light[4][0];
		var yT = light[4][1];
		var zT = light[4][2];

		var x = light[5][0];
		var y = light[5][1];
		var z = light[5][2];


		var rA = light[6][0];
		var gA = light[6][1];
		var BA = light[6][2];
		var aA = light[6][3];

		var rD = light[7][0];
		var gD = light[7][1];
		var bD = light[7][2];
		var aD = light[7][3];

		var rS = light[8][0];
		var gS = light[8][1];
		var bS = light[8][2];
		var aS = light[8][3];

		this.lights[k + j].setPosition(x, y, z);
		this.lights[k + j].setSpotDirection(xT, yT, zT);
		//this.lights[i].setAngle(angle);
		this.lights[k + j].setSpotExponent(exponent);
		this.lights[k + j].setAmbient(rA, gA, bA, aA);
		this.lights[k + j].setDiffuse(rD, gD, bD, aD);
		this.lights[k + j].setSpecular(rS, gS, bS, aS);

		if(enabled)
			this.lights[k + j].enable();
		else
			this.lights[k + j].disable();

		this.lights[k + j].setVisible(true);
		this.lights[k + j].update();
		// Add to Interface
		// this.interface.newLight("spot", id);
	}

}

XMLscene.prototype.loadPrimitives = function(){

	var primitives = this.graph.primitives;

	for(var i = 0; i < primitives.length; ++i){
		var curPrimitive = primitives[i];

		var id = curPrimitive[0];
		var primitiveValues = curPrimitive[1];

		var type = primitiveValues[0];

		switch(type){
			case 'rectangle':
				var x1 = primitiveValues[1];
				var y1 = primitiveValues[2];
				var x2 = primitiveValues[3];
				var y2 = primitiveValues[4];
				this.primitives[id] = new MyRetangle(this, x1, y1, x2, y2);
				break;

			case 'triangle':
				var x1 = primitiveValues[1];
				var y1 = primitiveValues[2];
				var z1 = primitiveValues[3];
				var x2 = primitiveValues[4];
				var y2 = primitiveValues[5];
				var z2 = primitiveValues[6];
				var x3 = primitiveValues[7];
				var y3 = primitiveValues[8];
				var z3 = primitiveValues[9];
				this.primitives[id] = new MyTriangle(this, x1, y1, z1, x2, y2, z2, x3, y3, z3);
				break;

			case 'cylinder':
				var base = primitiveValues[1];
				var top = primitiveValues[2];
				var height = primitiveValues[3];
				var slices = primitiveValues[4];
				var stacks = primitiveValues[5];
				this.primitives[id] = new MyCylinder(this, base, top, height, slices, stacks);
				break;

			case 'sphere':
				var radius = primitiveValues[1];
				var slices = primitiveValues[2];
				var stacks = primitiveValues[3];
				this.primitives[id] = new MySphere(this, radius, slices, stacks);
				break;

			case 'torus':
				var inner = primitiveValues[1];
				var outer = primitiveValues[2];
				var slices = primitiveValues[3];
				var loops = primitiveValues[4];
				this.primitives[id] = new MyTorus(this, inner, outer, slices, loops);
				break;

			default:
				console.log("Invalid primitive: " + type);
				return;
		}
	}

	
}

XMLscene.prototype.switchPerspective = function() {
	
    if (this.perspectiveind === this.graph.perspectives.length) {
        this.camera = this.perspective[this.perspectiveind];
		this.perspectiveind = 0;
    }
	else{
    this.camera = this.perspective[this.perspectiveind];
	this.perspectiveind += 1;
	}
	
};


