import { ref, computed } from 'vue'
import { Item, ItemType, ItemStatus } from '@/types'

/**
 * Composable for filtering items
 * Provides reactive filtering logic for item lists
 */
export function useItemFilters(items: Item[]) {
  const selectedType = ref<ItemType | null>(null)
  const selectedStatus = ref<ItemStatus | null>(null)

  const filteredItems = computed(() => {
    let filtered = [...items]

    if (selectedType.value) {
      filtered = filtered.filter(item => item.tipo === selectedType.value)
    }

    if (selectedStatus.value) {
      filtered = filtered.filter(item => item.estado === selectedStatus.value)
    }

    return filtered
  })

  function setTypeFilter(type: ItemType | null) {
    selectedType.value = type
  }

  function setStatusFilter(status: ItemStatus | null) {
    selectedStatus.value = status
  }

  function clearFilters() {
    selectedType.value = null
    selectedStatus.value = null
  }

  return {
    selectedType,
    selectedStatus,
    filteredItems,
    setTypeFilter,
    setStatusFilter,
    clearFilters
  }
}
