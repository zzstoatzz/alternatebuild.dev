import styles from './Nav.module.css';
import Link from 'next/link';

export default function Nav() {
    return (
        <nav className={styles.nav}>
            <ul className={styles.navList}>
                <li className={styles.navItem}>
                    <Link href="/" className={styles.navLink}>
                        <span className={styles.navLinkText}>Home</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link href="/about" className={styles.navLink}>
                        <span className={styles.navLinkText}>About</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link href="/contact" className={styles.navLink}>
                        <span className={styles.navLinkText}>Contact</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
}