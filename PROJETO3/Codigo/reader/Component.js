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
    this.transformation = new Transformation(scene);
    this.animations = [];
    this.parent = null;
	
	
	
}

Component.prototype.rotate = function(angle, x, y, z) {
    this.transformation.rotate(angle, x, y, z);
}

Component.prototype.translate = function(x, y, z) {
    this.transformation.translate(x, y, z);
}

Component.prototype.scale = function(x, y, z) {
    this.transformation.scale(x, y, z);
}


Component.prototype.transform = function(transformation) {
    this.transformation.multiply(transformation);
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
            this.inheritTexture = true;
            break;
        case 'none':
            this.texture = null;
            break;
        default:
            this.texture = textures[this.texture];
            break;
    }

    //Updates all textures
    for (let child of this.children) {
        if (child instanceof Component)
            child.updateTextures(textures);
    }
}

Component.prototype.display = function(parent, elaspedTime) {
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



    for(var i = 0; i < this.animations.length; i++){
        this.animations[i].apply(elaspedTime);   
        if(!this.animations[i].done)
            break;
    }

    for (let child of this.children) {
        this.material.apply();
        child.display(this, elaspedTime);
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

    if (this.currentMaterial == this.materials.length - 1)
        this.currentMaterial = 0;
    else
        this.currentMaterial++;
};

Component.prototype.amplifyTexture = function(amplifierS, amplifierT) {
    //Do nothing because only needs to work for primitives
};
