import { ref, computed } from 'vue'
import type { Item } from '@/types'

export function useBulkSelection() {
    const selectedIds = ref<Set<string>>(new Set())
    const isSelectionMode = ref(false)

    const selectedCount = computed(() => selectedIds.value.size)
    const hasSelection = computed(() => selectedCount.value > 0)

    function toggleSelection(id: string) {
        if (selectedIds.value.has(id)) {
            selectedIds.value.delete(id)
        } else {
            selectedIds.value.add(id)
        }
        // Trigger reactivity
        selectedIds.value = new Set(selectedIds.value)

        // Auto-enable selection mode when selecting first item
        if (selectedIds.value.size > 0) {
            isSelectionMode.value = true
        }
    }

    function isSelected(id: string): boolean {
        return selectedIds.value.has(id)
    }

    function selectAll(items: Item[]) {
        items.forEach(item => selectedIds.value.add(item.id))
        selectedIds.value = new Set(selectedIds.value)
        isSelectionMode.value = true
    }

    function clearSelection() {
        selectedIds.value.clear()
        selectedIds.value = new Set()
        isSelectionMode.value = false
    }

    function getSelectedItems(allItems: Item[]): Item[] {
        return allItems.filter(item => selectedIds.value.has(item.id))
    }

    return {
        selectedIds,
        selectedCount,
        hasSelection,
        isSelectionMode,
        toggleSelection,
        isSelected,
        selectAll,
        clearSelection,
        getSelectedItems
    }
}
