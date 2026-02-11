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
    if (!TMDB_API_KEY) {
        console.warn('TMDB API Key missing')
        return null
    }

    const endpoint = type === ItemType.SERIES ? '/search/tv' : '/search/movie'

    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                query,
                language: 'es-ES', // Spanish results
                page: 1
            }
        })

        const results = response.data.results as TMDBResult[]
        if (results.length > 0) {
            // Return the best match (first result usually)
            return results[0]
        }
        return null
    } catch (error) {
        console.error('Error searching TMDB:', error)
        return null
    }
}

export function getTMDBImageUrl(path: string | null): string | undefined {
    if (!path) return undefined
    return `${IMAGE_BASE_URL}${path}`
}
