'use client'

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    if (isHomepage) {
        return <>{children}</>;
    }
    
    return (
        <>
            <main className="flex-grow container mx-auto px-4 py-8 overflow-y-auto">
                {children}
            </main>
            <Footer />
        </>
    );
}