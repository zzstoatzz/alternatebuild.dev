export class Particle {
    constructor(x, y, settings) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2; // Small initial velocity
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = settings.PARTICLE_SIZE || 3;
        this.color = this.getRandomColor(settings);
        this.mass = Math.PI * this.radius * this.radius;
    }

    getRandomColor(settings) {
        // Access the particle colors from the global window scope if available
        if (window.particleSystem?.PARTICLE_COLORS) {
            const colors = window.particleSystem.PARTICLE_COLORS;
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        // Fallback color
        return settings.PARTICLE_COLOR || '#64ffda';
    }

    updateSettings(settings) {
        if (settings.PARTICLE_SIZE !== undefined) {
            this.radius = settings.PARTICLE_SIZE;
            // Update mass based on new radius
            this.mass = Math.PI * this.radius * this.radius;
        }
    }

    update(deltaTime, canvasWidth, canvasHeight, settings) {
        // Use passed settings directly rather than global lookup
        const gravity = settings ? settings.GRAVITY || 0 : 0;
        const drag = settings ? settings.DRAG || 0.01 : 0.01;
        
        // Apply gravity
        if (gravity !== 0) {
            this.vy += gravity * deltaTime;
        }
        
        // Calculate efficient drag
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1e-6) {
            const dragFactor = 1.0 - (drag * deltaTime * 60); 
            this.vx *= Math.max(0, dragFactor);
            this.vy *= Math.max(0, dragFactor);
        }
        
        // Scale velocity by deltaTime for consistent physics
        this.x += this.vx * deltaTime * 60;
        this.y += this.vy * deltaTime * 60;
        
        // Boundary collision with energy loss
        const restitution = 0.6;
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -restitution;
        } else if (this.x + this.radius > canvasWidth) {
            this.x = canvasWidth - this.radius;
            this.vx *= -restitution;
        }
        
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -restitution;
        } else if (this.y + this.radius > canvasHeight) {
            this.y = canvasHeight - this.radius;
            this.vy *= -restitution;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
} 