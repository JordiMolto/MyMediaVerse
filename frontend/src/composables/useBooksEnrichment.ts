import { ref } from 'vue'
import { useItemsStore } from '@/stores/items'
import { ItemType, type Item } from '@/types'
import { searchGoogleBooks } from '@/services/external/google-books.service'

export function useBooksEnrichment() {
    const itemsStore = useItemsStore()
    const isEnriching = ref(false)
    const enrichmentErrors = ref<string[]>([])

    async function enrichItemWithBooks(item: Item): Promise<boolean> {
        // Only enrich books
        if (item.tipo !== ItemType.BOOK && !item.tipo.toLowerCase().includes('libro')) {
            return false
        }

        try {
            // Search for the item in Google Books
            const bookResult = await searchGoogleBooks(item.titulo)

            if (!bookResult) {
                enrichmentErrors.value.push(`No se encontró "${item.titulo}" en Google Books`)
                return false
            }

            const details = bookResult.volumeInfo

            // Prepare updates
            const updates: Partial<Item> = {
                titulo: details.title || item.titulo,
                descripcion: details.description || item.descripcion,
                autor: details.authors ? details.authors.join(', ') : item.autor,
                editorial: details.publisher || item.editorial,
                duracion: details.pageCount ? details.pageCount : item.duracion,
                imagen: details.imageLinks?.thumbnail || details.imageLinks?.smallThumbnail || item.imagen
            }

            // Genres/Categories
            if (details.categories && details.categories.length > 0) {
                updates.genero = details.categories
            }

            // Publication date
            if (details.publishedDate) {
                // Google Books can return YYYY, YYYY-MM, or YYYY-MM-DD
                let dateStr = details.publishedDate
                if (dateStr.length === 4) dateStr += '-01-01'
                else if (dateStr.length === 7) dateStr += '-01'
                updates.fechaInicio = new Date(dateStr)
            }

            // Update the item
            await itemsStore.updateItem(item.id, updates)
            return true
        } catch (error) {
            console.error(`Error enriching book ${item.titulo}:`, error)
            enrichmentErrors.value.push(`Error al enriquecer "${item.titulo}"`)
            return false
        }
    }

    async function enrichMultipleBooks(items: Item[]) {
        isEnriching.value = true
        enrichmentErrors.value = []

        let successCount = 0

        for (const item of items) {
            const success = await enrichItemWithBooks(item)
            if (success) {
                successCount++
            }
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
        enrichmentErrors,
        enrichItemWithBooks,
        enrichMultipleBooks
    }
}
