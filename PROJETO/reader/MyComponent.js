function MyComponent(scene) {
    /* Temporarily holds the texture id and after updateTextures is called
     * updates the texture to the texture object.
     */
    this.texture;

    this.scene = scene;
    this.materials = [];
    this.inheritMaterial = false;
    this.inheritTexture = false;
    this.children = [];
    this.currentMaterial = 0;
    this.parent = null;
}

MyComponent.prototype.transform = function(transformation){

    for(var i = 0; i < transformation.length; ++i){
        var curTransformation = transformation[i];
            var type = curTransformation[0];

            switch(type){
                case 'rotate':
                    var angle = curTransformation[1];
                    var axis = curTransformation[2];
                    this.rotate(angle, axis);
                    break;

                case 'scale':
                    var x = curTransformation[1];
                    var y = curTransformation[2];
                    var z = curTransformation[3];
                    this.scale(x, y, z);
                    break;

                case 'translate':
                    var x = curTransformation[1];
                    var y = curTransformation[2];
                    var z = curTransformation[3];
                    this.translate(x, y, z);                   
                    break;

                case 'ref':
                    var id = curTransformation[1];
                    this.transform(this.transformations[id]);
                    break;

                default:
                    return "Invalid transformation: " + type;
            }
    }

}

MyComponent.prototype.rotate = function(angle, axis) {

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


MyComponent.prototype.translate = function(x, y, z) {
    
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.translate(x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}


MyComponent.prototype.scale = function(x, y, z) {
    this.scene.pushMatrix();
    this.scene.setMatrix(this.transformationMatrix);
    this.scene.scale(x, y, z);
    this.transformationMatrix = this.scene.getMatrix();
    this.scene.popMatrix();
}


MyComponent.prototype.addMaterial = function(material) {
    this.materials.push(material);
}


MyComponent.prototype.setTexture = function(texture) {
    this.texture = texture;
}


MyComponent.prototype.addChild = function(component) {
    this.children.push(component);
    component.parent = this;
}


MyComponent.prototype.updateTextures = function(textures) {
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

MyComponent.prototype.display = function(parent) {
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

MyComponent.prototype.switchMaterials = function() {
    this.nextMaterial();

    for (let child of this.children) {
        if (child instanceof Component)
            child.switchMaterials();
    }

};

MyComponent.prototype.nextMaterial = function() {
    if (this.inheritMaterial)
        return;

    if (this.currentMaterial === this.materials.length - 1)
        this.currentMaterial = 0;
    else
        this.currentMaterial++;
};