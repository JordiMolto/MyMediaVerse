import { computed, ref } from 'vue'
import { useItemsStore } from '@/stores/items'
import { ItemType, Item } from '@/types'

export interface DashboardStats {
    totalItems: number
    totalCompleted: number
    totalThisYear: number
    avgRating: number
    totalInProgress: number
    byMonth: { month: string, count: number }[]
    topRated: Item[]
    backlog: {
        oldestPending: Item | null
        bestRatedPending: Item | null
        randomPending: Item | null
    }
}

export function useDashboardStats() {
    const itemsStore = useItemsStore()
    const selectedType = ref<ItemType | 'all'>('all')
    const currentYear = new Date().getFullYear()

    // Robust mapping for types
    const typeMapping: Record<string, string[]> = {
        'movie': ['movie', 'película', 'pelicula', 'cine'],
        'series': ['series', 'serie', 'tv'],
        'anime': ['anime', 'animación', 'animacion'],
        'book': ['book', 'libro', 'lectura'],
        'videogame': ['videogame', 'videojuego', 'game', 'consola'],
        'boardgame': ['boardgame', 'juego de mesa', 'board game', 'mesa']
    }

    // Helper to check if an item matches a specific filter type
    const matchesType = (itemType: string | undefined, filterType: string) => {
        if (!itemType) return false
        const s = itemType.toString().toLowerCase()
        const f = filterType.toLowerCase()

        if (s === f) return true

        // Specific collision: 'juego de mesa' should not match 'videogame'
        if (f === 'videogame' && s.includes('mesa')) return false

        // Check mapping
        if (typeMapping[f]) {
            return typeMapping[f].some(m => s.includes(m))
        }

        return s.includes(f)
    }

    // Base filtered items
    const filteredItems = computed(() => {
        const typeValue = selectedType.value
        if (typeValue === 'all') {
            return itemsStore.items
        }

        return itemsStore.items.filter(item => matchesType(item.tipo, typeValue as string))
    })

    const stats = computed((): DashboardStats => {
        const items = filteredItems.value

        // Helper to normalize status comparison (English and Spanish)
        const hasStatus = (item: Item, status: string) => {
            const s = item.estado?.toString().toLowerCase()
            if (!s) return false

            const normalizedStatus = status.toLowerCase()

            if (normalizedStatus === 'completed') {
                return ['completed', 'completado', 'terminado', 'leído', 'visto'].includes(s)
            }
            if (normalizedStatus === 'in_progress') {
                return ['in_progress', 'en progreso', 'en curso', 'jugando', 'leyendo', 'viendo'].includes(s)
            }
            if (normalizedStatus === 'pending') {
                return ['pending', 'pendiente', 'por ver', 'por leer', 'backlog'].includes(s)
            }
            if (normalizedStatus === 'abandoned') {
                return ['abandoned', 'abandonado', 'dejado'].includes(s)
            }

            return s === normalizedStatus
        }

        const completed = items.filter(i => hasStatus(i, 'completed'))
        const inProgress = items.filter(i => hasStatus(i, 'in_progress'))
        const pending = items.filter(i => hasStatus(i, 'pending'))

        // This year completed
        const thisYear = completed.filter(i => {
            if (!i.fechaFin) return false
            try {
                const finDate = new Date(i.fechaFin)
                return finDate.getFullYear() === currentYear
            } catch {
                return false
            }
        })

        // Avg Rating
        const ratedItems = completed.filter(i => i.rating && i.rating > 0)
        const avgRating = ratedItems.length > 0
            ? ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length
            : 0

        // Total In Progress
        const totalInProgress = inProgress.length

        // Monthly stats for current year
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        const byMonth = months.map((month, idx) => {
            const count = thisYear.filter(i => {
                if (!i.fechaFin) return false
                try {
                    return new Date(i.fechaFin).getMonth() === idx
                } catch {
                    return false
                }
            }).length
            return { month, count }
        })

        // Top Rated (Top 5)
        const topRated = [...completed]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 5)

        // Backlog
        const oldestPending = [...pending]
            .sort((a, b) => {
                const dateA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0
                const dateB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0
                return dateA - dateB
            })[0] || null

        const bestRatedPending = [...pending]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0] || null

        const randomPending = pending.length > 0
            ? pending[Math.floor(Math.random() * pending.length)]
            : null

        return {
            totalItems: items.length,
            totalCompleted: completed.length,
            totalThisYear: thisYear.length,
            avgRating: Number(avgRating.toFixed(1)),
            totalInProgress,
            byMonth,
            topRated,
            backlog: {
                oldestPending,
                bestRatedPending,
                randomPending
            }
        }
    })

    const insights = computed(() => {
        const allItems = itemsStore.items

        // Helper to normalize status comparison for insights
        const isCompleted = (item: Item) => {
            const s = item.estado?.toString().toLowerCase()
            return ['completed', 'completado', 'terminado', 'leído', 'visto'].includes(s || '')
        }

        const completed = allItems.filter(isCompleted)

        if (completed.length === 0) return []

        const insightList: string[] = []

        // Most consumed format
        const typeCounts: Record<string, number> = {}
        completed.forEach(i => {
            const type = i.tipo?.toString().toLowerCase() || 'unknown'
            let mappedType = type

            // Map to standard internal keys
            for (const [key, aliases] of Object.entries(typeMapping)) {
                if (aliases.some(a => type.includes(a))) {
                    mappedType = key
                    break
                }
            }

            typeCounts[mappedType] = (typeCounts[mappedType] || 0) + 1
        })
        const mostConsumed = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]
        if (mostConsumed) {
            insightList.push(`Tu formato más consumido es ${formatLabel(mostConsumed[0])}.`)
        }

        // Most active month
        const monthCounts: Record<number, number> = {}
        completed.forEach(i => {
            if (i.fechaFin) {
                try {
                    const m = new Date(i.fechaFin).getMonth()
                    monthCounts[m] = (monthCounts[m] || 0) + 1
                } catch { }
            }
        })
        const mostActiveMonthIdx = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]
        if (mostActiveMonthIdx) {
            const monthsNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
            insightList.push(`Tu mes más activo históricamente es ${monthsNames[Number(mostActiveMonthIdx[0])]}.`)
        }

        return insightList
    })

    function formatLabel(type: string): string {
        const labels: Record<string, string> = {
            'movie': 'Películas',
            'series': 'Series',
            'anime': 'Anime',
            'book': 'Libros',
            'videogame': 'Videojuegos',
            'boardgame': 'Juegos de Mesa'
        }
        return labels[type] || type
    }

    function formatType(type: ItemType): string {
        return formatLabel(type.toString().toLowerCase())
    }

    return {
        selectedType,
        stats,
        insights,
        formatType
    }
}
