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
    backdrop_path: string | null
    release_date?: string
    first_air_date?: string // Series
    vote_average: number
    media_type: 'movie' | 'tv'
}

export interface TMDBDetailedResult extends TMDBResult {
    // Common
    genres: { id: number; name: string }[]
    runtime?: number // Movies (minutes)
    episode_run_time?: number[] // Series (minutes array)
    tagline?: string
    status: string
    original_language: string
    original_title?: string
    original_name?: string

    // Series specific
    number_of_seasons?: number
    number_of_episodes?: number

    // Additional data
    videos?: {
        results: {
            key: string
            site: string
            type: string
            official: boolean
        }[]
    }
    credits?: {
        cast: {
            id: number
            name: string
            character: string
            profile_path: string | null
        }[]
    }
    'watch/providers'?: {
        results: {
            ES?: {
                flatrate?: { provider_name: string; logo_path: string }[]
                rent?: { provider_name: string; logo_path: string }[]
                buy?: { provider_name: string; logo_path: string }[]
            }
        }
    }
}

export async function searchTMDBResults(query: string, type: ItemType | 'all'): Promise<TMDBResult[]> {
    const trimmedQuery = query.trim()

    if (!TMDB_API_KEY) {
        console.error('TMDB API Key missing.')
        return []
    }

    if (!trimmedQuery) return []

    // If type is 'all', we might want to use multi-search or just default to movie for this specific tool
    // But let's support tv/movie specifically
    const endpoint = type === ItemType.SERIES ? '/search/tv' : '/search/movie'

    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                query: trimmedQuery,
                language: 'es-ES',
                page: 1
            }
        })

        return (response.data.results as TMDBResult[]).map(r => ({
            ...r,
            media_type: type === ItemType.SERIES ? 'tv' : 'movie'
        }))
    } catch (error: any) {
        console.error('Error searching TMDB:', error?.response?.data || error.message)
        return []
    }
}

export async function searchTMDB(query: string, type: ItemType): Promise<TMDBResult | null> {
    const results = await searchTMDBResults(query, type)
    return results && results.length > 0 ? results[0] : null
}

export async function getTMDBDetails(id: number, type: ItemType): Promise<TMDBDetailedResult | null> {
    if (!TMDB_API_KEY) {
        console.error('TMDB API Key missing.')
        return null
    }

    const mediaType = type === ItemType.SERIES ? 'tv' : 'movie'

    try {
        const response = await axios.get(`${BASE_URL}/${mediaType}/${id}`, {
            params: {
                api_key: TMDB_API_KEY,
                language: 'es-ES',
                append_to_response: 'videos,credits,watch/providers'
            }
        })

        return response.data as TMDBDetailedResult
    } catch (error: any) {
        console.error('Error fetching TMDB details:', error?.response?.data || error.message)
        return null
    }
}

export function getTMDBImageUrl(path: string | null): string | undefined {
    if (!path) return undefined
    return `${IMAGE_BASE_URL}${path}`
}

export function getYouTubeTrailerUrl(videos?: TMDBDetailedResult['videos']): string | undefined {
    if (!videos?.results) return undefined

    // Find official trailer in Spanish or English
    const trailer = videos.results.find(
        v => v.site === 'YouTube' && v.type === 'Trailer' && v.official
    ) || videos.results.find(
        v => v.site === 'YouTube' && v.type === 'Trailer'
    )

    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : undefined
}

export function getStreamingPlatforms(providers?: TMDBDetailedResult['watch/providers']): string[] {
    if (!providers?.results?.ES) return []

    const platforms: string[] = []
    const esProviders = providers.results.ES

    if (esProviders.flatrate) {
        platforms.push(...esProviders.flatrate.map(p => p.provider_name))
    }

    return [...new Set(platforms)] // Remove duplicates
}
