
function MySceneGraph(filename, scene) {
	this.loadedOk = null;
	
	// Establish bidirectional references between scene and graph
	this.scene = scene;
	scene.graph=this;
		
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
	
	// Here should go the calls for different functions to parse the various blocks
	var error = this.parseScene(rootElement);

	if (error != null) {
		this.onXMLError(error);
		return;
	}	
		
	
	//TODO HANDLE ERRORS AND DEVELOP THESE FUNCTIONS
	this.parseScene(rootElement); // PARSER DONE
	this.parseView(rootElement); // TO BE DONE LATER
	this.parseIllumination(rootElement); // //TO BE DONE LATER
	this.parseLights(rootElement); // //TO BE DONE LATER
	this.parseTextures(rootElement); // //TO BE DONE LATER
	this.parseMaterials(rootElement); // //TO BE DONE LATER
	this.parseTransformations(rootElement); //DONE FOR SPECIFIC CASE
	this.parsePrimitives(rootElement); // TO DO
	this.parseComponents(rootElement); //TO BE DONE LATER


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

	this.root = this.reader.getItem(scene, 'root');

	if(root == null) {
		return "Root Element is missing.";
	}

	this.axis_length = this.reader.getItem(scene, 'axis_length');

	if(axis_length == null){
		return "Axis-length is missing.";
	}

	console.log("Scene read from file: {Root=" + this.root + ", Axis-length=" + this.axis_length +"}");

	return "All done!";

	/*
	var tempList=rootElement.getElementsByTagName('list');

	if (tempList == null  || tempList.length==0) {
		return "list element is missing.";
	}
	
	this.list=[];
	// iterate over every element
	var nnodes=tempList[0].children.length;
	for (var i=0; i< nnodes; i++)
	{
		var e=tempList[0].children[i];

		// process each element and store its information
		this.list[e.id]=e.attributes.getNamedItem("coords").value;
		console.log("Read list item id "+ e.id+" with value "+this.list[e.id]);
	}; 
	*/

};


MySceneGraph.prototype.parseView= function (primitives) {
	
	var elems =  rootElement.getElementsByTagName('views');

	if (elems == null) {
		return "'view' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'view' element found.";
	}
	
	var perspective = elems[0].getElementsByTagName('perspective');
	var ids = [];	
	this.perspectives = [] 
	
	for(int i = 0; i < perspective.length; ++i){
		var curPerspective = perspective[i];

		var id = curPerspective.attributes.getNamedItem('id').value;
		ids[i] = id;
		
		var near = curPerspective.attributes.getNamedItem('near').value;
		var far = curPerspective.attributes.getNamedItem('far').value;
		var angle = curPerspective.attributes.getNamedItem('angle').value;
		var from = curPerspective.attributes.getNamedItem('from').value;
		var to = curPerspective.attributes.getNamedItem('to').value;
		
		curPerspective = [near, far, angle, from, to];
		this.perspectives.push(curPerspective);
	}
	
	if(compareIds(ids) == "Equal Ids"){
		console.log("Equal Ids in transformations!\n");
		return "Equal Ids";
	}
}

MySceneGraph.prototype.parseIllumination= function (transformations) {
	
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

}

MySceneGraph.prototype.parseLights= function (illumination) {
	
	var elems =  rootElement.getElementsByTagName('lights');

	if (elems == null) {
		return "'lights' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'lights' element found.";
	}

}

MySceneGraph.prototype.parseTextures= function (primitives) {
	
	var elems =  rootElement.getElementsByTagName('textures');

	if (elems == null) {
		return "'textures' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'textures' element found.";
	}


}

MySceneGraph.prototype.parseMaterials= function (transformations) {
	
	var elems =  rootElement.getElementsByTagName('materials');

	if (elems == null) {
		return "'materials' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'materials' element found.";
	}


}

MySceneGraph.prototype.parseTransformations= function (illumination) {
	
	var elems =  rootElement.getElementsByTagName('transformations');

	if (elems == null) {
		return "'transformations' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'transformations' element found.";
	}

	var transformationsElems = elems[0].getElementsByTagName('transformation');
	var ids = [];
	this.transformations = [];

	for(int i = 0; i < transformationsElems.length; ++i){
		var curTransformation = transformationsElems[i];

		var id = curTransformation.attributes.getNamedItem('id').value;
		ids[i] = id;

		var children = curTransformation.childNodes;

		if(children.length == 0){
			console.log("There needs to be one or more transformation operations inside each transformation.\n")
			return "No transformations";
		}


		for(int j = 0; j < children.length; ++j){
			var operation = children[j];

			var type = children[j].tagName;
			var op = [];

			switch(type){
				case 'translate':
					var tx = translate[0].attributes.getNamedItem('x').value;
					var ty = translate[0].attributes.getNamedItem('y').value;
					var tz = translate[0].attributes.getNamedItem('z').value;
					op = ['translate', tx, ty, tz];
				break;

				case 'rotate':
					var rotate = curTransformation.getElementsByTagName('rotate');
					var axis = rotate[0].attributes.getNamedItem('axis').value;
					var length = rotate[0].attributes.getNamedItem('length').value;
					op = ['rotate', rotate, axis, length];
				break;

				case 'scale':
					var scale = curTransformation.getElementsByTagName('scale');
					var sx = scale[0].attributes.getNamedItem('x').value;
					var sy = scale[0].attributes.getNamedItem('y').value;
					var sz = scale[0].attributes.getNamedItem('z').value;
					op = ['scale', sx, sy, sz];
					break;

				default:
					console.log("Invalid transformation: " + type + "\n");
					return "Invalid transformation";
			}

			curTransformation.push([id, op]);
		}

		transformations.push(curTransformation);

	}

	if(compareIds(ids) == "Equal Ids"){
			console.log("Equal Ids in transformations!\n");
			return "Equal Ids";
		}

}

MySceneGraph.prototype.parsePrimitives= function (primitives) {
	
	var elems =  rootElement.getElementsByTagName('primitives');

	if (elems == null) {
		return "'primitives' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'primitives' element found.";
	}

	var primitivesElems = elems[0].getElementsByTagName('primitive');
	var ids[];

	for(int i = 0; i < primitivesElems.length; ++i){
		
		var curPrimitive = primitivesElems[i];

		var id = curPrimitive.attributes.getNamedItem('id');
		ids[i] = id;

		var rectangle = curPrimitive.getElementsByTagName('rectangle');

		if(rectangle.length > 1){
			console.log("More than one rectangle in a primitive!\n")
			return "More than one rectangle in a primitive";
		}
		else if(rectangle.length == 1){ //if no rectangle tags are found, do nothing
			var rect = [];
			var x1 = rectangle[0].attributes.getNamedItem('x1').value;
			var y1 = rectangle[0].attributes.getNamedItem('y1').value;
			var x2 = rectangle[0].attributes.getNamedItem('x2').value;
			var y2 = rectangle[0].attributes.getNamedItem('y2').value;
		}

		var triangle = curPrimitive.getElementsByTagName('triangle');

		if(triangle.length > 1){
			console.log("More than one triangle in a primitive!\n")
			return "More than one triangle in a primitive";
		}
		else if(triangle.length == 1){ //if no triangle tags are found, do nothing
			var tri = [];
			var x1 = triangle[0].attributes.getNamedItem('x1').value;
			var y1 = triangle[0].attributes.getNamedItem('y1').value;
			var z1 = triangle[0].attributes.getNamedItem('z1').value;
			var x2 = triangle[0].attributes.getNamedItem('x2').value;
			var y2 = triangle[0].attributes.getNamedItem('y2').value;
			var z2 = triangle[0].attributes.getNamedItem('z2').value;
			var x3 = triangle[0].attributes.getNamedItem('x3').value;
			var y3 = triangle[0].attributes.getNamedItem('y3').value;
			var z3 = triangle[0].attributes.getNamedItem('z3').value;
		}

		var cylinder = curPrimitive.getElementsByTagName('cylinder');

		if(cylinder.length > 1){
			console.log("More than one cylinder in a primitive!\n")
			return "More than one cylinder in a primitive";
		}
		else if(cylinder.length == 1){ //if no cylinder tags are found, do nothing
			var rect = [];
			var base = cylinder[0].attributes.getNamedItem('base').value;
			var top = cylinder[0].attributes.getNamedItem('top').value;
			var height = cylinder[0].attributes.getNamedItem('height').value;
			var slices = cylinder[0].attributes.getNamedItem('slices').value;
			var stacks = cylinder[0].attributes.getNamedItem('stacks').value;

		}

		var sphere = curPrimitive.getElementsByTagName('sphere');

		if(sphere.length > 1){
			console.log("More than one sphere in a primitive!\n")
			return "More than one sphere in a primitive";
		}
		else if(sphere.length == 1){ //if no sphere tags are found, do nothing
			var sph = [];
			var radius = sphere[0].attributes.getNamedItem('radius').value;
			var slices = sphere[0].attributes.getNamedItem('slices').value;
			var stacks = sphere[0].attributes.getNamedItem('stacks').value;

		}

		var torus = curPrimitive.getElementsByTagName('torus');

		if(torus.length > 1){
			console.log("More than one torus in a primitive!\n")
			return "More than one torus in a primitive";
		}
		else if(torus.length == 1){ //if no torus tags are found, do nothing
			var rect = [];
			var inner = torus[0].attributes.getNamedItem('x1').value;
			var outer = torus[0].attributes.getNamedItem('y1').value;
			var slices = torus[0].attributes.getNamedItem('x2').value;
			var loops = torus[0].attributes.getNamedItem('y2').value;
		}


	}

	if(compareIds(ids) == "Equal Ids"){
			console.log("Equal Ids in primitives!\n");
			return "Equal Ids";
		}
}


MySceneGraph.prototype.parseComponents= function (transformations) {
	
	var elems =  rootElement.getElementsByTagName('components');

	if (elems == null) {
		return "'components' element is missing.";
	}

	if (elems.length != 1) {
		return "Either zero or more than one 'components' element found.";
	}


}

MySceneGraph.prototype.compareIds = function(ids){
	for(int i = 0; i < ids.length; ++i)
		for(int j = i + 1; j < ids.length; ++j)
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


