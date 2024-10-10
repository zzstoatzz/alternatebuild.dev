'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  radius: number;
  color: string;
  mass: number;
  originalColor: string;
}

interface ParticleSystemProps {
  particleCount: number;
}

export default function ParticleSystem({ particleCount }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles and animation logic here
    // This will be implemented in the next steps

  }, [particleCount]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />;
}