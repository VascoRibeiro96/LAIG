function CircularAnimation(scene, span, center, radius, startang, rotang, perpetual){
	Animation.call(this);
	
	this.scene = scene;
	this.span = span;
	this.center = center;
	this.radius = radius;
	this.startAng = startang;
	this.curAng = startang;
	this.rotAng = rotang;
	this.perpetual = perpetual;
	this.velocity = this.rotAng / this.span;
	
	
}

CircularAnimation.prototype = Object.create(Animation.prototype);

CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.apply = function(span){
	
	if(span > this.span)
		span = this.span;
	
	this.scene.translate(this.center[0], this.center[1], this.center[2]);
	
	this.curAng += (this.velocity * span);

	if(!this.perpetual)
		if(this.curAng > this.rotAng)
			this.curAng = this.rotAng;

	this.scene.rotate(this.curAng * Math.PI/180,0,1,0);
	this.scene.translate(this.radius,0,0);
	
}