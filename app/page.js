import { getPosts } from '../lib/posts'

export default function Home() {
    const posts = getPosts()

    return (
        <main>
            <img src="https://random-d.uk/api/randomimg" alt="Random Duck" className="duck-image" />
            <h1>Recent Posts</h1>
            <section id="blog-posts">
                {posts.map((post) => (
                    <div key={post.slug} className="blog-post">
                        <h3>{post.title}</h3>
                        <p><em>{post.date}</em></p>
                        <div className="post-preview">{post.excerpt}</div>
                        <a href={`/posts/${post.slug}`} className="read-more">Read more</a>
                    </div>
                ))}
            </section>
        </main>
    )
}