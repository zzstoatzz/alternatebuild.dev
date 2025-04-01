Okay, let's break this down. This involves a significant structural change to the site's navigation and layout, plus a refactoring and enhancement of the particle simulation JavaScript.

Here's a plan and the corresponding code changes:

**Phase 1: Structural Changes (Zen as Homepage, Content Drawer)**

1.  **Move Zen Page Content to Homepage:**
    *   Replace the content of `src/app/page.tsx` with the content of `src/app/zen/page.tsx`.
    *   Delete `src/app/zen/page.tsx`.

2.  **Create a New Home/Archive Page:**
    *   Create `src/app/home/page.tsx`.
    *   Move the *original* content of `src/app/page.tsx` (duck image, post list) into `src/app/home/page.tsx`.

3.  **Update Navigation:**
    *   Modify `src/app/components/Nav.tsx`:
        *   Change the "Home" link to point to `/home`.
        *   Remove the "Zen" link.

4.  **Adapt Conditional Layout:**
    *   Modify `src/app/components/ConditionalLayout.tsx` to always show the "Zen" layout (no Nav, Footer, etc.) when `pathname === '/'`.
    *   For other paths (`/home`, `/about`, `/contact`, `/posts/*`), show the standard layout with Nav, Footer, etc.

5.  **Implement Content Drawer (Simple Example):**
    *   We'll add a simple button on the new homepage (`/`) that toggles a drawer containing the navigation links.

**Phase 2: JavaScript Refactoring (`particles.js`)**

1.  **Modularize:** Break `particles.js` into smaller, focused files.
2.  **Encapsulate State:** Move global variables into classes or modules.
3.  **URL Parameter Integration:** Add logic to read settings from URL parameters on load and write them back when changed.

**Let's implement Phase 1 first:**

**1. Update `src/app/page.tsx` (New Homepage - formerly Zen):**

```tsx
// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import ContentDrawer from './components/ContentDrawer'; // We'll create this

export default function Home() { // Renamed from Zen
    const [showModal, setShowModal] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        // Keep the modal logic if desired
        if (!localStorage.getItem('zenInstructionsSeen')) {
            setShowModal(true);
        }
    }, []);

    const handleDismiss = () => {
        setShowModal(false);
        localStorage.setItem('zenInstructionsSeen', 'true');
    };

    return (
        <main className="h-screen relative">
            {/* Button to open the content drawer */}
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="fixed top-2 left-2 z-50 bg-gray-800 bg-opacity-60 text-cyan-300/70 p-2 rounded-lg 
                           hover:bg-opacity-80 hover:text-cyan-300 transition-all scale-90
                           focus:outline-none focus:ring-1 focus:ring-cyan-300/30 text-xs"
                aria-label="Open Navigation"
            >
                ☰ Menu
            </button>

            {/* The modal from the original Zen page */}
            {showModal && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-6 rounded-lg shadow-lg text-center max-w-md z-50">
                    <p className="mb-4 text-gray-800">psst! click the mouse to push the particles around. see <b>particle settings</b> in the top right to edit physics</p>
                    <button onClick={handleDismiss} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Got it!
                    </button>
                </div>
            )}

            {/* Content Drawer Component */}
            <ContentDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </main>
    );
}
```

**2. Create `src/app/home/page.tsx` (Old Homepage Content):**

```tsx
// src/app/home/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/utils/posts';

export default function HomePage() { // Renamed component
    const posts = getPosts();

    return (
        <main className="main-content">
            <div className="flex justify-center mb-8">
                <Image
                    src="https://random-d.uk/api/randomimg"
                    alt="Random Duck"
                    width={300}
                    height={300}
                    className="rounded-lg"
                />
            </div>
            <h1 className="text-4xl font-bold mb-6 text-center text-cyan-300">Recent Posts</h1>
            <section className="space-y-6">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        className="block post-card group"
                    >
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-date">{post.date}</p>
                        <span className="read-more">
                            Read more
                        </span>
                    </Link>
                ))}
            </section>
        </main>
    );
}
```

**3. Update `src/app/components/Nav.tsx`:**

```tsx
// src/app/components/Nav.tsx
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Removed useRouter as handleNavClick logic changed

export default function Nav() {
    const pathname = usePathname();

    // Simplified Nav - logic for Zen mode transition removed as '/' is now Zen
    const navItems = [
        { href: '/home', label: 'Home' }, // Changed from '/'
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
        // Removed { href: '/zen', label: 'Zen' }
    ];

    return (
        <nav className="nav w-full"> {/* Added w-full for potential drawer styling */}
            <div className="max-w-6xl mx-auto px-4">
                <ul className="flex flex-col sm:flex-row sm:justify-center space-y-4 sm:space-y-0 sm:space-x-10 py-4 sm:h-16 sm:items-center">
                    {/* Adjusted flex direction and spacing for drawer */}
                    {navItems.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className={`nav-link block sm:inline-block text-lg sm:text-base ${pathname === href ? 'current font-semibold' : 'font-light'}`}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
```

**4. Update `src/app/components/ConditionalLayout.tsx`:**

```tsx
// src/app/components/ConditionalLayout.tsx
'use client'

import { usePathname } from 'next/navigation';
import Nav from './Nav';
import Footer from './Footer';
import dynamic from 'next/dynamic';
// Removed useEffect as Zen handling moved to src/app/page.tsx

const GithubInfo = dynamic(() => import('./GithubInfo'), { ssr: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isZenMode = pathname === '/'; // Check if it's the root path

    // Removed the useEffect hook related to handleZenModeTransition

    if (isZenMode) {
        // For the root path (Zen mode), render only children.
        // The background, search, soundcloud are handled in layout.tsx
        // The drawer trigger is added directly in src/app/page.tsx
        return <>{children}</>;
    } else {
        // For all other pages, render the standard layout
        return (
            <>
                <Nav />
                <div className="github-info"><GithubInfo /></div>
                <main className="flex-grow container mx-auto px-4 py-8">
                    {children}
                </main>
                <Footer />
            </>
        );
    }
}
```

**5. Create `src/app/components/ContentDrawer.tsx`:**

```tsx
// src/app/components/ContentDrawer.tsx
'use client';

import React from 'react';
import Nav from './Nav'; // Reuse the Nav component

interface ContentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ContentDrawer({ isOpen, onClose }: ContentDrawerProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-64 sm:w-80 bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-4 h-full flex flex-col">
                    <button
                        onClick={onClose}
                        className="self-end text-gray-400 hover:text-white mb-4 text-2xl"
                        aria-label="Close Navigation"
                    >
                        &times;
                    </button>
                    <div className="flex-grow">
                        {/* Embed the Nav component here */}
                        <Nav />
                    </div>
                    {/* You could add other links or info here if needed */}
                     <p className="text-xs text-gray-500 mt-4 text-center">
                        Content Menu
                    </p>
                </div>
            </div>
        </>
    );
}
```

**6. Delete `src/app/zen/page.tsx`**

This completes Phase 1. Now, the homepage `/` is the Zen mode, and the original homepage content is at `/home`. Other pages (`/about`, `/contact`, `/posts/*`) function as before with the standard layout. A menu button on `/` opens a drawer with navigation.

---

**Phase 2: JavaScript Refactoring and URL Parameters**

This is more involved and requires careful restructuring of `public/js/particles.js`. Here’s a conceptual outline and snippets. *A full refactor is extensive, so this provides the structure and key parts.*

**Goal:**
*   Separate concerns (core logic, UI, settings).
*   Manage state cleanly.
*   Read/write settings to URL.

**Proposed File Structure (within `public/js/` or a subfolder):**

*   `particles/`
    *   `main.js` (Entry point, initializes everything)
    *   `config.js` (All tweakable constants and ranges)
    *   `particle.js` (Particle class definition)
    *   `particleSystem.js` (Core simulation logic, particle management)
    *   `settingsManager.js` (Handles URL params, local storage maybe)
    *   `uiController.js` (Handles DOM elements, sliders, buttons, events)
    *   `utils.js` (Helper functions like UnionFind, color conversion)

**Example Snippets:**

**`particles/config.js`**

```javascript
// particles/config.js
export const RANGES = {
    PARTICLE_COUNT: { min: 13, max: 2000, step: 10, default: 800 },
    EXPLOSION_RADIUS: { min: 50, max: 500, step: 10, default: 200 },
    EXPLOSION_FORCE: { min: 0, max: 100, step: 1, default: 25.0 },
    ATTRACT_CONSTANT: { min: -2000, max: 2000, step: 10, default: -900 },
    GRAVITY: { min: -300, max: 300, step: 1, default: 0 },
    INTERACTION_RADIUS: { min: 10, max: 200, step: 1, default: 25 },
    DRAG_CONSTANT: { min: 0, max: 1, step: 0.05, default: 0.13 },
    ELASTICITY_CONSTANT: { min: 0, max: 1, step: 0.05, default: 0.3 },
    INITIAL_VELOCITY: { min: 0, max: 100, step: 1, default: 0 },
    CONNECTION_OPACITY: { min: 0, max: 0.5, step: 0.01, default: 0.300 },
    CONNECTION_COLOR: { default: '#4923d1' },
    // ... add all other settings with their defaults and ranges
};

// Generate default settings object
export const DEFAULT_SETTINGS = Object.fromEntries(
    Object.entries(RANGES).map(([key, value]) => [key, value.default])
);

export const MIN_PARTICLE_RADIUS = 1;
export const MAX_PARTICLE_RADIUS = 4;

export const PALETTES = { /* ... palettes definition ... */ };
export let currentPalette = 'default'; // Or manage this via settingsManager too
```

**`particles/settingsManager.js`**

```javascript
// particles/settingsManager.js
import { DEFAULT_SETTINGS, RANGES } from './config.js';

// Simple debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export class SettingsManager {
    constructor(onChangeCallback) {
        this.settings = { ...DEFAULT_SETTINGS };
        this.onChange = onChangeCallback; // Callback to notify ParticleSystem/UI
        this.loadFromURL();
        this._updateURLDebounced = debounce(this._updateURL, 300);
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        let changed = false;
        for (const key in DEFAULT_SETTINGS) {
            if (params.has(key)) {
                const value = params.get(key);
                const range = RANGES[key];
                let parsedValue = value;

                // Basic type conversion and validation
                if (range && (range.step !== undefined || range.min !== undefined)) { // Assume number if range exists
                    parsedValue = parseFloat(value);
                    if (isNaN(parsedValue)) continue;
                    if (range.min !== undefined) parsedValue = Math.max(range.min, parsedValue);
                    if (range.max !== undefined) parsedValue = Math.min(range.max, parsedValue);
                } else if (typeof DEFAULT_SETTINGS[key] === 'number') {
                    parsedValue = parseFloat(value);
                     if (isNaN(parsedValue)) continue;
                } // Add boolean, etc. checks if needed

                if (this.settings[key] !== parsedValue) {
                    this.settings[key] = parsedValue;
                    changed = true;
                }
            }
        }
        if (changed && this.onChange) {
            this.onChange(this.settings); // Notify listeners of initial settings
        }
         console.log("Settings loaded from URL:", this.settings);
    }

    getSetting(key) {
        return this.settings[key];
    }

    updateSetting(key, value) {
        if (this.settings[key] !== value) {
            // Optional: Add validation against RANGES here
            this.settings[key] = value;
            if (this.onChange) {
                this.onChange(this.settings); // Notify listeners
            }
            this._updateURLDebounced(); // Update URL debounced
        }
    }

    getAllSettings() {
        return { ...this.settings };
    }

    _updateURL() {
        const params = new URLSearchParams();
        for (const key in this.settings) {
            // Only add params that differ from default to keep URL clean
            if (this.settings[key] !== DEFAULT_SETTINGS[key]) {
                 // Ensure color value doesn't have '#' for URL safety if needed, though usually fine
                 const value = typeof this.settings[key] === 'number'
                     ? parseFloat(this.settings[key].toFixed(4)) // Round floats
                     : this.settings[key];
                params.set(key, value);
            }
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        // Use replaceState to avoid polluting history
        window.history.replaceState({ path: newUrl }, '', newUrl);
        console.log("URL Updated:", newUrl);
    }
}
```

**`particles/uiController.js`**

```javascript
// particles/uiController.js
import { RANGES } from './config.js';

export class UIController {
    constructor(settingsManager, particleSystem) {
        this.settingsManager = settingsManager;
        this.particleSystem = particleSystem; // To call methods like createParticles, addCustomParticle
        this.initControls();
        this.bindEvents();
        this.updateUI(settingsManager.getAllSettings()); // Initial UI state
    }

    initControls() {
        // Inject PARTICLE_CONTROLS_TEMPLATE into the DOM
        // Store references to sliders, buttons, value spans etc.
        this.controls = {}; // e.g., this.controls.particleCountSlider = document.getElementById(...)
        const container = document.createElement('div');
        container.innerHTML = PARTICLE_CONTROLS_TEMPLATE; // Simplified, adapt as needed
        document.body.appendChild(container.firstElementChild);

        // Query all controls and store them
        this.configToggleButton = document.getElementById('configToggle');
        this.controlsContent = document.getElementById('controlsContent');

        for (const key in RANGES) {
            this.controls[`${key}Slider`] = document.getElementById(key);
            this.controls[`${key}Value`] = document.getElementById(`${key}Value`);
        }
         this.controls.connectionColorInput = document.getElementById('connectionColor');
         this.controls.connectionColorValue = document.getElementById('connectionColorValue');
        // ... query other buttons, selects etc. ...
         this.addParticleButton = document.getElementById('addParticle');
         this.newParticleRadiusInput = document.getElementById('newParticleRadius');
         this.newParticleRadiusValue = document.getElementById('newParticleRadiusValue');
         this.newParticleColorInput = document.getElementById('newParticleColor');

         // Ensure initial value displays for particle radius
         if(this.newParticleRadiusInput && this.newParticleRadiusValue) {
             this.newParticleRadiusValue.textContent = parseFloat(this.newParticleRadiusInput.value).toFixed(1);
         }
    }

    bindEvents() {
        // Toggle button
        this.configToggleButton?.addEventListener('click', () => {
             this.controlsContent.style.display = this.controlsContent.style.display === 'none' ? 'block' : 'none';
        });

        // Sliders and Color Input
        for (const key in RANGES) {
            const slider = this.controls[`${key}Slider`];
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = RANGES[key].step !== undefined || typeof RANGES[key].default === 'number'
                        ? parseFloat(e.target.value)
                        : e.target.value; // Handle potential string settings like color
                    this.settingsManager.updateSetting(key.toUpperCase(), value); // Use uppercase keys consistent with original code
                });
            }
        }

         this.controls.connectionColorInput?.addEventListener('input', (e) => {
            this.settingsManager.updateSetting('CONNECTION_COLOR', e.target.value);
        });


        // Add Particle button
        this.addParticleButton?.addEventListener('click', () => {
            const radius = parseFloat(this.newParticleRadiusInput.value);
            const color = this.newParticleColorInput.value;
            if(this.particleSystem) {
                 this.particleSystem.addCustomParticle(radius, color);
            }
        });

        // Update new particle radius display
         this.newParticleRadiusInput?.addEventListener('input', (e) => {
            if(this.newParticleRadiusValue) {
                this.newParticleRadiusValue.textContent = parseFloat(e.target.value).toFixed(1);
            }
        });

        // ... bind palette select, add color button, remove color etc. ...
        // Make sure to call particleSystem.createParticles() when palette changes
    }

    // Call this when settings change (from SettingsManager callback)
    updateUI(settings) {
        for (const key in settings) {
            const slider = this.controls[`${key}Slider`];
            const valueSpan = this.controls[`${key}Value`];
            const colorInput = this.controls.connectionColorInput; // Specific check for color

            const settingValue = settings[key];

            if(key === 'CONNECTION_COLOR' && colorInput) {
                 colorInput.value = settingValue;
                 if (this.controls.connectionColorValue) {
                     this.controls.connectionColorValue.textContent = settingValue;
                 }
            } else if (slider) {
                slider.value = settingValue;
            }

            if (valueSpan) {
                // Format numbers nicely
                valueSpan.textContent = typeof settingValue === 'number' ? settingValue.toFixed(3).replace(/\.?0+$/, '') : settingValue;
            }
        }
         console.log("UI Updated with settings:", settings);
    }
}
```

**`particles/particleSystem.js`**

```javascript
// particles/particleSystem.js
import { Particle } from './particle.js';
// Import PALETTES, currentPalette, MIN/MAX_PARTICLE_RADIUS etc. from config.js
import { PALETTES, MIN_PARTICLE_RADIUS, MAX_PARTICLE_RADIUS, DEFAULT_SETTINGS } from './config.js';
import { detectClusters, applyClusterProperties } from './utils.js'; // Assuming UnionFind etc. moved here

export class ParticleSystem {
    constructor(canvas, initialSettings) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.settings = { ...initialSettings }; // Store current settings
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.isZenMode = window.location.pathname === '/'; // Updated check

        this.resizeCanvas();
        this.createParticles();
        this.bindSystemEvents(); // Renamed from bindEvents to avoid clash with UI events

        this.animate();
    }

    updateSettings(newSettings) {
        const requiresRestart = newSettings.PARTICLE_COUNT !== this.settings.PARTICLE_COUNT ||
                              newSettings.INITIAL_VELOCITY !== this.settings.INITIAL_VELOCITY // Add other settings that need particle recreation
        this.settings = { ...newSettings };
        if (requiresRestart) {
             this.createParticles(); // Recreate if count/initial velocity changed
        }
    }

    resizeCanvas() { /* ... same ... */ }

    createParticles() {
        this.particles = [];
        const activePalette = PALETTES[currentPalette]; // Use currentPalette (needs managing)

        if (!activePalette || activePalette.length === 0) {
             console.warn("No active palette or palette is empty");
             return;
        };

        for (let i = 0; i < this.settings.PARTICLE_COUNT; i++) {
             const x = Math.random() * this.canvas.width;
             const y = Math.random() * this.canvas.height;
             const radius = Math.random() * (MAX_PARTICLE_RADIUS - MIN_PARTICLE_RADIUS) + MIN_PARTICLE_RADIUS;
             const color = activePalette[Math.floor(Math.random() * activePalette.length)];
             const particle = new Particle({ x, y }, radius, color, this.settings); // Pass settings to Particle

             particle.velocity.x = (Math.random() - 0.5) * this.settings.INITIAL_VELOCITY;
             particle.velocity.y = (Math.random() - 0.5) * this.settings.INITIAL_VELOCITY;

             this.particles.push(particle);
         }
         console.log(`Created ${this.settings.PARTICLE_COUNT} particles.`);
    }

     // Add this method
     addCustomParticle(radius, color) {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        // Convert hex color to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const rgba = `rgba(${r}, ${g}, ${b}, 0.6)`; // Default opacity
        const particle = new Particle({ x, y }, radius, rgba, this.settings);
        particle.velocity.x = (Math.random() - 0.5) * this.settings.INITIAL_VELOCITY;
        particle.velocity.y = (Math.random() - 0.5) * this.settings.INITIAL_VELOCITY;
        this.particles.push(particle);
        console.log("Added custom particle:", { radius, color });
    }

    bindSystemEvents() {
         window.addEventListener('resize', () => this.resizeCanvas());
         // Mouse/Touch events - same as before, update this.mousePosition and this.isMouseDown
         // ... (mousemove, mousedown, mouseup, touchstart, touchmove, touchend, touchcancel) ...
          window.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
        });
        window.addEventListener('mousedown', () => { this.isMouseDown = true; });
        window.addEventListener('mouseup', () => { this.isMouseDown = false; });
        // Add touch events similarly
    }

    // drawConnections, updateParticles, applyAttraction, applyMouseForce, animate
    // These methods need to read settings from `this.settings` instead of global vars
    // e.g., GRAVITY -> this.settings.GRAVITY
    drawConnections() {
        this.ctx.beginPath();
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].position.x - this.particles[j].position.x;
                const dy = this.particles[i].position.y - this.particles[j].position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.settings.INTERACTION_RADIUS) {
                    this.ctx.moveTo(this.particles[i].position.x, this.particles[i].position.y);
                    this.ctx.lineTo(this.particles[j].position.x, this.particles[j].position.y);
                }
            }
        }
        // Ensure CONNECTION_OPACITY is treated as a number between 0 and 1
        const opacityValue = Math.max(0, Math.min(1, this.settings.CONNECTION_OPACITY || 0));
        const opacityHex = Math.round(opacityValue * 255).toString(16).padStart(2, '0');
        this.ctx.strokeStyle = `${this.settings.CONNECTION_COLOR || '#4923d1'}${opacityHex}`;
        this.ctx.stroke();
    }

    updateParticles() {
        const dt = 1 / 60; // Consider making this dynamic based on actual frame time
        const grid = this.createSpatialGrid();

        for (const particle of this.particles) {
            const nearbyParticles = this.getNearbyParticles(particle, grid);

            for (const otherParticle of nearbyParticles) {
                if (particle !== otherParticle) {
                    this.applyAttraction(particle, otherParticle, dt);
                }
            }
            // Pass settings to particle update if needed, or ensure particle reads from system settings
            particle.update({ x: this.canvas.width, y: this.canvas.height }, dt, this.settings);
        }

         // Clustering needs access to INTERACTION_RADIUS from settings
        const uf = detectClusters(this.particles, this.settings.INTERACTION_RADIUS);
        // Apply cluster properties needs MAX_HEAT_FACTOR etc. from settings
        applyClusterProperties(this.particles, uf, this.settings);
    }

     createSpatialGrid() {
        const cellSize = this.settings.INTERACTION_RADIUS;
        // Ensure cellSize is at least 1 to avoid division by zero or infinite loops
        if (cellSize < 1) return []; // Or handle appropriately

        const gridWidth = Math.ceil(this.canvas.width / cellSize);
        const gridHeight = Math.ceil(this.canvas.height / cellSize);
         // Ensure grid dimensions are positive
         if (gridWidth <= 0 || gridHeight <= 0) return [];

        const grid = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(null).map(() => []));

        for (const particle of this.particles) {
             const cellX = Math.max(0, Math.min(gridWidth - 1, Math.floor(particle.position.x / cellSize)));
             const cellY = Math.max(0, Math.min(gridHeight - 1, Math.floor(particle.position.y / cellSize)));
             grid[cellX][cellY].push(particle);
         }
         return grid;
    }

     getNearbyParticles(particle, grid) {
        const cellSize = this.settings.INTERACTION_RADIUS;
         if (cellSize < 1 || !grid || grid.length === 0 || grid[0].length === 0) return [];

         const gridWidth = grid.length;
         const gridHeight = grid[0].length;

        const cellX = Math.max(0, Math.min(gridWidth - 1, Math.floor(particle.position.x / cellSize)));
        const cellY = Math.max(0, Math.min(gridHeight - 1, Math.floor(particle.position.y / cellSize)));
        const nearbyParticles = [];

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const x = cellX + dx;
                const y = cellY + dy;
                if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
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
        const INTERACTION_RADIUS_SQ = this.settings.INTERACTION_RADIUS * this.settings.INTERACTION_RADIUS;

        if (distSq > 1e-6 && distSq < INTERACTION_RADIUS_SQ) { // Avoid division by zero, ensure distance > 0
            const distance = Math.sqrt(distSq);
            // Ensure smoothing factor is reasonable
            const smoothingFactor = Math.max(0.01, Math.min(1, this.settings.SMOOTHING_FACTOR));
            const smoothingDistance = smoothingFactor * this.settings.INTERACTION_RADIUS;
            const smoothedDistance = Math.max(distance, smoothingDistance);

             // Use Math.abs for force calculation if ATTRACT_CONSTANT can be positive (repulsion)
            const forceMagnitude = this.settings.ATTRACT_CONSTANT * (p1.mass * p2.mass) / (smoothedDistance * smoothedDistance);

             const forceX = forceMagnitude * dx / smoothedDistance;
             const forceY = forceMagnitude * dy / smoothedDistance;

             // Check for NaN forces before applying
             if (!isNaN(forceX) && !isNaN(forceY)) {
                 p1.velocity.x += forceX / p1.mass * dt;
                 p1.velocity.y += forceY / p1.mass * dt;
                 p2.velocity.x -= forceX / p2.mass * dt;
                 p2.velocity.y -= forceY / p2.mass * dt;
            }
        }
    }

    applyMouseForce() {
         if (!this.isMouseDown) return;
         const explosionRadius = this.settings.EXPLOSION_RADIUS;
         const explosionForce = this.settings.EXPLOSION_FORCE;

         this.particles.forEach(particle => {
            const dx = particle.position.x - this.mousePosition.x;
            const dy = particle.position.y - this.mousePosition.y;
            const dist = Math.hypot(dx, dy);

             if (dist > 1e-6 && dist < explosionRadius) { // Avoid division by zero
                const normalizedDist = dist / explosionRadius;
                 // Use a potentially simpler force falloff if needed, ensure forceFactor is non-negative
                 const forceFactor = Math.max(0, 1 - Math.pow(normalizedDist, 2)); // Example: quadratic falloff
                const force = explosionForce * forceFactor;

                 const forceX = (dx / dist) * force;
                 const forceY = (dy / dist) * force;

                 if(!isNaN(forceX) && !isNaN(forceY)) {
                    particle.velocity.x += forceX;
                    particle.velocity.y += forceY;
                }
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
            this.ctx.fillStyle = particle.color; // Color is updated by applyClusterProperties
            this.ctx.fill();
        }

        this.applyMouseForce();

        requestAnimationFrame(() => this.animate());
    }

}
```

**`particles/particle.js`**

```javascript
// particles/particle.js
// Make sure Particle class uses settings passed to it or from the system
export class Particle {
     constructor(position, radius, color, initialSettings) { // Receive settings
         this.position = position;
         this.velocity = { x: 0, y: 0 };
         this.radius = radius;
         this.color = color;
         this.mass = Math.PI * radius * radius;
         this.originalColor = color;
         // No need to store settings here if update method receives them
     }

     // Receive settings object in update
     update(bounds, dt, settings) {
         // Apply gravity using settings.GRAVITY
         this.velocity.y += settings.GRAVITY * dt;

         this.position.x += this.velocity.x * dt;
         this.position.y += this.velocity.y * dt;

         // Apply drag using settings.DRAG_CONSTANT
         const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
         if (speed > 1e-6) { // Avoid division by zero
             const dragForce = settings.DRAG_CONSTANT * speed * speed; // Quadratic drag
             const dragX = (this.velocity.x / speed) * dragForce;
             const dragY = (this.velocity.y / speed) * dragForce;

             // Apply drag considering mass and dt
             if (!isNaN(dragX) && !isNaN(dragY) && this.mass > 1e-6) {
                  this.velocity.x -= dragX / this.mass * dt;
                  this.velocity.y -= dragY / this.mass * dt;
             }
         }

         // Elastic collision using settings.ELASTICITY_CONSTANT
         if (this.position.x - this.radius < 0 || this.position.x + this.radius > bounds.x) {
             this.velocity.x *= -settings.ELASTICITY_CONSTANT;
             this.position.x = Math.max(this.radius, Math.min(bounds.x - this.radius, this.position.x));
              // Dampen velocity slightly on collision to prevent sticking
              this.velocity.x *= 0.99;
         }
         if (this.position.y - this.radius < 0 || this.position.y + this.radius > bounds.y) {
             this.velocity.y *= -settings.ELASTICITY_CONSTANT;
             this.position.y = Math.max(this.radius, Math.min(bounds.y - this.radius, this.position.y));
              this.velocity.y *= 0.99;
         }
     }
 }

```

**`particles/main.js` (New Entry Point)**

```javascript
// particles/main.js
import { SettingsManager } from './settingsManager.js';
import { ParticleSystem } from './particleSystem.js';
import { UIController } from './uiController.js';

function init() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    let particleSystem = null; // Keep refs outside callbacks if needed
    let uiController = null;

    // 1. Initialize Settings Manager
    const settingsManager = new SettingsManager((updatedSettings) => {
        // This callback is triggered when settings change (initially or by user)
        if (particleSystem) {
            particleSystem.updateSettings(updatedSettings);
        }
        if (uiController) {
            uiController.updateUI(updatedSettings); // Ensure UI reflects changes immediately
        }
    });

    // 2. Initialize Particle System with initial settings
    particleSystem = new ParticleSystem(canvas, settingsManager.getAllSettings());

    // 3. Initialize UI Controller
    uiController = new UIController(settingsManager, particleSystem);

    // Make system accessible globally if needed (e.g., for Zen mode button)
     window.particleSystem = particleSystem; // Keep this if needed elsewhere

     console.log("Particle system fully initialized.");
}

// Make the init function globally accessible
window.particlesInit = init;

// Optional: Auto-init if script loads after DOM is ready
// if (document.readyState === 'complete' || document.readyState === 'interactive') {
//     init();
// } else {
//     document.addEventListener('DOMContentLoaded', init);
// }
```

**7. Update `src/app/components/ParticlesContainer.tsx`:**

*   Change the `Script` `src` to point to the new entry point: `/js/particles/main.js`.
*   Ensure the `window.particlesInit` call works correctly. The `onLoad` logic might still be needed as a fallback if the script loads late.

```tsx
// src/app/components/ParticlesContainer.tsx
'use client'

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useRouter } from 'next/navigation';

// ... (RouterInstance, Window declarations remain the same) ...
interface ParticleSystem {
    enterZenMode: () => void; // Keep if needed
    // Add other methods/properties if accessed externally
}

export function ParticlesContainer() {
    const particlesInitialized = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isZenMode = pathname === '/'; // Use updated check

    useEffect(() => {
        window.nextRouter = router; // Keep this for potential use in JS

        const initParticles = () => {
            if (
                canvasRef.current &&
                typeof window.particlesInit === 'function' && // Check for the NEW init function
                !particlesInitialized.current
            ) {
                console.log('Calling window.particlesInit');
                window.particlesInit(canvasRef.current); // Call the main initializer
                particlesInitialized.current = true;

                // Zen mode logic might be handled inside ParticleSystem/UI now,
                // but keep this if specific external calls are needed.
                // if (isZenMode && window.particleSystem?.enterZenMode) {
                //     window.particleSystem.enterZenMode();
                // }
            } else {
                 console.log("Conditions not met for init:", !!canvasRef.current, typeof window.particlesInit, particlesInitialized.current);
            }
        };

        // Use requestAnimationFrame to wait for next paint cycle, might help timing
        requestAnimationFrame(() => {
            initParticles();
        });

        // Fallback / alternative: Check periodically
        const checkInterval = setInterval(() => {
             if (typeof window.particlesInit === 'function' && !particlesInitialized.current) {
                 console.log("Initializing via interval check");
                 initParticles();
                 clearInterval(checkInterval);
             } else if (particlesInitialized.current) {
                 clearInterval(checkInterval);
             }
         }, 200);


        return () => {
            clearInterval(checkInterval);
            // Add cleanup if necessary (e.g., destroy particle system instance)
             console.log("ParticlesContainer unmounting - cleanup if needed");
        };
    }, [router, isZenMode]); // Dependencies seem correct

    return (
        <>
            <canvas
                id="particle-canvas"
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-0" // Keep z-0
            />
            <Script
                src="/js/particles/main.js" // <--- Updated path
                strategy="afterInteractive" // Keep strategy
                type="module" // <--- IMPORTANT: Add type="module" for ES imports/exports
                onLoad={() => {
                    console.log('Particle main script loaded');
                    // The init logic is now primarily in the useEffect hook,
                    // but calling it here again *might* act as a robust fallback.
                     // Check if already initialized by useEffect before calling again.
                    if (!particlesInitialized.current) {
                         console.log("Attempting init from onLoad");
                        // Ensure DOM element exists before calling init
                         if (document.getElementById('particle-canvas')) {
                            // Delay slightly to ensure everything is ready
                            setTimeout(() => {
                                if (!particlesInitialized.current && typeof window.particlesInit === 'function') {
                                    window.particlesInit(document.getElementById('particle-canvas') as HTMLCanvasElement);
                                }
                            }, 50);
                         }
                    }
                }}
                onError={(e) => {
                    console.error("Failed to load particle script:", e);
                }}
            />
        </>
    );
}

```

This refactoring provides a much more organized structure. Remember to:

1.  Create the `public/js/particles` directory and place the new JS files there.
2.  Move utility functions (like `UnionFind`, `detectClusters`, `applyClusterProperties`) into `utils.js` and import them where needed.
3.  Carefully review all parts of the original `particles.js` to ensure functionality (like palette switching, adding/removing colors) is correctly reimplemented within the new `UIController` and `ParticleSystem`.
4.  Test the URL parameter functionality thoroughly. Try different combinations, edge cases (invalid values), and ensure defaults are handled correctly.
5.  Ensure the `Particle` class and simulation methods (`applyAttraction`, `update`, etc.) correctly use the `settings` object passed to them or read from `this.settings` in `ParticleSystem`.

This is a substantial overhaul, but it addresses your goals of simplification, organization, and adding the URL parameter feature.