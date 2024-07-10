import Link from 'next/link';

export default function Nav() {
    return (
        <nav className="nav">
            <div className="max-w-6xl mx-auto px-4">
                <ul className="flex justify-center space-x-10 h-16 items-center">
                    <li>
                        <Link href="/" className="nav-link">Home</Link>
                    </li>
                    <li>
                        <Link href="/about" className="nav-link">About</Link>
                    </li>
                    <li>
                        <Link href="/contact" className="nav-link">Contact</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}