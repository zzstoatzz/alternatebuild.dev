'use client';

import { useBackground } from '../contexts/BackgroundContext';
import { DEFAULT_IMAGES } from '../contexts/BackgroundContext';
import type { BackgroundType } from '../contexts/BackgroundContext';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function BackgroundSwitcher() {
    const { background, setBackground } = useBackground();
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomUrl, setShowCustomUrl] = useState(false);
    const pathname = usePathname();
    
    if (pathname === '/zen') return null;

    const handleTypeChange = (value: BackgroundType) => {
        setBackground({ ...background, type: value });
        setShowCustomUrl(false);
    };

    return (
        <div className="fixed top-4 left-4 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-800 bg-opacity-60 text-cyan-300/70 p-1.5 rounded-lg 
                    hover:bg-opacity-80 hover:text-cyan-300 transition-all scale-90
                    focus:outline-none focus:ring-1 focus:ring-cyan-300/30"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>

            {isOpen && (
                <div className="mt-2 bg-gray-800 bg-opacity-80 backdrop-blur-sm p-4 rounded-lg shadow-lg min-w-[300px]">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-cyan-300 mb-1">Background Type</label>
                            <select
                                value={background.type}
                                onChange={(e) => handleTypeChange(e.target.value as BackgroundType)}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            >
                                <option value="solid">Solid Color</option>
                                <option value="image">Image</option>
                            </select>
                        </div>

                        {background.type === 'solid' && (
                            <div>
                                <label className="block text-sm text-cyan-300 mb-1">Color</label>
                                <input
                                    type="color"
                                    value={background.color}
                                    onChange={(e) => setBackground({ ...background, color: e.target.value })}
                                    className="w-full h-8 rounded cursor-pointer"
                                />
                            </div>
                        )}

                        {background.type === 'image' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                    {DEFAULT_IMAGES.map((url, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setBackground({ ...background, imageUrl: url });
                                                setShowCustomUrl(false);
                                            }}
                                            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all
                                                ${background.imageUrl === url ? 'border-cyan-400' : 'border-transparent hover:border-cyan-400/50'}`}
                                        >
                                            <Image
                                                src={url}
                                                alt={`Background ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                                
                                <div>
                                    <button
                                        onClick={() => setShowCustomUrl(!showCustomUrl)}
                                        className="text-sm text-cyan-300 hover:text-cyan-400 transition-colors"
                                    >
                                        {showCustomUrl ? '- Hide Custom URL' : '+ Add Custom URL'}
                                    </button>
                                    
                                    {showCustomUrl && (
                                        <input
                                            type="text"
                                            value={background.imageUrl || ''}
                                            onChange={(e) => setBackground({ ...background, imageUrl: e.target.value })}
                                            placeholder="Enter image URL"
                                            className="mt-2 w-full bg-gray-700 text-white rounded p-2"
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 