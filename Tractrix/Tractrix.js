/**
 * Tractrix
 *
 * Imagine you have a rigid beam laid flat on the ground. Now imagine you pull the
 * bottom of the rigid beam to the side and let the top drag behind. The path the
 * top takes is a tractrix
 *
 * a(t) = (cos t + ln(tan(t / 2)), sin t)
 * a'(t) = (-sin t + csc t, cos t)
 */

var SCALE = 100; // Pixels per unit
var PIXEL = 1.0 / SCALE;
var SPEED = 0.005;

/**
 * Okay, really this is a half tractrix,
 * but if we have 2 of them we can plot forwards
 * and backwards at once
 */
function Tractrix(beam_length, dt) {
  this.beam_length = beam_length;
  this.dt = dt;
  this.angle = HALF_PI;
  this.tractrix = [];
  
  this.update = function() {
      if (0 < this.angle && this.angle < PI) { 
          this.angle += this.dt;
          var new_point = this.curve_point(this.angle);
          this.tractrix.push(new_point);
      } else {
          this.angle = HALF_PI;
          this.tractrix = [];
      }
      
  }
  
  this.ground_point = function(t) {
      return createVector(log(tan(t / 2)), 0);
  }
  
  this.curve_point = function(t) {
      return createVector(cos(t) + log(tan(t / 2)), sin(t));
  }
  
  this.render = function() {
      stroke(255);
      strokeWeight(2 * PIXEL);
      
      // Draw the beam
      var ground = this.ground_point(this.angle);
      var curve = this.curve_point(this.angle);
      line(ground.x, ground.y, curve.x, curve.y);
      
      // Draw the curve
      stroke(255, 0, 0);
      strokeWeight(4 * PIXEL);
      noFill();
      beginShape();
      for (var p of this.tractrix) {
          vertex(p.x, p.y);
      }
      endShape();
  };
}

var tractrices;
 
function setup() {
    createCanvas(windowWidth, windowHeight);
    tractrices = [
        new Tractrix(2.0, SPEED),
        new Tractrix(2.0, -SPEED)
    ];
}

function update() {
    for (let tractrix of tractrices)
        tractrix.update();
}

function draw() {
    background(0);
    push();
    translate(width / 2, height / 2);
    scale(SCALE, -SCALE);
    
    for (let tractrix of tractrices)
        tractrix.render();
    pop();
    
    update(); 
}
