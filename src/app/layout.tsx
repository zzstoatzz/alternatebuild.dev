import { Fira_Code } from 'next/font/google';
import '../styles/globals.css';
import { ParticlesContainer } from './components/ParticlesContainer';
import ConditionalLayout from './components/ConditionalLayout';
import type { Metadata } from 'next';

const firaCode = Fira_Code({
    subsets: ['latin'],
    weight: ['300', '400', '500'],
    variable: '--font-fira-code',
});

export const metadata: Metadata = {
    title: 'n8',
    icons: {
        icon: '/assets/images/stoat.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${firaCode.variable} font-sans`}>
            <body className="bg-[#0B0B03] text-white">
                <ParticlesContainer />
                <div className="relative z-10 min-h-screen flex flex-col">
                    <ConditionalLayout>
                        {children}
                    </ConditionalLayout>
                </div>
            </body>
        </html>
    );
}