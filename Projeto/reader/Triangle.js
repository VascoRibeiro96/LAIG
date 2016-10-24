/**
 * Triangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

function Triangle(scene, point1, point2, point3, minS, maxS, minT, maxT) {
    CGFobject.call(this, scene);

    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;

    if (typeof minS == 'undefined') {
        this.minS = 0;
    } else {
        this.minS = minS;
    }

    if (typeof maxS == 'undefined') {
        this.maxS = 1;
    } else {
        this.maxS = maxS;
    }

    if (typeof minT == 'undefined') {
        this.minT = 0;
    } else {
        this.minT = minT;
    }

    if (typeof maxT == 'undefined') {
        this.maxT = 1;
    } else {
        this.maxT = maxT;
    }

    this.initBuffers();
};

Triangle.prototype = Object.create(CGFobject.prototype);
Triangle.prototype.constructor = Triangle;

Triangle.prototype.initBuffers = function() {
    this.vertices = [this.point1[0], this.point1[1], this.point1[2], //0
        this.point2[0], this.point2[1], this.point2[2], //1
        this.point3[0], this.point3[1], this.point3[2] //2
    ];

    this.indices = [
        0, 1, 2
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    let a = Math.sqrt((this.point3[0] - this.point2[0]) * (this.point3[0] - this.point2[0]) +
        (this.point3[1] - this.point2[1]) * (this.point3[1] - this.point2[1]) +
        (this.point3[2] - this.point2[2]) * (this.point3[2] - this.point2[2]));

    let b = Math.sqrt((this.point1[0] - this.point3[0]) * (this.point1[0] - this.point3[0]) +
        (this.point1[1] - this.point3[1]) * (this.point1[1] - this.point3[1]) +
        (this.point1[2] - this.point3[2]) * (this.point1[2] - this.point3[2]));

    let c = Math.sqrt((this.point2[0] - this.point1[0]) * (this.point2[0] - this.point1[0]) +
        (this.point2[1] - this.point1[1]) * (this.point2[1] - this.point1[1]) +
        (this.point2[2] - this.point1[2]) * (this.point2[2] - this.point1[2]));

    let cosBeta = (Math.pow(a, 2) - Math.pow(b, 2) + Math.pow(c, 2)) / (2 * a * c);

    let beta = Math.acos(cosBeta);

    this.originalTexCoords = [
        0, 0,
        c, 0,
        c - a * cosBeta, a * Math.sin(beta)
    ];

    this.texCoords = this.originalTexCoords.slice();

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
