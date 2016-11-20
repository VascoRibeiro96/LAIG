function XMLscene() {
    CGFscene.call(this);
}

XMLscene.prototype = Object.create(CGFscene.prototype);
XMLscene.prototype.constructor = XMLscene;

/**
 * init
 * initializes the scene settings, camera, and light arrays
 */
XMLscene.prototype.init = function(application) {
    CGFscene.prototype.init.call(this, application);

    this.setUpdatePeriod(100/6);
    this.lastTime = new Date().getTime();


    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    this.lights = [];
    this.lightIDs = [];
    this.lightStatus = [];
    this.cameras = [];
    this.parentComponent;
};

/**
 * set the default scene appearance
 */
XMLscene.prototype.setDefaultAppearance = function() {
    this.setAmbient(0.2, 0.4, 0.8, 1.0);
    this.setDiffuse(0.2, 0.4, 0.8, 1.0);
    this.setSpecular(0.2, 0.4, 0.8, 1.0);
    this.setShininess(10.0);
};


// Handler called when the graph is finally loaded.
// As loading is asynchronous, this may be called already after the application has started the run loop
XMLscene.prototype.onGraphLoaded = function() {
    this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);
    this.gl.clearColor(this.graph.bg[0], this.graph.bg[1], this.graph.bg[2], this.graph.bg[3]);

    //Sets the axis
    this.axis = new CGFaxis(this, this.axisLength);

    //Sets default camera
    this.camera = this.cameras[this.currentCamera];
    this.interface.setActiveCamera(this.camera);

    //GUI for light control
    for (var i = 0; i < this.lights.length; ++i) {
        this.lightStatus.push(this.lights[i].enabled);
        this.interface.addLightControls(i, this.lightIDs[i]);
    }
};

XMLscene.prototype.display = function() {
    // ---- BEGIN Background, camera and axis setup

    var curTime = new Date().getTime();
    var elapsedTime = (curTime - this.lastTime) /1000;
    this.lastTime = curTime;

    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (this.graph.loadedOk) {
        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.setDefaultAppearance();

        // ---- END Background, camera and axis setup

        //Update lights

        for (light of this.lights)
            light.update();

        this.parentComponent.display(null, elapsedTime);

        // Draw axis
        this.axis.display();

    };

    XMLscene.prototype.switchMaterials = function() {
        this.parentComponent.switchMaterials();
    };

    /**
     * Switches camera to the next one on the scene cameras array
     */
    XMLscene.prototype.nextCamera = function() {
        if (this.currentCamera == this.cameras.length - 1)
            this.currentCamera = 0;
        else
            ++this.currentCamera;

        this.camera = this.cameras[this.currentCamera];
        this.interface.setActiveCamera(this.camera);
    };

    for (var i = 0; i < this.lights.length; ++i) {
        if (this.lightStatus[i])
            this.lights[i].enable();

        else this.lights[i].disable();

        this.lights[i].update();
    }
};
