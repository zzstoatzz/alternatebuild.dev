import { ParticleSystem } from './particleSystem.js';

// Main initialization function
function init(canvas) {
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    // Ensure canvas can receive pointer events directly
    canvas.style.pointerEvents = 'auto';
    
    // Create particle system (handles its own settings internally)
    const particleSystem = new ParticleSystem(canvas);
    
    // Make the particle system globally accessible for debugging
    window.particleSystem = particleSystem;
    
    return particleSystem;
}

// Make init function globally accessible
window.particlesInit = init;

// Auto-init if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        init(canvas);
    }
} else {
    // Otherwise wait for DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('particle-canvas');
        if (canvas) {
            init(canvas);
        }
    });
} 