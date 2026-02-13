import axios from 'axios'
import { ItemType } from '@/types'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

export interface TMDBResult {
    id: number
    title: string
    name?: string // Series
    overview: string
    poster_path: string | null
    release_date?: string
    first_air_date?: string // Series
    vote_average: number
    media_type: 'movie' | 'tv'
}

export async function searchTMDB(query: string, type: ItemType): Promise<TMDBResult | null> {
    const trimmedQuery = query.trim()

    if (!TMDB_API_KEY) {
        console.error('TMDB API Key missing. Please add VITE_TMDB_API_KEY to your .env file.')
        return null
    }

    if (!trimmedQuery) return null

    const endpoint = type === ItemType.SERIES ? '/search/tv' : '/search/movie'

    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                query: trimmedQuery,
                language: 'es-ES', // Spanish results
                page: 1
            }
        })

        const results = response.data.results as TMDBResult[]
        if (results && results.length > 0) {
            // Return the best match (first result usually)
            return results[0]
        }
        return null
    } catch (error: any) {
        console.error('Error searching TMDB:', error?.response?.data || error.message)
        return null
    }
}

export function getTMDBImageUrl(path: string | null): string | undefined {
    if (!path) return undefined
    return `${IMAGE_BASE_URL}${path}`
}
