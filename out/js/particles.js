const PARTICLE_COUNT = 500;
const EXPLOSION_RADIUS = 200;
const EXPLOSION_FORCE = 1.0;
const GRAVITY_CONSTANT = 0.001;
const INTERACTION_RADIUS = 30;

class Particle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.1;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.radius = radius;
        this.color = color;
        this.mass = Math.PI * Math.pow(radius, 2);
    }

    update(width, height) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.999;
        this.vy *= 0.999;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;

        this.resizeCanvas();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const earthTones = [
            'rgba(142, 106, 63, 0.6)',
            'rgba(113, 98, 83, 0.6)',
            'rgba(94, 75, 60, 0.6)',
            'rgba(66, 92, 73, 0.6)',
            'rgba(152, 151, 100, 0.6)',
            'rgba(70, 130, 180, 0.6)',
            'rgba(100, 149, 237, 0.6)',
        ];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * 3 + 1;
            const color = earthTones[Math.floor(Math.random() * earthTones.length)];
            this.particles.push(new Particle(x, y, radius, color));
        }
        console.log('Particles created:', this.particles.length);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });
        window.addEventListener('mousedown', () => this.isMouseDown = true);
        window.addEventListener('mouseup', () => this.isMouseDown = false);
    }

    drawConnections() {
        this.ctx.beginPath();
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < INTERACTION_RADIUS) {
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                }
            }
        }
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.stroke();
    }

    applyGravity(p1, p2) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < INTERACTION_RADIUS * INTERACTION_RADIUS && distSq > 0.01) {
            const force = GRAVITY_CONSTANT * (p1.mass * p2.mass) / distSq;
            const angle = Math.atan2(dy, dx);
            p1.vx += Math.cos(angle) * force / p1.mass;
            p1.vy += Math.sin(angle) * force / p1.mass;
        }
    }

    applyMouseForce() {
        if (!this.isMouseDown) return;

        this.particles.forEach(particle => {
            const dx = particle.x - this.mousePosition.x;
            const dy = particle.y - this.mousePosition.y;
            const dist = Math.hypot(dx, dy);
            if (dist < EXPLOSION_RADIUS) {
                const force = (1 - dist / EXPLOSION_RADIUS) * EXPLOSION_FORCE;
                particle.vx += (dx / dist) * force;
                particle.vy += (dy / dist) * force;
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawConnections();

        this.particles.forEach(particle => {
            for (let j = 0; j < this.particles.length; j++) {
                this.applyGravity(particle, this.particles[j]);
            }
            particle.update(this.canvas.width, this.canvas.height);

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });

        this.applyMouseForce();

        requestAnimationFrame(() => this.animate());
    }
}

window.particlesInit = function (canvasId) {
    console.log('Initializing particles for canvas:', canvasId);
    new ParticleSystem(canvasId);
}