import { Particle } from './particle.js';
import { SettingsManager } from "./settingsManager.js";
import { UIController } from "./uiController.js";
import { PARTICLE_COLORS } from "./config.js";

export class ParticleSystem {
	constructor(canvas, gridSize = 20) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.particles = [];
		this.gridSize = gridSize;
		this.grid = {};
		this.mouseX = 0;
		this.mouseY = 0;
		this.isMouseDown = false;
		this.selectedParticle = null;
		this.animationFrameId = null;
		this.lastTimestamp = 0;
		this.fpsLimit = 60;
		this.fpsInterval = 1000 / this.fpsLimit;

		// Make particle colors available globally
		this.PARTICLE_COLORS = PARTICLE_COLORS;
		window.particleSystem = this; // Set this early to make colors available to particles

		// Initialize settings manager with callback to update when settings change
		this.settingsManager = new SettingsManager((settings) => {
			this.applySettings(settings);
		});

		// Initialize UI controller with callback to update settings
		this.uiController = new UIController((key, value) => {
			this.settingsManager.updateSetting(key, value);
		}, this.settingsManager.getAllSettings());

		// Resize handler to maintain proper canvas size
		window.addEventListener("resize", () => this.resizeCanvas());
		this.resizeCanvas();

		// Initialize system (create particles, bind events)
		this.init();
	}

	init() {
		// Clear existing particles if any
		this.particles = [];

		// Create particles based on current settings
		const settings = this.settingsManager.getAllSettings();
		const count = settings.PARTICLE_COUNT;

		for (let i = 0; i < count; i++) {
			const x = Math.random() * this.canvas.width;
			const y = Math.random() * this.canvas.height;
			const particle = new Particle(x, y, settings);
			this.particles.push(particle);
		}

		// Attach event listeners
		this.bindSystemEvents();

		// Initialize the canvas
		this.resizeCanvas();

		// Start the animation loop
		this.animate();
	}

	resizeCanvas() {
		// Use the parent element's dimensions
		const parent = this.canvas.parentElement;

		// Set canvas size to match parent or window if no parent
		this.canvas.width = parent ? parent.clientWidth : window.innerWidth;
		this.canvas.height = parent ? parent.clientHeight : window.innerHeight;

		// Ensure the canvas has a baseline of at least being visible
		if (this.canvas.width === 0) this.canvas.width = window.innerWidth;
		if (this.canvas.height === 0) this.canvas.height = window.innerHeight;
	}

	bindSystemEvents() {
		// Ensure the canvas has pointer events enabled
		this.canvas.style.pointerEvents = "auto";
		this.canvas.style.zIndex = "10";

		// Inject CSS to make sure the canvas doesn't block events
		const style = document.createElement("style");
		style.textContent = `
            .particles-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: auto;
                z-index: 10;
            }
        `;
		document.head.appendChild(style);

		// Document level mouse/touch handlers for better responsiveness
		document.addEventListener("mousemove", (e) => {
			this.handleMouseMove(e);
		});

		document.addEventListener("mousedown", (e) => {
			if (this.isPointInCanvas(e.clientX, e.clientY)) {
				this.isMouseDown = true;
				this.mouseX = e.clientX;
				this.mouseY = e.clientY;
			}
		});

		document.addEventListener("mouseup", () => {
			this.isMouseDown = false;
		});

		// Touch events for mobile
		document.addEventListener(
			"touchstart",
			(e) => {
				if (e.touches.length > 0) {
					const touch = e.touches[0];
					if (this.isPointInCanvas(touch.clientX, touch.clientY)) {
						this.isMouseDown = true;
						this.mouseX = touch.clientX;
						this.mouseY = touch.clientY;
						e.preventDefault(); // Prevent scrolling
					}
				}
			},
			{ passive: false },
		);

		document.addEventListener(
			"touchmove",
			(e) => {
				if (e.touches.length > 0) {
					const touch = e.touches[0];
					if (this.isPointInCanvas(touch.clientX, touch.clientY)) {
						this.handleMouseMove({
							clientX: touch.clientX,
							clientY: touch.clientY,
						});
						e.preventDefault(); // Prevent scrolling
					}
				}
			},
			{ passive: false },
		);

		document.addEventListener("touchend", () => {
			this.isMouseDown = false;
		});
	}

	isPointInCanvas(x, y) {
		const rect = this.canvas.getBoundingClientRect();
		return (
			x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
		);
	}

	handleMouseMove(e) {
		if (this.isPointInCanvas(e.clientX, e.clientY)) {
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
		}
	}

	applySettings(settings) {
		// Update each particle with new settings
		for (const particle of this.particles) {
			particle.updateSettings(settings);
		}

		// If particle count has changed, adjust particle array size
		const currentCount = this.particles.length;
		const targetCount = settings.PARTICLE_COUNT;

		if (targetCount > currentCount) {
			// Add new particles
			for (let i = currentCount; i < targetCount; i++) {
				const x = Math.random() * this.canvas.width;
				const y = Math.random() * this.canvas.height;
				this.particles.push(new Particle(x, y, settings));
			}
		} else if (targetCount < currentCount) {
			// Remove excess particles
			this.particles = this.particles.slice(0, targetCount);
		}
	}

	applyMouseForce() {
		if (!this.isMouseDown) return;

		const settings = this.settingsManager.getAllSettings();
		const radius = settings.EXPLOSION_RADIUS;
		const force = settings.EXPLOSION_FORCE;

		// Apply force to particles within radius
		for (const particle of this.particles) {
			const dx = particle.x - this.mouseX;
			const dy = particle.y - this.mouseY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < radius) {
				// Force decreases with distance
				const strength = force * (1 - distance / radius);

				// Normalize direction vector
				const dirX = dx / distance;
				const dirY = dy / distance;

				// Apply force in the outward direction (explosion)
				particle.vx += dirX * strength;
				particle.vy += dirY * strength;
			}
		}
	}

	updateGrid() {
		// Clear grid
		this.grid = {};
		
		// Get current cell size from settings
		const settings = this.settingsManager.getAllSettings();
		const cellSize = settings.INTERACTION_RADIUS;
		
		// Place particles in grid cells
		for (let i = 0; i < this.particles.length; i++) {
			const p = this.particles[i];
			const cellX = Math.floor(p.x / cellSize);
			const cellY = Math.floor(p.y / cellSize);
			const cellId = `${cellX},${cellY}`;
			
			if (!this.grid[cellId]) {
				this.grid[cellId] = [];
			}
			
			this.grid[cellId].push(i);
			
			// Store the cell ID on the particle for quick removal
			p.cellId = cellId;
		}
	}

	applyAttraction() {
		const settings = this.settingsManager.getAllSettings();
		const interactionRadius = settings.INTERACTION_RADIUS;
		const attract = settings.ATTRACT;
		const smoothingFactor = settings.SMOOTHING_FACTOR || 0.3;
		
		if (Math.abs(attract) < 1e-6) return; // Skip if no attraction
		
		// Use grid to find nearby particles efficiently
		for (const cellId in this.grid) {
			const indices = this.grid[cellId];
			const cellParts = cellId.split(",");
			const cellX = Number.parseInt(cellParts[0]);
			const cellY = Number.parseInt(cellParts[1]);
			
			// Check own cell and neighboring cells
			for (let nx = cellX - 1; nx <= cellX + 1; nx++) {
				for (let ny = cellY - 1; ny <= cellY + 1; ny++) {
					const neighborId = `${nx},${ny}`;
					const neighborIndices = this.grid[neighborId];
					
					if (!neighborIndices) continue;
					
					// Apply attraction between particles
					for (const i of indices) {
						const p1 = this.particles[i];
						
						for (const j of neighborIndices) {
							// Don't attract to self
							if (i === j) continue;
							
							const p2 = this.particles[j];
							
							// Check distance
							const dx = p2.x - p1.x;
							const dy = p2.y - p1.y;
							const distSq = dx * dx + dy * dy;
							
							// Skip if particles are too far apart
							if (distSq > interactionRadius * interactionRadius) continue;
							
							// Skip near-zero distances to avoid division by zero
							if (distSq < 1e-6) continue;
							
							const distance = Math.sqrt(distSq);
							
							// Apply smoothing to avoid extreme forces at very small distances
							// This is crucial for stable repulsion
							const smoothedDistance = Math.max(distance, smoothingFactor * interactionRadius);
							
							// Calculate force using inverse square law
							const forceMagnitude = attract * (p1.mass * p2.mass) / (smoothedDistance * smoothedDistance);
							
							// Calculate force components
							const forceX = forceMagnitude * dx / smoothedDistance;
							const forceY = forceMagnitude * dy / smoothedDistance;
							
							// Skip if NaN (can happen with extreme values)
							if (Number.isNaN(forceX) || Number.isNaN(forceY)) continue;
							
							// Apply forces (divided by mass for acceleration)
							const dt = 1 / 60; // Assume 60fps for force calculation
							p1.vx += forceX / p1.mass * dt;
							p1.vy += forceY / p1.mass * dt;
							
							// Equal and opposite force on the other particle
							p2.vx -= forceX / p2.mass * dt;
							p2.vy -= forceY / p2.mass * dt;
						}
					}
				}
			}
		}
	}

	updateParticles(deltaTime) {
		// UpdateGrid for spatial partitioning
		this.updateGrid();
		
		// Apply inter-particle attraction forces
		this.applyAttraction();
		
		// Apply mouse force
		this.applyMouseForce();
		
		// Update each particle
		for (const particle of this.particles) {
			particle.update(deltaTime, this.canvas.width, this.canvas.height);
		}
	}

	drawConnections() {
		const settings = this.settingsManager.getAllSettings();
		if (settings.CONNECTION_OPACITY <= 0) return; // Skip if opacity is zero
		
		const interactionRadius = settings.INTERACTION_RADIUS;
		const connectionColor = settings.CONNECTION_COLOR;
		const connectionOpacity = settings.CONNECTION_OPACITY;
		
		this.ctx.strokeStyle = connectionColor;
		this.ctx.lineWidth = settings.CONNECTION_WIDTH || 1;
		
		// Use grid to find nearby particles efficiently
		for (const cellId in this.grid) {
			const indices = this.grid[cellId];
			const cellParts = cellId.split(",");
			const cellX = Number.parseInt(cellParts[0]);
			const cellY = Number.parseInt(cellParts[1]);
			
			// Check own cell and neighboring cells
			for (let nx = cellX - 1; nx <= cellX + 1; nx++) {
				for (let ny = cellY - 1; ny <= cellY + 1; ny++) {
					const neighborId = `${nx},${ny}`;
					const neighborIndices = this.grid[neighborId];
					
					if (!neighborIndices) continue;
					
					// Connect particles within this cell and neighboring cells
					for (const i of indices) {
						const p1 = this.particles[i];
						
						for (const j of neighborIndices) {
							// Don't connect to self
							if (i === j) continue;
							
							const p2 = this.particles[j];
							
							// Check distance
							const dx = p2.x - p1.x;
							const dy = p2.y - p1.y;
							const distance = Math.sqrt(dx * dx + dy * dy);
							
							if (distance <= interactionRadius) {
								// Calculate opacity based on distance
								const opacity = connectionOpacity * (1 - distance / interactionRadius);
								this.ctx.globalAlpha = opacity;
								
								// Draw connection
								this.ctx.beginPath();
								this.ctx.moveTo(p1.x, p1.y);
								this.ctx.lineTo(p2.x, p2.y);
								this.ctx.stroke();
							}
						}
					}
				}
			}
		}
		
		// Reset alpha
		this.ctx.globalAlpha = 1;
	}

	// Store mouse interaction effects and their lifetimes
	mouseEffects = [];

	animate(timestamp = 0) {
		// Calculate time delta for smooth animation
		const deltaTime = timestamp - this.lastTimestamp;

		// Throttle to target FPS
		if (deltaTime >= this.fpsInterval) {
			this.lastTimestamp = timestamp - (deltaTime % this.fpsInterval);

			// Clear canvas
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			// Update all particles
			this.updateParticles(deltaTime);

			// Draw connections between particles
			this.drawConnections();

			// Handle mouse effects
			this.updateAndDrawMouseEffects(timestamp);

			// Draw all particles
			for (const particle of this.particles) {
				particle.draw(this.ctx);
			}
		}

		// Continue animation loop
		this.animationFrameId = requestAnimationFrame((t) => this.animate(t));
	}

	updateAndDrawMouseEffects(timestamp) {
		const settings = this.settingsManager.getAllSettings();
		
		// If mouse is down, create a new effect
		if (this.isMouseDown) {
			// Add a new effect at current mouse position
			this.mouseEffects.push({
				x: this.mouseX,
				y: this.mouseY,
				radius: settings.EXPLOSION_RADIUS,
				startTime: timestamp,
				duration: 800, // Effect lasts for 0.8 seconds (shorter duration)
			});
		}
		
		// Draw and update existing effects
		this.ctx.save();
		
		for (let i = this.mouseEffects.length - 1; i >= 0; i--) {
			const effect = this.mouseEffects[i];
			const age = timestamp - effect.startTime;
			
			// Remove expired effects
			if (age > effect.duration) {
				this.mouseEffects.splice(i, 1);
				continue;
			}
			
			// Calculate effect progress (0 to 1)
			const progress = age / effect.duration;
			
			// Ethereal ripple effect - simplified and more subtle
			const rippleOpacity = Math.max(0, 0.2 * (1 - progress));
			const rippleRadius = Math.max(5, effect.radius * (0.1 + progress * 0.6)); // Ensure radius is positive
			
			// Draw rippling waves with gradient
			const gradient = this.ctx.createRadialGradient(
				effect.x, effect.y, 0,
				effect.x, effect.y, rippleRadius
			);
			
			// More subtle ethereal gradient
			gradient.addColorStop(0, `rgba(140, 240, 255, ${rippleOpacity * 0.05})`);
			gradient.addColorStop(0.6, `rgba(100, 210, 255, ${rippleOpacity * 0.03})`);
			gradient.addColorStop(1, `rgba(70, 130, 220, 0)`);
			
			this.ctx.globalAlpha = 1;
			this.ctx.fillStyle = gradient;
			
			// Draw main ripple
			this.ctx.beginPath();
			this.ctx.arc(effect.x, effect.y, rippleRadius, 0, Math.PI * 2);
			this.ctx.fill();
			
			// Draw a subtle ring
			const ringRadius = Math.max(2, rippleRadius * 0.8); // Ensure radius is positive
			this.ctx.beginPath();
			this.ctx.arc(effect.x, effect.y, ringRadius, 0, Math.PI * 2);
			this.ctx.lineWidth = 0.5;
			this.ctx.strokeStyle = 'rgba(180, 240, 255, ' + (rippleOpacity * 0.3) + ')';
			this.ctx.stroke();
		}
		
		this.ctx.restore();
	}

	stop() {
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	restart() {
		this.stop();
		this.init();
	}
}
