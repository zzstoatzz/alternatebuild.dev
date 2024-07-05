async function fetchPostContentByTitle(title) {
    try {
        const response = await fetch('https://api.github.com/repos/zzstoatzz/alternatebuild.dev/contents/_posts');
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        const posts = await response.json();
        const post = posts.find(file => file.name.replace('.md', '') === title);
        if (!post) throw new Error('Post not found');
        const postContent = await fetch(post.download_url);
        if (!postContent.ok) throw new Error('Failed to fetch post content');
        return await postContent.text();
    } catch (error) {
        console.error('Error fetching post content:', error);
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

async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('post');
    if (!title) return;

    const content = await fetchPostContentByTitle(title);
    if (!content) return;

    const { frontMatter, bodyContent } = parsePostContent(content);
    const postContainer = document.getElementById('post-content');
    postContainer.innerHTML = `
        <h2>${frontMatter.title || 'Untitled'}</h2>
        <p><em>${frontMatter.date || 'No date'}</em></p>
        <div>${marked.parse(bodyContent)}</div>
    `;
}

document.addEventListener('DOMContentLoaded', loadPost);
