import { getPosts } from '@/utils/posts'
import { NextResponse } from 'next/server'

export async function GET() {
    const posts = getPosts()
    const postsWithContent = posts.map(post => ({
        ...post,
        content: post.content || ''
    }))
    return NextResponse.json(postsWithContent)
} 