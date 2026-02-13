import axios from 'axios'

const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY
const BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

export interface GoogleBookResult {
    id: string
    volumeInfo: {
        title: string
        authors?: string[]
        description?: string
        imageLinks?: {
            thumbnail?: string
            smallThumbnail?: string
        }
        publishedDate?: string
        publisher?: string
        pageCount?: number
        categories?: string[]
    }
}

export async function searchGoogleBooks(query: string): Promise<GoogleBookResult | null> {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return null

    try {
        const params: any = {
            q: `intitle:${trimmedQuery}`,
            maxResults: 1,
            langRestrict: 'es' // Prefer Spanish
        }

        if (GOOGLE_BOOKS_API_KEY) {
            params.key = GOOGLE_BOOKS_API_KEY
        }

        const response = await axios.get(BASE_URL, { params })

        const items = response.data.items as GoogleBookResult[]
        if (items && items.length > 0) {
            return items[0]
        }
        return null
    } catch (error: any) {
        console.error('Error searching Google Books:', error.message)
        return null
    }
}
