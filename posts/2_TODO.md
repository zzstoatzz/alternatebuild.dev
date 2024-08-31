---
title: "Giving the site a refresh"
date: "2024-08-31"
---

since making the site a couple months ago, i haven't touched it so let's go!

<br>

# updating `particles.js`
this is my fun little particle snow-globe background

<br>

here's generally what we started with (hand-wavy):

```js
// Constants (PARTICLE_COUNT, EXPLOSION_RADIUS, etc.)
Particle: {x, y, vx, vy, radius, color, mass, update()}

ParticleSystem:
    init(): setup canvas, create particles, bind events
    helpers: resize, gravity, mouse interaction
    animate() {
        this.drawConnections();
        this.particles.forEach(particle => {...});
        this.applyMouseForce();

        requestAnimationFrame(() => this.animate());
    }
}
```

but basically we have a bunch of balls going around according to newtonian mechanics, and when you click, it exerts a radial, impinging force. particles form bonds when sufficiently close.

<br>

### some goals:

- [ ] ~~make it TypeScript~~
- [x] add jsdoc comments
- [x] add cluster awareness via union-find
```js
ParticleSystem:
    ...
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
```
- [x] add drag
- [x] add elasticity
```js
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
```

<br>

<hr>

<br>


# ooh boy this feels scandalous but also so good
```js
class ParticleSystem {
    ...
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.insertAdjacentHTML('beforebegin', `
            <div id="controls" style="position: fixed; top: 10px; left: 10px; z-index: 1000;">
                <button id="configToggle" style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">particle settings</button>
                <div id="controlsContent" style="display: none; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 5px; margin-top: 5px;">
                    <label>Particle Count: <input type="range" id="particleCount" min="100" max="2000" value="${PARTICLE_COUNT}"></label><br>
                    <label>Explosion Radius: <input type="range" id="explosionRadius" min="50" max="400" value="${EXPLOSION_RADIUS}"></label><br>
                    <label>Gravity Constant: <input type="range" id="gravityConstant" min="0" max="0.01" step="0.0001" value="${GRAVITY_CONSTANT}"></label><br>
                    <label>Interaction Radius: <input type="range" id="interactionRadius" min="10" max="100" value="${INTERACTION_RADIUS}"></label>
                </div>
            </div>
        `);
        ...
    }
}
```


