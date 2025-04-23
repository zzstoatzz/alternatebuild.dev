// src/utils/pitch-detector.ts
// A modern TypeScript implementation of a browser-based pitch detector using YIN algorithm

// Type definitions
export type AudioProcessCallback = (
	frequency: number | null,
	clarity: number,
) => void;

export interface PitchDetectorOptions {
	sampleRate?: number;
	bufferSize?: number;
	minFrequency?: number;
	maxFrequency?: number;
	threshold?: number;
	audioWorkletPath?: string; // Path to the worklet file
}

export class PitchDetector {
	private audioContext: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private stream: MediaStream | null = null;
	private source: MediaStreamAudioSourceNode | null = null;
	private processor: ScriptProcessorNode | null = null;
	private workletNode: AudioWorkletNode | null = null;
	private isRunning = false;

	// Configuration
	private readonly sampleRate: number;
	private readonly bufferSize: number;
	private readonly minFrequency: number;
	private readonly maxFrequency: number;
	private readonly threshold: number;
	private readonly audioWorkletPath: string;

	// Buffers for analysis
	private readonly buffer: Float32Array;
	private readonly correlationBuffer: Float32Array;

	constructor(options: PitchDetectorOptions = {}) {
		// Default configuration
		this.sampleRate = options.sampleRate || 44100;
		this.bufferSize = options.bufferSize || 2048;
		this.minFrequency = options.minFrequency || 50; // Hz
		this.maxFrequency = options.maxFrequency || 2000; // Hz
		this.threshold = options.threshold || 0.15;
		this.audioWorkletPath =
			options.audioWorkletPath || "/pitch-detector-worklet.js"; // Default path

		// Initialize buffers
		this.buffer = new Float32Array(this.bufferSize);
		this.correlationBuffer = new Float32Array(this.bufferSize);
	}

	/**
	 * Start pitch detection with microphone input
	 */
	async start(callback: AudioProcessCallback): Promise<void> {
		if (this.isRunning) return;

		try {
			// Get microphone access
			this.stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: true,
					noiseSuppression: true,
					autoGainControl: false,
				},
			});

			// Create audio context
			// Use a base sample rate that's commonly supported, but let the context choose the best match
			this.audioContext = new AudioContext({
				// sampleRate: targetSampleRate, // Let browser choose optimal, will resample if needed
				latencyHint: "interactive",
			});

			// Log the actual sample rate being used
			console.log(
				`AudioContext created with sample rate: ${this.audioContext.sampleRate} Hz`,
			);

			// Create source node
			this.source = this.audioContext.createMediaStreamSource(this.stream);

			// Create analyzer node (still useful for visualizations if needed, but not required for YIN)
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.fftSize = this.bufferSize * 2; // Typically related to bufferSize

			if (this.audioContext.audioWorklet) {
				try {
					console.log(
						`Attempting to load AudioWorklet from: ${this.audioWorkletPath}`,
					);
					await this.audioContext.audioWorklet.addModule(this.audioWorkletPath);
					console.log("AudioWorklet module loaded successfully.");

					this.workletNode = new AudioWorkletNode(
						this.audioContext,
						"pitch-detector-processor",
						{
							processorOptions: {
								bufferSize: this.bufferSize,
								sampleRate: this.audioContext.sampleRate, // Use actual sample rate
								minFrequency: this.minFrequency,
								maxFrequency: this.maxFrequency,
								threshold: this.threshold,
							},
						},
					);

					this.workletNode.port.onmessage = (event) => {
						if (event.data.frequency !== undefined) {
							// console.log('Worklet message:', event.data);
							callback(event.data.frequency, event.data.clarity);
						}
					};

					this.workletNode.port.onmessageerror = (err) => {
						console.error("Error receiving message from worklet:", err);
					};

					// Connect nodes: Source -> Analyser -> Worklet -> Destination
					// Analyser is included here but could be bypassed if not used for visualization
					this.source.connect(this.analyser);
					this.analyser.connect(this.workletNode);
					this.workletNode.connect(this.audioContext.destination); // Connect to output to avoid issues
					console.log("AudioWorklet pipeline connected.");
				} catch (e) {
					console.warn(
						"AudioWorklet setup failed, falling back to ScriptProcessor",
						e,
					);
					// Ensure workletNode is null if setup failed
					this.workletNode = null;
					this.setupScriptProcessor(callback);
				}
			} else {
				console.warn(
					"AudioWorklet not supported, falling back to ScriptProcessor.",
				);
				this.setupScriptProcessor(callback);
			}

			this.isRunning = true;
		} catch (err) {
			console.error("Failed to start pitch detection:", err);
			throw new Error(`Failed to start pitch detection: ${err.message || err}`);
		}
	}

	/**
	 * Setup legacy ScriptProcessorNode (fallback method)
	 */
	private setupScriptProcessor(callback: AudioProcessCallback): void {
		if (!this.audioContext || !this.source || !this.analyser) {
			console.error(
				"Cannot setup ScriptProcessor: AudioContext, Source, or Analyser not initialized.",
			);
			return;
		}

		// Create ScriptProcessor
		this.processor = this.audioContext.createScriptProcessor(
			this.bufferSize,
			1,
			1,
		);

		this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
			if (!this.isRunning) return; // Don't process if stopped

			// Get input data for the current frame
			const inputData = e.inputBuffer.getChannelData(0);

			// Although we have a buffer in the class, for ScriptProcessor,
			// it's often easier to process the inputData directly frame by frame.
			// However, the YIN implementation needs the full buffer. We need to copy.
			this.buffer.set(inputData);

			// Perform pitch detection on the buffer
			const result = this.detectPitch(
				this.buffer,
				this.audioContext?.sampleRate || this.sampleRate,
			); // Pass buffer & sampleRate
			callback(result.frequency, result.clarity);
		};

		// Connect nodes: Source -> Analyser -> Processor -> Destination
		this.source.connect(this.analyser);
		this.analyser.connect(this.processor);
		this.processor.connect(this.audioContext.destination);
		console.log("ScriptProcessor pipeline connected.");
	}

	/**
	 * Stop pitch detection
	 */
	stop(): void {
		if (!this.isRunning) return;
		console.log("Stopping pitch detection...");

		this.isRunning = false; // Signal processing loops to stop

		// Disconnect nodes safely
		try {
			if (this.processor) {
				this.processor.disconnect();
				this.processor = null;
			}
			if (this.workletNode) {
				this.workletNode.port.close();
				this.workletNode.disconnect();
				this.workletNode = null;
			}
			if (this.analyser) {
				this.analyser.disconnect();
				this.analyser = null;
			}
			if (this.source) {
				this.source.disconnect();
				this.source = null;
			}
		} catch (e) {
			console.error("Error disconnecting nodes:", e);
		}

		// Stop media stream tracks
		if (this.stream) {
			for (const track of this.stream.getTracks()) {
				track.stop();
			}
			this.stream = null;
		}

		// Close AudioContext
		if (this.audioContext && this.audioContext.state !== "closed") {
			this.audioContext
				.close()
				.then(() => {
					console.log("AudioContext closed.");
				})
				.catch((e) => {
					console.error("Error closing AudioContext:", e);
				});
			this.audioContext = null;
		}
	}

	/**
	 * Detect pitch using YIN algorithm
	 * Based on the paper: "YIN, a fundamental frequency estimator for speech and music"
	 * @param buffer The audio buffer to analyze.
	 * @param sampleRate The sample rate of the audio.
	 * @returns Object containing frequency (Hz) and clarity (0-1).
	 */
	private detectPitch(
		buffer: Float32Array,
		sampleRate: number,
	): { frequency: number | null; clarity: number } {
		const bufferSize = buffer.length;
		let yinBuffer = this.correlationBuffer; // Re-use class buffer

		// Ensure buffer has enough space (should match bufferSize)
		if (yinBuffer.length !== bufferSize) {
			yinBuffer = new Float32Array(bufferSize);
			// In practice, ensure correlationBuffer is always sized correctly in constructor
		}

		let period = 0;
		let clarity = 0;

		// 1. Difference function
		for (let tau = 0; tau < bufferSize / 2; tau++) {
			yinBuffer[tau] = 0;
			for (let i = 0; i < bufferSize / 2; i++) {
				const delta = buffer[i] - buffer[i + tau];
				yinBuffer[tau] += delta * delta;
			}
		}

		// 2. Cumulative mean normalized difference function
		yinBuffer[0] = 1;
		let runningSum = 0;
		for (let tau = 1; tau < bufferSize / 2; tau++) {
			runningSum += yinBuffer[tau];
			if (runningSum === 0) {
				yinBuffer[tau] = 1;
			} else {
				yinBuffer[tau] *= tau / runningSum;
			}
		}

		// 3. Absolute threshold
		// Find the first dip below the threshold
		const minTau = Math.max(1, Math.floor(sampleRate / this.maxFrequency));
		const maxTau = Math.floor(sampleRate / this.minFrequency);
		let tauEstimate = -1;

		for (let tau = minTau; tau < maxTau; tau++) {
			if (yinBuffer[tau] < this.threshold) {
				// Check if it's a local minimum
				while (tau + 1 < maxTau && yinBuffer[tau + 1] < yinBuffer[tau]) {
					tau++;
				}
				tauEstimate = tau;
				clarity = 1 - yinBuffer[tauEstimate]; // Clarity is 1 minus the dip value
				break;
			}
		}

		// 4. Parabolic interpolation (Refine the estimate)
		if (tauEstimate > 1 && tauEstimate < bufferSize / 2 - 1) {
			const y1 = yinBuffer[tauEstimate - 1];
			const y2 = yinBuffer[tauEstimate];
			const y3 = yinBuffer[tauEstimate + 1];
			const betterTau = tauEstimate + (y3 - y1) / (2 * (2 * y2 - y1 - y3));
			period = betterTau;
		} else {
			period = tauEstimate;
		}

		// Calculate frequency
		let frequency: number | null = null;
		if (period > 0) {
			frequency = sampleRate / period;
		} else {
			clarity = 0; // No reliable period found
		}

		// Handle potential invalid frequency (e.g., NaN, Infinity)
		if (!frequency || !Number.isFinite(frequency)) {
			frequency = null;
			clarity = 0;
		}

		return { frequency, clarity };
	}
}

// --- Helper Functions (can be kept here or moved with PitchDetector) ---

const noteNames = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B",
];
const A4_FREQ = 440;
const A4_NOTE_INDEX = 9; // A is the 9th index (0-based) in noteNames array [C, C#, ... A, A#, B]
const A4_OCTAVE = 4;

/**
 * Convert frequency to the nearest note name, octave, and cents offset.
 * @param freq Frequency in Hz.
 * @returns Object with note details or null if frequency is invalid.
 */
export const frequencyToNoteDetails = (
	freq: number,
): { note: string; octave: number; centsOff: number } | null => {
	if (freq <= 0 || !Number.isFinite(freq)) return null;

	// Calculate how many half-steps away from A4
	const n = 12 * Math.log2(freq / A4_FREQ);
	const roundedN = Math.round(n);

	// Calculate the difference in cents
	const centsOff = Math.round((n - roundedN) * 100);

	// Calculate the note index (0-11) and octave using A4 as reference
	const absoluteNoteIndex = (A4_NOTE_INDEX + (roundedN % 12) + 12) % 12;
	const octave = A4_OCTAVE + Math.floor((roundedN + A4_NOTE_INDEX) / 12);

	const note = noteNames[absoluteNoteIndex];

	return { note, octave, centsOff };
};
