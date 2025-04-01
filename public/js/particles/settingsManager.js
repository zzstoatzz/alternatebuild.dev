import { DEFAULT_SETTINGS, RANGES } from "./config.js";

// Simple debounce function to avoid updating URL too frequently
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
		this._updateURLDebounced = debounce(this._updateURL.bind(this), 300);
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
				if (range && (range.step !== undefined || range.min !== undefined)) {
					// Assume number if range exists
					parsedValue = Number.parseFloat(value);
					if (Number.isNaN(parsedValue)) continue;
					if (range.min !== undefined)
						parsedValue = Math.max(range.min, parsedValue);
					if (range.max !== undefined)
						parsedValue = Math.min(range.max, parsedValue);
				} else if (typeof DEFAULT_SETTINGS[key] === "number") {
					parsedValue = Number.parseFloat(value);
					if (Number.isNaN(parsedValue)) continue;
				} else if (typeof DEFAULT_SETTINGS[key] === "boolean") {
					parsedValue = value === "true";
				}

				if (this.settings[key] !== parsedValue) {
					this.settings[key] = parsedValue;
					changed = true;
				}
			}
		}

		// Call onChange AFTER the loop if changes occurred
		if (changed && this.onChange) {
			this.onChange(this.settings);
		} else if (this.onChange) {
			// Always trigger initial update to ensure settings are applied
			this.onChange(this.settings);
		}
	}

	getSetting(key) {
		return this.settings[key];
	}

	updateSetting(key, inputValue) {
		if (this.settings[key] !== inputValue) {
			// Validate against RANGES if applicable
			let finalValue = inputValue;
			const range = RANGES[key];
			if (range) {
				if (range.min !== undefined && finalValue < range.min) {
					finalValue = range.min;
				}
				if (range.max !== undefined && finalValue > range.max) {
					finalValue = range.max;
				}
			}

			this.settings[key] = finalValue;

			if (this.onChange) {
				this.onChange(this.settings); // Notify listeners
			}

			this._updateURLDebounced(); // Update URL with debounce
		}
	}

	getAllSettings() {
		return { ...this.settings };
	}

	resetToDefaults() {
		this.settings = { ...DEFAULT_SETTINGS };

		if (this.onChange) {
			this.onChange(this.settings);
		}

		this._updateURL();
	}

	_updateURL() {
		const params = new URLSearchParams();

		for (const key in this.settings) {
			// Only add params that differ from default to keep URL clean
			if (this.settings[key] !== DEFAULT_SETTINGS[key]) {
				// Format numbers to avoid excessive decimal places
				const value =
					typeof this.settings[key] === "number"
						? Number.parseFloat(this.settings[key].toFixed(4)) // Round floats
						: this.settings[key];

				params.set(key, value);
			}
		}

		const queryString = params.toString();
		const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;

		// Use replaceState to avoid polluting history
		window.history.replaceState({ path: newUrl }, "", newUrl);
	}

	generateShareLink() {
		const params = new URLSearchParams();

		// Include all current settings in the share link
		for (const key in this.settings) {
			const value =
				typeof this.settings[key] === "number"
					? Number.parseFloat(this.settings[key].toFixed(4)) // Round floats
					: this.settings[key];

			params.set(key, value);
		}

		// Create absolute URL for sharing
		const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

		return shareUrl;
	}
}
