import { getPostBySlug, getAllPosts } from '../../../lib/posts'
import { marked } from 'marked'

export default function Post({ params }) {
    const post = getPostBySlug(params.slug)

    return (
        <article className="post-content">
            <h2>{post.title}</h2>
            <p className="post-meta">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
            </p>
            <div className="post-body" dangerouslySetInnerHTML={{ __html: marked(post.content) }} />
        </article>
    )
}

export async function generateStaticParams() {
    const posts = getAllPosts()
    return posts.map((post) => ({
        slug: post.params.slug,
    }))
}