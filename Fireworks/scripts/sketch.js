var fireworks = [];
var gravity

function setup() {
	createCanvas(1200,600);
	gravity = createVector(0,0.2);
	
	stroke(255);
	strokeWeight(4);
	background(0);
}

function draw() {
	background(0,25);
	if(random(1) < 0.03) {
		fireworks.push(new Firework());
	}
	
	for(var i = fireworks.length - 1; i >=0; i--) {
		fireworks[i].update();
		fireworks[i].show();
		if (fireworks[i].done()) {
			fireworks.splice(i,1);
		}
	}
}

class Particle {
	constructor(x,y, firework, color, size, inv, color2,isShimmer,shp,i,total,petals) {
		this.pos = createVector(x,y);
		this.firework = firework;
		this.lifespan = 250;
		this.col = color;
		this.col2 = color2;
		this.rad = size;
		this.inv = inv;
		this.isShimmer = isShimmer;
		this.petals = petals;

		//SHape VArs
		this.shp = shp;
		this.i = i;
		this.total = total;

		this.counter = floor(random(120));
		if(this.firework) {
			this.vel = createVector(random(-3,3),random(-15,-11));
		} else {
			// Square
			// Circle
			// Heart
			// Default
			var t = this.i/this.total * TWO_PI;
			if(this.shp < 0.15) {
					this.vel = createVector(this.rad * cos(t), this.rad * sin(t));
					this.isShimmer = false;
			}
			else if(this.shp < 0.3) {
					this.vel = createVector(this.rad *  (abs(cos(t))*cos(t) + abs(sin(t)) * sin(t)),this.rad *  (abs(cos(t))*cos(t) - abs(sin(t)) * sin(t)));
					this.isShimmer = false;
			}
			else if(this.shp < 0.45) {
					//t = t - PI;
					this.vel = createVector(this.rad * cos(this.petals * t) * cos(t),this.rad * cos(this.petals * t) * sin(t));
					this.isShimmer = false;
			}
			else if(this. shp < 0.6){
				this.vel = createVector(16 * Math.pow(sin(t),3),-((13 * cos(t)) - (5 * cos(2 * t)) - (2 * cos(3*t)) - cos(4*t)));
				this.isShimmer = false;
			}
			else {
				//figure out how to create shapes with these vectors
				this.vel = p5.Vector.random2D();
				this.vel.mult(random(1,this.rad));
			}
		 }
		this.acc = createVector(0,0);
	}

	update() {
		if(!this.firework) {
			this.vel.mult(0.85);
			this.lifespan -= 4;
		}
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}

	applyForce(force) {
		this.acc.add(force);
	}

	show() {
		strokeWeight(2);
		if(!this.firework) {
			if(this.isShimmer) {
				if(this.counter < 10) {
					stroke('cream');
				} else if(this.counter < 20){
					strokeWeight(4);
					stroke('cream');
				} else {
					stroke('black');
				}
				this.counter++;
				this.counter = this.counter % 30;
			}
			else {
				
				if(this.lifespan >= 125) {
					stroke(this.col, this.lifespan);
				} else {
					stroke(this.col2, this.lifespan);
				}
			}
			
								
		}
		else {
			if(!this.inv) {
				stroke(200);
				strokeWeight(4);
			} else {
				stroke(0);
			}
			
		}
		point(this.pos.x,this.pos.y);
	}

	done() {
		return (this.lifespan <= 0);
	}
}

class Firework {
	constructor() {
		this.rad = random(10,30);
		this.inv = random(100) < 25;
		this.col = color(random(255),random(255),random(255));
		this.two = random() < 0.35;
		this.col2 = this.col;
		this.isShimmer = random() < 0.35;
		this.petals = Math.floor(random(2,8));
		// Square
		// Circle
		// Heart
		// Default
		this.shp = random();

		if(this.two) {
			this.col2 = color(random(255),random(255),random(255));
		}
		this.firework = new Particle(random(20,width-20),height,true,this.col,this.rad, this.inv, this.col2, this.isShimmer,this.shp,0,0,this.petals);
		this.exploded = false;
		this.particles = [];

	}

	update() {
		if(!this.exploded) {
			this.firework.applyForce(gravity);
			this.firework.update();

			if(this.firework.vel.y >= 0) {
				this.exploded = true;
				this.explode();
			}
		}

		for (var i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i].applyForce(gravity);
			this.particles[i].update();
			if(this.particles[i].done()) {
				this.particles.splice(i,1);
			}
		};
		
	}

	explode() {
		var total = random(50,120)
		for(var i = 0; i < total; i++) {
			var p = new Particle(this.firework.pos.x, this.firework.pos.y,false, this.col, this.rad, this.inv, this.col2,this.isShimmer,this.shp,i,total,this.petals);
			this.particles.push(p);
		}			
	}

	show() {
		if(!this.exploded) {
			this.firework.show();
		}
		for (var i = this.particles.length - 1; i >= 0; i--) {
		 this.particles[i].show();
		};
		
	}

	done() {
		if (this.exploded && this.particles.length === 0) {
			return true;
		}
		return false;
	}
}