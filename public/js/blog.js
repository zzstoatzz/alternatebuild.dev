import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

async function fetchBlogPosts() {
    try {
        const response = await fetch('https://api.github.com/repos/zzstoatzz/alternatebuild.dev/contents/_posts');
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        const posts = await response.json();
        return posts.filter(file => file.name.endsWith('.md'));
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
}

async function fetchPostContent(post) {
    try {
        const response = await fetch(post.download_url);
        if (!response.ok) throw new Error('Failed to fetch post content');
        return await response.text();
    } catch (error) {
        console.error(`Error fetching content for ${post.name}:`, error);
        return null;
    }
}

function parsePostContent(content) {
    const lines = content.split('\n');
    const frontMatter = {};
    let bodyContent = '';
    let inFrontMatter = false;

    for (const line of lines) {
        if (line.trim() === '---') {
            inFrontMatter = !inFrontMatter;
            continue;
        }

        if (inFrontMatter) {
            const [key, ...values] = line.split(':');
            if (key && values.length) {
                frontMatter[key.trim()] = values.join(':').trim().replace(/^"(.*)"$/, '$1');
            }
        } else {
            bodyContent += line + '\n';
        }
    }

    return { frontMatter, bodyContent };
}

function PostElement({ post }) {
    const previewContent = post.bodyContent.split('\n').slice(0, 3).join(' ') + '...';
    const title = post.frontMatter.title || post.name.replace('.md', '');
    const date = post.frontMatter.date || 'No date';

    return (
        <div className="blog-post">
            <h3>{title}</h3>
            <p><em>{date}</em></p>
            <div className="post-preview">
                <ReactMarkdown>{previewContent}</ReactMarkdown>
            </div>
            <a href={`post.html?post=${post.name.replace('.md', '')}`} className="read-more">Read more</a>
        </div>
    );
}

function BlogPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadBlogPosts() {
            try {
                const fetchedPosts = await fetchBlogPosts();
                const postContents = await Promise.all(fetchedPosts.map(fetchPostContent));
                const parsedPosts = postContents
                    .filter(content => content !== null)
                    .map(parsePostContent)
                    .map((post, index) => ({ ...post, name: fetchedPosts[index].name }));
                setPosts(parsedPosts);
            } catch (error) {
                console.error('Error loading blog posts:', error);
                setError('Failed to load blog posts.');
            } finally {
                setLoading(false);
            }
        }

        loadBlogPosts();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div><center><p>{error}</p></center></div>;
    if (posts.length === 0) return <div><p>No blog posts found.</p></div>;

    return (
        <div id="blog-posts">
            {posts.map((post, index) => (
                <PostElement key={index} post={post} />
            ))}
        </div>
    );
}

export default BlogPosts;
