'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function Home() {
    const [showModal, setShowModal] = useState(false);

    // Define handleDismiss with useCallback to avoid dependency issues
    const handleDismiss = useCallback(() => {
        setShowModal(false);
        localStorage.setItem('zenInstructionsSeen', 'true');
        
        // Force reload to ensure clean state
        window.location.reload();
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('zenInstructionsSeen')) {
            setShowModal(true);
        }
        
        // Add a universal force-dismiss click/touch handler
        const handleForceClose = () => {
            if (showModal) {
                handleDismiss();
            }
        };
        
        // Ensure any click/touch anywhere on screen will dismiss
        document.addEventListener('click', handleForceClose);
        document.addEventListener('touchend', handleForceClose);
        
        return () => {
            document.removeEventListener('click', handleForceClose);
            document.removeEventListener('touchend', handleForceClose);
        };
    }, [showModal, handleDismiss]);

    // Full page modal approach
    if (showModal) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-[9999]">
                <div className="bg-white p-8 rounded-lg shadow-xl text-center w-[90%] max-w-md">
                    <p className="mb-8 text-gray-800 text-lg">
                        psst! click the mouse to push the particles around. 
                        see <b>particle settings</b> in the top right to edit physics
                    </p>
                    <button 
                        onClick={handleDismiss}
                        className="w-full py-6 bg-blue-500 text-white text-2xl font-bold rounded-lg"
                        type="button"
                    >
                        TAP ANYWHERE TO DISMISS
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