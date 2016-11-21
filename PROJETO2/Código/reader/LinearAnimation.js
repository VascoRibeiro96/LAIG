function LinearAnimation(scene, span, controlpoints){
	
	Animation.call(this);
	
	this.scene = scene;
	this.span = span;
	this.controlpoints = controlpoints;
	this.currentDistance = 0;
	this.curSeg = 0;
	this.numSegs = this.controlpoints.length - 1;
	this.rotationAngle = 0;
	this.distance = 0;
	this.vectorDistances = [];
	
	for (var i = 0; i < controlpoints.length - 1; i++) {
		this.distance += vec3.dist(vec3.fromValues(controlpoints[i][0], controlpoints[i][1], controlpoints[i][2]), vec3.fromValues(controlpoints[i + 1][0], controlpoints[i + 1][1], controlpoints[i + 1][2]));
		this.vectorDistances.push(this.distance);
	}
	
	this.velocity = this.distance/span;
	this.preAngle = 0;
	
}

LinearAnimation.prototype = Object.create(Animation.prototype);

LinearAnimation.prototype.constructor = LinearAnimation;

LinearAnimation.prototype.apply = function(span) {
	if (span > this.span)
		span = this.span;



	// Makes the transformation for completed segments:

	for(var i = 0; i < this.curSeg; i++)
	{
		var p1 = this.controlpoints[i];
		var p2 = this.controlpoints[i+1];
		this.scene.translate((p2[0] - p1[0]), (p2[1] - p1[1]), (p2[2] - p1[2]));
	}



	if(this.curSeg < this.numSegs){

		this.currentDistance += this.velocity * span;
		

		// get control points from current segment
		var p1 = this.controlpoints[this.curSeg];
		var p2 = this.controlpoints[i + 1];

		if(this.curSeg != 0) //Nao roda para o primeiro segmento
			this.rotationAngle = Math.atan((p2[0] - p1[0]) / (p2[2] - p1[2]))

		var displacement = this.currentDistance / this.vectorDistances[this.curSeg];
		this.scene.translate((p2[0] - p1[0]) * displacement, (p2[1] - p1[1]) * displacement, (p2[2] - p1[2]) * displacement);
		



		if(this.currentDistance >= this.vectorDistances[this.curSeg]){
			this.curSeg++;
			this.currentDistance = 0;
		}
	}
	else
		this.done = true;
	
	this.scene.rotate(this.rotationAngle, 0, 1, 0);

}