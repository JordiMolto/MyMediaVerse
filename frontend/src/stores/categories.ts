import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Category } from '@/types'
import * as categoriesApi from '@/services/api/categories.api'

export const useCategoriesStore = defineStore('categories', () => {
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchCategories() {
        loading.value = true
        error.value = null
        try {
            categories.value = await categoriesApi.fetchCategories()
        } catch (err: any) {
            error.value = err.message || 'Error al cargar categorías'
            console.error('Error fetching categories:', err)
        } finally {
            loading.value = false
        }
    }

    async function createCategory(category: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
        loading.value = true
        error.value = null
        try {
            const newCategory = await categoriesApi.createCategory(category)
            categories.value.push(newCategory)
            return newCategory
        } catch (err: any) {
            error.value = err.message || 'Error al crear categoría'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateCategory(id: string, updates: Partial<Category>) {
        loading.value = true
        error.value = null
        try {
            const updated = await categoriesApi.updateCategory(id, updates)
            const index = categories.value.findIndex(c => c.id === id)
            if (index !== -1) {
                categories.value[index] = updated
            }
            return updated
        } catch (err: any) {
            error.value = err.message || 'Error al actualizar categoría'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteCategory(id: string) {
        loading.value = true
        error.value = null
        try {
            await categoriesApi.deleteCategory(id)
            categories.value = categories.value.filter(c => c.id !== id)
        } catch (err: any) {
            error.value = err.message || 'Error al eliminar categoría'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory
    }
})
