/**
 * AudioWorkletProcessor for performing YIN pitch detection off the main thread.
 */
class PitchDetectorProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    
    // Extract options passed from the main thread
    const processorOptions = options.processorOptions || {};
    this.bufferSize = processorOptions.bufferSize || 2048;
    this.sampleRate = processorOptions.sampleRate || 44100; // Use actual sample rate from AudioContext
    this.minFrequency = processorOptions.minFrequency || 50;
    this.maxFrequency = processorOptions.maxFrequency || 2000;
    this.threshold = processorOptions.threshold || 0.15;
    
    // Initialize buffers
    this.buffer = new Float32Array(this.bufferSize);
    this.correlationBuffer = new Float32Array(this.bufferSize); // For YIN calculations
    this.bufferIndex = 0;
    
    // console.log('Worklet initialized with options:', processorOptions);
  }
  
  /**
   * Called by the system to process audio blocks.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  process(inputs, _outputs, _parameters) {
    // Use the first input and first channel - assumes mono input
    const inputChannel = inputs[0]?.[0];
    
    // Stop processing if input is silent or channel is unavailable
    if (!inputChannel) {
      // console.warn('Worklet: No input channel data.');
      return true; // Keep processor alive
    }
    
    // If the buffer size mismatches the input block size, we need to handle accumulation carefully.
    // For simplicity, this example assumes inputChannel.length is constant and smaller than bufferSize.
    // A more robust implementation might handle variable block sizes.

    // Accumulate samples into our internal buffer
    for (let i = 0; i < inputChannel.length; i++) {
        // If the buffer is full, process it first
        if (this.bufferIndex >= this.bufferSize) {
            const result = this.detectPitch(this.buffer, this.sampleRate);
            // Post result back to the main thread
            this.port.postMessage(result);
            // Reset buffer index to start filling again
            this.bufferIndex = 0;
        }
        // Add the current sample to the buffer
        this.buffer[this.bufferIndex] = inputChannel[i];
        this.bufferIndex++;
    }
    
    // Return true to keep the processor alive
    return true;
  }
  
  /**
   * Detect pitch using YIN algorithm (implementation copied from main PitchDetector class).
   * @param buffer The audio buffer to analyze.
   * @param sampleRate The sample rate of the audio.
   * @returns Object containing frequency (Hz) and clarity (0-1).
   */
  detectPitch(buffer, sampleRate) {
    const bufferSize = buffer.length;
    let yinBuffer = this.correlationBuffer; // Re-use buffer

    if (yinBuffer.length !== bufferSize) {
        console.warn('Worklet YIN buffer size mismatch, reallocating.'); // Should not happen if constructed correctly
        yinBuffer = new Float32Array(bufferSize);
        this.correlationBuffer = yinBuffer; // Update ref if reallocated
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
    const minTau = Math.max(1, Math.floor(sampleRate / this.maxFrequency));
    const maxTau = Math.floor(sampleRate / this.minFrequency);
    let tauEstimate = -1;

    for (let tau = minTau; tau < maxTau; tau++) {
        if (yinBuffer[tau] < this.threshold) {
            while (tau + 1 < maxTau && yinBuffer[tau + 1] < yinBuffer[tau]) {
                tau++;
            }
            tauEstimate = tau;
            clarity = 1 - yinBuffer[tauEstimate];
            break;
        }
    }

    // 4. Parabolic interpolation
    if (tauEstimate > 1 && tauEstimate < bufferSize / 2 - 1) {
        const y1 = yinBuffer[tauEstimate - 1];
        const y2 = yinBuffer[tauEstimate];
        const y3 = yinBuffer[tauEstimate + 1];
        // Check for division by zero potential
        const divisor = 2 * (2 * y2 - y1 - y3);
        if (divisor !== 0) {
            const betterTau = tauEstimate + (y3 - y1) / divisor;
            period = betterTau;
        } else {
             period = tauEstimate; // Fallback if divisor is zero
        }
    } else {
        period = tauEstimate;
    }

    // Calculate frequency
    let frequency = null;
    if (period > 0) {
        frequency = sampleRate / period;
    } else {
        clarity = 0;
    }

    // Final check for valid number
    if (!frequency || !Number.isFinite(frequency)) {
        frequency = null;
        clarity = 0;
    }
    
    return { frequency, clarity };
  }
}

// Register the processor with the browser
try {
  registerProcessor('pitch-detector-processor', PitchDetectorProcessor);
} catch (e) {
  console.error('Failed to register PitchDetectorProcessor:', e);
} 