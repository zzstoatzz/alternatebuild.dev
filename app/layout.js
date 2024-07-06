import '../styles/globals.css'
import { ParticlesContainer } from '../components/ParticlesContainer'

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <ParticlesContainer />
                <div className="content">
                    <nav>
                        <ul>
                            <li><a href="/">Home</a></li>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </nav>
                    {children}
                    <footer>
                        <ul className="footer-links">
                            <li>
                                <a href="mailto:zzstoatzz@protonmail.com" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/images/email-icon.webp" alt="Email" />
                                </a>
                            </li>
                            <li>
                                <a href="https://x.com/Nathan_Nowack" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/images/x-icon.png" alt="Twitter" />
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/zzstoatzz" target="_blank" rel="noopener noreferrer">
                                    <img src="/assets/images/github-icon.png" alt="GitHub" />
                                </a>
                            </li>
                        </ul>
                        <p>&copy; 2024 zzstoatzz</p>
                    </footer>
                </div>
            </body>
        </html>
    )
}