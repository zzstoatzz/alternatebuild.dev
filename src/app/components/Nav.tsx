import Link from 'next/link';

export default function Nav() {
    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-80 backdrop-blur-sm z-50">
            <div className="max-w-6xl mx-auto px-4">
                <ul className="flex justify-center space-x-8 h-16 items-center">
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