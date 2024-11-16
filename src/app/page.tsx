import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/utils/posts';

export default function Home() {
    const posts = getPosts();

    return (
        <main className="main-content">
            <div className="flex justify-center mb-8">
                <Image
                    src="https://random-d.uk/api/randomimg"
                    alt="Random Duck"
                    width={300}
                    height={300}
                    className="rounded-lg"
                />
            </div>
            <h1 className="text-4xl font-bold mb-6 text-center text-cyan-300">Recent Posts</h1>
            <section className="space-y-6">
                {posts.map((post) => (
                    <Link 
                        key={post.slug} 
                        href={`/posts/${post.slug}`}
                        className="block post-card group"
                    >
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-date">{post.date}</p>
                        <span className="read-more">
                            Read more
                        </span>
                    </Link>
                ))}
            </section>
        </main>
    );
}