'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Nav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        if (pathname === '/zen') {
            document.querySelector('nav')?.classList.remove('hidden');
            document.querySelector('.github-info')?.classList.remove('hidden');
            document.getElementById('exitZenMode')?.remove();
            router.push('/');
        } else if (href === '/zen') {
            router.push('/zen');
            if (typeof window.handleZenModeTransition === 'function') {
                window.handleZenModeTransition();
            }
        } else {
            router.push(href);
        }
    };

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
                            <Link
                                href={href}
                                className={`nav-link ${pathname === href ? 'current' : ''}`}
                                onClick={(e) => handleNavClick(e, href)}
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}