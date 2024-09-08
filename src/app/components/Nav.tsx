'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
    const pathname = usePathname();

    return (
        <nav className="nav">
            <div className="max-w-6xl mx-auto px-4">
                <ul className="flex justify-center space-x-10 h-16 items-center">
                    {[
                        { href: '/', label: 'Home' },
                        { href: '/about', label: 'About' },
                        { href: '/contact', label: 'Contact' },
                        { href: '/zen', label: 'Zen' },
                    ].map(({ href, label }) => (
                        <li key={href}>
                            <Link href={href} className={`nav-link ${pathname === href ? 'current' : ''}`}>
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}