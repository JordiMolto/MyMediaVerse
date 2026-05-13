import * as idb from '@/utils/db'
import * as api from '@/services/api/categories.api'
import { useAuthStore } from '@/stores/auth'
import { Category } from '@/types'

/**
 * Storage abstraction layer for categories
 * Uses Supabase if authenticated, otherwise IndexedDB
 */

export async function fetchCategories(): Promise<Category[]> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.fetchCategories()
  }
  return idb.getAllCategories()
}

export async function createCategory(category: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.createCategory(category)
  }
  
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
    userId: 'local-user',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  await idb.addCategory(newCategory)
  return newCategory
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.updateCategory(id, updates)
  }
  
  const categories = await idb.getAllCategories()
  const existingCategory = categories.find(c => c.id === id)
  if (!existingCategory) throw new Error('Category not found')
  
  const updatedCategory = { 
    ...existingCategory, 
    ...updates,
    updatedAt: new Date()
  }
  await idb.updateCategory(updatedCategory)
  return updatedCategory
}

export async function deleteCategory(id: string): Promise<void> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.deleteCategory(id)
  }
  return idb.deleteCategory(id)
}
