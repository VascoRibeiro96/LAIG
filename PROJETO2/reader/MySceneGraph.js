/**
 * intializes the reader, root id, as well as the dictionaries for the materials, transformations, primitives and textures
 * @constructor
 */
function MySceneGraph(filename, scene) {
    this.loadedOk = null;

    // Establish bidirectional references between scene and graph
    this.scene = scene;
    scene.graph = this;

    // File reading
    this.reader = new CGFXMLreader();
    this.parentComponent;
    this.materials = {};
    this.transformations = {};
	this.animations = {};
    this.primitives = {};
    this.textures = {};

    /*
     * Read the contents of the xml file, and refer to this class for loading and error handlers.
     * After the file is read, the reader calls onXMLReady on this object.
     * If any error occurs, the reader calls onXMLError on this object, with an error message
     */
    this.reader.open('scenes/' + filename, this);
}

/**
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady = function() {
    console.log("XML Loading finished.");
    var rootElement = this.reader.xmlDoc.documentElement;

    // Here should go the calls for different functions to parse the various blocks
    var error = this.parseDsx(rootElement);

    if (error != null) {
        this.onXMLError(error);
        return;
    }

    // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
    this.scene.onGraphLoaded();
    this.loadedOk = true;
};

/**
 * Calls the parsing functions on every block of the dsx, checking for an error in any of them
 * @param dsx
 */
MySceneGraph.prototype.parseDsx = function(dsx) {
    //Mandatory in order to ensure the blocks order.
    var scene = dsx.children[0];
    var views = dsx.children[1];
    var illumination = dsx.children[2];
    var lights = dsx.children[3];
    var textures = dsx.children[4];
    var materials = dsx.children[5];
    var transformations = dsx.children[6];
	var animations = dsx.children[7]
    var primitives = dsx.children[8];
    var components = dsx.children[9];

    return (this.parseScene(scene) || this.parseViews(views) || this.parseIllumination(illumination) || this.parseLights(lights) || this.parseTextures(textures) || this.parseMaterials(materials) || this.parseTransformations(transformations) || this.parseAnimations(animations) || this.parsePrimitives(primitives) || this.parseComponents(components));
}

MySceneGraph.prototype.parseScene = function(scene) {
    if (scene.nodeName != 'scene')
        return ('Invalid tag order');

    this.parentComponent = this.reader.getString(scene, 'root', true);

    if (this.parentComponent == null)
        return 'Scene tag must define a root component.';

    this.scene.axisLength = this.reader.getFloat(scene, 'axis_length', false);
}

MySceneGraph.prototype.parseViews = function(views) {
    if (views.nodeName != 'views')
        return ('Invalid tag order');

    var defaultPerspectiveId = this.reader.getString(views, 'default', true);

    if (!(views.children.length > 0))
        return 'You need to have at least one perspective defined.';

    for (var perspective of views.children) {
        var id = this.reader.getString(perspective, 'id', true);
        var fov = this.reader.getFloat(perspective, 'angle', true) * Math.PI / 180; //To radians
        var near = this.reader.getFloat(perspective, 'near', true);
        var far = this.reader.getFloat(perspective, 'far', true);

        var fromTag = perspective.getElementsByTagName('from')[0];
        var fromVector = [this.reader.getFloat(fromTag, 'x', true),
                          this.reader.getFloat(fromTag, 'y', true), 
                          this.reader.getFloat(fromTag, 'z', true)];

        var toTag = perspective.getElementsByTagName('to')[0];
        var toVector = [this.reader.getFloat(toTag, 'x', true),
                        this.reader.getFloat(toTag, 'y', true), 
                        this.reader.getFloat(toTag, 'z', true)];

        if (defaultPerspectiveId == id)
            this.scene.currentCamera = this.scene.cameras.length;

        this.scene.cameras.push(new CGFcamera(fov, near, far, fromVector, toVector));
    }

    if (this.scene.currentCamera == null)
        return 'The default perspective is not a child of views.';
}

MySceneGraph.prototype.parseIllumination = function(illumination) {
    if (illumination.nodeName != 'illumination')
        return ('Invalid tag order');

    this.doublesided = this.reader.getBoolean(illumination, 'doublesided', true);
    this.local = this.reader.getBoolean(illumination, 'local', true);

    if (this.doublesided == null || this.local == null)
        return 'Boolean value(s) in illumination missing.';

    var ambientTag = illumination.getElementsByTagName('ambient')[0];
    this.ambient = [this.reader.getFloat(ambientTag, 'r', true),
                    this.reader.getFloat(ambientTag, 'g', true),
                    this.reader.getFloat(ambientTag, 'b', true),
                    this.reader.getFloat(ambientTag, 'a', true)];

    var backgroundTag = illumination.getElementsByTagName('background')[0];
    this.bg = [this.reader.getFloat(backgroundTag, 'r', true),
               this.reader.getFloat(backgroundTag, 'g', true),
               this.reader.getFloat(backgroundTag, 'b', true),
               this.reader.getFloat(backgroundTag, 'a', true)];


    if (this.ambient == null)
        return 'Ambient illumination missing.';

    if (this.bg == null)
        return 'Background illumination missing.';
}


MySceneGraph.prototype.parseLights = function(lights) {
    if (lights.nodeName != 'lights')
        return ('Invalid tag order');

    var error;
    this.ids = {};

    if (!lights.children.length) {
        return "No lights detected in the dsx";
    }


    for (var light of lights.children) {
        var id = this.reader.getString(light, 'id', true);
        if (!id)
            return ('A light must have an id. One is missing.');

        var enabled = this.reader.getBoolean(light, 'enabled', true);
        if (enabled == undefined)
            return ("Light with id " + id + " has no valid 'enabled' attribute");

        if (this.ids[id])
            return ('Light with id ' + id + ' already exists.');

        var type = light.nodeName;

        switch (type) {
            case 'omni':
                error = this.parseOmniLight(light, this.scene.lights.length, enabled, id);
                break;

            case 'spot':
                error = this.parseSpotLight(light, this.scene.lights.length, enabled, id);
                break;

            default:
                error = ("Light with id " + id + " has an invalid type");
        }
        this.ids[id] = id;
    }

    return error;
};


MySceneGraph.prototype.parseOmniLight = function(light, n_lights, enabled, id) {

    var newLight = new CGFlight(this.scene, n_lights);
    if (enabled)
        newLight.enable();
    else
        newLight.disable();

    var locationTag = light.getElementsByTagName('location')[0];
    newLight.setPosition(this.reader.getFloat(locationTag, 'x', true),
                         this.reader.getFloat(locationTag, 'y', true), 
                         this.reader.getFloat(locationTag, 'z', true), 
                         this.reader.getFloat(locationTag, 'w', true));

    var ambientTag = light.getElementsByTagName('ambient')[0];
    newLight.setAmbient(this.reader.getFloat(ambientTag, 'r', true),
                        this.reader.getFloat(ambientTag, 'g', true), 
                        this.reader.getFloat(ambientTag, 'b', true), 
                        this.reader.getFloat(ambientTag, 'a', true));

    var diffuseTag = light.getElementsByTagName('diffuse')[0];
    newLight.setDiffuse(this.reader.getFloat(diffuseTag, 'r', true),
                        this.reader.getFloat(diffuseTag, 'g', true), 
                        this.reader.getFloat(diffuseTag, 'b', true), 
                        this.reader.getFloat(diffuseTag, 'a', true));


    var specularTag = light.getElementsByTagName('specular')[0];
    newLight.setSpecular(this.reader.getFloat(specularTag, 'r', true),
                         this.reader.getFloat(specularTag, 'g', true), 
                         this.reader.getFloat(specularTag, 'b', true), 
                         this.reader.getFloat(specularTag, 'a', true));
    
    newLight.setVisible(true);
    this.scene.lights.push(newLight);
    this.scene.lightIDs.push(id);
    newLight.update();
}

MySceneGraph.prototype.parseSpotLight = function(light, n_lights, enabled, id) {
    var newLight = new CGFlight(this.scene, n_lights);

    var angle = this.reader.getFloat(light, 'angle', true);

    var exponent = this.reader.getFloat(light, 'exponent', true);

    var targetTag = light.getElementsByTagName('target')[0];
    var target = [this.reader.getFloat(targetTag, 'x', true),
                  this.reader.getFloat(targetTag, 'y', true), 
                  this.reader.getFloat(targetTag, 'z', true)];


    var locationTag = light.getElementsByTagName('location')[0];
    var location = [this.reader.getFloat(locationTag, 'x', true),
                    this.reader.getFloat(locationTag, 'y', true), 
                    this.reader.getFloat(locationTag, 'z', true)];


    var ambientTag = light.getElementsByTagName('ambient')[0];
    newLight.setAmbient(this.reader.getFloat(ambientTag, 'r', true),
                        this.reader.getFloat(ambientTag, 'g', true), 
                        this.reader.getFloat(ambientTag, 'b', true), 
                        this.reader.getFloat(ambientTag, 'a', true));

    var diffuseTag = light.getElementsByTagName('diffuse')[0];
    newLight.setDiffuse(this.reader.getFloat(diffuseTag, 'r', true),
                        this.reader.getFloat(diffuseTag, 'g', true), 
                        this.reader.getFloat(diffuseTag, 'b', true), 
                        this.reader.getFloat(diffuseTag, 'a', true));


    var specularTag = light.getElementsByTagName('specular')[0];
    newLight.setSpecular(this.reader.getFloat(specularTag, 'r', true),
                         this.reader.getFloat(specularTag, 'g', true), 
                         this.reader.getFloat(specularTag, 'b', true), 
                         this.reader.getFloat(specularTag, 'a', true));


    var direction = [];
    direction[0] = target[0] - location[0];
    direction[1] = target[1] - location[1];
    direction[2] = target[2] - location[2];
    var newLight = new CGFlight(this.scene, n_lights);

    if (enabled)
        newLight.enable();
    else
        newLight.disable();

    newLight.setPosition(location[0], location[1], location[2], 1);
    newLight.setSpotDirection(direction[0], direction[1], direction[2]);

    newLight.setSpotExponent(exponent);
    newLight.setSpotCutOff(angle);

    newLight.setVisible(true);

    this.scene.lights.push(newLight);
    this.scene.lightIDs.push(id);
    newLight.update();
}

MySceneGraph.prototype.parseTextures = function(textures) {
    if (textures.nodeName != 'textures')
        return ('Invalid tag order');

    for (var texture of textures.children) {

        var id = this.reader.getString(texture, 'id', true);

        if (this.textures[id])
            return ('Texture ' + id + ' already exists.');

        var file = this.reader.getString(texture, 'file', true);

        var length_s = this.reader.getFloat(texture, 'length_s', false);

        if (!length_s || length_s <= 0) {
            console.log('Texture with id ' + id + ' does not have length_s defined or is invalid. Assuming 1.0.');
            length_s = 1;
        }


        var length_t = this.reader.getFloat(texture, 'length_t', false);

        if (!length_t || length_t <= 0) {
            console.log('Texture with id ' + id + ' does not have length_t defined or is invalid. Assuming 1.0.');
            length_t = 1;
        }

        this.textures[id] = new Texture(this.scene, file, length_s, length_t);
    }
}

MySceneGraph.prototype.parseMaterials = function(materials) {
    if (materials.nodeName != 'materials')
        return ('Invalid Tag Order');

    if (!materials.children.length)
        return ('There must be at least one material defined.');

    for (var material of materials.children) {
        var id = this.reader.getString(material, 'id', true);
        if (!id)
            return ('Id required for all materials');

        if (this.materials[id])
            return ('Material ' + id + ' already exists.');

        var appearance = new CGFappearance(this.scene);

        var emission = material.getElementsByTagName('emission')[0];
        appearance.setEmission(this.reader.getFloat(emission, 'r', true),
                               this.reader.getFloat(emission, 'g', true),
                               this.reader.getFloat(emission, 'b', true),
                               this.reader.getFloat(emission, 'a', true));


        var ambient = material.getElementsByTagName('ambient')[0];
        appearance.setAmbient(this.reader.getFloat(ambient, 'r', true),
                              this.reader.getFloat(ambient, 'g', true),
                              this.reader.getFloat(ambient, 'b', true),
                              this.reader.getFloat(ambient, 'a', true));

        var diffuse = material.getElementsByTagName('diffuse')[0];
        appearance.setDiffuse(this.reader.getFloat(diffuse, 'r', true),
                              this.reader.getFloat(diffuse, 'g', true),
                              this.reader.getFloat(diffuse, 'b', true),
                              this.reader.getFloat(diffuse, 'a', true));

        var specular = material.getElementsByTagName('specular')[0];
        appearance.setSpecular(this.reader.getFloat(specular, 'r', true),
                               this.reader.getFloat(specular, 'g', true),
                               this.reader.getFloat(specular, 'b', true),
                               this.reader.getFloat(specular, 'a', true));

        var shininess = material.getElementsByTagName('shininess')[0];
        appearance.setShininess(this.reader.getFloat(shininess, 'value', true));

        this.materials[id] = appearance;
    }
}

MySceneGraph.prototype.parseComponents = function(compsTag) {
    if (compsTag.nodeName != 'components')
        return ('Invalid tag order');

    var components = {};

    for (var compTag of compsTag.children) {
        var id = this.reader.getString(compTag, 'id', true);

        if (!id)
            return 'There needs to be an ID for every component';

        if (components[id])
            return ('Component' + id + ' already exists.');

        var component = new Component(this.scene, id);

        var transformationTag = compTag.getElementsByTagName('transformation')[0];
        var materialsTag = compTag.getElementsByTagName('materials')[0];

        //Transformations

        for (var transfTag of transformationTag.children) {
        var transformation;

        if (transfTag.nodeName == 'transformationref') {
    
            var id = this.reader.getString(transfTag, 'id', true);

            if (!this.transformations[id])
                return ('Transformation ' + id + ' does not exist.');

            transformation = this.transformations[id];
            component.transform(transformation);
        } 
        else {
            transformation = this.parseTransformation(this.scene, this.reader, transfTag);
            component.transform(transformation);
        }
    }

        //Materials

        if (!materialsTag.children.length)
        return 'Components must have a material';

        for (var materialTag of materialsTag.children) {
        
        var id = this.reader.getString(materialTag, 'id', true);

        if (id == 'inherit')
            component.inheritMaterial = true;
        else if (!this.materials[id])
            return ('There is no material with id ' + id + '.');

        component.addMaterial(this.materials[id]);
    }
        
        //Textures

        var texture = compTag.getElementsByTagName('texture')[0];
        if (!texture)
            return ('Component ' + id + ' does not have a texture tag.');

        var textureId = this.reader.getString(texture, 'id', true);
        if (textureId) {
            if (textureId != 'none' && textureId != 'inherit' && !this.textures[textureId])
                return ('No texture with id ' + textureId + ' exists.');

            error = component.setTexture(textureId);

            if (error)
                return error;
        } else
            return ('Component' + id + ' need a texture tag');

        var childrenTag = compTag.getElementsByTagName('children')[0];

        error = this.parseComponentChildren(components, component, childrenTag)
        if (error)
            return error;
    }

    var error = this.createSceneGraph(components);

    if (error)
        return error;
}

/**
 * Creates the scene graph used to display the scene
 */
MySceneGraph.prototype.createSceneGraph = function(components) {
    for (var id in components) {
        for (var child of components[id].children) {
            components[id].component.addChild(components[child].component);
        }
    }

    this.scene.parentComponent = components[this.parentComponent].component;

    if (this.scene.parentComponent.texture == 'inherit')
        return 'Root component cannot inherit a texture because it has no parent.';

    this.scene.parentComponent.updateTextures(this.textures);

};

MySceneGraph.prototype.parseComponentChildren = function(components, component, tag) {
    var children = [];

    for (var child of tag.children) {
        if (child.nodeName != 'componentref' && child.nodeName != 'primitiveref')
            return ('Only componentref or primitiveref tags allowed');

        var id = this.reader.getString(child, 'id', true);

        if (child.nodeName == 'componentref') {

        children.push(id);
        } 
        else 
            component.addChild(this.primitives[id]);
    }

    components[component.id] = {
        'component': component,
        'children': children
    };
}


MySceneGraph.prototype.parsePrimitives = function(primitives) {
    if (primitives.nodeName != 'primitives')
        return ('Invalid Tag order');

    for (var primitive of primitives.children) {
        var shape = primitive.children[0];
        var id = this.reader.getString(primitive, 'id', true);

        if (!id)
            return 'No ID in primitive';

        var object;

        switch (shape.nodeName) {
            case 'rectangle':
                object = new Rectangle(this.scene,
                    this.reader.getFloat(shape, 'x1', true),
                    this.reader.getFloat(shape, 'y1', true),
                    this.reader.getFloat(shape, 'x2', true),
                    this.reader.getFloat(shape, 'y2', true)
                );
                break;

            case 'triangle':
                object = new Triangle(this.scene,
                    this.reader.getFloat(shape, 'x1', true),
                    this.reader.getFloat(shape, 'y1', true),
                    this.reader.getFloat(shape, 'z1', true),
                    this.reader.getFloat(shape, 'x2', true),
                    this.reader.getFloat(shape, 'y2', true),
                    this.reader.getFloat(shape, 'z2', true),
                    this.reader.getFloat(shape, 'x3', true),
                    this.reader.getFloat(shape, 'y3', true),
                    this.reader.getFloat(shape, 'z3', true)
                );
                break;

            case 'cylinder':
                object = new Cylinder(this.scene,
                    this.reader.getFloat(shape, 'base', true),
                    this.reader.getFloat(shape, 'top', true),
                    this.reader.getFloat(shape, 'height', true),
                    this.reader.getFloat(shape, 'slices', true),
                    this.reader.getFloat(shape, 'stacks', true)
                );
                break;

            case 'sphere':
                    object = new Sphere(this.scene,
                        this.reader.getFloat(shape, 'radius', true),
                        this.reader.getFloat(shape, 'slices', true),
                        this.reader.getFloat(shape, 'stacks', true)
                    );
                break;

            case 'torus':
                    object = new Torus(this.scene,
                        this.reader.getFloat(shape, 'inner', true),
                        this.reader.getFloat(shape, 'outer', true),
                        this.reader.getInteger(shape, 'slices', true),
                        this.reader.getInteger(shape, 'loops', true)
                    );
                break;

            default:
                return ('Invalid Primitive:' + shape.nodeName);
                break;
        }

        if (this.primitives[id])
            return ('Two primitives cannot have the same id. Found more than one instance of:' + id);

        this.primitives[id] = object;
    }
}

MySceneGraph.prototype.parseTransformations = function(transformations) {
    if (transformations.nodeName != 'transformations')
        return ('Invalid tag order');

    if (transformations.children.length < 1)
        return 'There need to be at least one operation inside the transformation tag';

    this.transformations = []; 


    for (var transf of transformations.children) {
        var transfID = this.reader.getString(transf, 'id', true);

        //check if a transformation with the same ID has already been stored
        if (this.transformations[transfID])
            return ('Transformation ' + transfID + ' already exists.');

        this.transformations[transfID] = new Transformation(this.scene);

        for (var operations of transf.children) {
            this.transformations[transfID].multiply(this.parseTransformation(this.scene, this.reader, operations));
        }
    }
};


MySceneGraph.prototype.parseAnimations = function(animations) {
    if (animations.nodeName != 'animations')
        return ('Invalid tag order');

    var error;
    this.ids = {};

    if (!animations.children.length) {
        return "No animations detected in the dsx";
    }


    for (var animation of animations.children) {
        var id = this.reader.getString(animation, 'id', true);
        if (!id)
            return ('An animation must have an id. One is missing.');

        var span = this.reader.getFloat(animation, 'span', true);
        if (span == undefined)
            return ("Animation with id " + id + " has no valid 'span' attribute");

        if (this.ids[id])
            return ('Light with id ' + id + ' already exists.');

        var type = animation.nodeName;

        switch (type) {
            case 'linear':
                error = this.parseLinearAnimation(animation, span, id);
                break;

            case 'circular':
                error = this.parseCircularAnimation(animation, span, id);
                break;

            default:
                error = ("Animation with id " + id + " has an invalid type");
        }
        this.ids[id] = id;
    }

    return error;
};

MySceneGraph.prototype.parseLinearAnimation = function(animation, span, id) {

	var controlpoints;
	
    for(var linear of animation.children){
		
		var controlpoint = animation.getElementsByTagName('controlpoint')[0];
        var xx = this.reader.getFloat(controlpoint, 'xx', true);
        var yy = this.reader.getFloat(controlpoint, 'yy', true);
		var zz = this.reader.getFloat(controlpoint, 'zz', true);
         
		var tmpcontrol = [xx, yy, zz];
		controlpoints.push(tmpcontrol);
		
	}
	
        
    
    this.animations[id] = new AnimationLinear(span, controlpoints);
 
}

MySceneGraph.prototype.parseCircularAnimation = function(animation, span, id) {

	
        var centerx = this.reader.getFloat(animation, 'centerx', true);
        var centery = this.reader.getFloat(animation, 'centery', true);
		var centerz = this.reader.getFloat(animation, 'centerz', true);
         
		var radius = this.reader.getFloat(animation, 'radius', true);
        var startang = this.reader.getFloat(animation, 'startang', true);
		var rotang = this.reader.getFloat(animation, 'rotang', true);
	
        
    
    this.animations[id] = new AnimationCircular(span, centerx, centery, centerz, radius, startang,rotang);
 
}

/**
 * Callback to be executed on any read error
 */
MySceneGraph.prototype.onXMLError = function(message) {
    console.error("XML Loading Error: " + message);
    this.loadedOk = false;
};

MySceneGraph.prototype.parseTransformation = function(scene, reader, tag) {
    var transformation = new Transformation(scene);

    switch (tag.nodeName) {
        case 'translate':
            transformation.translate(this.reader.getFloat(tag, 'x', true),
                this.reader.getFloat(tag, 'y', true),
                this.reader.getFloat(tag, 'z', true)
            );
            break;

        case 'rotate':
            var axis = reader.getString(tag, 'axis', true);            
            var angle = reader.getFloat(tag, 'angle', true);
            var x;
            var y;
            var z;

            (axis == 'x') ? (x = 1) : (x = 0); 
            (axis == 'y') ? (y = 1) : (y = 0); 
            (axis == 'z') ? (z = 1) : (z = 0); 

            transformation.rotate(angle, x, y, z);
            break;

        case 'scale':
                transformation.scale(this.reader.getFloat(tag, 'x', true),
                this.reader.getFloat(tag, 'y', true),
                this.reader.getFloat(tag, 'z', true)
            );
            break;

        default:
            return "Invalid transformation name: " + tag.nodeName;
            break;
    }

    return transformation;
};
