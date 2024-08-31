const PARTICLE_COUNT = 500;
const EXPLOSION_RADIUS = 200;
const EXPLOSION_FORCE = 1.0;
const GRAVITY_CONSTANT = 0.1;
const INTERACTION_RADIUS = 30;

// Define types for better type safety
type Vector2D = { x: number; y: number };

interface IParticle {
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    radius: number;
    color: string;
    update(bounds: Vector2D): void;
}

class Particle implements IParticle {
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    radius: number;
    color: string;

    constructor(position: Vector2D, radius: number, color: string) {
        this.position = position;
        this.velocity = { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 };
        this.radius = radius;
        this.color = color;
        this.mass = Math.PI * radius * radius; // Assuming uniform density
    }

    update(bounds: Vector2D): void {
        // Update position and handle boundary conditions
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply damping
        this.velocity.x *= 0.999;
        this.velocity.y *= 0.999;

        // Bounce off walls
        if (this.position.x < 0 || this.position.x > bounds.x) this.velocity.x *= -1;
        if (this.position.y < 0 || this.position.y > bounds.y) this.velocity.y *= -1;
    }
}

class ParticleSystem {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: IParticle[];
    private mousePosition: Vector2D;
    private isMouseDown: boolean;

    constructor(canvas: HTMLCanvasElement) {
        console.log('ParticleSystem constructor called');
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d')!;
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
        console.log('Canvas resized:', this.canvas.width, 'x', this.canvas.height);
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
            this.particles.push(new Particle({ x, y }, radius, color));
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
                const dx = this.particles[i].position.x - this.particles[j].position.x;
                const dy = this.particles[i].position.y - this.particles[j].position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < INTERACTION_RADIUS) {
                    this.ctx.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                    this.ctx.lineTo(this.particles[j].position.x, this.particles[j].position.y);
                }
            }
        }
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.stroke();
    }

    private applyGravity(p1: IParticle, p2: IParticle): void {
        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const distSq = dx * dx + dy * dy;

        // Avoid division by zero and limit interaction radius
        if (distSq > 0.01 && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS) {
            const force = GRAVITY_CONSTANT * (p1.mass * p2.mass) / distSq;
            const angle = Math.atan2(dy, dx);
            const forcex = Math.cos(angle) * force;
            const forcey = Math.sin(angle) * force;

            // Apply equal and opposite forces (Newton's third law)
            p1.velocity.x += forcex / p1.mass;
            p1.velocity.y += forcey / p1.mass;
            p2.velocity.x -= forcex / p2.mass;
            p2.velocity.y -= forcey / p2.mass;
        }
    }

    private updateParticles(): void {
        const particleCount = this.particles.length;
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                this.applyGravity(this.particles[i], this.particles[j]);
            }
            this.particles[i].update({ x: this.canvas.width, y: this.canvas.height });
        }
    }

    applyMouseForce() {
        if (!this.isMouseDown) return;

        this.particles.forEach(particle => {
            const dx = particle.position.x - this.mousePosition.x;
            const dy = particle.position.y - this.mousePosition.y;
            const dist = Math.hypot(dx, dy);
            if (dist < EXPLOSION_RADIUS) {
                const force = (1 - dist / EXPLOSION_RADIUS) * EXPLOSION_FORCE;
                particle.velocity.x += (dx / dist) * force;
                particle.velocity.y += (dy / dist) * force;
            }
        });
    }

    animate() {
        console.log('Animation frame');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawConnections();

        this.particles.forEach(particle => {
            particle.update({ x: this.canvas.width, y: this.canvas.height });

            this.ctx.beginPath();
            this.ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });

        this.applyMouseForce();

        requestAnimationFrame(() => this.animate());
    }
}

window.particlesInit = function (canvas) {
    console.log('Initializing particles for canvas:', canvas);
    if (canvas instanceof HTMLCanvasElement) {
        console.log('Valid canvas element, dimensions:', canvas.width, 'x', canvas.height);
        new ParticleSystem(canvas);
    } else {
        console.error('Invalid canvas element:', canvas);
    }
}