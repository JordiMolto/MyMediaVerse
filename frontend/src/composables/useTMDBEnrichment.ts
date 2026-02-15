import { ref } from 'vue'
import { useItemsStore } from '@/stores/items'
import { ItemType, type Item } from '@/types'
import { searchTMDB, getTMDBDetails, getTMDBImageUrl, getYouTubeTrailerUrl, getStreamingPlatforms } from '@/services/external/tmdb.service'

export function useTMDBEnrichment() {
    const itemsStore = useItemsStore()
    const isEnriching = ref(false)
    const enrichmentProgress = ref(0)
    const enrichmentTotal = ref(0)
    const enrichmentErrors = ref<string[]>([])

    function isEnrichable(type: string): boolean {
        const t = (type || '').toLowerCase()
        return [
            ItemType.MOVIE, ItemType.SERIES, ItemType.ANIME,
            'película', 'pelicula', 'serie', 'anime'
        ].some(v => t.includes(v.toLowerCase()))
    }

    function getTMDBType(type: string): ItemType {
        const t = (type || '').toLowerCase()
        if (t === ItemType.SERIES || t === ItemType.ANIME || t.includes('serie') || t.includes('anime')) {
            return ItemType.SERIES
        }
        return ItemType.MOVIE
    }

    async function enrichItemWithTMDB(item: Item): Promise<boolean> {
        // Only enrich movies, series, and anime
        if (!isEnrichable(item.tipo)) {
            return false
        }

        try {
            // Search for the item in TMDB
            const type = getTMDBType(item.tipo)
            const tmdbResult = await searchTMDB(item.titulo, type)

            if (!tmdbResult) {
                enrichmentErrors.value.push(`No se encontró "${item.titulo}" en TMDB`)
                return false
            }

            // Get detailed information
            const details = await getTMDBDetails(tmdbResult.id, type)

            if (!details) {
                enrichmentErrors.value.push(`No se pudieron obtener detalles de "${item.titulo}"`)
                return false
            }

            // Prepare updates
            const updates: Partial<Item> = {
                titulo: details.title || details.name || item.titulo,
                descripcion: details.overview || item.descripcion,
                imagen: getTMDBImageUrl(details.poster_path) || item.imagen,
                backdropImage: getTMDBImageUrl(details.backdrop_path),
                rating: details.vote_average ? Math.round(details.vote_average / 2) : item.rating,
                tagline: details.tagline
            }

            // Genres
            if (details.genres && details.genres.length > 0) {
                updates.genero = details.genres.map(g => g.name)
            }

            // Runtime/Duration
            if (details.runtime) {
                updates.duracion = details.runtime
            } else if (details.episode_run_time && details.episode_run_time.length > 0) {
                updates.duracion = details.episode_run_time[0]
            }

            // Series specific
            if (type === ItemType.SERIES || item.tipo === ItemType.ANIME) {
                updates.numberOfSeasons = details.number_of_seasons
                updates.numberOfEpisodes = details.number_of_episodes
            }

            // Cast (top 5)
            if (details.credits?.cast && details.credits.cast.length > 0) {
                updates.reparto = details.credits.cast.slice(0, 5).map(c => c.name)
            }

            // Trailer
            updates.trailer = getYouTubeTrailerUrl(details.videos)

            // Streaming platforms
            updates.streamingPlatforms = getStreamingPlatforms(details['watch/providers'])

            // Release date
            if (details.release_date || details.first_air_date) {
                updates.fechaInicio = new Date(details.release_date || details.first_air_date!)
            }

            // Update the item
            await itemsStore.updateItem(item.id, updates)
            return true
        } catch (error) {
            console.error(`Error enriching ${item.titulo}:`, error)
            enrichmentErrors.value.push(`Error al enriquecer "${item.titulo}"`)
            return false
        }
    }

    async function enrichMultipleItems(items: Item[]) {
        isEnriching.value = true
        enrichmentProgress.value = 0
        enrichmentTotal.value = items.length
        enrichmentErrors.value = []

        let successCount = 0

        for (const item of items) {
            const success = await enrichItemWithTMDB(item)
            if (success) {
                successCount++
            }
            enrichmentProgress.value++

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300))
        }

        isEnriching.value = false

        return {
            total: items.length,
            success: successCount,
            failed: items.length - successCount,
            errors: enrichmentErrors.value
        }
    }

    return {
        isEnriching,
        enrichmentProgress,
        enrichmentTotal,
        enrichmentErrors,
        enrichItemWithTMDB,
        enrichMultipleItems
    }
}
