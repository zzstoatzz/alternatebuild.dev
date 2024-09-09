'use client'

import { usePathname } from 'next/navigation';
import Nav from './Nav';
import Footer from './Footer';
import dynamic from 'next/dynamic';

const GithubInfo = dynamic(() => import('./GithubInfo'), { ssr: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isZenMode = pathname === '/zen';

    return (
        <>
            {!isZenMode && <Nav />}
            {!isZenMode && <GithubInfo />}
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            {!isZenMode && <Footer />}
        </>
    );
}