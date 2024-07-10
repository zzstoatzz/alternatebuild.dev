import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="footer">
            <ul className="footer-icons">
                <li>
                    <a href="mailto:zzstoatzz@protonmail.com" target="_blank" rel="noopener noreferrer">
                        <Image src="/assets/images/email-icon.webp" alt="Email" width={24} height={24} className="footer-icon" />
                    </a>
                </li>
                <li>
                    <a href="https://x.com/Nathan_Nowack" target="_blank" rel="noopener noreferrer">
                        <Image src="/assets/images/x-icon.png" alt="Twitter" width={24} height={24} className="footer-icon" />
                    </a>
                </li>
                <li>
                    <a href="https://github.com/zzstoatzz" target="_blank" rel="noopener noreferrer">
                        <Image src="/assets/images/github-icon.png" alt="GitHub" width={24} height={24} className="footer-icon" />
                    </a>
                </li>
            </ul>
            <p className="footer-copyright">&copy; 2024 zzstoatzz</p>
        </footer>
    );
}