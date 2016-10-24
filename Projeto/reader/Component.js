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
    this.parent = null;
}

/**
 * Rotates this component.
 */
Component.prototype.rotate = function(angle, x, y, z) {
    this.transformation.rotate(angle, x, y, z);
}

/**
 * Translates this component.
 */
Component.prototype.translate = function(x, y, z) {
    this.transformation.translate(x, y, z);
}

/**
 * Scales the this component
 */
Component.prototype.scale = function(x, y, z) {
    this.transformation.scale(x, y, z);
}

/**
 * Multiples the this component matrix by the given matrix.
 */
Component.prototype.transform = function(transformation) {
    this.transformation.multiply(transformation);
}

/**
 * Adds a material to this component available materials.
 */
Component.prototype.addMaterial = function(material) {
    this.materials.push(material);
}

/**
 * Sets the component texture.
 */
Component.prototype.setTexture = function(texture) {
    this.texture = texture;
}

/**
 * Gets the component id.
 */
Component.prototype.getId = function() {
    return this.id;
}

/**
 * Adds a child to this component and indicates its parent.
 */
Component.prototype.addChild = function(component) {
    this.children.push(component);
    component.parent = this;
}

/**
 * Updates the texture string in this.texture to
 * the texture object it refers to.
 */
Component.prototype.updateTextures = function(textures) {
    switch (this.texture) {
        case 'inherit':
            this.inheritTexture = true;
            break;
        case 'none':
            this.texture = null;
            break;
        default:
            if (!textures[this.texture])
                return ('There is not texture with id ' + this.texture + '.');

            this.texture = textures[this.texture];
            break;
    }

    for (let child of this.children) {
        //FIXME: Better way to do this
        if (child instanceof Component)
            child.updateTextures(textures);
    }
}

/**
 * Depth-first display of components.
 */
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
        if (this.texture) {
            /*
             * Only textures with length_s or length_t between 0 and 1 need to be
             * repeated. And only textures that are repeated need to have power of
             * two width or height (depending on the t or s below 1).
             * As such, this method is used in order to avoid black textures,
             * when textures do not have a power of two dimension but also do not
             * need to.
             * The better alternative would be setTextureWrap('REPEAT', 'REPEAT')
             * on CGFappearance creation, but that would prohibit the use of
             * textures without power of two dimensions.
             */
            /*let wrapS = 'CLAMP_TO_EDGE';
            let wrapT = 'CLAMP_TO_EDGE';

            if (this.texture.length_s < 1)
                wrapS = 'REPEAT';

            if (this.texture.length_t < 1)
                wrapT = 'REPEAT';*/

            /*this.material.setTextureWrap(wrapS, wrapT);*/
            this.material.apply();

            
        }

        child.display(this);
    }

    this.scene.popMatrix();
}

/**
 * Changes the material of the component and its children.
 */
Component.prototype.switchMaterials = function() {
    this.nextMaterial();

    for (let child of this.children) {
        if (child instanceof Component)
            child.switchMaterials();
    }

};

/**
 * Selects the next material from the available ones.
 */
Component.prototype.nextMaterial = function() {
    if (this.inheritMaterial)
        return;

    if (this.currentMaterial === this.materials.length - 1)
        this.currentMaterial = 0;
    else
        this.currentMaterial++;
};

/**
 * Amplifies the texture of a component. Only primitives can be amplified,
 * so this function is used in order to avoid calling a function on an object
 * that does not have it.
 */
Component.prototype.amplifyTexture = function(amplifierS, amplifierT) {

};
