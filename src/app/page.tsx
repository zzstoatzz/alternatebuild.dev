'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('zenInstructionsSeen')) {
            setShowModal(true);
        }
    }, []);

    const handleDismiss = () => {
        setShowModal(false);
        localStorage.setItem('zenInstructionsSeen', 'true');
    };

    // Completely block all background activity if modal is shown
    if (showModal) {
        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]" 
                style={{ 
                    touchAction: 'none',
                    pointerEvents: 'auto'
                }}
            >
                <div className="bg-white p-6 rounded-lg shadow-xl text-center w-[90%] max-w-md">
                    <p className="mb-6 text-gray-800 text-lg">psst! click the mouse to push the particles around. see <b>particle settings</b> in the top right to edit physics</p>
                    <button 
                        onClick={handleDismiss} 
                        className="w-full py-4 bg-blue-500 text-white text-xl font-bold rounded-lg hover:bg-blue-600 active:bg-blue-700"
                        type="button"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="h-screen relative">
            {/* Main content only rendered when modal is closed */}
        </main>
    );
}