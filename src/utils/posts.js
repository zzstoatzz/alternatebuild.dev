import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'src/app/posts')

export const getPosts = () => {
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const slug = fileName.replace(/\.md$/, '')
            const fullPath = path.join(postsDirectory, fileName)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const { data, content } = matter(fileContents)

            return {
                slug,
                ...data,
                excerpt: content.split('\n').slice(0, 3).join(' ') + '...',
            }
        })

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1))
}


export const getAllPosts = () => {
    const fileNames = fs.readdirSync(postsDirectory)
    return fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => ({
            params: {
                slug: fileName.replace(/\.md$/, ''),
            },
        }))
}

export const getPostBySlug = (slug) => {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
        slug,
        content,
        ...data,
    }
}