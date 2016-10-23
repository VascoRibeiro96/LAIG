function Component(scene, id) {
    /* Temporarily holds the texture id and after updateTextures is called
     * updates the texture to the texture object.
     */
    this.texture;

    this.scene = scene;
    this.id = id;
    this.materials = [];
    this.inheritMaterial = false;
    this.inheritTexture = false;
    this.children = [];
    this.currentMaterial = 0;
    this.parent = null;
}

Component.prototype.rotate = function(angle, axis) {

    var x = 0;
    var y = 0;
    var z = 0;

    switch(axis){
        case 'x':
            x = 1;
            break;
        case 'y':
            y = 1;
            break;
        case 'z':
            z = 1;
            break;
        default:
            return 'Invalid Axis';
    }

    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.rotate(angle*Math.PI/180, x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}


Component.prototype.translate = function(x, y, z) {
    
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.translate(x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}


Component.prototype.scale = function(x, y, z) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.scale(x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}


Component.prototype.addMaterial = function(material) {
    this.materials.push(material);
}


Component.prototype.setTexture = function(texture) {
    this.texture = texture;
}


Component.prototype.addChild = function(component) {
    this.children.push(component);
    component.parent = this;
}


Component.prototype.updateTextures = function(textures) {
    switch (this.texture) {
        case 'inherit':
            if(this.parent == null)
                this.texture = null;
            else
                this.texture = parent.texture;
            break;
        case 'none':
            this.texture = null;
            break;
        default:
            this.texture = textures[this.texture];
            break;
    }

    for (let child of this.children) {
        if (child instanceof Component)
            child.updateTextures(textures);
    }
}

/**
Recursive Display of components
**/

Component.prototype.display = function(parent) {
    this.scene.pushMatrix();

    this.scene.multMatrix(this.transformation.getMatrix());

    if (this.inheritTexture)
        this.texture = parent.texture;

    if (this.inheritMaterial)
        this.material = parent.material;
    else
        this.material = this.materials[this.currentMaterial];

    if (this.texture)
        this.texture.apply(this.material);
    else
        this.material.setTexture(null);

    this.material.apply();

    for (let child of this.children) {
        child.display(this);
    }

    this.scene.popMatrix();
}

Component.prototype.switchMaterials = function() {
    this.nextMaterial();

    for (let child of this.children) {
        if (child instanceof Component)
            child.switchMaterials();
    }

};

Component.prototype.nextMaterial = function() {
    if (this.inheritMaterial)
        return;

    if (this.currentMaterial === this.materials.length - 1)
        this.currentMaterial = 0;
    else
        this.currentMaterial++;
};