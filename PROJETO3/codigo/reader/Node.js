
 function Node(){
   this.material = [];
   this.texture = null;
   this.mat = null;
   this.children =[];
   this.primitive = null;
   this.transformation = null;
   this.animations = [];
   this.animationIndex = 0;
 };

 Node.prototype.push = function(nodeName){
   this.children.push(nodeName);
 }

 Node.prototype.getSize = function(){
   return this.children.length;
 }
