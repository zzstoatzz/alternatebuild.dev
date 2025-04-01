'use client'

import { usePathname } from 'next/navigation';
import Footer from './Footer';
import dynamic from 'next/dynamic';

const GithubInfo = dynamic(() => import('./GithubInfo'), { ssr: false });

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    if (isHomepage) {
        return <>{children}</>;
    }
    
    return (
        <>
            <div className="github-info"><GithubInfo /></div>
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </>
    );
}