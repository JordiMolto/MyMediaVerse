import axios from 'axios'

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY
const BASE_URL = 'https://api.rawg.io/api/games'

export interface RawgGameResult {
    id: number
    name: string
    description_raw?: string
    background_image: string | null
    released: string | null
    rating: number
    platforms?: { platform: { name: string } }[]
    developers?: { name: string }[]
    genres?: { name: string }[]
}

export async function searchRawgGames(query: string): Promise<RawgGameResult | null> {
    const trimmedQuery = query.trim()

    if (!RAWG_API_KEY) {
        console.warn('RAWG API Key missing. Please add VITE_RAWG_API_KEY to your .env file.')
        return null
    }

    if (!trimmedQuery) return null

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                key: RAWG_API_KEY,
                search: trimmedQuery,
                page_size: 1
            }
        })

        const results = response.data.results as RawgGameResult[]
        if (results && results.length > 0) {
            // RAWG search results are shallow, we might need to fetch detail if we want more info
            // but for bulk import, the search result usually has the image and basic info.
            return results[0]
        }
        return null
    } catch (error: any) {
        console.error('Error searching RAWG:', error.message)
        return null
    }
}
