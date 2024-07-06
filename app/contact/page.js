import Link from 'next/link';
import styles from './Contact.module.css';

export default function Contact() {
    return (
        <main className={styles.content}>

            <h1>Contact Me</h1>

            <div className={styles.contactContent}>
                <p>You can reach me at:</p>
                <ul>
                    <li>Email: <a href="mailto:zzstoatzz@protonmail.com">zzstoatzz@protonmail.com</a></li>
                    <li>Twitter: <a href="https://twitter.com/Nathan_Nowack" target="_blank" rel="noopener noreferrer">@Nathan_Nowack</a></li>
                    <li>GitHub: <a href="https://github.com/zzstoatzz" target="_blank" rel="noopener noreferrer">github.com/zzstoatzz</a></li>
                </ul>
                <p>I'll do my best to respond when I can - looking forward to hearing from you!</p>
            </div>
        </main>
    );
}