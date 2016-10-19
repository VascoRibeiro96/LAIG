


function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;


	this.sceneValues = [];
	this.transformations = [];
	this.perspectives = [];
	this.illumination = [];
	this.lights = [];
	this.textures = [];
	this.materials = [];
	this.transformations = [];
	this.primitives = [];
	this.components = [];
		
	// File reading 
	this.reader = new CGFXMLreader();

	/*
	 * Read the contents of the dsx file, and refer to this class for loading and error handlers.
	 * After the file is read, the reader calls onXMLReady on this object.
	 * If any error occurs, the reader calls onXMLError on this object, with an error message
	 */
	 
	this.reader.open('scenes/'+filename, this);
}

/*
 * Callback to be executed after successful reading
 */
MySceneGraph.prototype.onXMLReady=function() 
{
	console.log("DSX Loading finished.");
	var rootElement = this.reader.xmlDoc.documentElement;
	
	var error = this.parseScene(rootElement);
	if (error != null) {
		this.onXMLError(error);
		return;
	}	
		
	error = this.parseView(rootElement); 
	if (error != null) {
		this.onXMLError(error);
		return;
	}	
	
	error = this.parseLights(rootElement); 
	if (error != null) {
		this.onXMLError(error);
		return;
	}	
	
	error = this.parseTextures(rootElement); 
	if (error != null) {
		this.onXMLError(error);
		return;
	}	
	
	error = this.parseMaterials(rootElement); 
	if (error != null) {
		this.onXMLError(error);
		return;
	}	
	
	error = this.parseTransformations(rootElement);
	if (error != null) {
		this.onXMLError(error);
		return;
	}	
	
	error = this.parsePrimitives(rootElement); 
	if (error != null) {
		this.onXMLError(error);
		return;
	}	
	
	error = this.parseComponents(rootElement); 
	if (error != null) {
		this.onXMLError(error);
		return;
	}	

	console.log("Parsed everything");


	this.loadedOk=true;
	
	
	// As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
	this.scene.onGraphLoaded();
};

/*
 * Example of method that parses elements of one block and stores information in a specific data structure
 */
MySceneGraph.prototype.parseScene= function(rootElement) {
	
	var elems = rootElement.getElementsByTagName('scene');
	if (elems == null) {
		return "'scene' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'scene' element found.";
	}

	var scene = elems[0];

	var root = scene.attributes.getNamedItem('root').value;

	if(root == null) {
		return "Root Element is missing.";
	}

	var axis_length = scene.attributes.getNamedItem('axis_length').value;

	if(axis_length == null){
		return "Axis-length is missing.";
	}

	this.sceneValues = [root, axis_length];

	console.log("Scene read from file: {Root=" + root + ", Axis-length=" + axis_length +"}");

};


MySceneGraph.prototype.parseView= function (rootElement) {
	
	var elems =  rootElement.getElementsByTagName('views');

	if (elems == null) {
		return "'views' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'views' element found.";
	}
	
	var perspective = elems[0].getElementsByTagName('perspective');
	var ids = [];	
	
	for(i = 0; i < perspective.length; ++i){
		var curPerspective = perspective[i];

		var id = curPerspective.attributes.getNamedItem('id').value;
		ids[i] = id;
		
		var near = curPerspective.attributes.getNamedItem('near').value;
		var far = curPerspective.attributes.getNamedItem('far').value;
		var angle = curPerspective.attributes.getNamedItem('angle').value;

		var perspectiveAttributes = curPerspective.children;

		if(perspectiveAttributes.length != 2 || perspectiveAttributes[0].tagName != 'from' || perspectiveAttributes[1].tagName != 'to'){
			return "Each perspective needs to have and only have a 'from' and a 'to' tag in this order";
		}

		var from = [];
		var to = [];

		var xf = perspectiveAttributes[0].attributes.getNamedItem('x').value;
		var yf = perspectiveAttributes[0].attributes.getNamedItem('y').value;
		var zf = perspectiveAttributes[0].attributes.getNamedItem('z').value;

		from = [xf, yf, zf];

		var xt = perspectiveAttributes[1].attributes.getNamedItem('x').value;
		var yt = perspectiveAttributes[1].attributes.getNamedItem('y').value;
		var zt = perspectiveAttributes[1].attributes.getNamedItem('z').value;

		to = [xt, yt, zt];
		
		curPerspective = [id, near, far, angle, from, to];
		this.perspectives.push(curPerspective);
	}
	
	if(this.compareIds(ids) == "Equal Ids"){
		console.log("Equal Ids in Views!\n");
		return "Equal Ids";
	}
}

MySceneGraph.prototype.parseIllumination= function (rootElement) {
	
	var elems =  rootElement.getElementsByTagName('illumination');

	if (elems == null) {
		return "'illumination' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'illumination' element found.";
	}
	
	var doublesided = elems.attributes.getNamedItem('doublesided').value;
	var local = elems.attributes.getNamedItem('local').value;
	var ambient = elems.attributes.getNamedItem('ambient').value;
	var background = elems.attributes.getNamedItem('background').value;
	
	this.illumination = [doublesided, local, ambient, background];
}

MySceneGraph.prototype.parseLights= function (rootElement) {
	
	var elems =  rootElement.getElementsByTagName('lights');

	if (elems == null) {
		return "'lights' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'lights' element found.";
	}
	
	var omni = elems[0].getElementsByTagName('omni');
	var spot = elems[0].getElementsByTagName('spot');
	var idsOmni = [];
	var idsSpot = [];
	var omni = []; 
	var spot = [];
	
	for(i = 0; i < omni.length; ++i){
		var curOmni = omni[i];

		var id = curOmni.attributes.getNamedItem('id').value;
		idsOmni[i] = id;
		
		var enabled = curOmni.attributes.getNamedItem('enabled').value;
		var location = curOmni.attributes.getNamedItem('location').value;
		var ambient = curOmni.attributes.getNamedItem('ambient').value;
		var diffuse = curOmni.attributes.getNamedItem('diffuse').value;
		var specular = curOmni.attributes.getNamedItem('specular').value;
		
		curOmni = [id, enabled, location, ambient, diffuse, specular];
		omni.push(curOmni);
	}
	
	for(i = 0; i < spot.length; ++i){
		var curSpot = spot[i];

		var id = curSpot.attributes.getNamedItem('id').value;
		idsSpot[i] = id;
		
		var enabled = curcurSpot.attributes.getNamedItem('enabled').value;
		var angle = curSpot.attributes.getNamedItem('angle').value;
		var exponent = curSpot.attributes.getNamedItem('exponent').value;
		var target = curSpot.attributes.getNamedItem('target').value;
		var location = curSpot.attributes.getNamedItem('location').value;
		var ambient = curSpot.attributes.getNamedItem('ambient').value;
		var diffuse = curSpot.attributes.getNamedItem('diffuse').value;
		var specular = curSpot.attributes.getNamedItem('specular').value;
		
		curSpot = [id, enabled, ,angle, exponent, target, location, ambient, diffuse, specular];
		spot.push(curSpot);
	}

	this.lights = [omni, spot];
	
	if(this.compareIds(idsOmni) == "Equal Ids"){
		console.log("Equal Ids in omni lights!\n");
		return "Equal Ids";
	}
	
	if(this.compareIds(idsSpot) == "Equal Ids"){
		console.log("Equal Ids in spot lights!\n");
		return "Equal Ids";
	}

}

MySceneGraph.prototype.parseTextures= function (rootElement) {
	
	var elems =  rootElement.getElementsByTagName('textures');

	if (elems == null) {
		return "'textures' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'textures' element found.";
	}

	var texture = elems[0].getElementsByTagName('texture');
	var ids = [];	
	
	for(i = 0; i < texture.length; ++i){
		var curTexture = texture[i];

		var id = curTexture.attributes.getNamedItem('id').value;
		ids[i] = id;
		
		var file = curTexture.attributes.getNamedItem('file').value;
		var length_s = curTexture.attributes.getNamedItem('length_s').value;
		var length_t = curTexture.attributes.getNamedItem('length_t').value;
		
		curTexture = [id, file, length_s, length_t];
		this.textures.push(curTexture);
	}
	
	if(this.compareIds(ids) == "Equal Ids"){
		console.log("Equal Ids in transformations!\n");
		return "Equal Ids";
	}

}

MySceneGraph.prototype.parseMaterials= function (rootElement) {
	

	//TEMPORARIO -- NAO PERMITE DEBUGGING
	var elems =  rootElement.getElementsByTagName('materials');

/*
	if (elems == null) {
		return "'materials' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'materials' element found.";
	}
*/
	var material = elems[0].getElementsByTagName('material');
	var ids = [];	
	
	for(i = 0; i < material.length; ++i){
		var curMaterial = material[i];
		var materialAttributes = [];

		var id = curMaterial.attributes.getNamedItem('id').value;
		ids[i] = id;

		var materialChidren = curMaterial.children;

		materialAttributes.push(id);

		for(j = 0; j < materialChidren.length - 1; ++j){
			var r = materialChidren[j].attributes.getNamedItem('r').value;
			var g = materialChidren[j].attributes.getNamedItem('g').value;
			var b = materialChidren[j].attributes.getNamedItem('b').value;
			var a = materialChidren[j].attributes.getNamedItem('a').value;
			var type = materialChidren[j].tagName;

			var curAttribute = [type, r, g, b, a];
			materialAttributes.push(curAttribute);
		}

		var shineness = materialChidren[4].attributes.getNamedItem('value').value;
		materialAttributes.push(shineness);

		this.materials.push(materialAttributes);
	}
	
	if(this.compareIds(ids) == "Equal Ids"){
		console.log("Equal Ids in transformations!\n");
		return "Equal Ids";
	}

}

MySceneGraph.prototype.parseTransformations= function (rootElement) {
	
	var elems =  rootElement.getElementsByTagName('transformations');

	if (elems == null) {
		return "'transformations' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'transformations' element found.";
	}

	var transformationsElems = elems[0].getElementsByTagName('transformation');
	var ids = [];

	for(i = 0; i < transformationsElems.length; ++i){
		var curTransformation = transformationsElems[i];
		var transformationValues = [];

		var id = curTransformation.attributes.getNamedItem('id').value;
		ids[i] = id;

		var children = curTransformation.children;

		if(children.length == 0){
			console.log("There needs to be one or more transformation operations inside each transformation.\n")
			return "No transformations";
		}


		for(j = 0; j < children.length; ++j){
			var operation = children[j];

			var type = children[j].tagName;
			var op = [];

			switch(type){
				case 'translate':
					var tx = children[j].attributes.getNamedItem('x').value;
					var ty = children[j].attributes.getNamedItem('y').value;
					var tz = children[j].attributes.getNamedItem('z').value;
					op = ['translate', tx, ty, tz];
				break;

				case 'rotate':
					var rotate = children[j].getElementsByTagName('rotate');
					var axis = children[j].attributes.getNamedItem('axis').value;
					op = ['rotate', rotate, axis];
				break;

				case 'scale':
					var scale = curTransformation.getElementsByTagName('scale');
					var sx = children[j].attributes.getNamedItem('x').value;
					var sy = children[j].attributes.getNamedItem('y').value;
					var sz = children[j].attributes.getNamedItem('z').value;
					op = ['scale', sx, sy, sz];
					break;

				default:
					console.log("Invalid transformation: " + type + "\n");
					return "Invalid transformation";
			}

			transformationValues.push([id, op]);
		}

		this.transformations.push(transformationValues);

	}

	if(this.compareIds(ids) == "Equal Ids"){
			console.log("Equal Ids in transformations!\n");
			return "Equal Ids";
		}

}

MySceneGraph.prototype.parsePrimitives= function (rootElement) {
	
	var elems =  rootElement.getElementsByTagName('primitives');

	if (elems == null) {
		return "'primitives' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'primitives' element found.";
	}

	var primitivesElems = elems[0].getElementsByTagName('primitive');
	var ids = [];

	for(i = 0; i < primitivesElems.length; ++i){
		
		var curPrimitive = primitivesElems[i];

		var id = curPrimitive.attributes.getNamedItem('id');
		ids[i] = id;

		var primitiveChild = curPrimitive.children;
		var primitiveValues = [];

		if(primitiveChild.length != 1){
			return "There must be one and only one element inside each primitive";
		}

		var type = primitiveChild[0].tagName;

		switch(type){
			case 'rectangle':
				var x1 = primitiveChild[0].attributes.getNamedItem('x1').value;
				var y1 = primitiveChild[0].attributes.getNamedItem('y1').value;
				var x2 = primitiveChild[0].attributes.getNamedItem('x2').value;
				var y2 = primitiveChild[0].attributes.getNamedItem('y2').value;
				primitiveValues = [type, x1, y1, x2, y2];
				break;

			case 'triangle':
				var x1 = primitiveChild[0].attributes.getNamedItem('x1').value;
				var y1 = primitiveChild[0].attributes.getNamedItem('y1').value;
				var z1 = primitiveChild[0].attributes.getNamedItem('z1').value;
				var x2 = primitiveChild[0].attributes.getNamedItem('x2').value;
				var y2 = primitiveChild[0].attributes.getNamedItem('y2').value;
				var z2 = primitiveChild[0].attributes.getNamedItem('z2').value;
				var x3 = primitiveChild[0].attributes.getNamedItem('x3').value;
				var y3 = primitiveChild[0].attributes.getNamedItem('y3').value;
				var z3 = primitiveChild[0].attributes.getNamedItem('z3').value; 
				primitiveValues = [type, x1, y1, z1, x2, y2, z2, x3, y3, z3];
				break;

			case 'cylinder':
				var base = primitiveChild[0].attributes.getNamedItem('base').value;
				var top = primitiveChild[0].attributes.getNamedItem('top').value;
				var height = primitiveChild[0].attributes.getNamedItem('height').value;
				var slices = primitiveChild[0].attributes.getNamedItem('slices').value;
				var stacks = primitiveChild[0].attributes.getNamedItem('stacks').value;
				primitiveValues = [type, base, top, height, slices, stacks];
				break;

			case 'sphere':
				var radius = primitiveChild[0].attributes.getNamedItem('radius').value;
				var slices = primitiveChild[0].attributes.getNamedItem('slices').value;
				var stacks = primitiveChild[0].attributes.getNamedItem('stacks').value;
				primitiveValues = [type, radius, slices, stacks];
				break;

			case 'torus':
				var inner = primitiveChild[0].attributes.getNamedItem('inner').value;
				var outer = primitiveChild[0].attributes.getNamedItem('outer').value;
				var slices = primitiveChild[0].attributes.getNamedItem('slices').value;
				var loops = primitiveChild[0].attributes.getNamedItem('loops').value;
				primitiveValues = [type, inner, outer, slices, loops];
				break;

			default:
				return "Invalid primitive name";
				break;
		}

		this.primitives.push([id, primitiveValues]);

	}

	if(this.compareIds(ids) == "Equal Ids"){
			console.log("Equal Ids in primitives!\n");
			return "Equal Ids";
		}
}


MySceneGraph.prototype.parseComponents= function (rootElement) {
	
	var elems =  rootElement.getElementsByTagName('components');

	if (elems == null) {
		return "'components' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'components' element found.";
	}

	var componentElems = elems[0].getElementsByTagName('component');
	var ids = [];

	for(i = 0; i < componentElems.length; ++i){


		var id = componentElems[i].attributes.getNamedItem('id').value;
		ids.push(id);

		var transformation = componentElems[i].getElementsByTagName('transformation');

		if (transformation.length != 1){
			return "There needs to be one and only one 'transformation' block in each component.";
		}

		var operations = transformation[0].children;

		for(j = 0; j < operations.length; ++j){

			var curOperation = [];
			var allTransformations = [];

			var type = operations[j].tagName;

				switch(type){
				case 'transformationref':
					curOperation = ['ref', operations[j].attributes.getNamedItem('id').value];
					break;
			
				case 'translate':
					var tx = operations[j].attributes.getNamedItem('x').value;
					var ty = operations[j].attributes.getNamedItem('y').value;
					var tz = operations[j].attributes.getNamedItem('z').value;
					curOperation = [type, tx, ty, tz];
				break;

				case 'rotate':
					var rotate = operations[j].getElementsByTagName('rotate');
					var axis = operations[j].attributes.getNamedItem('axis').value;
					curOperation = [type, rotate, axis];
				break;

				case 'scale':
					var scale = operations[j].getElementsByTagName('scale');
					var sx = operations[j].attributes.getNamedItem('x').value;
					var sy = operations[j].attributes.getNamedItem('y').value;
					var sz = operations[j].attributes.getNamedItem('z').value;
					curOperation = [type, sx, sy, sz];
					break;

				default:
					console.log("Invalid transformation: " + type + "\n");
					return "Invalid transformation";
					break;

			}

			allTransformations.push(curOperation);


		}


			var materials = componentElems[i].getElementsByTagName('materials');

			if(materials.length != 1){
				return "There need to be one and only one 'materials' block in each component";
			}

			var materialsElems = materials[0].children;

			if(materialsElems.length < 1){
				return "There needs to be at least one material declared in each component";
			}

			var allMaterials = [];

			for(j = 0; j < materialsElems.length; ++j){
				var materialId = materialsElems[j].attributes.getNamedItem('id').value;
				allMaterials.push(materialId);
			}



			var textures = componentElems[i].getElementsByTagName('texture');

			if(textures.length != 1){
				return "There need to be one and only one 'textures' block in each component";
			}

			var texturesElems = textures[0].children;
			var allTextures = [];

			for(j = 0; j < texturesElems.length; ++j){
				var textureId = materialsElems[j].attributes.getNamedItem('id').value;
				allTextures.push(textureId);
			}

			var children = componentElems[i].getElementsByTagName('children');

			if(children.length != 1){
				return "There needs to be one and only one 'children' block in each component";
			}

			var childComponents = children[0].children;

			console.log(childComponents);

			if(childComponents.length < 1){
				return "There needs to be at least one child inside the 'children' block in each component";
			}

			for (j = 0; j < childComponents.length; ++j){

				var type = childComponents[j].tagName;
				var curChild = [];
				var childId = childComponents[j].attributes.getNamedItem('id').value;
				var allChildren = [];
				
				if(type != 'primitiveref' && type != 'componentref'){
					return "Invalid child name in components.\n Only 'primitiveref' and 'componentref' allowed";
				}
				else{
					curChild = [type, id];
				}

				allChildren.push(curChild);

			}

			var curComponent = [id, allTransformations, allMaterials, allTextures, allChildren];
			this.components.push(curComponent);		
	}

	if(this.compareIds(ids) == "Equal Ids"){
		console.log("Equal Ids in components!\n");
		return "Equal Ids";
	}


}

MySceneGraph.prototype.compareIds = function(ids){
	for(i = 0; i < ids.length; ++i)
		for(j = i + 1; j < ids.length; ++j)
			if(i != j && ids[i] == ids[j])
				return "Equal Ids";
}

	
/*
 * Callback to be executed on any read error
 */
 
MySceneGraph.prototype.onXMLError=function (message) {
	console.error("DSX Loading Error: "+message);	
	this.loadedOk=false;
};


