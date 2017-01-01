
 function Piece(timeSpan, piece, xi, yi, xf, yf) {
   Animation.apply(this, arguments);
   this.deltaX = (xi-xf);
   this.deltaZ = -(yi-yf);

   this.radius = Math.sqrt(Math.pow(this.deltaX, 2) + Math.pow(this.deltaZ, 2));

   this.xf = xf;
   this.yf = yf;

   this.piece = piece;

   this.timeSpan = timeSpan;

   this.initialTime = this.piece.scene.time;

   this.matrix = mat4.create();
 }

Piece.prototype = new Animation();
Piece.prototype.constructor = Piece;

Piece.prototype.isComplete = function(currentTime){
  var timePassed = (currentTime - this.initialTime)/1000;

  return timePassed > this.timeSpan;
};

Piece.prototype.update = function(currentTime){
  var timePassed = (currentTime - this.initialTime)/1000;
  this.matrix = mat4.create();

  var movementRatio = 2* (1 - timePassed/this.timeSpan);

  if(timePassed >= this.timeSpan){
    this.piece.moving = false;
    this.piece.animation = null;
    return;
  }

  mat4.translate(this.matrix, this.matrix, [this.deltaX*movementRatio, 0, this.deltaZ*movementRatio]);
};

Piece.prototype.apply = function(){
  this.piece.scene.multMatrix(this.matrix);
};
