const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d"); // canvas rendering context objects, contains all 2d drawing functions

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colours = ["white", "aqua", "teal"];

// Canvas settings

ctx.fillStyle = "white";
ctx.strokeStyle = "white";
ctx.lineWidth = 1;

class Particle {
    constructor(effect, x, y) {
        this.effect = effect;

        this.angle = 0;

        if (x != undefined && y != undefined) {
            this.x = x;
            this.y = y;
        }

        else {
            this.x = Math.floor(Math.random() * this.effect.width);
            this.y = Math.floor(Math.random() * this.effect.height);
        }

        this.speedX;
        this.speedY;
        this.speedModifier = Math.floor(Math.random() * 10 + 1);

        this.colour = colours[Math.floor(Math.random() * colours.length)];

        this.history = [{x: this.x, y: this.y}];
        this.maxLength = Math.floor((Math.random() * 200) + 10);

        this.timer = this.maxLength;
    }

    draw(ctx) {
        ctx.fillStyle = this.colour;
        ctx.strokeStyle = this.colour;

        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);

        for (let i = 0; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
        }

        ctx.stroke();
    }

    // called every frame
    update() {
        this.timer--;

        if (this.timer >= 1) {
            let col = Math.floor(this.x / this.effect.cellSize);
            let row = Math.floor(this.y / this.effect.cellSize);
            let index = (row * this.effect.columns) + col;
    
            this.angle = this.effect.flowField[index];
    
            this.speedX = Math.cos(this.angle) * this.speedModifier;
            this.speedY = Math.sin(this.angle) * this.speedModifier;
    
            this.x += this.speedX;
            this.y += this.speedY;
    
            this.history.push({x: this.x, y: this.y});
        }

        else if (this.history.length > 1) {
            this.history.shift();
        }

        else {
            this.reset();
        }
    }

    reset() {
        this.x = Math.floor(Math.random() * this.effect.width);
        this.y = Math.floor(Math.random() * this.effect.height);

        this.history = [{x: this.x, y: this.y}];

        this.timer = this.maxLength * 2;
    }
}

class Effect {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.cellSize = 10;
        this.rows;
        this.columns;
        
        this.particles = [];
        this.numberOfParticles = 1;
        this.maxNumberOfParticles = 5000;

        this.curve = 1.5;
        this.zoom = 0.1;
        
        this.flowField = [];

        this.init();

        this.debug = false;
        window.addEventListener("keydown", e => {
            if (e.key === 'd') this.debug = !this.debug;
        });

        window.addEventListener("resize", e => {
            this.resize(e.target.innerWidth, e.target.innerHeight);
        });


        window.addEventListener("mousemove", e => {
            let x = e.clientX;
            let y = e.clientY;

            let col = x / this.cellSize;
            let row = y / this.cellSize;

            let particle = new Particle(this, x, y);

            this.particles.push(particle);

            if (this.particles.length > this.maxNumberOfParticles) this.particles.shift();
        })
    }

    init() {
        // create flow field
        this.rows = Math.floor(this.height / this.cellSize);
        this.columns = Math.floor(this.width / this.cellSize);
        this.flowField = [];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                let angle = (Math.cos(x * this.zoom) + Math.sin(y * this.zoom)) * this.curve;
                this.flowField.push(angle);
            }
        }

        // create particles
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }

    drawGrid(ctx) {
        ctx.save(); 

        ctx.strokeStyle = "white";
        ctx.lineWidth = 0.3;

        for (let col = 0; col < this.columns; col++) {
            ctx.beginPath();
            ctx.moveTo(col * this.cellSize, 0);
            ctx.lineTo(col * this.cellSize, this.height);
            ctx.stroke();

        }

        for (let row = 0; row < this.rows; row++) {
            ctx.beginPath();
            ctx.moveTo(0, row * this.cellSize);
            ctx.lineTo(this.width, row * this.cellSize);
            ctx.stroke();

        }

        ctx.restore(); // restore the original properties of the flow field lines 
    }

    render(ctx) {
        if (this.debug) this.drawGrid(ctx);
        
        // for each particle object in the array, call its associated raw method
        this.particles.forEach(particle => {
            particle.draw(ctx);
            particle.update();
        });
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.init();
    }
} 

// Main animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas after every frame
    effect.render(ctx);
    requestAnimationFrame(animate);
}

// Main
const effect = new Effect(canvas);

animate();


