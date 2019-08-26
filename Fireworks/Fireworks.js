const SPEED = 100;
const EXPLODE_HEIGHT = 400;
const EXPLODE_TIME = 1;
const FPS = 30;
const NUM_FRAGMENTS = 1000;

class Rocket {
  constructor(explode_time, explode_height) {
    this.explode_time = explode_time;
    this.explode_height = explode_height;
    this.WIDTH = 10;
  }
  
  get velocity() {
    return this.explode_height / this.explode_time;
  }
  
  position(t) {
    return this.velocity * t;
  }
  
  render(t) {
    if (t > this.explode_time) {
      return;
    }
    
    const y = height - this.position(t);
    noFill();
    stroke(255);
    rect(width / 2 - this.WIDTH / 2, y + this.WIDTH, this.WIDTH, this.WIDTH);   
  }
}

class Fragment {
  constructor(explode_time, explode_height, speed) {
    this.explode_time = explode_time;
    this.explode_height = explode_height;
    this.initial_position = createVector(width / 2, explode_height);
    this.initial_velocity = p5.Vector.random2D().mult(speed);
    this.frag_color = color(255 * random(), 255 * random(), 255 * random());
    this.GRAVITY = 10;
    this.MAX_HISTORY = 1000;
    this.POINT_SIZE = 2;
    this.points = [];
  }
  
  get acceleration() {
    return createVector(0, -this.GRAVITY);
  }
  
  velocity(t) {
    return p5.Vector.add(this.initial_velocity, this.acceleration.mult(t));
  }
  
  position(t) {
    return createVector(0, 0)
      .add(this.initial_position)
      .add(this.velocity(t).mult(t))
      .add(this.acceleration.mult(0.5 * t * t));
  }
  
  update_history(pos) {
    this.points.push(pos);
    if (this.points.length > this.MAX_HISTORY) {
      this.points.shift();
    }
  }
  
  render(t) {
    // We only start once the firework reaches the explode height
    if (t <= this.explode_time) {
      return;
    }
    const effective_t = t - this.explode_time;
    
    // Add a new point to the list
    const pos = this.position(effective_t);
    fill(this.frag_color);
    noStroke();
    ellipse(pos.x, height - pos.y, this.POINT_SIZE, this.POINT_SIZE);
  }
}


var rocket;
var fragments = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(FPS);
  
  rocket = new Rocket(EXPLODE_TIME, EXPLODE_HEIGHT);
  for (let i = 0; i < NUM_FRAGMENTS; i++) {
    const frag = new Fragment(EXPLODE_TIME, EXPLODE_HEIGHT, SPEED);
    fragments.push(frag);
  }
}


function draw() {
  const t = frameCount / FPS;
  if (t < EXPLODE_TIME + 0.01) {
    background(0);
  }
  
  rocket.render(t);
  
  for (let frag of fragments) {
    frag.render(t);
  }

}
