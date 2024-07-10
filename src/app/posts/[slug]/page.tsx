import { getPostBySlug, getAllPosts } from '@/utils/posts'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/nord.css'

export default function Post({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug)

    marked.setOptions({
        highlight: function (code, lang) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
    });

    return (
        <article className="max-w-3xl mx-auto px-4 py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold text-cyan-400 mb-2">{post.title}</h1>
                <p className="text-gray-400">
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                </p>
            </header>
            <div
                className="prose prose-invert prose-cyan max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(post.content) }}
            />
        </article>
    )
}

export async function generateStaticParams() {
    const posts = getAllPosts()
    return posts.map((post) => ({
        slug: post.slug,
    }))
}