// raw javascript because i don't know any better, please judge me and then PR

// particle settings
const MIN_PARTICLE_RADIUS = 1;
const MAX_PARTICLE_RADIUS = 4;

const PARTICLE_COUNT_RANGE = { min: 13, max: 2000, step: 10 };
const EXPLOSION_RADIUS_RANGE = { min: 50, max: 500, step: 10 };
const EXPLOSION_FORCE_RANGE = { min: 0, max: 100, step: 1 };
const ATTRACT_CONSTANT_RANGE = { min: -2000, max: 2000, step: 10 };
const GRAVITY_RANGE = { min: -300, max: 300, step: 1 };
const INTERACTION_RADIUS_RANGE = { min: 10, max: 200, step: 1 };
const DRAG_CONSTANT_RANGE = { min: 0, max: 1, step: 0.05 };
const ELASTICITY_CONSTANT_RANGE = { min: 0, max: 1, step: 0.05 };
const INITIAL_VELOCITY_RANGE = { min: 0, max: 100, step: 1 };
const CONNECTION_OPACITY_RANGE = { min: 0, max: 0.5, step: 0.01 };
const MAX_HEAT_FACTOR_RANGE = { min: 0, max: 1, step: 0.05 };
const MIN_CLUSTER_OPACITY_RANGE = { min: 0, max: 1, step: 0.05 };
const OPACITY_REDUCTION_FACTOR_RANGE = { min: 0, max: 2, step: 0.05 };
const SMOOTHING_FACTOR_RANGE = { min: 0.01, max: 0.5, step: 0.01 };

let PARTICLE_COUNT = 1000;
let EXPLOSION_RADIUS = 200;
let EXPLOSION_FORCE = 25.0;
let ATTRACT_CONSTANT = -1000;
let GRAVITY = 100;
let INTERACTION_RADIUS = 25;


let DRAG_CONSTANT = 0.05;
let ELASTICITY_CONSTANT = 0.3;
let INITIAL_VELOCITY = 0;

let CONNECTION_OPACITY = 0.250;
const MIN_GRAVITY_DISTANCE = 0.01;
let MAX_HEAT_FACTOR = 0.2;
let MIN_CLUSTER_OPACITY = 0.6;
let OPACITY_REDUCTION_FACTOR = 1;
let SMOOTHING_FACTOR = 0.25;

const DEFAULT_CONNECTION_COLOR = '#4923d1';
let CONNECTION_COLOR = DEFAULT_CONNECTION_COLOR;

// settings display

const PARTICLE_CONTROLS_TEMPLATE = `
<div id="particleControls" style="position: fixed; top: 2vh; right: 2vw; z-index: 1000; font-size: 1.5vmin;">
    <button id="configToggle" style="background: rgba(0,0,0,0.7); color: white; border: none; padding: 1vmin 2vmin; border-radius: 5px; cursor: pointer; font-size: inherit;" title="'P' to toggle settings, Tab/arrow to navigate/edit">
        <span class="full-text">particle settings</span>
        <span class="emoji" style="display: none;">⚙️</span>
    </button>
    <div id="controlsContent" style="display: none; background: rgba(0,0,0,0.3); padding: 2vmin; border-radius: 5px; position: fixed; z-index: 1001; font-size: calc(8px + 0.5vmin); max-width: 300px; max-height: 80vh; overflow-y: auto; top: 8vh; right: 2vw;">
        <button id="closeSettings" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: calc(24px + 1vmin); cursor: pointer; padding: calc(5px + 1vmin);">&times;</button>
        <h2 style="margin-top: 0; margin-bottom: 15px; color: white;">Particle Settings</h2>
        <div style="display: grid; gap: 10px;">
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                particle count: <span id="particleCountValue">${PARTICLE_COUNT}</span>
                <input type="range" id="particleCount" min="${PARTICLE_COUNT_RANGE.min}" max="${PARTICLE_COUNT_RANGE.max}" step="${PARTICLE_COUNT_RANGE.step}" value="${PARTICLE_COUNT}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                attract: <span id="attractConstantValue">${ATTRACT_CONSTANT}</span>
                <input type="range" id="attractConstant" min="${ATTRACT_CONSTANT_RANGE.min}" max="${ATTRACT_CONSTANT_RANGE.max}" step="${ATTRACT_CONSTANT_RANGE.step}" value="${ATTRACT_CONSTANT}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                gravity: <span id="gravityValue">${GRAVITY}</span>
                <input type="range" id="gravity" min="${GRAVITY_RANGE.min}" max="${GRAVITY_RANGE.max}" step="${GRAVITY_RANGE.step}" value="${GRAVITY}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                interaction radius: <span id="interactionRadiusValue">${INTERACTION_RADIUS}</span>
                <input type="range" id="interactionRadius" min="${INTERACTION_RADIUS_RANGE.min}" max="${INTERACTION_RADIUS_RANGE.max}" step="${INTERACTION_RADIUS_RANGE.step}" value="${INTERACTION_RADIUS}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                initial velocity: <span id="initialVelocityRangeValue">${INITIAL_VELOCITY}</span>
                <input type="range" id="initialVelocityRange" min="${INITIAL_VELOCITY_RANGE.min}" max="${INITIAL_VELOCITY_RANGE.max}" step="${INITIAL_VELOCITY_RANGE.step}" value="${INITIAL_VELOCITY}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                drag: <span id="dragConstantValue">${DRAG_CONSTANT}</span>
                <input type="range" id="dragConstant" min="${DRAG_CONSTANT_RANGE.min}" max="${DRAG_CONSTANT_RANGE.max}" step="${DRAG_CONSTANT_RANGE.step}" value="${DRAG_CONSTANT}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                elasticity: <span id="elasticityConstantValue">${ELASTICITY_CONSTANT}</span>
                <input type="range" id="elasticityConstant" min="${ELASTICITY_CONSTANT_RANGE.min}" max="${ELASTICITY_CONSTANT_RANGE.max}" step="${ELASTICITY_CONSTANT_RANGE.step}" value="${ELASTICITY_CONSTANT}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                connection color: <span id="connectionColorValue">${DEFAULT_CONNECTION_COLOR}</span>
                <input type="color" id="connectionColor" value="${DEFAULT_CONNECTION_COLOR}" style="width: 100%; height: 30px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                connection opacity: <span id="connectionOpacityValue">${CONNECTION_OPACITY}</span>
                <input type="range" id="connectionOpacity" min="${CONNECTION_OPACITY_RANGE.min}" max="${CONNECTION_OPACITY_RANGE.max}" step="${CONNECTION_OPACITY_RANGE.step}" value="${CONNECTION_OPACITY}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                mouse force radius: <span id="explosionRadiusValue">${EXPLOSION_RADIUS}</span>
                <input type="range" id="explosionRadius" min="${EXPLOSION_RADIUS_RANGE.min}" max="${EXPLOSION_RADIUS_RANGE.max}" step="${EXPLOSION_RADIUS_RANGE.step}" value="${EXPLOSION_RADIUS}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
            <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                mouse force strength: <span id="explosionForceValue">${EXPLOSION_FORCE}</span>
                <input type="range" id="explosionForce" min="${EXPLOSION_FORCE_RANGE.min}" max="${EXPLOSION_FORCE_RANGE.max}" step="${EXPLOSION_FORCE_RANGE.step}" value="${EXPLOSION_FORCE}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
            </label>
        </div>
        <details style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
            <summary style="cursor: pointer; color: white;">Experimental Settings</summary>
            <div style="display: grid; gap: 10px; margin-top: 10px;">
                <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                    max heat factor: <span id="maxHeatFactorValue">${MAX_HEAT_FACTOR}</span>
                    <input type="range" id="maxHeatFactor" min="${MAX_HEAT_FACTOR_RANGE.min}" max="${MAX_HEAT_FACTOR_RANGE.max}" step="${MAX_HEAT_FACTOR_RANGE.step}" value="${MAX_HEAT_FACTOR}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                    min cluster opacity: <span id="minClusterOpacityValue">${MIN_CLUSTER_OPACITY}</span>
                    <input type="range" id="minClusterOpacity" min="${MIN_CLUSTER_OPACITY_RANGE.min}" max="${MIN_CLUSTER_OPACITY_RANGE.max}" step="${MIN_CLUSTER_OPACITY_RANGE.step}" value="${MIN_CLUSTER_OPACITY}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                    opacity reduction: <span id="opacityReductionFactorValue">${OPACITY_REDUCTION_FACTOR}</span>
                    <input type="range" id="opacityReductionFactor" min="${OPACITY_REDUCTION_FACTOR_RANGE.min}" max="${OPACITY_REDUCTION_FACTOR_RANGE.max}" step="${OPACITY_REDUCTION_FACTOR_RANGE.step}" value="${OPACITY_REDUCTION_FACTOR}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
                </label>
                <label style="display: flex; justify-content: space-between; align-items: center; color: white;">
                    smoothing factor: <span id="smoothingFactorValue">${SMOOTHING_FACTOR}</span>
                    <input type="range" id="smoothingFactor" min="${SMOOTHING_FACTOR_RANGE.min}" max="${SMOOTHING_FACTOR_RANGE.max}" step="${SMOOTHING_FACTOR_RANGE.step}" value="${SMOOTHING_FACTOR}" style="flex-grow: 1; margin-left: 10px; margin-right: 10px;">
                </label>
            </div>
        </details>
        <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
            <label for="colorPalette" style="color: white;">Color Palette:</label>
            <select id="colorPalette" style="width: 100%; margin-top: 5px; padding: 5px; background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 3px;">
                <option value="default">Default</option>
                <option value="highContrast">High Contrast</option>
                <option value="custom">Custom</option>
            </select>
        </div>
        <div id="customPaletteControls" style="display: none; margin-top: 10px;">
            <input type="color" id="newColor" value="#000000" style="width: 100%; height: 30px;">
            <button id="addColor" style="width: 100%; margin-top: 5px; padding: 5px; background: rgba(255,255,255,0.1); color: white; border: none; border-radius: 3px; cursor: pointer;">Add Color</button>
            <div id="customColorList" style="margin-top: 10px;"></div>
        </div>
        <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; background: rgba(255,255,255,0.1); border-radius: 5px; padding: 10px;">
            <h3 style="margin-top: 0; color: white;">Add a Particle</h3>
            <div style="display: grid; gap: 10px;">
                <label style="display: flex; flex-direction: column; color: white;">
                    Radius: <span id="newParticleRadiusValue">${MAX_PARTICLE_RADIUS * 4}</span>
                    <input type="range" id="newParticleRadius" min="${MIN_PARTICLE_RADIUS}" max="${MAX_PARTICLE_RADIUS * 20}" value="${MAX_PARTICLE_RADIUS * 4}" step="0.1" style="width: 100%;">
                </label>
                <label style="display: flex; flex-direction: column; color: white;">
                    Color:
                    <input type="color" id="newParticleColor" value="#ffffff" style="width: 100%; height: 30px;">
                </label>
                <button id="addParticle" style="width: 100%; padding: 5px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 3px; cursor: pointer;">Add Particle</button>
            </div>
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
/* General styles */
#controlsContent label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
}
#controlsContent input[type="range"] {
    flex-grow: 1;
    margin-left: 10px;
    margin-right: 10px;
}
#controlsContent span {
    min-width: 30px;
    text-align: right;
}

/* Desktop styles */
@media (min-width: 769px) {
    #controlsContent {
        width: 400px !important;
        max-width: 90vw !important;
    }
    
    #controlsContent label {
        margin-bottom: 15px;
        flex-wrap: wrap;
    }
    
    #controlsContent label > span:first-child {
        width: 100%;
        margin-bottom: 5px;
    }
    
    #controlsContent input[type="range"] {
        width: calc(100% - 50px);
        margin-left: 0;
    }
    
    #controlsContent span:last-child {
        width: 40px;
        text-align: right;
    }
    
    #controlsContent input[type="color"] {
        margin-top: 5px;
        width: 100%;
    }
}

/* Mobile styles */
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
    #controlsContent label {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    #controlsContent label > span:first-child {
        margin-bottom: 10px;
        font-weight: bold;
    }
    #controlsContent input[type="range"] {
        width: 100%;
        margin: 10px 0;
        -webkit-appearance: none;
        background: transparent;
    }
    #controlsContent span:last-child {
        align-self: flex-end;
        font-size: 14px;
        opacity: 0.8;
    }
    #controlsContent input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 24px;
        width: 24px;
        border-radius: 50%;
        background: #A9A9A9;
        cursor: pointer;
        margin-top: -8px;
    }
    #controlsContent input[type="range"]::-webkit-slider-runnable-track {
        width: 100%;
        height: 8px;
        background: #ddd;
        border-radius: 4px;
    }
    #controlsContent input[type="color"] {
        width: 100%;
        height: 40px;
        margin-top: 10px;
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

    update(bounds, dt) {
        // Apply gravity
        this.velocity.y += GRAVITY * dt;

        // Update position
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Apply drag
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        const dragForce = DRAG_CONSTANT * speed ** 2;
        const dragX = this.velocity.x * dragForce / speed;
        const dragY = this.velocity.y * dragForce / speed;
        this.velocity.x -= dragX / this.mass * dt;
        this.velocity.y -= dragY / this.mass * dt;

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
        EXPLOSION_FORCE = parseFloat(document.getElementById('explosionForce').value) || EXPLOSION_FORCE;
        ATTRACT_CONSTANT = parseFloat(document.getElementById('attractConstant').value) || ATTRACT_CONSTANT;
        GRAVITY = parseFloat(document.getElementById('gravity').value) || GRAVITY;
        INTERACTION_RADIUS = parseInt(document.getElementById('interactionRadius').value) || INTERACTION_RADIUS;

        DRAG_CONSTANT = parseFloat(document.getElementById('dragConstant').value) || DRAG_CONSTANT;
        ELASTICITY_CONSTANT = parseFloat(document.getElementById('elasticityConstant').value) || ELASTICITY_CONSTANT;
        INITIAL_VELOCITY = parseFloat(document.getElementById('initialVelocityRange').value) || INITIAL_VELOCITY;
        CONNECTION_OPACITY = parseFloat(document.getElementById('connectionOpacity').value) || CONNECTION_OPACITY;
        MAX_HEAT_FACTOR = parseFloat(document.getElementById('maxHeatFactor').value) || MAX_HEAT_FACTOR;
        MIN_CLUSTER_OPACITY = parseFloat(document.getElementById('minClusterOpacity').value) || MIN_CLUSTER_OPACITY;
        OPACITY_REDUCTION_FACTOR = parseFloat(document.getElementById('opacityReductionFactor').value) || OPACITY_REDUCTION_FACTOR;
        SMOOTHING_FACTOR = parseFloat(document.getElementById('smoothingFactor').value) || SMOOTHING_FACTOR;
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

            particle.velocity.x = (Math.random() - 0.5) * INITIAL_VELOCITY;
            particle.velocity.y = (Math.random() - 0.5) * INITIAL_VELOCITY;

            this.particles.push(particle);
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());

        // Mouse events
        window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });
        window.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        // Touch events
        window.addEventListener('touchstart', (e) => {
            this.isMouseDown = true;
            const touch = e.touches[0];
            if (touch) {
                this.mousePosition.x = touch.clientX;
                this.mousePosition.y = touch.clientY;
            }
        });

        window.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            if (touch) {
                this.mousePosition.x = touch.clientX;
                this.mousePosition.y = touch.clientY;
            }
        });

        window.addEventListener('touchend', () => {
            this.isMouseDown = false;
        });

        window.addEventListener('touchcancel', () => {
            this.isMouseDown = false;
        });

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

        const newParticleRadius = document.getElementById('newParticleRadius');
        const newParticleRadiusValue = document.getElementById('newParticleRadiusValue');
        const newParticleColor = document.getElementById('newParticleColor');
        const addParticleButton = document.getElementById('addParticle');

        if (newParticleRadius && newParticleRadiusValue) {
            newParticleRadius.addEventListener('input', (e) => {
                const radius = parseFloat(e.target.value).toFixed(1);
                newParticleRadiusValue.textContent = radius;
            });
        }

        if (addParticleButton) {
            addParticleButton.addEventListener('click', () => {
                const radius = parseFloat(newParticleRadius.value);
                const color = newParticleColor.value;
                this.addCustomParticle(radius, color);
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
                const connectionColorValue = document.getElementById('connectionColorValue');
                if (connectionColorValue) {
                    connectionColorValue.textContent = CONNECTION_COLOR;
                }
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
            case 'explosionForce':
                EXPLOSION_FORCE = parseFloat(value);
                break;
            case 'attractConstant':
                ATTRACT_CONSTANT = parseFloat(value);
                break;
            case 'gravity':
                GRAVITY = parseFloat(value);
                break;
            case 'interactionRadius':
                INTERACTION_RADIUS = parseInt(value);
                break;
            case 'initialVelocityRange':
                INITIAL_VELOCITY = parseFloat(value);
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
            case 'smoothingFactor':
                SMOOTHING_FACTOR = parseFloat(value);
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
        const opacity = Math.round(CONNECTION_OPACITY * 255).toString(16).padStart(2, '0');
        this.ctx.strokeStyle = `${CONNECTION_COLOR}${opacity}`;
        this.ctx.stroke();
    }

    updateParticles() {
        const dt = 1 / 60; // Assuming 60 FPS, adjust if using a different frame rate
        const grid = this.createSpatialGrid();

        for (const particle of this.particles) {
            const nearbyParticles = this.getNearbyParticles(particle, grid);

            for (const otherParticle of nearbyParticles) {
                if (particle !== otherParticle) {
                    this.applyAttraction(particle, otherParticle, dt);
                }
            }

            particle.update({ x: this.canvas.width, y: this.canvas.height }, dt);
        }

        const uf = detectClusters(this.particles, INTERACTION_RADIUS);
        applyClusterProperties(this.particles, uf);
    }

    createSpatialGrid() {
        const cellSize = INTERACTION_RADIUS;
        const gridWidth = Math.max(1, Math.ceil(this.canvas.width / cellSize));
        const gridHeight = Math.max(1, Math.ceil(this.canvas.height / cellSize));
        const grid = Array(gridWidth).fill().map(() => Array(gridHeight).fill().map(() => []));

        for (const particle of this.particles) {
            const cellX = Math.floor(particle.position.x / cellSize);
            const cellY = Math.floor(particle.position.y / cellSize);

            if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
                grid[cellX][cellY].push(particle);
            }
        }

        return grid;
    }

    getNearbyParticles(particle, grid) {
        const cellSize = INTERACTION_RADIUS;
        const cellX = Math.floor(particle.position.x / cellSize);
        const cellY = Math.floor(particle.position.y / cellSize);
        const nearbyParticles = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const x = cellX + dx;
                const y = cellY + dy;
                if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
                    nearbyParticles.push(...grid[x][y]);
                }
            }
        }

        return nearbyParticles;
    }

    applyAttraction(p1, p2, dt) {
        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const distSq = dx * dx + dy * dy;
        const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;

        if (distSq > 0 && distSq < INTERACTION_RADIUS_SQ) {
            const distance = Math.sqrt(distSq);
            const smoothingDistance = SMOOTHING_FACTOR * INTERACTION_RADIUS;
            const smoothedDistance = Math.max(distance, smoothingDistance);
            const force = ATTRACT_CONSTANT * (p1.mass * p2.mass) / (smoothedDistance * smoothedDistance);
            const forceX = force * dx / smoothedDistance;
            const forceY = force * dy / smoothedDistance;

            p1.velocity.x += forceX / p1.mass * dt;
            p1.velocity.y += forceY / p1.mass * dt;
            p2.velocity.x -= forceX / p2.mass * dt;
            p2.velocity.y -= forceY / p2.mass * dt;
        }
    }

    applyMouseForce() {
        if (!this.isMouseDown) return;

        this.particles.forEach(particle => {
            const dx = particle.position.x - this.mousePosition.x;
            const dy = particle.position.y - this.mousePosition.y;
            const dist = Math.hypot(dx, dy);
            if (dist < EXPLOSION_RADIUS) {
                const normalizedDist = dist / EXPLOSION_RADIUS;
                const forceFactor = 1 - Math.pow(normalizedDist, 4); // More explosive near the center
                const force = EXPLOSION_FORCE * forceFactor;
                particle.velocity.x += (dx / dist) * force;
                particle.velocity.y += (dy / dist) * force;
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateParticles();
        this.drawConnections();

        for (const particle of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(particle.position.x, particle.position.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
        }

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

    addCustomParticle(radius, color) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        // Convert hex color to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const rgba = `rgba(${r}, ${g}, ${b}, 0.6)`;
        const particle = new Particle({ x, y }, radius, rgba);
        particle.velocity.x = (Math.random() - 0.5) * INITIAL_VELOCITY;
        particle.velocity.y = (Math.random() - 0.5) * INITIAL_VELOCITY;
        this.particles.push(particle);
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