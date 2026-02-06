import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as storage from '@/services/storage/items.storage'
import { Item, ItemType, ItemStatus } from '@/types'

export const useItemsStore = defineStore('items', () => {
  const items = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed getters
  const pendingItems = computed(() => 
    items.value.filter(item => item.estado === ItemStatus.PENDING)
  )

  const inProgressItems = computed(() => 
    items.value.filter(item => item.estado === ItemStatus.IN_PROGRESS)
  )

  const completedItems = computed(() => 
    items.value.filter(item => item.estado === ItemStatus.COMPLETED)
  )

  // Actions
  async function fetchItems() {
    loading.value = true
    error.value = null
    try {
      items.value = await storage.getAllItems()
    } catch (e: any) {
      error.value = 'Error al cargar los items'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function getItemById(id: string): Promise<Item | undefined> {
    // First check in memory
    const cachedItem = items.value.find(item => item.id === id)
    if (cachedItem) return cachedItem

    // If not in memory, fetch from storage
    try {
      return await storage.getItemById(id)
    } catch (e: any) {
      console.error('Error fetching item:', e)
      return undefined
    }
  }

  async function createItem(itemData: Omit<Item, 'id' | 'fechaCreacion'>) {
    loading.value = true
    error.value = null
    try {
      const newItem = await storage.createItem(itemData)
      items.value.push(newItem)
      return newItem
    } catch (e: any) {
      error.value = 'Error al crear el item'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id: string, updates: Partial<Item>) {
    loading.value = true
    error.value = null
    try {
      const updatedItem = await storage.updateItem(id, updates)
      const index = items.value.findIndex(i => i.id === id)
      if (index !== -1) {
        items.value[index] = updatedItem
      }
      return updatedItem
    } catch (e: any) {
      error.value = 'Error al actualizar el item'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function changeStatus(id: string, status: ItemStatus) {
    const updates: Partial<Item> = { estado: status }
    
    if (status === ItemStatus.IN_PROGRESS) {
      const item = items.value.find(i => i.id === id)
      if (item && !item.fechaInicio) {
        updates.fechaInicio = new Date()
      }
    }
    
    if (status === ItemStatus.COMPLETED) {
      updates.fechaFin = new Date()
    }
    
    return updateItem(id, updates)
  }

  async function deleteItem(id: string) {
    loading.value = true
    error.value = null
    try {
      await storage.deleteItem(id)
      items.value = items.value.filter(i => i.id !== id)
    } catch (e: any) {
      error.value = 'Error al eliminar el item'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function filterItems(filters: {
    type?: ItemType
    status?: ItemStatus
    search?: string
  }) {
    let filtered = [...items.value]

    if (filters.type) {
      filtered = filtered.filter(item => item.tipo === filters.type)
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.estado === filters.status)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.titulo.toLowerCase().includes(searchLower) ||
        item.descripcion?.toLowerCase().includes(searchLower) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  return {
    items,
    loading,
    error,
    pendingItems,
    inProgressItems,
    completedItems,
    fetchItems,
    getItemById,
    createItem,
    updateItem,
    changeStatus,
    deleteItem,
    filterItems
  }
})
