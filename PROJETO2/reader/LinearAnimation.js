function LinearAnimation(scene, span, controlpoints){
	
	MyAnimation.call(this);
	
	this.scene = scene;
	this.span = span;
	this.controlpoints = controlpoints;
	
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

	this.currentDistance = this.velocity * span;

	// find current segment
	var i = 0;
	while (this.currentDistance > this.vectorDistances[i] && i < this.vectorDistances.length)
		i++;

	// get control points from current segment
	var p1 = this.controlpoints[i];
	var p2 = this.controlpoints[i + 1];

	// calculate displacement and apply translation
	var lastSegDist;
	if (i == 0)
		lastSegDist = 0;
	else
		lastSegDist = this.vectorDistances[i - 1];

	var displacement = (this.currentDistance - lastSegDist) / (this.vectorDistances[i] - lastSegDist);
	this.scene.translate((p2[0] - p1[0]) * displacement + p1[0], (p2[1] - p1[1]) * displacement + p1[1], (p2[2] - p1[2]) * displacement + p1[2]);

	// calculate rotation angle and apply rotation
	var rotationAngle = Math.atan((p2[0] - p1[0]) / (p2[2] - p1[2]));

	if (p2[2] - p1[2] < 0)
		rotationAngle += Math.PI;

	if (p2[0] - p1[0] == 0 && p2[2] - p1[2] == 0)
		rotationAngle = this.preAngle;

	this.preAngle = rotationAngle;

	this.scene.rotate(rotationAngle, 0, 1, 0);
}