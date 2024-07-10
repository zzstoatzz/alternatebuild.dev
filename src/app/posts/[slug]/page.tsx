import { getPostBySlug, getAllPosts } from '@/utils/posts';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import type { Metadata } from 'next';

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

    marked.setOptions({
        highlight: function (code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
        breaks: true,
        gfm: true,
    });

    // Custom renderer for code blocks
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
        const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
        const highlightedCode = hljs.highlight(validLanguage, code).value;
        return `<div class="hljs-code-block"><span class="hljs-language">${validLanguage}</span><pre><code class="hljs ${validLanguage}">${highlightedCode}</code></pre></div>`;
    };

    marked.use({ renderer });

    return (
        <article className="max-w-4xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-cyan-300 mb-2">{post.title}</h1>
                <p className="text-gray-400">{post.date}</p>
            </header>
            <div
                className="prose prose-invert prose-cyan max-w-none prose-headings:text-cyan-300 prose-a:text-cyan-400 prose-strong:text-cyan-200 prose-code:text-cyan-300 prose-pre:bg-transparent prose-pre:p-0"
                dangerouslySetInnerHTML={{ __html: marked(post.content) }}
            />
        </article>
    );
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}