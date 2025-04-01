'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavigationDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    const closeDrawer = () => {
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={toggleDrawer}
                className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 bg-opacity-60 text-cyan-300/70 p-2 rounded-lg 
                       hover:bg-opacity-80 hover:text-cyan-300 transition-all
                       focus:outline-none focus:ring-1 focus:ring-cyan-300/30 text-xs"
                aria-label="Toggle Navigation"
                type="button"
            >
                nav
            </button>

            {/* Backdrop - always present but with opacity transition */}
            <div
                className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
                    isOpen ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0 pointer-events-none'
                }`}
                onClick={closeDrawer}
                onKeyDown={(e) => e.key === 'Escape' && closeDrawer()}
                role="button"
                tabIndex={0}
            />

            {/* Drawer Panel - always present but with transform transition */}
            <div
                className={`fixed top-0 left-1/2 -translate-x-1/2 w-64 bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-50 rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                }`}
            >
                <div className="p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-cyan-300 text-sm font-light">nav</h2>
                        <button
                            onClick={closeDrawer}
                            className="text-gray-400 hover:text-white text-xl"
                            aria-label="Close Navigation"
                            type="button"
                        >
                            &times;
                        </button>
                    </div>
                    <div>
                        <nav className="w-full">
                            <ul className="flex flex-col space-y-2">
                                {[
                                    { href: '/', label: 'home' },
                                    { href: '/about', label: 'about' },
                                    { href: '/contact', label: 'contact' },
                                ].map(({ href, label }) => (
                                    <li key={href} className={pathname === href ? "opacity-50" : ""}>
                                        <Link
                                            href={href}
                                            className="nav-link block text-base font-light hover:text-cyan-300 transition-colors"
                                            onClick={closeDrawer}
                                        >
                                            {label} {pathname === href && '*'}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
} 