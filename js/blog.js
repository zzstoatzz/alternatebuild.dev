async function fetchBlogPosts() {
    try {
        const response = await fetch('https://api.github.com/repos/zzstoatzz/zzstoatzz.github.io/contents/_posts');
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
            const [key, value] = line.split(':').map(part => part.trim());
            frontMatter[key] = value;
        } else {
            bodyContent += line + '\n';
        }
    }

    return { frontMatter, bodyContent };
}

function renderBlogPosts(posts) {
    const blogPostsContainer = document.getElementById('blog-posts');
    blogPostsContainer.innerHTML = '';

    if (posts.length === 0) {
        blogPostsContainer.innerHTML = '<p>No blog posts found.</p>';
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'blog-post';
        postElement.innerHTML = `
            <h3>${post.frontMatter.title || 'Untitled'}</h3>
            <p><em>${post.frontMatter.date || 'No date'}</em></p>
            ${marked(post.bodyContent)}
        `;
        blogPostsContainer.appendChild(postElement);
    });
}

async function loadBlogPosts() {
    try {
        const posts = await fetchBlogPosts();
        const postContents = await Promise.all(posts.map(fetchPostContent));
        const parsedPosts = postContents
            .filter(content => content !== null)
            .map(parsePostContent);
        renderBlogPosts(parsedPosts);
    } catch (error) {
        console.error('Error loading blog posts:', error);
        document.getElementById('blog-posts').innerHTML = '<center><p>Failed to load blog posts.</p></center>';
    }
}

document.addEventListener('DOMContentLoaded', loadBlogPosts);