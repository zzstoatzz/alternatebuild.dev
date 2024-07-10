import { Fira_Code } from 'next/font/google';
import '../styles/globals.css';
import { ParticlesContainer } from './components/ParticlesContainer';
import Nav from './components/Nav';
import Footer from './components/Footer';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

const GithubInfo = dynamic(() => import('./components/GithubInfo'), { ssr: false });

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
            <body className="bg-black text-white">
                <ParticlesContainer />
                <div className="relative z-10 min-h-screen flex flex-col">
                    <Nav />
                    <GithubInfo />
                    <main className="flex-grow container mx-auto px-4 py-8">
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}