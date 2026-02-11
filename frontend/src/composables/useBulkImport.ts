import { ref } from 'vue'
import readXlsxFile from 'read-excel-file'
import Papa from 'papaparse'
import { searchTMDB, getTMDBImageUrl } from '@/services/external/tmdb.service'
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
                                titulo: String(row[0] || ''),
                                estado: row[1] ? String(row[1]) : undefined,
                                nota: row[2] ? Number(row[2]) : undefined
                            })).filter(r => r.titulo && r.titulo.trim() !== '')
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
                        titulo: String(row[0]),
                        estado: row[1] ? String(row[1]) : undefined,
                        nota: row[2] ? Number(row[2]) : undefined
                    })).filter(r => r.titulo && r.titulo.trim() !== '')
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
                const tmdbResult = await searchTMDB(row.titulo, type)
                if (tmdbResult) {
                    item.titulo = tmdbResult.title || tmdbResult.name || row.titulo
                    item.descripcion = tmdbResult.overview
                    item.imagen = getTMDBImageUrl(tmdbResult.poster_path)
                    item.rating = tmdbResult.vote_average ? Math.round(tmdbResult.vote_average / 2) : item.rating // 1-10 to 1-5

                    if (tmdbResult.release_date || tmdbResult.first_air_date) {
                        item.fechaInicio = new Date(tmdbResult.release_date || tmdbResult.first_air_date!)
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
