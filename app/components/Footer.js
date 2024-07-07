import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <ul className={styles.footerLinks}>
                <li className={styles.footerItem}>
                    <a href="mailto:zzstoatzz@protonmail.com" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                        <img src="/assets/images/email-icon.webp" alt="Email" className={styles.footerIcon} />
                    </a>
                </li>
                <li className={styles.footerItem}>
                    <a href="https://x.com/Nathan_Nowack" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                        <img src="/assets/images/x-icon.png" alt="Twitter" className={styles.footerIcon} />
                    </a>
                </li>
                <li className={styles.footerItem}>
                    <a href="https://github.com/zzstoatzz" className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                        <img src="/assets/images/github-icon.png" alt="GitHub" className={styles.footerIcon} />
                    </a>
                </li>
            </ul>
            <p className={styles.footerCopyright}>&copy; 2024 zzstoatzz</p>
        </footer>
    );
}