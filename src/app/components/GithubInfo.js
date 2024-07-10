import Link from 'next/link';

export default function OpenSourceInfo() {
    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 bg-opacity-80 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg z-50">
            <p className="text-sm mb-2">This site is open source.</p>
            <Link
                href="https://github.com/zzstoatzz/alternatebuild.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 text-sm"
            >
                View the code on GitHub
            </Link>
        </div>
    );
}