import { computed } from 'vue'
import { useItemsStore } from '@/stores/items'

/**
 * Composable for item statistics
 * Provides computed properties for dashboard stats
 */
export function useItemStats() {
  const itemsStore = useItemsStore()

  const totalItems = computed(() => itemsStore.items.length)
  
  const pendingCount = computed(() => itemsStore.pendingItems.length)
  
  const inProgressCount = computed(() => itemsStore.inProgressItems.length)
  
  const completedCount = computed(() => itemsStore.completedItems.length)

  return {
    totalItems,
    pendingCount,
    inProgressCount,
    completedCount
  }
}
