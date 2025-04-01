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

    return (
        <main className="h-screen relative">
            {/* The modal for particle instructions */}
            {showModal && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-80 p-6 rounded-lg shadow-lg text-center max-w-md z-50">
                    <p className="mb-4 text-gray-800">psst! click the mouse to push the particles around. see <b>particle settings</b> in the top right to edit physics</p>
                    <button 
                        onClick={handleDismiss} 
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        type="button"
                    >
                        Got it!
                    </button>
                </div>
            )}
        </main>
    );
}