import { Particle } from "./particle.js";
import { SettingsManager } from "./settingsManager.js";
import { UIController } from "./uiController.js";
import { PARTICLE_COLORS } from "./config.js";

export class ParticleSystem {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
		this.particles = [];
		this.grid = {};
		this.mouseX = 0;
		this.mouseY = 0;
		this.isMouseDown = false;
		this.selectedParticle = null;
		this.animationFrameId = null;
		this.deltaTime = 0; // Initialize deltaTime for use in physics
		this.lastTimestamp = 0;
		this.fpsLimit = 60;
		this.fpsInterval = 1000 / this.fpsLimit;
		this.mouseEffects = [];

		// Make particle colors available
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
		this.canvas.style.zIndex = "10"; // Lower z-index to allow navigation to be on top

		// Inject CSS to make sure the canvas doesn't block events
		const style = document.createElement("style");
		style.textContent =
			".particles-canvas {" +
			"position: absolute;" +
			"top: 0;" +
			"left: 0;" +
			"width: 100%;" +
			"height: 100%;" +
			"pointer-events: auto;" +
			"z-index: 10;" +
			"}";
		document.head.appendChild(style);

		// Document level mouse/touch handlers for better responsiveness
		document.addEventListener("mousemove", (e) => {
			this.handleMouseMove(e);
		});

		document.addEventListener("mousedown", (e) => {
			if (this.isPointInCanvas(e.clientX, e.clientY)) {
				this.isMouseDown = true;
				// Convert screen coordinates to canvas coordinates
				const rect = this.canvas.getBoundingClientRect();
				this.mouseX = e.clientX - rect.left;
				this.mouseY = e.clientY - rect.top;
			}
		});

		document.addEventListener("mouseup", () => {
			this.isMouseDown = false;
		});

		// Touch events for mobile - modified to work better with navigation
		document.addEventListener(
			"touchstart",
			(e) => {
				if (e.touches.length > 0) {
					const touch = e.touches[0];
					// Check if we're touching particles area, but don't block nav elements
					if (this.isPointInCanvas(touch.clientX, touch.clientY)) {
						// Get all elements at the touch position
						const elementsAtPoint = document.elementsFromPoint(
							touch.clientX,
							touch.clientY,
						);
						// If any element is part of the navigation or settings UI, don't interact with particles
						const isUIElement = elementsAtPoint.some((el) => {
							return (
								el.closest("nav") ||
								el.closest(".particle-controls") ||
								el.closest("button") ||
								el.tagName === "BUTTON" ||
								el.tagName === "A" ||
								el.closest(".z-50")
							); // Common high z-index nav elements
						});

						if (!isUIElement) {
							this.isMouseDown = true;
							// Convert screen coordinates to canvas coordinates
							const rect = this.canvas.getBoundingClientRect();
							this.mouseX = touch.clientX - rect.left;
							this.mouseY = touch.clientY - rect.top;
							e.preventDefault(); // Only prevent default when interacting with particles
						}
					}
				}
			},
			{ passive: false },
		);

		document.addEventListener(
			"touchmove",
			(e) => {
				if (e.touches.length > 0 && this.isMouseDown) {
					const touch = e.touches[0];
					this.handleMouseMove({
						clientX: touch.clientX,
						clientY: touch.clientY,
					});
					e.preventDefault(); // Only prevent scrolling if already interacting with particles
				}
			},
			{ passive: false },
		);

		document.addEventListener("touchend", () => {
			this.isMouseDown = false;
		});
	}

	isPointInCanvas(clientX, clientY) {
		const rect = this.canvas.getBoundingClientRect();
		return (
			clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
		);
	}

	handleMouseMove(e) {
		if (this.isPointInCanvas(e.clientX, e.clientY)) {
			// Convert screen coordinates to canvas coordinates
			const rect = this.canvas.getBoundingClientRect();
			this.mouseX = e.clientX - rect.left;
			this.mouseY = e.clientY - rect.top;
		}
	}

	applySettings(settings) {
		// Update existing particles 
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
				// New particles get created with randomized size based on current settings
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
		const radiusSq = radius * radius;
		
		// Use a reasonable cell size for mouse check, potentially larger than interaction radius
		const cellSize = Math.max(50, settings.INTERACTION_RADIUS > 0 ? settings.INTERACTION_RADIUS : 50);
		
		// mouseX and mouseY are now in canvas coordinates (we fixed this in handleMouseMove)
		const mouseCellX = Math.floor(this.mouseX / cellSize);
		const mouseCellY = Math.floor(this.mouseY / cellSize);
		
		// Adjust check radius based on cellSize
		const checkRadiusCells = Math.ceil(radius / cellSize);
		
		// Track particles we've already checked
		const checkedParticles = new Set();
		
		for (let nx = mouseCellX - checkRadiusCells; nx <= mouseCellX + checkRadiusCells; nx++) {
			for (let ny = mouseCellY - checkRadiusCells; ny <= mouseCellY + checkRadiusCells; ny++) {
				// Map check cell coords to main grid coords - use the same cell format as updateGrid
				const cellId = `${nx},${ny}`;
				const indices = this.grid[cellId];
				
				if (!indices) continue;
				
				for (const i of indices) {
					if (checkedParticles.has(i)) continue;
					
					const particle = this.particles[i];
					const dx = particle.x - this.mouseX;
					const dy = particle.y - this.mouseY;
					const distSq = dx * dx + dy * dy;
					
					if (distSq < radiusSq && distSq > 1e-6) {
						const distance = Math.sqrt(distSq);
						const strength = force * (1 - distance / radius);
						const dirX = dx / distance;
						const dirY = dy / distance;
						
						particle.vx += dirX * strength;
						particle.vy += dirY * strength;
					}
					
					checkedParticles.add(i);
				}
			}
		}
	}

	updateGrid() {
		// Clear grid
		this.grid = {};

		// Get current cell size from settings with safety fallback
		const settings = this.settingsManager.getAllSettings();
		const cellSize =
			settings.INTERACTION_RADIUS > 0 ? settings.INTERACTION_RADIUS : 50;

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

			// Store the cell ID on the particle for quick reference
			p.cellId = cellId;
		}
	}

	applyAttraction() {
		const settings = this.settingsManager.getAllSettings();
		const interactionRadius = settings.INTERACTION_RADIUS;
		const attract = settings.ATTRACT;
		const smoothingFactor = settings.SMOOTHING_FACTOR || 0.3;

		// Early exit if no attraction/repulsion or radius is invalid
		if (Math.abs(attract) < 1e-6 || interactionRadius <= 0) return;

		const interactionRadiusSq = interactionRadius * interactionRadius;
		// Pre-calculate force scaling factor including deltaTime
		const forceScale = attract * this.deltaTime;

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
							// Critical optimization: Only process unique pairs with i < j
							if (i >= j) continue;

							const p2 = this.particles[j];

							// Check distance
							const dx = p2.x - p1.x;
							const dy = p2.y - p1.y;
							const distSq = dx * dx + dy * dy;

							// Skip if particles are too far apart or too close
							if (distSq >= interactionRadiusSq || distSq < 1e-6) continue;

							const distance = Math.sqrt(distSq);

							// Apply smoothing to avoid extreme forces at very small distances
							const smoothedDistance = Math.max(
								distance,
								smoothingFactor * interactionRadius,
							);
							if (smoothedDistance < 1e-6) continue;

							// Calculate force using inverse square law, with pre-calculated scale
							const forceMagnitude =
								(forceScale * (p1.mass * p2.mass)) /
								(smoothedDistance * smoothedDistance);

							// Efficiently combine magnitude and normalization
							const G = forceMagnitude / distance;
							const forceX = G * dx;
							const forceY = G * dy;

							// Skip if NaN (can happen with extreme values)
							if (Number.isNaN(forceX) || Number.isNaN(forceY)) continue;

							// Apply accelerations (Force / mass)
							const accX1 = forceX / p1.mass;
							const accY1 = forceY / p1.mass;
							const accX2 = -forceX / p2.mass;
							const accY2 = -forceY / p2.mass;

							// Update velocities for both particles
							p1.vx += accX1;
							p1.vy += accY1;
							p2.vx += accX2;
							p2.vy += accY2;
						}
					}
				}
			}
		}
	}

	updateParticles(deltaTime) {
		// Store the deltaTime for use in physics calculations
		this.deltaTime = deltaTime / 1000.0; // Convert to seconds
		
		// UpdateGrid for spatial partitioning
		this.updateGrid();
		
		// Apply inter-particle attraction forces
		this.applyAttraction();
		
		// Apply mouse force
		this.applyMouseForce();
		
		// Update each particle with direct settings reference
		const settings = this.settingsManager.getAllSettings();
		for (const particle of this.particles) {
			particle.update(this.deltaTime, this.canvas.width, this.canvas.height, settings);
		}
	}

	drawConnections() {
		const settings = this.settingsManager.getAllSettings();
		const connectionOpacity = settings.CONNECTION_OPACITY;

		// Early exit if no connections needed
		if (connectionOpacity <= 0.001 || settings.INTERACTION_RADIUS <= 0) return;

		const interactionRadius = settings.INTERACTION_RADIUS;
		const interactionRadiusSq = interactionRadius * interactionRadius;
		const connectionColor = settings.CONNECTION_COLOR;
		const connectionWidth = settings.CONNECTION_WIDTH || 1;

		this.ctx.strokeStyle = connectionColor;
		this.ctx.lineWidth = connectionWidth;

		// Store lines by opacity to batch drawing
		const linesByOpacity = {};

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
							// Only process unique pairs with i < j
							if (i >= j) continue;

							const p2 = this.particles[j];

							// Check distance
							const dx = p2.x - p1.x;
							const dy = p2.y - p1.y;
							const distSq = dx * dx + dy * dy;

							if (distSq < interactionRadiusSq) {
								const distance = Math.sqrt(distSq);
								// Calculate opacity before deciding to draw
								const opacity =
									connectionOpacity * (1 - distance / interactionRadius);

								if (opacity > 0.001) {
									// Opacity threshold
									// Quantize opacity for batching (e.g., nearest 0.05)
									const opacityKey = Math.round(opacity * 20) / 20;
									if (!linesByOpacity[opacityKey]) {
										linesByOpacity[opacityKey] = [];
									}
									linesByOpacity[opacityKey].push([p1.x, p1.y, p2.x, p2.y]);
								}
							}
						}
					}
				}
			}
		}

		// Batch draw calls by opacity
		for (const opacityKey in linesByOpacity) {
			this.ctx.globalAlpha = Number.parseFloat(opacityKey);
			this.ctx.beginPath();

			for (const line of linesByOpacity[opacityKey]) {
				this.ctx.moveTo(line[0], line[1]);
				this.ctx.lineTo(line[2], line[3]);
			}

			this.ctx.stroke();
		}

		// Reset alpha
		this.ctx.globalAlpha = 1;
	}

	animate(timestamp = 0) {
		if (!this.canvas) { // Safety check if canvas removed
			this.stop();
			return;
		}
		
		// Calculate time delta for smooth animation
		const elapsed = timestamp - (this.lastTimestamp || timestamp); // Handle first frame
		this.lastTimestamp = timestamp;

		// Time in seconds, capped to avoid spiral of death
		const deltaTime = Math.min(elapsed, 100);

		// Clear canvas
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Update all particles
		this.updateParticles(deltaTime);

		// Draw connections between particles
		this.drawConnections();

		// Handle mouse effects
		this.updateAndDrawMouseEffects(timestamp);

		// Batch particle drawing by color for efficiency
		const particlesByColor = new Map();
		for (const particle of this.particles) {
			if (!particlesByColor.has(particle.color)) {
				particlesByColor.set(particle.color, []);
			}
			particlesByColor.get(particle.color).push(particle);
		}

		// Draw particles by color batches
		for (const [color, particles] of particlesByColor.entries()) {
			this.ctx.fillStyle = color;
			this.ctx.beginPath();
			
			for (const particle of particles) {
				this.ctx.moveTo(particle.x + particle.radius, particle.y);
				this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			}
			
			this.ctx.fill();
		}

		// Continue animation loop
		this.animationFrameId = requestAnimationFrame((t) => this.animate(t));
	}

	updateAndDrawMouseEffects(timestamp) {
		const settings = this.settingsManager.getAllSettings();
		
		// Limit number of effects to avoid slowdown
		const MAX_EFFECTS = 20; // Reduced from 30
		if (this.isMouseDown && this.mouseEffects.length < MAX_EFFECTS) {
			// mouse coordinates are already in canvas space
			this.mouseEffects.push({
				x: this.mouseX,
				y: this.mouseY,
				radius: settings.EXPLOSION_RADIUS,
				startTime: timestamp,
				duration: 500, // Reduced from 600
			});
		}
		
		// Draw and update existing effects
		this.ctx.save();
		
		for (let i = this.mouseEffects.length - 1; i >= 0; i--) {
			const effect = this.mouseEffects[i];
			const age = timestamp - effect.startTime;
			
			if (age > effect.duration) {
				this.mouseEffects.splice(i, 1);
				continue;
			}
			
			const progress = age / effect.duration;
			const easeOutQuad = 1 - (1 - progress) * (1 - progress);
			
			const currentOpacity = Math.max(0, 0.1 * (1 - progress));
			const currentRadius = Math.max(1, effect.radius * easeOutQuad * 0.7);
			
			// Draw a single gradient ripple
			const gradient = this.ctx.createRadialGradient(
				effect.x, effect.y, 0,
				effect.x, effect.y, currentRadius
			);
			
			gradient.addColorStop(0, `rgba(120, 220, 255, ${currentOpacity})`);
			gradient.addColorStop(1, 'rgba(60, 120, 220, 0)');
			
			this.ctx.fillStyle = gradient;
			this.ctx.beginPath();
			this.ctx.arc(effect.x, effect.y, currentRadius, 0, Math.PI * 2);
			this.ctx.fill();
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
