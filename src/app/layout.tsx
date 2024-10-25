import { Fira_Code } from 'next/font/google';
import '../styles/globals.css';
import { ParticlesContainer } from './components/ParticlesContainer';
import ConditionalLayout from './components/ConditionalLayout';
import type { Metadata } from 'next';
import Script from 'next/script';
import 'highlight.js/styles/atom-one-dark.css';
import SoundCloudPlayer from './components/SoundCloudPlayer';

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
            <head>
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-SLML4CSJ70"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', 'G-SLML4CSJ70');
                    `}
                </Script>
            </head>
            <body className="bg-[#0B0B03] text-white">
                <ParticlesContainer />
                <div className="relative z-10 min-h-screen flex flex-col">
                    <ConditionalLayout>
                        {children}
                    </ConditionalLayout>
                </div>
                <SoundCloudPlayer />
            </body>
        </html>
    );
}
