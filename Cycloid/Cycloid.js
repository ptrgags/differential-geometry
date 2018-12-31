/**
 * Cycloid
 *
 * Curve generated by tracking a point on a circle as it rolls along the ground
 *
 * The center of the circle simply moves to the right as it rolls
 * center(t) = (t, R)
 *
 * We want to track a point on the circumference as it rolls around.
 * the offset is its motion relative to the center
 * offset(t) = (-R * sin(t), -R * cos(t))
 *
 * The cycloid is just the offset in world space:
 * cycloid(t) = center(t) + offset(t)
 *            = (t - R * sin(t), R - R * cos(t))
 */

var dt = 0.05;
var SCALE = 50; // pixels per unit
var PIXEL = 1.0 / SCALE; // units per pixel

function Circle(x, y, r) {
    this.pos = createVector(x, y);
    this.radius = r;
    this.angle = 0.0;
    this.cycloid = [];
    this.MAX_POINTS = 1000;
    
    this.move = function(dt) {
        this.pos.add(this.radius * dt);
        this.angle += dt;
        
        if (this.cycloid.length < this.MAX_POINTS)
            this.cycloid.push(this.get_rim_point());
    }
    
    // Get the point on the circle that was originally touching the ground
    this.get_rim_point = function() {
        var rim_point = createVector(-this.radius * sin(this.angle), -this.radius * cos(this.angle));
        rim_point.add(this.pos);
        return rim_point;
    }
    
    this.render = function() {
        // Stroke the circle in white
        noFill();
        stroke(255);
        strokeWeight(1.0 * PIXEL);
        
        // Draw the main circle
        var w = 2.0 * this.radius;
        ellipse(this.pos.x, this.pos.y, w, w);
        
        // Draw a line and point to show the current angle
        var rim_point = this.get_rim_point();
        line(rim_point.x, rim_point.y, this.pos.x, this.pos.y);
        ellipse(rim_point.x, rim_point.y, 4.0 * PIXEL, 4.0 * PIXEL);
        
        // And draw the cycloid
        stroke(255, 0, 0);
        strokeWeight(3.0 * PIXEL);
        beginShape();
        for (var point of this.cycloid) {
            vertex(point.x, point.y);
        }
        endShape();
        
    }
}

function Ground() {
    this.MIN_X = 0;
    this.MAX_X = 20;
    this.THICKNESS = 0.5;
    this.render = function() {
        noFill();
        stroke(255);
        strokeWeight(2.0 * PIXEL);
        line(this.MIN_X, 0, this.MAX_X, 0);
        for (var i = this.MIN_X; i < this.MAX_X; i++) {
            line(i, -this.THICKNESS, i + 1, 0);
        }
    }
}

var circle;
var ground = new Ground();

function setup() {
    createCanvas(windowWidth, windowHeight);
    circle = new Circle(0, 2, 2);
}

function update() {
    circle.move(dt);
}

function draw() {
    background(0);
    push();
    
    translate(0, 3 * height / 4);
    scale(SCALE, -SCALE);

    ground.render();
    circle.render();
    pop();
    
    update();
}