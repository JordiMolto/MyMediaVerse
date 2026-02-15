import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Category } from '@/types'
import * as categoriesApi from '@/services/api/categories.api'

export const useCategoriesStore = defineStore('categories', () => {
    const categories = ref<Category[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchCategories() {
        if (loading.value) return
        loading.value = true
        error.value = null
        try {
            const data = await categoriesApi.fetchCategories()

            // If user has no categories, seed defaults automatically
            if (data.length === 0) {
                console.log('No categories found, seeding defaults...')
                const defaults = [
                    { nombre: 'Películas', icono: 'fa-film', color: '#A855F7' },
                    { nombre: 'Series', icono: 'fa-tv', color: '#A855F7' },
                    { nombre: 'Libros', icono: 'fa-book', color: '#4CAF50' },
                    { nombre: 'Videojuegos', icono: 'fa-gamepad', color: '#00F5FF' },
                    { nombre: 'Juegos de Mesa', icono: 'fa-dice', color: '#FFC107' }
                ]

                for (const cat of defaults) {
                    await categoriesApi.createCategory(cat)
                }

                // Fetch again to get the newly created categories with IDs
                categories.value = await categoriesApi.fetchCategories()
            } else {
                categories.value = data
            }
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
