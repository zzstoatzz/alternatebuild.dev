let PARTICLE_COUNT = 1000;
let EXPLOSION_RADIUS = 200;
const EXPLOSION_FORCE = 1.0;
let GRAVITY_CONSTANT = 0.001;
let INTERACTION_RADIUS = 50;
const MIN_PARTICLE_RADIUS = 1;
const MAX_PARTICLE_RADIUS = 4;

// Experimental constants
const DRAG_CONSTANT = 0.01;
const ELASTICITY_CONSTANT = 0.5;
const INITIAL_VELOCITY_RANGE = 0.1;

const CONNECTION_OPACITY = 0.03;
const MIN_GRAVITY_DISTANCE = 0.01;
const MAX_HEAT_FACTOR = 0.2;
const MIN_CLUSTER_OPACITY = 0.6;
const OPACITY_REDUCTION_FACTOR = 1;

class Particle {
    constructor(position, radius, color) {
        this.position = position;
        this.velocity = {
            x: (Math.random() - 0.5) * INITIAL_VELOCITY_RANGE,
            y: (Math.random() - 0.5) * INITIAL_VELOCITY_RANGE
        };
        this.radius = radius;
        this.color = color;
        this.mass = Math.PI * radius * radius;
        this.originalColor = color;
    }

    update(bounds) {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply drag
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        const dragForce = DRAG_CONSTANT * speed ** 2;
        const dragX = this.velocity.x * dragForce / speed;
        const dragY = this.velocity.y * dragForce / speed;
        this.velocity.x -= dragX / this.mass;
        this.velocity.y -= dragY / this.mass;

        // Elastic collision with walls
        if (this.position.x - this.radius < 0 || this.position.x + this.radius > bounds.x) {
            this.velocity.x *= -ELASTICITY_CONSTANT;
            this.position.x = Math.max(this.radius, Math.min(bounds.x - this.radius, this.position.x));
        }
        if (this.position.y - this.radius < 0 || this.position.y + this.radius > bounds.y) {
            this.velocity.y *= -ELASTICITY_CONSTANT;
            this.position.y = Math.max(this.radius, Math.min(bounds.y - this.radius, this.position.y));
        }
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.insertAdjacentHTML('beforebegin', `
            <div id="controls" style="position: fixed; top: 2vh; right: 2vw; z-index: 1000; font-size: 2vmin;">
                <button id="configToggle" style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 1vmin 2vmin; border-radius: 5px; cursor: pointer; font-size: inherit;">particle settings</button>
                <div id="controlsContent" style="display: none; background: rgba(0,0,0,0.7); padding: 2vmin; border-radius: 5px; margin-top: 1vmin;">
                    <label>Particle Count: <input type="range" id="particleCount" min="100" max="2000" value="${PARTICLE_COUNT}"></label><br>
                    <label>Explosion Radius: <input type="range" id="explosionRadius" min="50" max="400" value="${EXPLOSION_RADIUS}"></label><br>
                    <label>Gravity Constant: <input type="range" id="gravityConstant" min="0" max="0.01" step="0.0001" value="${GRAVITY_CONSTANT}"></label><br>
                    <label>Interaction Radius: <input type="range" id="interactionRadius" min="10" max="100" value="${INTERACTION_RADIUS}"></label>
                </div>
            </div>
        `);

        // Add this after the insertAdjacentHTML call
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @media (max-width: 768px) {
                #controls {
                    top: auto !important;
                    bottom: 2vh !important;
                    right: 2vw !important;
                    left: 2vw !important;
                }
                #controlsContent {
                    position: fixed;
                    bottom: calc(2vh + 6vmin);
                    right: 2vw;
                    left: 2vw;
                    max-height: 70vh;
                    overflow-y: auto;
                }
            }
        `;
        document.head.appendChild(styleElement);

        document.getElementById('configToggle').addEventListener('click', () => {
            const content = document.getElementById('controlsContent');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;

        this.resizeCanvas();
        this.createParticles();
        this.bindEvents();
        this.bindSliderEvents();
        this.animate();
    }

    updateConstants() {
        PARTICLE_COUNT = parseInt(document.getElementById('particleCount').value) || PARTICLE_COUNT;
        EXPLOSION_RADIUS = parseInt(document.getElementById('explosionRadius').value) || EXPLOSION_RADIUS;
        GRAVITY_CONSTANT = parseFloat(document.getElementById('gravityConstant').value) || GRAVITY_CONSTANT;
        INTERACTION_RADIUS = parseInt(document.getElementById('interactionRadius').value) || INTERACTION_RADIUS;
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
            const radius = Math.random() * (MAX_PARTICLE_RADIUS - MIN_PARTICLE_RADIUS) + MIN_PARTICLE_RADIUS;
            const color = earthTones[Math.floor(Math.random() * earthTones.length)];
            this.particles.push(new Particle({ x, y }, radius, color));
        }
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

    bindSliderEvents() {
        document.querySelectorAll('#controls input').forEach(input => {
            input.addEventListener('input', () => {
                this.updateConstants();
                this.particles = [];
                this.createParticles();
            });
        });
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
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${CONNECTION_OPACITY})`;
        this.ctx.stroke();
    }

    applyGravity(p1, p2) {
        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > MIN_GRAVITY_DISTANCE && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS) {
            const mass1 = p1.clusterMass || p1.mass;
            const mass2 = p2.clusterMass || p2.mass;
            const force = GRAVITY_CONSTANT * (mass1 * mass2) / distSq;
            const angle = Math.atan2(dy, dx);
            const forcex = Math.cos(angle) * force;
            const forcey = Math.sin(angle) * force;

            p1.velocity.x += forcex / mass1;
            p1.velocity.y += forcey / mass1;
            p2.velocity.x -= forcex / mass2;
            p2.velocity.y -= forcey / mass2;
        }
    }

    updateParticles() {
        const particleCount = this.particles.length;
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                this.applyGravity(this.particles[i], this.particles[j]);
            }
            this.particles[i].update({ x: this.canvas.width, y: this.canvas.height });
        }

        const uf = detectClusters(this.particles, INTERACTION_RADIUS);
        applyClusterProperties(this.particles, uf);
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawConnections();
        this.updateParticles();

        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        });

        this.applyMouseForce();

        requestAnimationFrame(() => this.animate());
    }
}

class UnionFind {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, i) => i);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]); // Path compression
        }
        return this.parent[x];
    }

    union(x, y) {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX !== rootY) {
            this.parent[rootY] = rootX;
        }
    }
}

function detectClusters(particles, interactionRadius) {
    const uf = new UnionFind(particles.length);

    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].position.x - particles[j].position.x;
            const dy = particles[i].position.y - particles[j].position.y;
            if (dx * dx + dy * dy < interactionRadius * interactionRadius) {
                uf.union(i, j);
            }
        }
    }

    return uf;
}

function applyClusterProperties(particles, uf) {
    const clusterSizes = new Map();
    let maxClusterSize = 1;

    for (let index = 0; index < particles.length; index++) {
        const root = uf.find(index);
        const size = (clusterSizes.get(root) || 0) + 1;
        clusterSizes.set(root, size);
        maxClusterSize = Math.max(maxClusterSize, size);
    }

    particles.forEach((particle, index) => {
        const root = uf.find(index);
        const clusterSize = clusterSizes.get(root);

        const heatFactor = Math.min((clusterSize - 1) / (maxClusterSize - 1), MAX_HEAT_FACTOR);

        const rgbaMatch = particle.originalColor.match(/\d+/g).map(Number);
        const [r, g, b, a] = rgbaMatch;

        const newR = Math.round(r + (255 - r) * heatFactor);
        const newG = Math.round(g + (255 - g) * heatFactor);
        const newB = Math.round(b + (255 - b) * heatFactor);

        const newA = Math.max(MIN_CLUSTER_OPACITY, 1 - heatFactor * OPACITY_REDUCTION_FACTOR);

        particle.color = `rgba(${newR}, ${newG}, ${newB}, ${newA})`;
        particle.clusterMass = clusterSize;
    });
}

window.particlesInit = function (canvas) {
    if (canvas instanceof HTMLCanvasElement) {
        new ParticleSystem(canvas);
    } else {
        console.error('Invalid canvas element:', canvas);
    }
}