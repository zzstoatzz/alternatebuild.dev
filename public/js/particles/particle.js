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

    update(deltaTime, canvasWidth, canvasHeight) {
        // Get settings from particle system if available
        const gravity = window.particleSystem ? 
            window.particleSystem.settingsManager.getSetting('GRAVITY') || 0 : 
            0;
        
        const drag = window.particleSystem ? 
            window.particleSystem.settingsManager.getSetting('DRAG') || 0.01 : 
            0.01;
        
        // Apply gravity only if non-zero
        if (gravity !== 0) {
            this.vy += gravity * deltaTime / 16; // Normalized for ~60fps
        }
        
        // Apply drag - slows down particles based on their velocity
        // Formula: F_drag = -coefficient * v
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 0) {
            const dragFactor = 1 - drag; // Convert drag to a multiplier (1 = no drag, 0 = full stop)
            this.vx *= dragFactor;
            this.vy *= dragFactor;
        }
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Boundary collision
        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.8; // Bounce with energy loss
        } else if (this.x + this.radius > canvasWidth) {
            this.x = canvasWidth - this.radius;
            this.vx *= -0.8;
        }
        
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.8;
        } else if (this.y + this.radius > canvasHeight) {
            this.y = canvasHeight - this.radius;
            this.vy *= -0.8;
        }
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
} 