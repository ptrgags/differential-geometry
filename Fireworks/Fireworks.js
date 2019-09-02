const FPS = 30;
const NUM_FRAGMENTS = 100;

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
        strokeWeight(2.0 / scale_factor);
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
    static get MAX_HISTORY() {
        return 30;
    }

    static get SIZE() {
        return 0.5;
    }

    constructor(angle) {
        this.angle = angle;
        this.points = [];
    }

    x(t) {
        return v0 * cos(this.angle) * t
    }

    y(t) {
        return y0 + v0 * sin(this.angle) * t - 0.5 * g * t * t;
    }
  
    position(t) {
        const x = this.x(t);
        const y = this.y(t);
        if (y < 0) {
            return null;
        } else {
            return createVector(this.x(t), max(y, 0));
        }
    }

    update_history(pos) {
        if (pos !== null) {
            this.points.push(pos);
            // Remove old points
            if (this.points.length > Fragment.MAX_HISTORY) {
                this.points.shift();
            }
        } else {
            // Remove old points
            if (this.points.length > 1) {
                this.points.shift();
            }
        }

    }

    get last_position() {
        return this.points[this.points.length - 1];
    }
  
    render(t) {
        const w = Fragment.SIZE;
        const pos = this.position(t);
        this.update_history(pos);
 
        noFill();
        stroke(255, 255, 0);
        beginShape(LINES);
        for (let i = 0; i < this.points.length - 1; i++) {
            const prev = this.points[i];
            const next = this.points[i + 1];
            vertex(prev.x, prev.y);
            vertex(next.x, next.y);
        }
        endShape();

        // Draw a bigger dot at the end of the trajectory
        fill(255, 255, 0);
        noStroke();
        const last_pos = this.last_position;
        ellipse(last_pos.x - w / 2, last_pos.y - w / 2, w, w);
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

    for (let i = 0; i < NUM_FRAGMENTS; i++) {
        const theta = i / NUM_FRAGMENTS * TWO_PI;
        const frag = new Fragment(theta);
        fragments.push(frag);
    }
}


function draw() {
    background(0);

    scaler.start_scaling();
    envelope.render();

    const t = frameCount / FPS;
    if (t < EXPLODE_TIME) {
        rocket.render(t)
    } else {
        for (let frag of fragments) {
            frag.render(t - EXPLODE_TIME);
        }
    }

    scaler.stop_scaling();

}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
