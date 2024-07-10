'use client'

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        particlesInit: (canvas: HTMLCanvasElement) => void;
    }
}

export function ParticlesContainer() {
    const particlesInitialized = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const initParticles = () => {
            if (
                canvasRef.current &&
                typeof window.particlesInit === 'function' &&
                !particlesInitialized.current
            ) {
                console.log('Initializing particles');
                const canvas = canvasRef.current;
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                window.particlesInit(canvas);
                particlesInitialized.current = true;
            }
        };

        window.addEventListener('resize', initParticles);
        initParticles();

        return () => {
            window.removeEventListener('resize', initParticles);
        };
    }, []);

    return (
        <>
            <canvas
                id="particle-canvas"
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none z-0"
            />
            <Script
                src="/js/particles.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log('Particles script loaded');
                    if (
                        canvasRef.current &&
                        typeof window.particlesInit === 'function' &&
                        !particlesInitialized.current
                    ) {
                        const canvas = canvasRef.current;
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                        window.particlesInit(canvas);
                        particlesInitialized.current = true;
                    }
                }}
            />
        </>
    );
}