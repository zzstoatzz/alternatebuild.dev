import {
	RANGES,
	SETTINGS_STYLES,
} from "./config.js";

export class UIController {
	constructor(onSettingChange, initialSettings) {
		this.onSettingChange = onSettingChange;
		this.controls = {};
		this.currentSettings = { ...initialSettings };

		this.injectStyles();
		this.initControls();
		this.bindEvents();
		this.updateUI(initialSettings);
	}

	injectStyles() {
		if (!document.getElementById('particle-settings-styles')) {
			const styleElement = document.createElement('style');
			styleElement.id = 'particle-settings-styles';
			styleElement.textContent = SETTINGS_STYLES;
			document.head.appendChild(styleElement);
			
			// Add additional minimalist styles with Fira Code font
			const additionalStyles = document.createElement('style');
			additionalStyles.textContent = `
				@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500&display=swap');
				
				.particle-controls {
					background: rgba(16, 20, 24, 0.8) !important;
					border-radius: 8px !important;
					backdrop-filter: blur(10px) !important;
					box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
					border: 1px solid rgba(100, 255, 218, 0.15) !important;
					font-family: 'Fira Code', monospace !important;
					max-width: 280px !important;
					overflow: hidden !important;
					transition: all 0.3s ease !important;
				}
				
				.control-header {
					padding: 8px 12px !important;
					background: rgba(30, 34, 40, 0.9) !important;
					display: flex !important;
					justify-content: space-between !important;
					align-items: center !important;
					border-bottom: 1px solid rgba(100, 255, 218, 0.1) !important;
				}
				
				.control-header h3 {
					margin: 0 !important;
					font-size: 12px !important;
					font-weight: 500 !important;
					color: #64ffda !important;
					letter-spacing: 0.5px !important;
				}
				
				.toggle-button {
					background: transparent !important;
					border: none !important;
					color: #64ffda !important;
					cursor: pointer !important;
					font-family: 'Fira Code', monospace !important;
					font-size: 14px !important;
					padding: 0 !important;
					width: 24px !important;
					height: 24px !important;
					display: flex !important;
					align-items: center !important;
					justify-content: center !important;
					transition: transform 0.3s ease !important;
				}
				
				.toggle-button:hover {
					opacity: 0.8 !important;
				}
				
				.control-content {
					padding: 12px !important;
					max-height: 70vh !important;
					overflow-y: auto !important;
					-ms-overflow-style: none !important; /* IE and Edge */
					scrollbar-width: none !important; /* Firefox */
				}
				
				/* Hide scrollbar for Chrome, Safari and Opera */
				.control-content::-webkit-scrollbar {
					display: none !important;
				}
				
				.control-group {
					margin-bottom: 12px !important;
					padding-bottom: 12px !important;
					border-bottom: 1px solid rgba(100, 255, 218, 0.05) !important;
				}
				
				.control-group label {
					display: block !important;
					font-size: 10px !important;
					color: rgba(255, 255, 255, 0.7) !important;
					margin-bottom: 4px !important;
					font-family: 'Fira Code', monospace !important;
					letter-spacing: 0.5px !important;
					text-transform: lowercase !important;
				}
				
				.slider-row {
					display: flex !important;
					align-items: center !important;
					gap: 8px !important;
				}
				
				.slider-input {
					flex: 1 !important;
					height: 4px !important;
					background: rgba(100, 255, 218, 0.1) !important;
					border-radius: 2px !important;
					appearance: none !important;
					outline: none !important;
				}
				
				.slider-input::-webkit-slider-thumb {
					appearance: none !important;
					width: 12px !important;
					height: 12px !important;
					border-radius: 50% !important;
					background: #64ffda !important;
					cursor: pointer !important;
					border: none !important;
					transition: all 0.2s !important;
				}
				
				.slider-input::-webkit-slider-thumb:hover {
					transform: scale(1.2) !important;
					box-shadow: 0 0 10px rgba(100, 255, 218, 0.5) !important;
				}
				
				.value-display {
					min-width: 40px !important;
					text-align: right !important;
					font-size: 10px !important;
					color: #64ffda !important;
					font-family: 'Fira Code', monospace !important;
				}
				
				.button-row {
					display: flex !important;
					gap: 8px !important;
					margin-top: 16px !important;
				}
				
				.button {
					flex: 1 !important;
					background: rgba(100, 255, 218, 0.1) !important;
					border: 1px solid rgba(100, 255, 218, 0.2) !important;
					color: #64ffda !important;
					font-family: 'Fira Code', monospace !important;
					font-size: 10px !important;
					padding: 6px 12px !important;
					border-radius: 4px !important;
					cursor: pointer !important;
					transition: all 0.2s !important;
					text-transform: lowercase !important;
					letter-spacing: 0.5px !important;
				}
				
				.button:hover {
					background: rgba(100, 255, 218, 0.2) !important;
					border-color: rgba(100, 255, 218, 0.3) !important;
				}
				
				.color-picker {
					border: none !important;
					background: transparent !important;
					width: 24px !important;
					height: 24px !important;
					cursor: pointer !important;
					padding: 0 !important;
					border-radius: 50% !important;
					overflow: hidden !important;
				}
				
				.success-message {
					position: fixed !important;
					bottom: 20px !important;
					left: 50% !important;
					transform: translateX(-50%) !important;
					background: rgba(100, 255, 218, 0.9) !important;
					color: #0a192f !important;
					padding: 8px 16px !important;
					border-radius: 4px !important;
					font-family: 'Fira Code', monospace !important;
					font-size: 12px !important;
					opacity: 0 !important;
					transition: opacity 0.3s ease !important;
					z-index: 999 !important;
				}
				
				.success-message.show {
					opacity: 1 !important;
				}
			`;
			document.head.appendChild(additionalStyles);
		}
	}

	initControls() {
		// Insert the controls template into the DOM
		const controlsContainer = document.getElementById('particle-controls-container');
		if (!controlsContainer) {
			const container = document.createElement("div");
			container.id = 'particle-controls-container';
			container.innerHTML = this.generateControlsTemplate();
			document.body.appendChild(container);
			
			// Create success message div for notifications
			const successMsg = document.createElement("div");
			successMsg.id = "success-message";
			successMsg.className = "success-message";
			document.body.appendChild(successMsg);
		}

		// Store references to sliders, buttons, value displays
		this.configToggleButton = document.getElementById("configToggle");
		this.controlsContent = document.getElementById("controlsContent");

		// Get all sliders and their value displays
		for (const key in RANGES) {
			this.controls[key] = document.getElementById(key);
			this.controls[`${key}_VALUE`] = document.getElementById(`${key}_VALUE`);
		}

		// Special controls
		this.resetDefaultsButton = document.getElementById("resetDefaults");
		this.generateShareLinkButton = document.getElementById("generateShareLink");
	}

	generateControlsTemplate() {
		return `
			<div class="particle-controls" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
				<div class="control-header">
					<h3>particle settings</h3>
					<button id="configToggle" class="toggle-button">−</button>
				</div>
				<div id="controlsContent" class="control-content">
					${this.generateControlGroups()}
					<div class="button-row">
						<button id="resetDefaults" class="button">reset</button>
						<button id="generateShareLink" class="button">share</button>
					</div>
					<div class="button-row" style="margin-top: 8px;">
						<button id="randomizeColors" class="button">randomize colors</button>
					</div>
				</div>
			</div>
		`;
	}

	generateControlGroups() {
		let html = '';
		
		// Group controls by category
		const categories = {
			'particles': ['PARTICLE_COUNT', 'PARTICLE_SIZE', 'DRAG'],
			'connections': ['INTERACTION_RADIUS', 'CONNECTION_OPACITY', 'CONNECTION_WIDTH', 'CONNECTION_COLOR'],
			'forces': ['EXPLOSION_RADIUS', 'EXPLOSION_FORCE', 'GRAVITY', 'ATTRACT', 'SMOOTHING_FACTOR']
		};
		
		for (const [category, keys] of Object.entries(categories)) {
			html += `<div class="control-group"><h4 style="margin-top: 0; margin-bottom: 10px; font-size: 11px; color: #64ffda;">${category}</h4>`;
			
			for (const key of keys) {
				const range = RANGES[key];
				if (!range) continue;
				
				if (key === 'CONNECTION_COLOR') {
					html += `
						<div class="control-group">
							<label for="${key}">${key.toLowerCase().replace(/_/g, ' ')}</label>
							<div class="slider-row">
								<input type="color" id="${key}" class="color-picker" value="${range.default}">
								<span id="${key}_VALUE" class="value-display">${range.default}</span>
							</div>
						</div>
					`;
				} else {
					html += `
						<div class="control-group">
							<label for="${key}">${key.toLowerCase().replace(/_/g, ' ')}</label>
							<div class="slider-row">
								<input type="range" id="${key}" class="slider-input" 
									min="${range.min}" max="${range.max}" step="${range.step}" value="${range.default}">
								<span id="${key}_VALUE" class="value-display">${range.default}</span>
							</div>
						</div>
					`;
				}
			}
			
			html += '</div>';
		}
		
		return html;
	}

	bindEvents() {
		// Get all settings sliders and add direct event listeners
		const allRangeInputs = document.querySelectorAll('input[type="range"]');
		
		for (const input of allRangeInputs) {
			// Extract key from ID
			const key = input.id;
			if (!key) continue;
			
			// Function to handle input changes
			const handleChange = (e) => {
				let value = e.target.value;
				
				// Convert to number for most controls
				if (key !== "CONNECTION_COLOR") {
					value = Number.parseFloat(value);
					if (Number.isNaN(value)) return;
				}
				
				// Update settings
				this.onSettingChange(key, value);
				
				// Update display value directly
				const valueDisplay = document.getElementById(`${key}_VALUE`);
				if (valueDisplay) {
					if (typeof value === "number") {
						valueDisplay.textContent = value.toString();
					} else {
						valueDisplay.textContent = value;
					}
				}
			};
			
			// Remove existing handlers by cloning
			const newInput = input.cloneNode(true);
			input.parentNode.replaceChild(newInput, input);
			
			// Add handlers to the new element
			newInput.addEventListener('input', handleChange);
			newInput.addEventListener('change', handleChange);
		}
		
		// Set up special controls: color picker
		const colorPicker = document.querySelector('input[type="color"]');
		if (colorPicker) {
			const handleColorChange = (e) => {
				const value = e.target.value;
				this.onSettingChange("CONNECTION_COLOR", value);
				
				const valueDisplay = document.getElementById("CONNECTION_COLOR_VALUE");
				if (valueDisplay) {
					valueDisplay.textContent = value;
				}
			};
			
			const newColorPicker = colorPicker.cloneNode(true);
			colorPicker.parentNode.replaceChild(newColorPicker, colorPicker);
			
			newColorPicker.addEventListener('input', handleColorChange);
			newColorPicker.addEventListener('change', handleColorChange);
		}
		
		// Config toggle button
		const configToggle = document.getElementById("configToggle");
		const controlsContent = document.getElementById("controlsContent");
		
		if (configToggle && controlsContent) {
			// Clone to remove existing listeners
			const newToggle = configToggle.cloneNode(true);
			configToggle.parentNode.replaceChild(newToggle, configToggle);
			
			newToggle.addEventListener('click', () => {
				const isVisible = controlsContent.style.display !== "none";
				controlsContent.style.display = isVisible ? "none" : "block";
				newToggle.textContent = isVisible ? "+" : "−";
				newToggle.style.transform = isVisible ? "rotate(0deg)" : "rotate(0deg)";
			});
		}
		
		// Reset button
		const resetButton = document.getElementById("resetDefaults");
		if (resetButton) {
			resetButton.addEventListener('click', () => {
				// Use reset function from parent particleSystem
				if (window.particleSystem) {
					window.particleSystem.settingsManager.resetToDefaults();
					
					// Update all sliders and displays to match default values
					const defaults = window.particleSystem.settingsManager.getAllSettings();
					this.updateUI(defaults);
					
					this.showSuccessMessage("settings reset to defaults");
				}
			});
		}
		
		// Share link button
		const shareButton = document.getElementById("generateShareLink");
		if (shareButton) {
			shareButton.addEventListener('click', () => {
				// Get share link from parent particleSystem
				if (window.particleSystem) {
					const shareLink = window.particleSystem.settingsManager.generateShareLink();
					this.copyToClipboard(shareLink);
					this.showSuccessMessage("link copied to clipboard");
				}
			});
		}
		
		// Randomize colors button
		const randomizeButton = document.getElementById("randomizeColors");
		if (randomizeButton) {
			randomizeButton.addEventListener('click', () => {
				if (window.particleSystem) {
					// Just recreate particles with new random colors
					window.particleSystem.restart();
					this.showSuccessMessage("colors randomized");
				}
			});
		}
	}

	updateUI(settings) {
		// Update all sliders and displays
		for (const key in settings) {
			const control = document.getElementById(key);
			const valueDisplay = document.getElementById(`${key}_VALUE`);

			if (!control) continue;

			// Update control value
			if (control.type === "checkbox") {
				control.checked = settings[key];
			} else {
				control.value = settings[key];
			}

			// Update display value
			if (valueDisplay) {
				if (control.type === "checkbox") {
					valueDisplay.textContent = settings[key] ? 'on' : 'off';
				} else if (typeof settings[key] === "number") {
					const displayValue = Number.parseFloat(settings[key].toFixed(3)).toString();
					valueDisplay.textContent = displayValue;
				} else {
					valueDisplay.textContent = settings[key];
				}
			}
		}
	}

	copyToClipboard(text) {
		// Create temporary element
		const el = document.createElement("textarea");
		el.value = text;
		el.setAttribute("readonly", "");
		el.style.position = "absolute";
		el.style.left = "-9999px";
		document.body.appendChild(el);

		// Select and copy
		const selected =
			document.getSelection().rangeCount > 0
				? document.getSelection().getRangeAt(0)
				: false;

		el.select();
		document.execCommand("copy");
		document.body.removeChild(el);

		// Restore selection if any
		if (selected) {
			document.getSelection().removeAllRanges();
			document.getSelection().addRange(selected);
		}
	}
	
	showSuccessMessage(message) {
		const messageElement = document.getElementById("success-message");
		if (!messageElement) return;
		
		messageElement.textContent = message;
		messageElement.classList.add("show");
		
		// Hide after 2 seconds
		setTimeout(() => {
			messageElement.classList.remove("show");
		}, 2000);
	}
}
