import styles from '../styles/Home.module.css';
import postsStyles from './posts/Posts.module.css';
import Link from 'next/link';
import { getPosts } from './posts/utils';

export default function Home() {
    const posts = getPosts();

    return (
        <main className={styles.main}>
            <div className={styles.imageContainer}>
                <img src="https://random-d.uk/api/randomimg" alt="Random Duck" className={styles.duckImage} />
            </div>
            <h1 className={styles.title}>Recent Posts</h1>
            <section className={styles.blogPosts}>
                {posts.map((post) => (
                    <div key={post.slug} className={postsStyles.blogPost}>
                        <h3 className={postsStyles.blogPostTitle}>{post.title}</h3>
                        <p><em>{post.date}</em></p>
                        <div className={postsStyles.postPreview}>{post.excerpt}</div>
                        <Link href={`/posts/${post.slug}`} className={postsStyles.readMore}>
                            <span className={postsStyles.readMoreText}>Read more</span>
                        </Link>
                    </div>
                ))}
            </section>
        </main>
    );
}