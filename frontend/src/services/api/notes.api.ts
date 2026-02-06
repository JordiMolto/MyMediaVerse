import { supabase } from '@/config/supabase'
import { Note } from '@/types'

/**
 * Supabase API for notes
 * All functions require authentication
 */

export async function fetchNotesByItemId(itemId: string): Promise<Note[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(mapSupabaseNoteToLocal)
}

export async function createNote(note: Omit<Note, 'id' | 'fechaCreacion'>): Promise<Note> {
  if (!supabase) throw new Error('Supabase not configured')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const supabaseNote = {
    user_id: user.id,
    item_id: note.itemId,
    contenido: note.contenido,
    es_spoiler: note.esSpoiler
  }

  const { data, error } = await supabase
    .from('notes')
    .insert(supabaseNote)
    .select()
    .single()

  if (error) throw error

  return mapSupabaseNoteToLocal(data)
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  if (!supabase) throw new Error('Supabase not configured')

  const supabaseUpdates: any = {}
  
  if (updates.contenido !== undefined) supabaseUpdates.contenido = updates.contenido
  if (updates.esSpoiler !== undefined) supabaseUpdates.es_spoiler = updates.esSpoiler

  const { data, error } = await supabase
    .from('notes')
    .update(supabaseUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return mapSupabaseNoteToLocal(data)
}

export async function deleteNote(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured')

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Map Supabase note (snake_case) to local Note (camelCase)
 */
function mapSupabaseNoteToLocal(supabaseNote: any): Note {
  return {
    id: supabaseNote.id,
    itemId: supabaseNote.item_id,
    contenido: supabaseNote.contenido,
    esSpoiler: supabaseNote.es_spoiler,
    fechaCreacion: new Date(supabaseNote.created_at)
  }
}
