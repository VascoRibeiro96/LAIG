
function Board(scene) {
	CGFobject.call(this, scene);

  this.finished = false;

	this.scene = scene;

	this.history = null;

  this.initBoardMatrix();

  this.initPiecesMatrix();
};

Board.prototype = Object.create(CGFobject.prototype);
Board.prototype.constructor=Board;

Board.prototype.initBoardMatrix = function(){
  this.matrix = [];
  var prevColor;
  for(var x=0; x<8; x++){
    this.matrix.push([]);
    for(var y=0; y<4; y++){
      if((x+y) % 2 == 0){
        prevColor = "white";
      }
      else {
        prevColor = "grey";
      }
      this.matrix[x].push(new BoardCell(this.scene, x, y, new Cube(this.scene, 2, 0.2, 2), prevColor));
    }
  }
}

Board.prototype.initPiecesMatrix = function(){
  this.pieces = [];

  for(var x=0; x<8; x++){
    this.pieces.push([]);
    for(var y=0; y<4; y++){
      if((x==0 && y==0) || (x==0 && y==1) || (x==1 && y==0) || (x==7 && y==3) || (x==7 && y==2) || (x==6 && y==3)){
        this.pieces[x].push(new Queen(this.scene, x, y));
      }

      else if((x==0 && y==2) || (x==1 && y==1) || (x==2 && y==0) || (x==7 && y==1) || (x==6 && y==2) || (x==5 && y==3)){
        this.pieces[x].push(new Drone(this.scene, x, y));
      }

      else if((x==1 && y==2) || (x==2 && y==2) || (x==2 && y==1) || (x==6 && y==1) || (x==5 && y==1) || (x==5 && y==2)){
        this.pieces[x].push(new Pawn(this.scene, x, y));
      }

      else
        this.pieces[x].push("");
    }
  }
}

Board.prototype.display = function(){
  this.scene.pushMatrix();


	var i = 0;
  for(var x=0; x<this.matrix.length; x++){
    for (var y=0; y<4; y++){
      this.scene.pushMatrix();
			this.scene.registerForPick(i, this.matrix[x][y]);
			i++;
			this.matrix[x][y].setId(i-1);
      this.matrix[x][y].display();
      this.scene.popMatrix();
      if(this.pieces[x][y] != ""){
        this.scene.pushMatrix();
				this.scene.registerForPick(i, this.pieces[x][y]);
				i++;
				this.pieces[x][y].setId(i-1);
        this.pieces[x][y].display();
        this.scene.popMatrix();
      }
    }
  }

	this.scene.popMatrix();

	if(this.history != null){
		for(var a = 0; a < this.history.p1Captured.length; a++){
			this.scene.pushMatrix();
			this.history.p1Captured[a].display();
			this.scene.popMatrix();
		}

		for(var b = 0; b < this.history.p2Captured.length; b++){
			this.scene.pushMatrix();
			this.history.p2Captured[b].display();
			this.scene.popMatrix();
		}
	}
}

Board.prototype.update = function(currTime){
	for(var x=0; x<this.matrix.length; x++){
		for (var y=0; y<4; y++){
			if(this.pieces[x][y] != "")
				if(this.pieces[x][y].animation != null){
					this.pieces[x][y].animation.update(currTime);
				}
		}
	}
	if(this.history != null){
		for(var a = 0; a < this.history.p1Captured.length; a++){
			if(this.history.p1Captured[a].animation != null){
				this.history.p1Captured[a].animation.update(currTime);
			}
		}

		for(var b = 0; b < this.history.p2Captured.length; b++){
			if(this.history.p2Captured[b].animation != null){
				this.history.p2Captured[b].animation.update(currTime);
			}
		}
	}
}

Board.prototype.make_move = function(xi, yi, xf, yf, playing, points){
	this.pieces[xi][yi].animation = new Piece(1, this.pieces[xi][yi], xi, yi, xf, yf);
	this.pieces[xi][yi].moving = true;

	var captured = null;
	if(this.pieces[xf][yf] != ""){
		switch(this.pieces[xf][yf].type){
			case 'pawn':
		  captured = new Pawn(this.scene, xf, yf);
			break;
			case 'drone':
			captured = new Drone(this.scene, xf, yf);
			break;
			case 'queen':
			captured = new Queen(this.scene, xf, yf);
			break;
			default:
			break;
		}

		if(this.history.playing == this.history.player1){
			this.history.capture(captured, xf, yf, 'player1');
		}
		else{
			this.history.capture(captured, xf, yf, 'player2');
		}
	}

	this.history.insertMove(new Move(this.scene, xi, yi, xf, yf, this.pieces[xi][yi], this.pieces[xf][yf], playing, points));

	this.pieces[xf][yf] = this.pieces[xi][yi];
	this.pieces[xi][yi] = "";

	this.pieces[xf][yf].x = xf;
	this.pieces[xf][yf].y = yf;
}

Board.prototype.get_bot_move = function(msg){
	var yi = parseFloat(msg.substring(1,2));
	var xi = parseFloat(msg.substring(3,4));
	var yf = parseFloat(msg.substring(5,6));
	var xf = parseFloat(msg.substring(7,8));
	if(msg.length == 11)
	var np = parseFloat(msg.substring(9,10));
	else {
		var np = parseFloat(msg.substring(9,11));
	}

	this.make_move(xi, yi, xf, yf, this.history.playing, np);
}

Board.prototype.showWinner = function(){
	if(this.history.p1Points > this.history.p2Points){
		this.winnerP = this.history.p1Points;
		this.winner = this.history.player1;
	} else{
		this.winner = this.history.player2;
		this.winnerP = this.history.p2Points;
	}
	console.log("The winner is " + this.winner);
}
