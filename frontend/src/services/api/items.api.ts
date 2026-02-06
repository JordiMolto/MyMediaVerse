import { supabase } from '@/config/supabase'
import { Item, ItemType, ItemStatus, Priority } from '@/types'

/**
 * Supabase API for items
 * All functions require authentication
 */

export async function fetchItems(): Promise<Item[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('fecha_creacion', { ascending: false })

  if (error) throw error

  return data.map(mapSupabaseItemToLocal)
}

export async function getItemById(id: string): Promise<Item | null> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error

  return data ? mapSupabaseItemToLocal(data) : null
}

export async function createItem(item: Omit<Item, 'id' | 'fechaCreacion'>): Promise<Item> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const supabaseItem = {
    user_id: user.id,
    tipo: item.tipo,
    titulo: item.titulo,
    estado: item.estado,
    prioridad: item.prioridad,
    rating: item.rating,
    descripcion: item.descripcion,
    tags: item.tags,
    fecha_inicio: item.fechaInicio,
    fecha_fin: item.fechaFin
  }

  const { data, error } = await supabase
    .from('items')
    .insert(supabaseItem)
    .select()
    .single()

  if (error) throw error

  return mapSupabaseItemToLocal(data)
}

export async function updateItem(id: string, updates: Partial<Item>): Promise<Item> {
  if (!supabase) throw new Error('Supabase not configured')

  const supabaseUpdates: any = {}
  
  if (updates.tipo) supabaseUpdates.tipo = updates.tipo
  if (updates.titulo) supabaseUpdates.titulo = updates.titulo
  if (updates.estado) supabaseUpdates.estado = updates.estado
  if (updates.prioridad !== undefined) supabaseUpdates.prioridad = updates.prioridad
  if (updates.rating !== undefined) supabaseUpdates.rating = updates.rating
  if (updates.descripcion !== undefined) supabaseUpdates.descripcion = updates.descripcion
  if (updates.tags !== undefined) supabaseUpdates.tags = updates.tags
  if (updates.fechaInicio !== undefined) supabaseUpdates.fecha_inicio = updates.fechaInicio
  if (updates.fechaFin !== undefined) supabaseUpdates.fecha_fin = updates.fechaFin

  const { data, error } = await supabase
    .from('items')
    .update(supabaseUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapSupabaseItemToLocal(data)
}

export async function deleteItem(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Map Supabase item (snake_case) to local Item (camelCase)
 */
function mapSupabaseItemToLocal(supabaseItem: any): Item {
  return {
    id: supabaseItem.id,
    tipo: supabaseItem.tipo as ItemType,
    titulo: supabaseItem.titulo,
    estado: supabaseItem.estado as ItemStatus,
    prioridad: supabaseItem.prioridad as Priority | undefined,
    rating: supabaseItem.rating,
    descripcion: supabaseItem.descripcion,
    tags: supabaseItem.tags,
    fechaCreacion: new Date(supabaseItem.fecha_creacion),
    fechaInicio: supabaseItem.fecha_inicio ? new Date(supabaseItem.fecha_inicio) : undefined,
    fechaFin: supabaseItem.fecha_fin ? new Date(supabaseItem.fecha_fin) : undefined
  }
}
