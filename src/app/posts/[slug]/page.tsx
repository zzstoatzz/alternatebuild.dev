import { getPostBySlug, getAllPosts } from '@/utils/posts';
import type { Metadata } from 'next';
import PostContent from '@/app/components/PostContent';

interface PostPageProps {
    params: { slug: string };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
    const post = getPostBySlug(params.slug);
    return {
        title: post.title,
        description: post.excerpt,
    };
}

export default function PostPage({ params }: PostPageProps) {
    const post = getPostBySlug(params.slug);

    return (
        <article className="max-w-4xl mx-auto px-4 py-8 content-container">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-cyan-300 mb-2">{post.title}</h1>
                <p className="text-gray-400">{post.date}</p>
            </header>
            <PostContent content={post.content} />
        </article>
    );
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}