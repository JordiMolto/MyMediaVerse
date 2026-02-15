import { ref } from 'vue'
import readXlsxFile from 'read-excel-file'
import Papa from 'papaparse'
import { searchTMDB, getTMDBImageUrl } from '@/services/external/tmdb.service'
import { searchGoogleBooks } from '@/services/external/google-books.service'
import { searchRawgGames } from '@/services/external/rawg.service'
import { Item, ItemType, ItemStatus } from '@/types'

interface ImportedRow {
    titulo: string
    estado?: string
    nota?: number
    [key: string]: any
}

interface EnrichedItem extends Partial<Item> {
    originalTitle: string
    found: boolean
    matchConfidence: string // 'high', 'low', 'none'
    id: string
}

export function useBulkImport() {
    const isProcessing = ref(false)
    const progress = ref(0)
    const processedItems = ref<EnrichedItem[]>([])
    const error = ref<string | null>(null)

    const parseFile = async (file: File): Promise<ImportedRow[]> => {
        error.value = null
        try {
            let data: ImportedRow[] = []

            if (file.name.toLowerCase().endsWith('.csv')) {
                return new Promise((resolve) => {
                    Papa.parse(file, {
                        complete: (results) => {
                            const rows = results.data as any[][]
                            data = rows.slice(1).map(row => ({
                                titulo: row[0] ? String(row[0]).trim() : '',
                                estado: row[1] ? String(row[1]).trim() : undefined,
                                nota: row[2] ? Number(row[2]) : undefined
                            })).filter(r => r.titulo !== '')
                            resolve(data)
                        },
                        error: (err: any) => {
                            console.error(err)
                            error.value = 'Error al leer el archivo CSV.'
                            resolve([])
                        },
                        header: false
                    })
                })
            } else {
                try {
                    const rows = await readXlsxFile(file)
                    data = rows.slice(1).map(row => ({
                        titulo: row[0] ? String(row[0]).trim() : '',
                        estado: row[1] ? String(row[1]).trim() : undefined,
                        nota: row[2] ? Number(row[2]) : undefined
                    })).filter(r => r.titulo !== '')
                    return data
                } catch (e) {
                    throw e
                }
            }
        } catch (e) {
            error.value = 'Error al leer el archivo. Asegúrate de usar la plantilla correcta (.csv o .xlsx).'
            console.error(e)
            return []
        }
    }

    const mapStatus = (status?: string): ItemStatus => {
        if (!status) return ItemStatus.PENDING
        const s = status.toLowerCase()
        if (s.includes('viendo') || s.includes('jugando') || s.includes('leyendo') || s.includes('progreso')) return ItemStatus.IN_PROGRESS
        if (s.includes('visto') || s.includes('terminado') || s.includes('acabado') || s.includes('completado')) return ItemStatus.COMPLETED
        return ItemStatus.PENDING
    }

    const enrichItems = async (rows: ImportedRow[], type: ItemType) => {
        isProcessing.value = true
        progress.value = 0
        const total = rows.length
        const results: EnrichedItem[] = []

        for (let i = 0; i < total; i++) {
            const row = rows[i]
            const item: EnrichedItem = {
                originalTitle: row.titulo,
                titulo: row.titulo, // Default to original
                tipo: type,
                estado: mapStatus(row.estado),
                rating: row.nota,
                found: false,
                matchConfidence: 'none',
                id: crypto.randomUUID(), // Temp ID
                fechaCreacion: new Date()
            }

            // Enrichment Logic
            if (type === ItemType.MOVIE || type === ItemType.SERIES) {
                const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
                if (!TMDB_KEY) {
                    error.value = 'Configuración incompleta: Falta la API Key de TMDB en el archivo .env.'
                    isProcessing.value = false
                    return
                }

                const tmdbResult = await searchTMDB(row.titulo, type)
                if (tmdbResult) {
                    // Get detailed information
                    const { getTMDBDetails, getYouTubeTrailerUrl, getStreamingPlatforms } = await import('@/services/external/tmdb.service')
                    const details = await getTMDBDetails(tmdbResult.id, type)

                    if (details) {
                        item.titulo = details.title || details.name || row.titulo
                        item.descripcion = details.overview
                        item.imagen = getTMDBImageUrl(details.poster_path)
                        item.backdropImage = getTMDBImageUrl(details.backdrop_path)
                        item.rating = details.vote_average ? Math.round(details.vote_average / 2) : item.rating
                        item.tagline = details.tagline

                        // Genres
                        if (details.genres && details.genres.length > 0) {
                            item.genero = details.genres.map(g => g.name)
                        }

                        // Runtime/Duration
                        if (details.runtime) {
                            item.duracion = details.runtime
                        } else if (details.episode_run_time && details.episode_run_time.length > 0) {
                            item.duracion = details.episode_run_time[0]
                        }

                        // Series specific
                        if (type === ItemType.SERIES) {
                            item.numberOfSeasons = details.number_of_seasons
                            item.numberOfEpisodes = details.number_of_episodes
                        }

                        // Cast (top 5)
                        if (details.credits?.cast && details.credits.cast.length > 0) {
                            item.reparto = details.credits.cast.slice(0, 5).map(c => c.name)
                        }

                        // Trailer
                        item.trailer = getYouTubeTrailerUrl(details.videos)

                        // Streaming platforms
                        item.streamingPlatforms = getStreamingPlatforms(details['watch/providers'])

                        // Release date
                        if (details.release_date || details.first_air_date) {
                            item.fechaInicio = new Date(details.release_date || details.first_air_date!)
                        }

                        item.found = true
                        item.matchConfidence = 'high'
                    }
                }
            } else if (type === ItemType.BOOK) {
                const bookResult = await searchGoogleBooks(row.titulo)
                if (bookResult) {
                    item.titulo = bookResult.volumeInfo.title
                    item.descripcion = bookResult.volumeInfo.description
                    item.imagen = bookResult.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:')
                    item.autor = bookResult.volumeInfo.authors?.join(', ')
                    item.editorial = bookResult.volumeInfo.publisher
                    item.duracion = bookResult.volumeInfo.pageCount // Pages

                    if (bookResult.volumeInfo.publishedDate) {
                        item.fechaInicio = new Date(bookResult.volumeInfo.publishedDate)
                    }

                    item.found = true
                    item.matchConfidence = 'high'
                }
            } else if (type === ItemType.VIDEOGAME) {
                const gameResult = await searchRawgGames(row.titulo)
                if (gameResult) {
                    item.titulo = gameResult.name
                    item.imagen = gameResult.background_image || undefined
                    item.rating = gameResult.rating ? Math.round(item.rating || (gameResult.rating)) : item.rating
                    item.developer = gameResult.developers?.[0]?.name
                    item.plataforma = gameResult.platforms?.[0]?.platform?.name

                    if (gameResult.released) {
                        item.fechaInicio = new Date(gameResult.released)
                    }

                    item.found = true
                    item.matchConfidence = 'high'
                }
            }

            results.push(item)
            progress.value = Math.round(((i + 1) / total) * 100)

            // Rate limiting: sleep 200ms
            await new Promise(resolve => setTimeout(resolve, 200))
        }

        processedItems.value = results
        isProcessing.value = false
    }

    const downloadTemplate = (type: ItemType) => {
        const headers = ['Titulo', 'Estado (Pendiente/Progreso/Completado)', 'Nota (1-5)']
        const examples = [
            ['Matrix', 'Completado', '5'],
            ['Inception', 'Pendiente', ''],
            ['Interstellar', 'Progreso', '4']
        ]

        let csvContent = headers.join(',') + '\n'
        examples.forEach(row => {
            csvContent += row.join(',') + '\n'
        })

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `plantilla_importacion_${type}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const parseAndEnrich = async (file: File, type: ItemType) => {
        isProcessing.value = true
        const rows = await parseFile(file)
        if (rows.length > 0) {
            await enrichItems(rows, type)
        } else {
            isProcessing.value = false
        }
    }

    return {
        isProcessing,
        progress,
        items: processedItems,
        error,
        parseAndEnrich,
        downloadTemplate
    }
}
