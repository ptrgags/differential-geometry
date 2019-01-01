/**
 * Cissoid of Diocles
 *
 * See for example
 * https://en.wikipedia.org/wiki/Cissoid_of_Diocles
 */
var SCALE = 100; // pixels per unit
var PIXEL = 1.0 / SCALE;

function Line(point, direction, line_color) {
    this.point = point;
    this.direction = direction;
    this.LARGE_T = 1000;
    this.line_color = line_color;
    
    this.get_normal = function() {
        return createVector(-this.direction.y, this.direction.x).normalize();
    }
    
    this.render = function() {
        stroke(this.line_color);
        strokeWeight(PIXEL);
        
        // Use the equation L(t) = P + t * D
        // to project points far out in each direction. We'll let
        // clipping do the rest.
        var start = this.direction.copy().mult(-1);
        var end = this.direction.copy();
        start.mult(this.LARGE_T);
        end.mult(this.LARGE_T);
        start.add(this.point);
        end.add(this.point);
        
        line(start.x, start.y, end.x, end.y);
    }
}

function Cissoid(radius) {
    this.radius = radius;
    this.cissoid = [];
    this.center = createVector(radius, 0);
    this.theta = -HALF_PI;
    this.dt = 0.01;
    this.LINE_OFFSET = 10 * PIXEL;
    
    this.far_line = new Line(
        createVector(2 * this.radius), createVector(0, 1), color(255));
    
    this.circle_point = function(theta) {
        // point on the circle of radius r as usual (r * cos(t), r * sin(t))
        // however, the angle is measured from the left end of the circle,
        // so the angle at the center is *double* theta
        return createVector(cos(2 * theta), sin(2 * theta)).mult(this.radius);
    }
    
    this.cissoid_point = function(theta) {
        var result = this.tangent_point(theta);
        result.sub(this.circle_point(theta).add(this.center));
        return result;
    }
    
    this.tangent_point = function(theta) {
        return createVector(1, tan(theta)).mult(2 * this.radius);
    }
    
    this.update = function() {
        // Only draw a half-cycle
        if (this.theta > HALF_PI)
            return;
        
        // Add a new point to the list
        var new_point = this.cissoid_point(this.theta);
        this.cissoid.push(new_point);
        
        this.theta += this.dt;
        
        if (this.theta > HALF_PI) {
            this.theta = -HALF_PI;
            this.cissoid = [];
        }
    }
    
    this.plot_point = function(point) {
        noStroke();
        fill(0, 0, 255);
        ellipse(point.x, point.y, 8 * PIXEL, 8 * PIXEL);
    }
    
    this.render = function() {
        stroke(255);
        noFill();
        strokeWeight(PIXEL);
        
        // Draw the circle and a tangent vertical line on the far side
        // of the circle
        ellipse(this.center.x, this.center.y, 2 * this.radius, 2 * this.radius);
        this.far_line.render();
        
        // Draw a line through the current point
        var generating_line = new Line(
            createVector(0, 0), 
            createVector(cos(this.theta), sin(this.theta)), 
            color(255, 255, 0));
        generating_line.render();
        
        // Draw the cissoid
        stroke(255, 0, 0);
        strokeWeight(3 * PIXEL);
        beginShape();
        for (var p of this.cissoid) {
            vertex(p.x, p.y);
        }
        endShape();
        
        // Get the key points on the circle and tangent line
        var ciss_point = this.cissoid_point(this.theta);
        var tan_point = this.tangent_point(this.theta);
        var circ_point = this.circle_point(this.theta).add(this.center);
        
        // Draw the two line segments of equal length slightly parallel to the
        // main line
        var normal = generating_line.get_normal();
        stroke(0, 255, 0);
        strokeWeight(3 * PIXEL);
        push();
        translate(this.LINE_OFFSET * normal.x, this.LINE_OFFSET * normal.y);
        line(0, 0, ciss_point.x, ciss_point.y);
        pop();
        
        push();
        translate(-this.LINE_OFFSET * normal.x, -this.LINE_OFFSET * normal.y);
        line(circ_point.x, circ_point.y, tan_point.x, tan_point.y);
        pop();
        
        // Draw the key points as small circles
        this.plot_point(createVector(0, 0));
        this.plot_point(circ_point);
        this.plot_point(tan_point);
        this.plot_point(ciss_point);
    }
}

var x_axis;
var y_axis;
var cissoid;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    x_axis = new Line(createVector(0, 0), createVector(1, 0), color(255));
    y_axis = new Line(createVector(0, 0), createVector(0, 1), color(255));
    cissoid = new Cissoid(1);
}

function update() {
    cissoid.update();
}

function draw() {
    background(0);
    push();
    translate(width / 4, height / 2);
    scale(SCALE, -SCALE);
    x_axis.render();
    y_axis.render();
    cissoid.render();
    
    pop();
    
    update(); 
}
