import { getPostBySlug, getAllPosts } from '../utils'
import { marked } from 'marked'
import styles from '../../posts/Post.module.css'

export default function Post({ params }) {
    const post = getPostBySlug(params.slug)

    marked.setOptions({
        highlight: function (code, lang) {
            const hljs = require('highlight.js');
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        },
    });

    return (
        <article className={styles.postContent}>
            <header className={styles.postHeader}>
                <h1>{post.title}</h1>
                <p className={styles.postMeta}>
                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                </p>
            </header>
            <div
                className={styles.postBody}
                dangerouslySetInnerHTML={{ __html: marked(post.content) }}
            />
        </article>
    )
}

export async function generateStaticParams() {
    const posts = getAllPosts()
    return posts.map((post) => ({
        slug: post.params.slug,
    }))
}