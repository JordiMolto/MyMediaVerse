import * as idb from '@/utils/db'
import * as api from '@/services/api/notes.api'
import { useAuthStore } from '@/stores/auth'
import { Note } from '@/types'

/**
 * Storage abstraction layer for notes
 * Uses Supabase if authenticated, otherwise IndexedDB
 */

export async function getNotesByItemId(itemId: string): Promise<Note[]> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.fetchNotesByItemId(itemId)
  }
  return idb.getNotesByItemId(itemId)
}

export async function createNote(note: Omit<Note, 'id' | 'fechaCreacion'>): Promise<Note> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.createNote(note)
  }
  
  const newNote: Note = {
    ...note,
    id: crypto.randomUUID(),
    fechaCreacion: new Date()
  }
  
  await idb.addNote(newNote)
  return newNote
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.updateNote(id, updates)
  }
  
  const existingNote = await idb.getNoteById(id)
  if (!existingNote) throw new Error('Note not found')
  
  const updatedNote = { ...existingNote, ...updates }
  await idb.updateNote(updatedNote)
  return updatedNote
}

export async function deleteNote(id: string): Promise<void> {
  const authStore = useAuthStore()
  
  if (authStore.canUseSupabase) {
    return api.deleteNote(id)
  }
  return idb.deleteNote(id)
}
