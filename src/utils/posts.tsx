import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src/app/posts')

export interface Post {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    content: string;
}

export const getPosts = (): Post[] => {
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data, content } = matter(fileContents);

            return {
                slug,
                title: data.title,
                date: data.date,
                excerpt: content.split('\n').slice(0, 3).join(' ') + '...',
                content,
            };
        });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getAllPosts = (): Post[] => {
    return getPosts();
};

export const getPostBySlug = (slug: string): Post => {
    const posts = getPosts();
    const post = posts.find(post => post.slug === slug);
    if (!post) {
        throw new Error(`Post with slug "${slug}" not found`);
    }
    return post;
}