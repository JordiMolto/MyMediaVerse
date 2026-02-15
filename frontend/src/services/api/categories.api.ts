import { supabase } from '@/config/supabase'
import { Category } from '@/types'

/**
 * Supabase API for categories
 * All functions require authentication
 */

export async function fetchCategories(): Promise<Category[]> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('nombre', { ascending: true })

    if (error) throw error

    return data.map(mapSupabaseCategoryToLocal)
}

export async function createCategory(category: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    if (!supabase) throw new Error('Supabase not configured')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const supabaseCategory = {
        user_id: user.id,
        nombre: category.nombre,
        icono: category.icono,
        color: category.color
    }

    const { data, error } = await supabase
        .from('categories')
        .insert(supabaseCategory)
        .select()
        .single()

    if (error) throw error

    return mapSupabaseCategoryToLocal(data)
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (!supabase) throw new Error('Supabase not configured')

    const supabaseUpdates: any = {}
    if (updates.nombre) supabaseUpdates.nombre = updates.nombre
    if (updates.icono) supabaseUpdates.icono = updates.icono
    if (updates.color) supabaseUpdates.color = updates.color

    const { data, error } = await supabase
        .from('categories')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error

    return mapSupabaseCategoryToLocal(data)
}

export async function deleteCategory(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured')

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) throw error
}

/**
 * Map Supabase category (snake_case) to local Category (camelCase)
 */
function mapSupabaseCategoryToLocal(supabaseCategory: any): Category {
    return {
        id: supabaseCategory.id,
        userId: supabaseCategory.user_id,
        nombre: supabaseCategory.nombre,
        icono: supabaseCategory.icono,
        color: supabaseCategory.color,
        createdAt: new Date(supabaseCategory.created_at),
        updatedAt: new Date(supabaseCategory.updated_at)
    }
}
