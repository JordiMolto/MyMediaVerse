import * as idb from '@/utils/db'
import * as api from '@/services/api/items.api'
import { useAuthStore } from '@/stores/auth'
import { Item, ItemStatus } from '@/types'

/**
 * Storage abstraction layer for items
 * Uses Supabase if authenticated, otherwise IndexedDB
 */

export async function getAllItems(): Promise<Item[]> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.fetchItems()
  }
  return idb.getAllItems()
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    const item = await api.getItemById(id)
    return item || undefined
  }
  return idb.getItemById(id)
}

export async function createItem(item: Omit<Item, 'id' | 'fechaCreacion'>): Promise<Item> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.createItem(item)
  }
  
  const newItem: Item = {
    ...item,
    id: crypto.randomUUID(),
    fechaCreacion: new Date()
  }
  
  // Set dates based on status
  if (newItem.estado === ItemStatus.IN_PROGRESS && !newItem.fechaInicio) {
    newItem.fechaInicio = new Date()
  }
  if (newItem.estado === ItemStatus.COMPLETED && !newItem.fechaFin) {
    newItem.fechaFin = new Date()
  }
  
  await idb.addItem(newItem)
  return newItem
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.updateItem(id, updates)
  }
  
  const existingItem = await idb.getItemById(id)
  if (!existingItem) throw new Error('Item not found')
  
  const updatedItem = { ...existingItem, ...updates }
  await idb.updateItem(updatedItem)
  return updatedItem
}

export async function deleteItem(id: string): Promise<void> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.deleteItem(id)
  }
  return idb.deleteItem(id)
}
