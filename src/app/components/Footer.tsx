import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="py-4 mt-6">
            <div className="container mx-auto flex flex-col items-center">
                <div className="flex space-x-4 mb-2">
                    <a 
                        href="mailto:zzstoatzz@protonmail.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="opacity-60 hover:opacity-100 transition-opacity hover:-translate-y-1 duration-300"
                    >
                        <Image src="/assets/images/email-icon.webp" alt="Email" width={20} height={20} />
                    </a>
                    <a 
                        href="https://x.com/Nathan_Nowack" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="opacity-60 hover:opacity-100 transition-opacity hover:-translate-y-1 duration-300"
                    >
                        <Image src="/assets/images/x-icon.png" alt="Twitter" width={20} height={20} />
                    </a>
                    <a 
                        href="https://github.com/zzstoatzz" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="opacity-60 hover:opacity-100 transition-opacity hover:-translate-y-1 duration-300"
                    >
                        <Image src="/assets/images/github-icon.png" alt="GitHub" width={20} height={20} />
                    </a>
                </div>
                <p className="text-xs text-gray-500">&copy; 2024 zzstoatzz</p>
            </div>
        </footer>
    );
}