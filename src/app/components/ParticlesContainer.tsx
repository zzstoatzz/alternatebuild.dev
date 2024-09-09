'use client'

import { useEffect, useRef } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        particlesInit: (canvas: HTMLCanvasElement) => void;
        handleZenModeTransition: () => void;
        particleSystem: any; // Add this line
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

        window.handleZenModeTransition = () => {
            if (window.particleSystem) {
                window.particleSystem.enterZenMode();
            }
        };

        window.addEventListener('resize', initParticles);

        // Wait for particlesInit to be defined
        const checkParticlesInit = setInterval(() => {
            if (typeof window.particlesInit === 'function') {
                clearInterval(checkParticlesInit);
                initParticles();
            }
        }, 100);

        return () => {
            window.removeEventListener('resize', initParticles);
            clearInterval(checkParticlesInit);
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