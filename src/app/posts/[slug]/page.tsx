import { getPostBySlug, getAllPosts } from '@/utils/posts';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Changed to a dark theme

export default function Post({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);

    marked.setOptions({
        highlight: function (code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            const highlightedCode = hljs.highlight(code, { language }).value;
            return `<div class="hljs-code-block"><span class="hljs-language">${language}</span>${highlightedCode}</div>`;
        },
        breaks: true,
        gfm: true,
    });

    return (
        <article className="max-w-4xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-cyan-300 mb-2">{post.title}</h1>
                <p className="text-gray-400">
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                </p>
            </header>
            <div
                className="prose prose-invert prose-cyan max-w-none prose-headings:text-cyan-300 prose-a:text-cyan-400 prose-strong:text-cyan-200 prose-code:text-cyan-300 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-cyan-900"
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
