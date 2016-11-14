function Interface(scene) {
    CGFinterface.call(this);

    this.scene = scene;
};

Interface.prototype = Object.create(CGFinterface.prototype);
Interface.prototype.constructor = Interface;

Interface.prototype.init = function(application) {
    CGFinterface.prototype.init.call(this, application);

    this.gui = new dat.GUI();
    this.lightGroup = this.gui.addFolder("Lights");
    return true;
};

Interface.prototype.processKeyDown = function(event) {
    CGFinterface.prototype.processKeyDown.call(this, event);
};

Interface.prototype.processKeyUp = function(event) {
    CGFinterface.prototype.processKeyUp.call(this, event);

    switch (event.keyCode) {
        case (77): // 'M'
            this.scene.switchMaterials();
            break;
        case (86): //'V'
            this.scene.nextCamera();
            break;
    };
};


Interface.prototype.addLightControls = function(i, id) {
    this.lightGroup.add(this.scene.lightStatus, i, this.scene.lightStatus[i]).name(id);
}
