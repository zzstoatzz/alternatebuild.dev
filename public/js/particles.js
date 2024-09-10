// raw javascript because i don't know any better, please judge me and then PR

// particle settings
const PARTICLE_COUNT_RANGE = { min: 13, max: 2000, step: 1 };
const EXPLOSION_RADIUS_RANGE = { min: 50, max: 400 };
const GRAVITY_CONSTANT_RANGE = { min: -10, max: 10, step: 0.001 };
const INTERACTION_RADIUS_RANGE = { min: 10, max: 300 };
const DRAG_CONSTANT_RANGE = { min: 0, max: 1, step: 0.01 };
const ELASTICITY_CONSTANT_RANGE = { min: 0, max: 1, step: 0.01 };
const INITIAL_VELOCITY_RANGE_RANGE = { min: 0, max: 1, step: 0.01 };
const CONNECTION_OPACITY_RANGE = { min: 0, max: 0.5, step: 0.001 };
const MAX_HEAT_FACTOR_RANGE = { min: 0, max: 1, step: 0.01 };
const MIN_CLUSTER_OPACITY_RANGE = { min: 0, max: 1, step: 0.01 };
const OPACITY_REDUCTION_FACTOR_RANGE = { min: 0, max: 2, step: 0.01 };

let PARTICLE_COUNT = 710;
let EXPLOSION_RADIUS = 200;
const EXPLOSION_FORCE = 1.0;
let GRAVITY_CONSTANT = -0.200;
let INTERACTION_RADIUS = 204;
const MIN_PARTICLE_RADIUS = 1;
const MAX_PARTICLE_RADIUS = 4;

let DRAG_CONSTANT = 0.150;
let ELASTICITY_CONSTANT = 0.3;
let INITIAL_VELOCITY_RANGE = 0;

let CONNECTION_OPACITY = 0.013;
const MIN_GRAVITY_DISTANCE = 0.01;
let MAX_HEAT_FACTOR = 0.2;
let MIN_CLUSTER_OPACITY = 0.6;
let OPACITY_REDUCTION_FACTOR = 1;

const DEFAULT_CONNECTION_COLOR = '#00db6a';
let CONNECTION_COLOR = DEFAULT_CONNECTION_COLOR;


// settings display

const PARTICLE_CONTROLS_TEMPLATE = `
<div id="particleControls" style="position: fixed; top: 2vh; right: 2vw; z-index: 1000; font-size: 1.5vmin;">
    <button id="configToggle" style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 1vmin 2vmin; border-radius: 5px; cursor: pointer; font-size: inherit;" title="'P' to toggle settings, Tab/arrow to navigate/edit">
        <span class="full-text">particle settings</span>
        <span class="emoji" style="display: none;">⚙️</span>
    </button>
    <div id="controlsContent" style="display: none; background: rgba(0,0,0,0.7); padding: 2vmin; border-radius: 5px; position: fixed; z-index: 1001; font-size: 1vmin; max-width: 300px; max-height: 80vh; overflow-y: auto; top: 8vh; right: 2vw;">
        <button id="closeSettings" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
        <h2 style="margin-top: 0; margin-bottom: 15px;">Particle Settings</h2>
        <label style="display: flex; justify-content: space-between; align-items: center;">particle count: <input type="range" id="particleCount" min="${PARTICLE_COUNT_RANGE.min}" max="${PARTICLE_COUNT_RANGE.max}" value="${PARTICLE_COUNT}" style="margin-left: 1vmin;"> <span id="particleCountValue" style="margin-left: 1vmin;">${PARTICLE_COUNT}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">mouse force: <input type="range" id="explosionRadius" min="${EXPLOSION_RADIUS_RANGE.min}" max="${EXPLOSION_RADIUS_RANGE.max}" value="${EXPLOSION_RADIUS}"> <span id="explosionRadiusValue" style="margin-left: 1vmin;">${EXPLOSION_RADIUS}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">gravity: <input type="range" id="gravityConstant" min="${GRAVITY_CONSTANT_RANGE.min}" max="${GRAVITY_CONSTANT_RANGE.max}" step="${GRAVITY_CONSTANT_RANGE.step}" value="${GRAVITY_CONSTANT}"> <span id="gravityConstantValue" style="margin-left: 1vmin;">${GRAVITY_CONSTANT}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">interaction radius: <input type="range" id="interactionRadius" min="${INTERACTION_RADIUS_RANGE.min}" max="${INTERACTION_RADIUS_RANGE.max}" value="${INTERACTION_RADIUS}"> <span id="interactionRadiusValue" style="margin-left: 1vmin;">${INTERACTION_RADIUS}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">initial velocity: <input type="range" id="initialVelocityRange" min="${INITIAL_VELOCITY_RANGE_RANGE.min}" max="${INITIAL_VELOCITY_RANGE_RANGE.max}" step="${INITIAL_VELOCITY_RANGE_RANGE.step}" value="${INITIAL_VELOCITY_RANGE}"> <span id="initialVelocityRangeValue" style="margin-left: 1vmin;">${INITIAL_VELOCITY_RANGE}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">drag: <input type="range" id="dragConstant" min="${DRAG_CONSTANT_RANGE.min}" max="${DRAG_CONSTANT_RANGE.max}" step="${DRAG_CONSTANT_RANGE.step}" value="${DRAG_CONSTANT}"> <span id="dragConstantValue" style="margin-left: 1vmin;">${DRAG_CONSTANT}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">elasticity: <input type="range" id="elasticityConstant" min="${ELASTICITY_CONSTANT_RANGE.min}" max="${ELASTICITY_CONSTANT_RANGE.max}" step="${ELASTICITY_CONSTANT_RANGE.step}" value="${ELASTICITY_CONSTANT}"> <span id="elasticityConstantValue" style="margin-left: 1vmin;">${ELASTICITY_CONSTANT}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">connection color: <input type="color" id="connectionColor" value="${DEFAULT_CONNECTION_COLOR}"> <span id="connectionColorValue" style="margin-left: 1vmin;">${DEFAULT_CONNECTION_COLOR}</span></label><br>
        <label style="display: flex; justify-content: space-between; align-items: center;">connection opacity: <input type="range" id="connectionOpacity" min="${CONNECTION_OPACITY_RANGE.min}" max="${CONNECTION_OPACITY_RANGE.max}" step="${CONNECTION_OPACITY_RANGE.step}" value="${CONNECTION_OPACITY}"> <span id="connectionOpacityValue" style="margin-left: 1vmin;">${CONNECTION_OPACITY}</span></label><br>
        <details>
            <summary style="cursor: pointer; margin-top: 1vmin;">Experimental Settings</summary>
            <div style="margin-top: 1vmin;">
                <label style="display: flex; justify-content: space-between; align-items: center;">max heat factor: <input type="range" id="maxHeatFactor" min="${MAX_HEAT_FACTOR_RANGE.min}" max="${MAX_HEAT_FACTOR_RANGE.max}" step="${MAX_HEAT_FACTOR_RANGE.step}" value="${MAX_HEAT_FACTOR}"> <span id="maxHeatFactorValue" style="margin-left: 1vmin;">${MAX_HEAT_FACTOR}</span></label><br>
                <label style="display: flex; justify-content: space-between; align-items: center;">min cluster opacity: <input type="range" id="minClusterOpacity" min="${MIN_CLUSTER_OPACITY_RANGE.min}" max="${MIN_CLUSTER_OPACITY_RANGE.max}" step="${MIN_CLUSTER_OPACITY_RANGE.step}" value="${MIN_CLUSTER_OPACITY}"> <span id="minClusterOpacityValue" style="margin-left: 1vmin;">${MIN_CLUSTER_OPACITY}</span></label><br>
                <label style="display: flex; justify-content: space-between; align-items: center;">opacity reduction: <input type="range" id="opacityReductionFactor" min="${OPACITY_REDUCTION_FACTOR_RANGE.min}" max="${OPACITY_REDUCTION_FACTOR_RANGE.max}" step="${OPACITY_REDUCTION_FACTOR_RANGE.step}" value="${OPACITY_REDUCTION_FACTOR}"> <span id="opacityReductionFactorValue" style="margin-left: 1vmin;">${OPACITY_REDUCTION_FACTOR}</span></label>
            </div>
        </details>
        <div style="margin-top: 1vmin;">
            <label for="colorPalette">Color Palette:</label>
            <select id="colorPalette">
                <option value="default">Default</option>
                <option value="highContrast">High Contrast</option>
                <option value="custom">Custom</option>
            </select>
        </div>
        <div id="customPaletteControls" style="display: none; margin-top: 1vmin;">
            <input type="color" id="newColor" value="#000000">
            <button id="addColor">Add Color</button>
            <div id="customColorList"></div>
        </div>
    </div>
</div>
`

const EXIT_ZEN_MODE_TEMPLATE = `
<div id="exitZenMode" style="position: fixed; top: 2vh; left: 2vw; z-index: 1000;">
    <button style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 1vmin 2vmin; border-radius: 5px; cursor: pointer; font-size: 1.5vmin;">Exit Zen Mode</button>
</div>
`

// settings display styles

const SETTINGS_STYLES = `
@media (max-width: 768px) {
    #particleControls #configToggle .full-text {
        display: none;
    }
    #particleControls #configToggle .emoji {
        display: inline !important;
        font-size: 24px;
    }
    #particleControls #configToggle {
        padding: 8px;
        font-size: 24px;
    }
    #controlsContent {
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        height: 100% !important;
        max-width: none !important;
        max-height: none !important;
        border-radius: 0 !important;
        overflow-y: auto;
        font-size: 16px !important;
        padding: 20px !important;
        box-sizing: border-box;
    }
    #controlsContent label, #controlsContent input, #controlsContent select {
        font-size: 16px !important;
    }
    #controlsContent > * {
        margin-left: 10px;
        margin-right: 10px;
    }
}
`

// Define palettes
const PALETTES = {
    default: [
        'rgba(142, 106, 63, 0.6)',
        'rgba(113, 98, 83, 0.6)',
        'rgba(94, 75, 60, 0.6)',
        'rgba(66, 92, 73, 0.6)',
        'rgba(152, 151, 100, 0.6)',
        'rgba(70, 130, 180, 0.6)',
        'rgba(100, 149, 237, 0.6)',
    ],
    highContrast: [
        'rgba(255, 0, 0, 0.6)',
        'rgba(0, 255, 0, 0.6)',
        'rgba(0, 0, 255, 0.6)',
        'rgba(255, 255, 0, 0.6)',
        'rgba(255, 0, 255, 0.6)',
    ],
    custom: []
};

let currentPalette = 'default';

class Particle {
    constructor(position, radius, color) {
        this.position = position;
        this.velocity = {
            x: 0,
            y: 0
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

        // Check if we're in Zen mode
        this.isZenMode = window.location.pathname === '/zen';

        // Add particle controls
        this.canvas.insertAdjacentHTML('beforebegin', PARTICLE_CONTROLS_TEMPLATE);

        // Add Exit Zen Mode button if in Zen mode
        if (this.isZenMode) {
            this.addExitZenModeButton();
        }

        const styleElement = document.createElement('style');
        styleElement.textContent = SETTINGS_STYLES;
        document.head.appendChild(styleElement);

        const configToggle = document.getElementById('configToggle');
        const controlsContent = document.getElementById('controlsContent');
        const closeSettings = document.getElementById('closeSettings');

        configToggle.addEventListener('click', () => {
            controlsContent.style.display = controlsContent.style.display === 'none' ? 'block' : 'none';
        });

        closeSettings.addEventListener('click', () => {
            controlsContent.style.display = 'none';
        });

        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;

        this.resizeCanvas();
        this.updatePaletteDropdown();
        this.updateCustomPaletteDisplay();
        const customControls = document.getElementById('customPaletteControls');
        if (customControls) {
            customControls.style.display = currentPalette === 'custom' ? 'block' : 'none';
        }
        this.createParticles();
        this.bindEvents();
        this.bindSliderEvents();
        this.bindColorInputEvent();
        this.animate();

        // Add keyboard shortcut
        window.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                this.toggleControls();
            }
        });

        // Store the instance globally
        window.particleSystem = this;
    }

    toggleControls() {
        const content = document.getElementById('controlsContent');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }

    updateConstants() {
        PARTICLE_COUNT = parseInt(document.getElementById('particleCount').value) || PARTICLE_COUNT;
        EXPLOSION_RADIUS = parseInt(document.getElementById('explosionRadius').value) || EXPLOSION_RADIUS;
        GRAVITY_CONSTANT = parseFloat(document.getElementById('gravityConstant').value) || GRAVITY_CONSTANT;
        INTERACTION_RADIUS = parseInt(document.getElementById('interactionRadius').value) || INTERACTION_RADIUS;

        DRAG_CONSTANT = parseFloat(document.getElementById('dragConstant').value) || DRAG_CONSTANT;
        ELASTICITY_CONSTANT = parseFloat(document.getElementById('elasticityConstant').value) || ELASTICITY_CONSTANT;
        INITIAL_VELOCITY_RANGE = parseFloat(document.getElementById('initialVelocityRange').value) || INITIAL_VELOCITY_RANGE;
        CONNECTION_OPACITY = parseFloat(document.getElementById('connectionOpacity').value) || CONNECTION_OPACITY;
        MAX_HEAT_FACTOR = parseFloat(document.getElementById('maxHeatFactor').value) || MAX_HEAT_FACTOR;
        MIN_CLUSTER_OPACITY = parseFloat(document.getElementById('minClusterOpacity').value) || MIN_CLUSTER_OPACITY;
        OPACITY_REDUCTION_FACTOR = parseFloat(document.getElementById('opacityReductionFactor').value) || OPACITY_REDUCTION_FACTOR;
        CONNECTION_COLOR = document.getElementById('connectionColor').value || DEFAULT_CONNECTION_COLOR;
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        const activePalette = PALETTES[currentPalette];

        if (activePalette.length === 0) return;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const radius = Math.random() * (MAX_PARTICLE_RADIUS - MIN_PARTICLE_RADIUS) + MIN_PARTICLE_RADIUS;
            const color = activePalette[Math.floor(Math.random() * activePalette.length)];
            const particle = new Particle({ x, y }, radius, color);

            particle.velocity.x = (Math.random() - 0.5) * INITIAL_VELOCITY_RANGE;
            particle.velocity.y = (Math.random() - 0.5) * INITIAL_VELOCITY_RANGE;

            this.particles.push(particle);
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
        window.addEventListener('resize', () => {
            const content = document.getElementById('controlsContent');
            if (content.style.display !== 'none') {
                document.getElementById('configToggle').click();
                document.getElementById('configToggle').click();
            }
        });

        const colorPaletteSelect = document.getElementById('colorPalette');
        if (colorPaletteSelect) {
            colorPaletteSelect.addEventListener('change', (e) => {
                currentPalette = e.target.value;
                const customControls = document.getElementById('customPaletteControls');
                if (customControls) {
                    customControls.style.display = currentPalette === 'custom' ? 'block' : 'none';
                }
                this.createParticles();
                this.updatePaletteDropdown();
            });
        }

        const addColorButton = document.getElementById('addColor');
        if (addColorButton) {
            addColorButton.addEventListener('click', () => {
                const newColorInput = document.getElementById('newColor');
                if (newColorInput) {
                    const newColor = newColorInput.value;
                    PALETTES.custom.push(newColor);
                    this.updateCustomPaletteDisplay();
                    if (currentPalette === 'custom') {
                        this.createParticles();
                    }
                }
            });
        }

        const customColorList = document.getElementById('customColorList');
        if (customColorList) {
            customColorList.addEventListener('click', (e) => {
                if (e.target.classList.contains('removeColor')) {
                    const index = parseInt(e.target.dataset.index);
                    PALETTES.custom.splice(index, 1);
                    this.updateCustomPaletteDisplay();
                    if (currentPalette === 'custom') {
                        this.createParticles();
                    }
                }
            });
        }
    }

    bindSliderEvents() {
        const sliders = document.querySelectorAll('#controlsContent input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', (event) => {
                const target = event.target;
                const value = target.value;
                const valueSpan = document.getElementById(`${target.id}Value`);
                if (valueSpan) {
                    valueSpan.textContent = value;
                }
                this.updateParticleSettings(target.id, value);
            });
        });
    }

    bindColorInputEvent() {
        const connectionColorInput = document.getElementById('connectionColor');
        if (connectionColorInput) {
            connectionColorInput.addEventListener('input', (event) => {
                CONNECTION_COLOR = event.target.value;
            });
        }
    }

    updateParticleSettings(settingId, value) {
        switch (settingId) {
            case 'particleCount':
                PARTICLE_COUNT = parseInt(value);
                this.createParticles();
                break;
            case 'explosionRadius':
                EXPLOSION_RADIUS = parseInt(value);
                break;
            case 'gravityConstant':
                GRAVITY_CONSTANT = parseFloat(value);
                break;
            case 'interactionRadius':
                INTERACTION_RADIUS = parseInt(value);
                break;
            case 'initialVelocityRange':
                INITIAL_VELOCITY_RANGE = parseFloat(value);
                break;
            case 'dragConstant':
                DRAG_CONSTANT = parseFloat(value);
                break;
            case 'elasticityConstant':
                ELASTICITY_CONSTANT = parseFloat(value);
                break;
            case 'connectionOpacity':
                CONNECTION_OPACITY = parseFloat(value);
                break;
            case 'maxHeatFactor':
                MAX_HEAT_FACTOR = parseFloat(value);
                break;
            case 'minClusterOpacity':
                MIN_CLUSTER_OPACITY = parseFloat(value);
                break;
            case 'opacityReductionFactor':
                OPACITY_REDUCTION_FACTOR = parseFloat(value);
                break;
        }
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
        this.ctx.strokeStyle = `${CONNECTION_COLOR}${Math.round(CONNECTION_OPACITY * 255).toString(16).padStart(2, '0')}`;
        this.ctx.stroke();
    }

    applyGravity(p1, p2) {
        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const distSq = dx * dx + dy * dy;

        if (distSq > MIN_GRAVITY_DISTANCE && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS) {
            const distance = Math.sqrt(distSq);
            const force = GRAVITY_CONSTANT * (p1.mass * p2.mass) / distSq;
            const forceX = force * dx / distance;
            const forceY = force * dy / distance;

            p1.velocity.x += forceX / p1.mass;
            p1.velocity.y += forceY / p1.mass;
            p2.velocity.x -= forceX / p2.mass;
            p2.velocity.y -= forceY / p2.mass;
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

    updateCustomPaletteDisplay() {
        const customColorList = document.getElementById('customColorList');
        if (customColorList) {
            customColorList.innerHTML = PALETTES.custom.map((color, index) => `
                <div style="display: flex; align-items: center; margin-bottom: 0.5vmin;">
                    <div style="width: 20px; height: 20px; background-color: ${color}; margin-right: 0.5vmin;"></div>
                    <button class="removeColor" data-index="${index}">Remove</button>
                </div>
            `).join('');
        }
    }

    updatePaletteDropdown() {
        const colorPaletteSelect = document.getElementById('colorPalette');
        if (colorPaletteSelect) {
            colorPaletteSelect.value = currentPalette;
        }
    }

    addExitZenModeButton() {
        if (!document.getElementById('exitZenMode')) {
            this.canvas.insertAdjacentHTML('beforebegin', EXIT_ZEN_MODE_TEMPLATE);
            const exitZenMode = document.getElementById('exitZenMode');
            exitZenMode.addEventListener('click', () => {
                window.location.href = '/';
            });
        }
    }

    enterZenMode() {
        this.isZenMode = true;
        this.addExitZenModeButton();
        // Hide nav and other elements
        document.querySelector('nav')?.classList.add('hidden');
        document.getElementById('githubInfo')?.classList.add('hidden');
        // Add any other Zen mode-specific changes here
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
        const clusterSize = clusterSizes.get(root) || 1;

        const heatFactor = Math.min((clusterSize - 1) / (maxClusterSize - 1), MAX_HEAT_FACTOR);

        const rgbaMatch = particle.originalColor.match(/\d+/g);
        if (rgbaMatch && rgbaMatch.length >= 4) {
            const [r, g, b, a] = rgbaMatch.map(Number);

            const newR = Math.round(r + (255 - r) * heatFactor);
            const newG = Math.round(g + (255 - g) * heatFactor);
            const newB = Math.round(b + (255 - b) * heatFactor);

            const newA = Math.max(MIN_CLUSTER_OPACITY, 1 - heatFactor * OPACITY_REDUCTION_FACTOR);

            particle.color = `rgba(${newR}, ${newG}, ${newB}, ${newA})`;
        }
        particle.clusterMass = clusterSize;
    });
}

window.particlesInit = function (canvas) {
    new ParticleSystem(canvas);
};