import { Fira_Code } from 'next/font/google';
import '../styles/globals.css';
import { ParticlesContainer } from './components/ParticlesContainer';
import Nav from './components/Nav';
import Footer from './components/Footer';
import styles from './components/Layout.module.css';

const firaCode = Fira_Code({
    subsets: ['latin'],
    weight: ['300', '400', '500'],
    variable: '--font-fira-code',
});

export const metadata = {
    title: 'n8',
    icons: {
        icon: '/assets/images/stoat.png',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={firaCode.variable}>
            <body>
                <ParticlesContainer />
                <div className={styles.mainContent}>
                    <Nav />
                    <main className={styles.pageContent}>
                        {children}
                    </main>
                    <Footer />
                </div>
            </body>
        </html>
    );
}