const SPEED = 100;
const EXPLODE_HEIGHT = 400;
const FPS = 30;
const NUM_FRAGMENTS = 1000;

const v0 = 20.0;
const g = 9.81;
const y0 = 100.0;
const EXPLODE_TIME = 1.0;
const ROCKET_VELOCITY = y0;

/**
 * Parabola that serves as the envelope of the superposition
 * of all possible trajectories
 */
class Envelope {
    static get MAX_X() {
        const term1 = 2 * y0 * v0 * v0 / g;
        const term2 = v0 * v0 * v0 * v0 / g / g;
        return Math.sqrt(term1 + term2);
    }

    static get RESOLUTION() {
        return 100;
    }

    static height(x) {
        const term1 = y0;
        const term2 = v0 * v0 / 2.0 / g;
        const term3 = -g * x * x / 2.0 / v0 / v0;
        return term1 + term2 + term3
    }

    static make_points() {
        const points = [];
        const xf = Envelope.MAX_X;
        for (let i = 0; i < Envelope.RESOLUTION; i++) {
            const t = i / (Envelope.RESOLUTION - 1);
            const x = lerp(-xf, xf, t);
            const y = Envelope.height(x);
            const point = createVector(x, y);
            points.push(point);
        }
        return points;
    }

    constructor() {
        this.points = Envelope.make_points();
    }

    render() {
        noFill();
        stroke(255);
        beginShape(LINES);
        for (let i = 0; i < this.points.length - 1; i++) {
            const prev = this.points[i];
            const curr = this.points[i + 1];
            vertex(prev.x, prev.y);
            vertex(curr.x, curr.y);
        }
        endShape();

        rect(-Envelope.MAX_X, 0, 2 * Envelope.MAX_X, 2 * Envelope.MAX_X);
    }
}

class Scaler {
    constructor() {
        this.size_meters = 2.0 * Envelope.MAX_X;
    }

    get size_pixels() {
        return min(width, height);
    }

    get meters_per_pixel() {
        return this.size_meters / this.size_pixels;
    }
    
    start_scaling() {
        const scale_factor = 1.0 / this.meters_per_pixel;
        push();
        translate(width / 2, height / 2 + this.size_pixels / 2);
        scale(1, -1);
        scale(scale_factor, scale_factor);
        strokeWeight(1.0 / scale_factor);
    }

    stop_scaling() {
        pop();
    }
}

class Rocket {
    static get SIZE() {
        return 1;
    }

    constructor(velocity) {
        this.velocity = velocity;
    }
  
    position(t) {
        return this.velocity * t;
    }
  
    render(t) {
        const w = Rocket.SIZE;
        const y = this.position(t);
        noFill();
        stroke(255);
        rect(-w / 2, y - w / 2, w, w);   
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


let rocket;
let fragments = []; 
let envelope;
let scaler;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(FPS);

    envelope = new Envelope();
    scaler = new Scaler();
    rocket = new Rocket(ROCKET_VELOCITY);
  /* 
  rocket = new Rocket(EXPLODE_TIME, EXPLODE_HEIGHT);
  for (let i = 0; i < NUM_FRAGMENTS; i++) {
    const frag = new Fragment(EXPLODE_TIME, EXPLODE_HEIGHT, SPEED);
    fragments.push(frag);
  }
  */
}


function draw() {
    background(0);

    scaler.start_scaling();
    envelope.render();

    const t = frameCount / FPS;
    if (t < EXPLODE_TIME) {
        rocket.render(t)
    } else {
        //
    }

    /*
  const t = frameCount / FPS;
  if (t < EXPLODE_TIME + 0.01) {
    background(0);
  }
  
  rocket.render(t);
  
  for (let frag of fragments) {
    frag.render(t);
  }
  */

    scaler.stop_scaling();

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
