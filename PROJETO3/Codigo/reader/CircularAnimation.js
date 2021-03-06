function CircularAnimation(scene, id, type, span, centerx, centery, centerz, radius, startang, rotang){

  Animation.call(this, scene, id, type , span);

  this.centerx = centerx;
  this.centery = centery;
  this.centerz = centerz;
  this.radius = radius;
  this.startang = startang * Math.PI / 180;
  this.rotang = rotang * Math.PI / 180;
  this.complete = false;
  this.elapsedTime = 0;

  this.velocity = this.rotang/this.span;
};

CircularAnimation.prototype = Object.create(Animation.prototype);
CircularAnimation.prototype.constructor = CircularAnimation;

CircularAnimation.prototype.apply = function(currTime, node){
  if(this.elapsedTime == 0) this.elapsedTime = currTime;
  var span = currTime-this.elapsedTime;
	if (span > this.span){
		span = this.span;
    this.complete = true;
  }

  this.scene.translate(this.centerx, this.centery, this.centerz);

  var angle = this.startang + this.velocity * span;
  this.scene.rotate(angle, 0, 1, 0);

  this.scene.translate(this.radius, 0, 0);
};
