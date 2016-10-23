function MyTexture(scene, file, length_s, length_t) {
    this.texture = new CGFtexture(scene, file);
    this.length_s = length_s;
    this.length_t = length_t;
}

MyTexture.prototype.constructor = MyTexture;

MyTexture.prototype.apply = function(appearance) {
    appearance.setTexture(this.texture);
}

MyTexture.prototype.amplify = function(component) {
    component.amplifyTexture(this.length_s, this.length_t);
}