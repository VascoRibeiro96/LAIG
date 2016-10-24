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
    var primitives = dsx.children[7];
    var components = dsx.children[8];

    return (this.parseScene(scene) || this.parseViews(views) || this.parseIllumination(illumination) || this.parseLights(lights) || this.parseTextures(textures) || this.parseMaterials(materials) || this.parseTransformations(transformations) || this.parsePrimitives(primitives) || this.parseComponents(components));
}

/**
  Parses the scene tag
*/
MySceneGraph.prototype.parseScene = function(scene) {
    if (scene.nodeName !== 'scene')
        return ('Blocks not ordered correctly. Expected "scene", found "' + scene.nodeName + '".');

    this.parentComponent = this.reader.getString(scene, 'root', true);

    if (this.parentComponent == null)
        return 'Scene tag must define a root component.';

    this.scene.axisLength = this.reader.getFloat(scene, 'axis_length', false);
}

/**
  Parses the views tag and its children and sets the scene's cameras accordingly.
*/
MySceneGraph.prototype.parseViews = function(views) {
    if (views.nodeName !== 'views')
        return ('Blocks not ordered correctly. Expected "views", found "' + views.nodeName + '".');

    var defaultPerspectiveId = this.reader.getString(views, 'default', true);

    if (!(views.children.length > 0))
        return 'You need to have at least one perspective defined.';

    for (var perspective of views.children) {
        //Parse perspective attributes
        var id = this.reader.getString(perspective, 'id', true);
        var fov = this.reader.getFloat(perspective, 'angle', true) * Math.PI / 180; //To radians
        var near = this.reader.getFloat(perspective, 'near', true);
        var far = this.reader.getFloat(perspective, 'far', true);

        //Parse perspective elements
        var fromTag = perspective.getElementsByTagName('from')[0];
        var fromVector = parseVec3(this.reader, fromTag);

        var toTag = perspective.getElementsByTagName('to')[0];
        var toVector = parseVec3(this.reader, toTag);

        //Sets the default camera
        if (defaultPerspectiveId === id)
            this.scene.currentCamera = this.scene.cameras.length;

        this.scene.cameras.push(new CGFcamera(fov, near, far, fromVector, toVector));
    }

    if (this.scene.currentCamera == null)
        return 'The default perspective is not a child of views.';
}


/**
 * Parses the illumination block of the DSX
 */
MySceneGraph.prototype.parseIllumination = function(illumination) {
    if (illumination.nodeName !== 'illumination')
        return ('Blocks not ordered correctly. Expected "illumination", found "' + illumination.nodeName + '".');

    this.doublesided = this.reader.getBoolean(illumination, 'doublesided', true);
    this.local = this.reader.getBoolean(illumination, 'local', true);

    if (this.doublesided == null || this.local == null)
        return 'Boolean value(s) in illumination missing.';

    var ambientTag = illumination.getElementsByTagName('ambient')[0];
    this.ambient = parseRGBA(this.reader, ambientTag);

    var backgroundTag = illumination.getElementsByTagName('background')[0];
    this.bg = parseRGBA(this.reader, backgroundTag);


    if (this.ambient == null)
        return 'Ambient illumination missing.';

    if (this.bg == null)
        return 'Background illumination missing.';
}

/**
 * Parses the lights block from the dsx.
 */
MySceneGraph.prototype.parseLights = function(lights) {
    if (lights.nodeName !== 'lights')
        return ('Blocks not ordered correctly. Expected "lights", found "' + lights.nodeName + '".');

    var error;
    this.ids = {};

    if (!lights.children.length) {
        return "No lights detected in the dsx";
    }

    /*
     * For every light, checks it attributes and if it is an omni or spot light, calling the appropriate parser
     */
    for (var light of lights.children) {
        var id = this.reader.getString(light, 'id', true);
        if (!id)
            return ('A light must have an id. One is missing.');

        var enabled = this.reader.getBoolean(light, 'enabled', true);
        if (enabled === undefined)
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

/**
 * Parses an omni type light from the lights block
 */
MySceneGraph.prototype.parseOmniLight = function(light, n_lights, enabled, id) {

    var locationTag = light.getElementsByTagName('location')[0];
    var location = parseVec4(this.reader, locationTag);
    if (!location)
        return ("Light with id " + id + " is missing a valid location!");

    var ambientTag = light.getElementsByTagName('ambient')[0];
    var ambient = parseRGBA(this.reader, ambientTag);
    if (!ambient)
        return ("Light with id " + id + " is missing a valid ambient setting!");

    var diffuseTag = light.getElementsByTagName('diffuse')[0];
    var diffuse = parseRGBA(this.reader, diffuseTag);
    if (!diffuse)
        return ("Light with id " + id + " is missing a valid diffuse setting!");

    var specularTag = light.getElementsByTagName('specular')[0];
    var specular = parseRGBA(this.reader, specularTag);
    if (!specular)
        return ("Light with id " + id + " is missing a valid specular setting!");

    var newLight = new CGFlight(this.scene, n_lights);
    if (enabled)
        newLight.enable();
    else
        newLight.disable();

    newLight.setPosition(location[0], location[1], location[2], location[3]);
    newLight.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
    newLight.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
    newLight.setSpecular(specular[0], specular[1], specular[2], specular[3]);
    newLight.setVisible(true);

    this.scene.lights.push(newLight);
    //needed for GUI
    this.scene.lightIDs.push(id);
    newLight.update();
}

MySceneGraph.prototype.parseSpotLight = function(light, n_lights, enabled, id) {
    var angle = this.reader.getFloat(light, 'angle', true);
    if (!angle)
        return ("Light with id " + id + " has an invalid angle");

    var exponent = this.reader.getFloat(light, 'exponent', true);
    if (!exponent)
        return ("Light with id " + id + " has an invalid exponent");


    var targetTag = light.getElementsByTagName('target')[0];
    var target = parseVec3(this.reader, targetTag);
    if (!target)
        return ("Light with id " + id + " is missing a valid target!");

    var locationTag = light.getElementsByTagName('location')[0];
    var location = parseVec3(this.reader, locationTag);
    if (!location)
        return ("Light with id " + id + " is missing a valid location!");

    var ambientTag = light.getElementsByTagName('ambient')[0];
    var ambient = parseRGBA(this.reader, ambientTag);
    if (!ambient)
        return ("Light with id " + id + " is missing a valid ambient setting!");


    var diffuseTag = light.getElementsByTagName('diffuse')[0];
    var diffuse = parseRGBA(this.reader, diffuseTag);
    if (!diffuse)
        return ("Light with id " + id + " is missing a valid diffuse setting!");

    var specularTag = light.getElementsByTagName('specular')[0];
    var specular = parseRGBA(this.reader, specularTag);
    if (!specular)
        return ("Light with id " + id + " is missing a valid specular setting!");

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
    newLight.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
    newLight.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
    newLight.setSpecular(specular[0], specular[1], specular[2], specular[3]);
    newLight.setVisible(true);

    this.scene.lights.push(newLight);
    //needed for GUI
    this.scene.lightIDs.push(id);
    newLight.update();
}


/**
 * Parses the textures block from the dsx.
 */
MySceneGraph.prototype.parseTextures = function(textures) {
    if (textures.nodeName !== 'textures')
        return ('Blocks not ordered correctly. Expected "textures", found "' + textures.nodeName + '".');

    for (var texture of textures.children) {

        var id = this.reader.getString(texture, 'id', true);
        if (!id)
            return ('A texture must have an id. One is missing.');

        if (this.textures[id])
            return ('Texture with id ' + id + ' already exists.');

        if (id === 'none' || id === 'inherit')
            return ('"none" and "inherit" are keywords and cannot be used as texture ids.');


        var file = this.reader.getString(texture, 'file', true);

        if (!file)
            return ('Texture with id ' + id + ' does not have a file associated.');


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

/**
 * Parses the materials block from the dsx.
 */
MySceneGraph.prototype.parseMaterials = function(materials) {
    if (materials.nodeName !== 'materials')
        return ('Blocks not ordered correctly. Expected "materials", found "' + materials.nodeName + '".');

    if (!materials.children.length)
        return ('There must be at least one material defined.');

    for (var material of materials.children) {
        var id = this.reader.getString(material, 'id', true);
        if (!id)
            return ('A material must have an id. One is missing.');

        if (this.materials[id])
            return ('Material with id ' + id + ' already exists.');

        var emission = material.getElementsByTagName('emission')[0];
        var emissionRGBA = parseRGBA(this.reader, emission);

        var ambient = material.getElementsByTagName('ambient')[0];
        var ambientRGBA = parseRGBA(this.reader, ambient);

        var diffuse = material.getElementsByTagName('diffuse')[0];
        var diffuseRGBA = parseRGBA(this.reader, diffuse);

        var specular = material.getElementsByTagName('specular')[0];
        var specularRGBA = parseRGBA(this.reader, specular);

        var shininess = material.getElementsByTagName('shininess')[0];
        var shininessValue = this.reader.getFloat(shininess, 'value', true);


        var appearance = new CGFappearance(this.scene);
        appearance.setEmission(emissionRGBA[0], emissionRGBA[1], emissionRGBA[2], emissionRGBA[3]);
        appearance.setAmbient(ambientRGBA[0], ambientRGBA[1], ambientRGBA[2], ambientRGBA[3]);
        appearance.setDiffuse(diffuseRGBA[0], diffuseRGBA[1], diffuseRGBA[2], diffuseRGBA[3]);
        appearance.setSpecular(specularRGBA[0], specularRGBA[1], specularRGBA[2], specularRGBA[3]);
        appearance.setShininess(shininessValue);

        this.materials[id] = appearance;
    }
}

/**
 * Parses the components block from the dsx.
 * And creates the scene graph.
 */
MySceneGraph.prototype.parseComponents = function(compsTag) {
    if (compsTag.nodeName !== 'components')
        return ('Blocks not ordered correctly. Expected "components", found "' + compsTag.nodeName + '".');

    var components = {};

    for (var compTag of compsTag.children) {
        var id = this.reader.getString(compTag, 'id', true);

        if (!id)
            return 'A component must have an id. Please provide one.';

        if (components[id])
            return ('A component with id ' + id + ' already exists.');

        var component = new Component(this.scene, id);

        var transformationTag = compTag.getElementsByTagName('transformation')[0];
        var materialsTag = compTag.getElementsByTagName('materials')[0];

        //Transformations

        for (var transfTag of transformationTag.children) {
        var transformation;

        if (transfTag.nodeName === 'transformationref') {
    
            var id = this.reader.getString(transfTag, 'id', true);

            if (!this.transformations[id])
                return ('Transformation with id ' + id + ' does not exist.');

            transformation = this.transformations[id];
            component.transform(transformation);
        } 
        else {
            transformation = parseTransformation(this.scene, this.reader, transfTag);
            component.transform(transformation);
        }
    }

        //Materials

        if (!materialsTag.children.length)
        return 'Components must have a material';

        for (var materialTag of materialsTag.children) {
        
        var id = this.reader.getString(materialTag, 'id', true);

        if (!id)
            return 'A material in a component is missing its id.';

        if (id === 'inherit')
            component.inheritMaterial = true;
        else if (!this.materials[id])
            return ('There is no material with id ' + id + '.');

        component.addMaterial(this.materials[id]);
    }
        
        //Textures

        var texture = compTag.getElementsByTagName('texture')[0];
        if (!texture)
            return ('A component with id ' + id + ' does not have a texture tag.');

        var textureId = this.reader.getString(texture, 'id', true);
        if (textureId) {
            if (textureId !== 'none' && textureId !== 'inherit' && !this.textures[textureId])
                return ('No texture with id ' + textureId + ' exists.');

            error = component.setTexture(textureId);

            if (error)
                return error;
        } else
            return ('A component with id ' + id + ' is missing a texture id');

        //Children parsing
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

    if (!components[this.parentComponent])
        return 'There is no node with the root id provided.';

    this.scene.parentComponent = components[this.parentComponent].component;

    /*
     * Handle textures inheritance
     */
    if (this.scene.parentComponent.texture === 'inherit')
        return 'Root node cannot inherit a texture.';

    this.scene.parentComponent.updateTextures(this.textures);

    /*
     * Handle materials inheritance
     */
};

MySceneGraph.prototype.parseComponentChildren = function(components, component, tag) {
    var children = [];

    for (var child of tag.children) {
        if (child.nodeName !== 'componentref' && child.nodeName !== 'primitiveref')
            return ('Only componentref or primitiveref tags allowed');

        var id = this.reader.getString(child, 'id', true);

        if (child.nodeName === 'componentref') {

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
    if (primitives.nodeName !== 'primitives')
        return ('Tag not ordered correctly');

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
    if (transformations.nodeName !== 'transformations')
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
