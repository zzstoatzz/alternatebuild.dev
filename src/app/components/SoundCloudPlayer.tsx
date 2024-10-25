'use client';

import { useState, useEffect, useRef } from 'react';

const MinimizeIndicator = ({ onMinimize }: { onMinimize: () => void }) => (
    <div 
        className="absolute left-0 right-0 top-0 h-24 opacity-10 hover:opacity-30 cursor-pointer 
            flex items-center justify-center transition-opacity"
        onClick={onMinimize}
    >
        <div className="animate-bounce-subtle flex flex-col items-center pointer-events-none">
            <span className="block transform rotate-90 text-2xl tracking-widest font-thin">›</span>
            <span className="block transform rotate-90 text-2xl tracking-widest font-thin -mt-3">›</span>
        </div>
    </div>
);

export default function SoundCloudPlayer() {
    const [isMinimized, setIsMinimized] = useState(true);
    const [shouldShow, setShouldShow] = useState(true); // Set this to true by default
    const [username, setUsername] = useState("stoat-master");
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const widgetRef = useRef<any>(null);
    
    // Move the widget setup into a separate effect that depends on shouldShow
    useEffect(() => {
        if (!shouldShow) return; // Don't do anything if component isn't shown
        
        console.log('Setting up SoundCloud widget');
        
        const script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.async = true;
        document.body.appendChild(script);

        const setupWidget = () => {
            console.log('Setting up widget events');
            const iframe = document.querySelector('iframe');
            if (!iframe) {
                console.error('No iframe found');
                return;
            }

            try {
                const widget = (window as any).SC.Widget(iframe);
                widgetRef.current = widget;
                console.log('Widget initialized successfully');

                // Add periodic state checking
                const stateCheckInterval = setInterval(() => {
                    widget.getPosition((position: number) => {
                        if (position > 0) {
                            widget.isPaused((isPaused: boolean) => {
                                setIsPlaying(!isPaused);
                            });
                        }
                    });
                }, 1000);

                // Clean up interval on unmount
                return () => clearInterval(stateCheckInterval);

            } catch (error) {
                console.error('Error setting up widget:', error);
            }
        };

        script.onload = () => {
            console.log('SoundCloud script loaded');
            setTimeout(setupWidget, 1000);
        };

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, [shouldShow]); // Add shouldShow as a dependency

    const handleUsernameSubmit = (newUsername: string) => {
        setUsername(newUsername);
        localStorage.setItem('soundcloudUsername', newUsername);
        setShowUsernameModal(false);
    };

    // Add some debug logging
    console.log('Render SoundCloudPlayer', { isMinimized, isPlaying, shouldShow });

    if (!shouldShow) return null;
    
    return (
        <>
            <div 
                className={`fixed bottom-4 left-4 transition-all duration-300 ease-in-out z-50 
                    ${shouldShow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}
                    ${isMinimized ? 'h-12 w-12 cursor-pointer' : 'h-[465px] w-[320px]'}`}
                onClick={() => isMinimized ? setIsMinimized(false) : null}
            >
                <div className={`bg-black bg-opacity-80 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden h-full
                    ${isPlaying ? 'animate-glow bg-blue-500/5' : 'transition-[box-shadow,background-color] duration-75'}`}>
                    <div className="h-12 px-4 flex items-center justify-between bg-black bg-opacity-40">
                        <div className="w-full h-full flex items-center justify-between text-xl transition-colors group">
                            {isMinimized ? (
                                <span className="text-cyan-300 group-hover:text-cyan-400">♪</span>
                            ) : (
                                <>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMinimized(true);
                                        }}
                                        className="text-cyan-300 group-hover:text-cyan-400"
                                    >
                                        ♪
                                    </button>
                                    
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowUsernameModal(true);
                                        }}
                                        className="text-xs text-gray-500 opacity-40 hover:opacity-60 relative z-[60]"
                                        style={{ width: 'fit-content' }}
                                    >
                                        change user
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    <div className={`w-full transition-all duration-200 ${isMinimized ? 'opacity-0 h-0' : 'opacity-100 h-[calc(100%-3rem)]'}`}>
                        <iframe
                            width="100%"
                            height="100%"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/${username}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                        />
                        {!isMinimized && <MinimizeIndicator onMinimize={() => setIsMinimized(true)} />}
                    </div>
                </div>
            </div>

            {showUsernameModal && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowUsernameModal(false)}
                >
                    <div 
                        className="bg-black bg-opacity-80 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4"
                        onClick={e => e.stopPropagation()}
                    >
                        <input
                            type="text"
                            defaultValue={username}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUsernameSubmit(e.currentTarget.value);
                                }
                                if (e.key === 'Escape') {
                                    setShowUsernameModal(false);
                                }
                            }}
                            className="w-full bg-transparent border-b border-cyan-300/30 text-cyan-300 text-sm px-2 py-1 focus:outline-none focus:border-cyan-300"
                            placeholder="Enter SoundCloud username"
                            autoFocus
                        />
                        <div className="text-xs text-gray-500 mt-2 text-center opacity-50">
                            Press Enter to save, Esc or click outside to cancel
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
