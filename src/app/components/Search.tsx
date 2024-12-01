'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Post {
    title: string
    slug: string
    date: string
    content?: string
}

export default function Search() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [posts, setPosts] = useState<Post[]>([])
    const router = useRouter()

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(setPosts)
            .catch(console.error)
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(prev => !prev)
                setQuery('')
                return
            }
            
            if (e.key === 'Escape' && isOpen) {
                e.preventDefault()
                setIsOpen(false)
                setQuery('')
                return
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const getHighlightedContent = (content: string, query: string) => {
        if (!query) return ''
        
        const lowerContent = content.toLowerCase()
        const lowerQuery = query.toLowerCase()
        const index = lowerContent.indexOf(lowerQuery)
        
        if (index === -1) return content.substring(0, 100) + '...'
        
        const start = Math.max(0, index - 40)
        const end = Math.min(content.length, index + query.length + 40)
        const excerpt = content.substring(start, end)
        
        return (
            (start > 0 ? '...' : '') +
            excerpt.replace(
                new RegExp(query, 'gi'),
                match => `<mark class="bg-cyan-900/50 text-cyan-100">${match}</mark>`
            ) +
            (end < content.length ? '...' : '')
        )
    }

    const filteredPosts = posts.filter(post => {
        const searchText = `${post.title} ${post.content || ''}`.toLowerCase()
        const searchQuery = query.toLowerCase()
        
        if (post.title.toLowerCase().includes(searchQuery)) {
            return true
        }
        
        return searchText.includes(searchQuery)
    })

    const handleSelect = (slug: string) => {
        router.push(`/posts/${slug}`)
        setIsOpen(false)
        setQuery('')
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false)
            setQuery('')
        }
    }

    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-gray-900 rounded-lg w-full max-w-lg shadow-2xl">
                <div className="p-4 border-b border-gray-800">
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent text-white outline-none"
                        autoFocus
                    />
                </div>
                <div className="max-h-96 overflow-auto">
                    {filteredPosts.map(post => (
                        <button
                            key={post.slug}
                            onClick={() => handleSelect(post.slug)}
                            className="w-full p-4 text-left hover:bg-gray-800 text-gray-300 hover:text-white"
                        >
                            <div className="font-medium">{post.title}</div>
                            {query && post.content && (
                                <div 
                                    className="text-sm text-gray-500 mt-1"
                                    dangerouslySetInnerHTML={{
                                        __html: getHighlightedContent(post.content, query)
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
} 