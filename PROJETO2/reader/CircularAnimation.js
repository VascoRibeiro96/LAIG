function CircularAnimation(scene, span, center, radius, startang, rotang){
	Animation.call(this);
	
	this.scene = scene;
	this.span = span;
	this.center = center;
	this.radius = radius;
	this.startang = startang;
	this.rotang = rotang;
	
	this.velocity = this.rotang / this.span;
	
	
}

CircularAnimation.prototype = Object.create(Animation.prototype);

CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.apply = function(time){
	
	if(time > this.time)
		time = this.time;
	
	this.scene.translate(this.center[0], this.center[1], this.center[2]);
	
	var angle = this.startang + this.velocity*time;
	this.scene.rotate(angle,0,1,0);
	this.scene.translate(this.radius,0,0);
	
}