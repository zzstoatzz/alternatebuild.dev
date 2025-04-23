"use client";

import { useState, useEffect, useRef, useCallback, type FC } from "react";
import { PitchDetector, frequencyToNoteDetails } from '@/utils/pitch-detector';

const MIN_CLARITY_THRESHOLD = 0.7; // Minimum clarity to display note

const TunerPage: FC = () => {
	const [frequency, setFrequency] = useState<number | null>(null);
	const [noteDetails, setNoteDetails] = useState<{ note: string; octave: number; centsOff: number } | null>(null);
	const [clarity, setClarity] = useState<number>(0);
	const [isListening, setIsListening] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	// Ref to hold the PitchDetector instance
	const pitchDetectorRef = useRef<PitchDetector | null>(null);

	// Callback function passed to the detector
	const handlePitchUpdate = useCallback((detectedFrequency: number | null, detectedClarity: number) => {
		setFrequency(detectedFrequency);
		setClarity(detectedClarity);
		
		if (detectedFrequency && detectedClarity >= MIN_CLARITY_THRESHOLD) {
			const details = frequencyToNoteDetails(detectedFrequency);
			setNoteDetails(details);
		} else {
			setNoteDetails(null); // Clear note if below threshold or no frequency
		}
	}, []); // No dependencies needed as it only calls setters

	const handleStart = useCallback(async () => {
		setError(null); // Clear previous errors
		if (pitchDetectorRef.current) return; // Already started

		try {
			// Configure and create the detector instance
			pitchDetectorRef.current = new PitchDetector({
				sampleRate: 48000, // Higher sample rate
				bufferSize: 4096,  // Larger buffer
				threshold: 0.15,   // YIN threshold
				// Ensure the worklet path is correct relative to the public directory
				audioWorkletPath: '/pitch-detector-worklet.js' 
			});
			
			console.log('Starting pitch detector...');
			await pitchDetectorRef.current.start(handlePitchUpdate);
			setIsListening(true);
			console.log('Pitch detector started successfully.');
		} catch (err) {
			console.error('Error starting pitch detector:', err);
			setError(`Error starting tuner: ${err.message || 'Unknown error'}`);
			// Clean up if start failed partially
			if (pitchDetectorRef.current) {
				pitchDetectorRef.current.stop();
				pitchDetectorRef.current = null;
			}
			setIsListening(false); 
		}
	}, [handlePitchUpdate]); // Dependency on the stable callback

	const handleStop = useCallback(() => {
		console.log('Attempting to stop pitch detector...');
		pitchDetectorRef.current?.stop();
		pitchDetectorRef.current = null;
		
		// Reset state
		setIsListening(false);
		setFrequency(null);
		setNoteDetails(null);
		setClarity(0);
		setError(null);
		console.log('Pitch detector stopped and state reset.');
	}, []); // No dependencies needed as it only accesses ref and setters

	// Cleanup on unmount
	useEffect(() => {
		// Return the cleanup function
		return () => {
			console.log('TunerPage unmounting, ensuring detector is stopped.');
			handleStop(); // Use the stable handleStop function
		};
	}, [handleStop]); // Depend on the stable handleStop callback

	// Determine text color based on cents offset
	const getCentsColor = (cents: number): string => {
		const absCents = Math.abs(cents);
		if (absCents <= 5) return 'text-green-400'; // Very close
		if (absCents <= 15) return 'text-yellow-400'; // Slightly off
		return 'text-red-400'; // Significantly off
	};

	return (
		<div className="mx-auto max-w-2xl px-4 py-16 font-sans text-gray-200 flex flex-col items-center min-h-[calc(100vh-10rem)]">
			<h1 className="text-3xl font-bold text-cyan-400 mb-8">Browser Guitar Tuner</h1>
			
			<div className="mb-8">
				{!isListening ? (
					<button 
						type="button" 
						onClick={handleStart}
						className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out text-lg disabled:opacity-50"
						disabled={isListening} // Disable if already listening (though state should prevent overlap)
					>
						Start Tuning
					</button>
				) : (
					<button 
						type="button" 
						onClick={handleStop}
						className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out text-lg"
					>
						Stop Tuning
					</button>
				)}
			</div>

			{error && (
				<div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded-md">
					{error}
				</div>
			)}

			<div className="text-center h-56 flex flex-col justify-center items-center p-6 bg-gray-800 rounded-lg shadow-inner w-full max-w-md">
				{isListening ? (
					<>
						{frequency !== null ? (
							<p className="text-lg text-gray-400 mb-1">
								Frequency: <span className="font-bold text-gray-100">{frequency.toFixed(1)}</span> Hz
							</p>
						) : null}
						
						<p className="text-sm text-gray-500 mb-3">
						   Clarity: {(clarity * 100).toFixed(0)}%
						</p>
						
						{noteDetails ? (
							<div className="text-6xl font-bold text-cyan-300">
								<span className="align-top text-4xl mr-1">{noteDetails.note}</span>
								<span>{noteDetails.octave}</span>
								<p className={`text-xl font-normal mt-2 ${getCentsColor(noteDetails.centsOff)}`}>
								   Cents: <span className="font-semibold">{noteDetails.centsOff > 0 ? '+' : ''}{noteDetails.centsOff}</span>
								</p>
							</div>
						) : (
							<p className="text-2xl text-gray-500 animate-pulse h-[96px] flex items-center">Listening...</p> // Maintain height
						)}
					</>
				) : (
					<p className='text-xl text-gray-500 h-[96px] flex items-center'>Click &quot;Start Tuning&quot; to begin</p> // Maintain height
				)}
			</div>

		</div>
	);
};

export default TunerPage;
