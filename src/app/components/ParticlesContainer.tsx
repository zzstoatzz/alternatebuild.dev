'use client'

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

declare global {
    interface Window {
        particlesInit: (canvas: HTMLCanvasElement) => void;
        handleZenModeTransition: () => void;
        particleSystem: ParticleSystem;
        nextRouter: AppRouterInstance;
    }
}

interface ParticleSystem {
    enterZenMode: () => void;
    mousePosition: { x: number; y: number };
    isMouseDown: boolean;
}

export function ParticlesContainer() {
    const particlesInitialized = useRef<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isZenMode = pathname === '/zen';

    useEffect(() => {
        window.nextRouter = router;

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

                if (isZenMode && window.particleSystem?.enterZenMode) {
                    window.particleSystem.enterZenMode();
                }
            }
        };

        window.handleZenModeTransition = () => {
            if (window.particleSystem?.enterZenMode) {
                try {
                    window.particleSystem.enterZenMode();
                } catch (error) {
                    console.warn('Failed to enter zen mode:', error);
                }
            }
        };

        const checkParticlesInit = setInterval(() => {
            if (typeof window.particlesInit === 'function') {
                clearInterval(checkParticlesInit);
                initParticles();
            }
        }, 100);

        return () => {
            clearInterval(checkParticlesInit);
        };
    }, [router, isZenMode]);

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
                        
                        if (isZenMode && window.particleSystem?.enterZenMode) {
                            window.particleSystem.enterZenMode();
                        }
                    }
                }}
            />
        </>
    );
}