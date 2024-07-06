'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

export function ParticlesContainer() {
    const particlesInitialized = useRef(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const initParticles = () => {
            if (canvasRef.current && typeof window.particlesInit === 'function' && !particlesInitialized.current) {
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
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                }}
            />
            <Script
                src="/js/particles.js"
                strategy="afterInteractive"
                onLoad={() => {
                    console.log('Particles script loaded');
                    if (canvasRef.current && typeof window.particlesInit === 'function' && !particlesInitialized.current) {
                        const canvas = canvasRef.current;
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                        window.particlesInit(canvas);
                        particlesInitialized.current = true;
                    }
                }}
            />
        </>
    )
}