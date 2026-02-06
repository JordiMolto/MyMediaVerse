import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as storage from '@/services/storage/notes.storage'
import { Note } from '@/types'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchNotesByItemId(itemId: string): Promise<Note[]> {
    loading.value = true
    error.value = null
    try {
      return await storage.getNotesByItemId(itemId)
    } catch (e: any) {
      error.value = 'Error al cargar las notas'
      console.error(e)
      return []
    } finally {
      loading.value = false
    }
  }

  async function createNote(noteData: Omit<Note, 'id' | 'fechaCreacion'>) {
    loading.value = true
    error.value = null
    try {
      const newNote = await storage.createNote(noteData)
      notes.value.unshift(newNote)
      return newNote
    } catch (e: any) {
      error.value = 'Error al crear la nota'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateNote(id: string, updates: Partial<Note>) {
    loading.value = true
    error.value = null
    try {
      const updatedNote = await storage.updateNote(id, updates)
      const index = notes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notes.value[index] = updatedNote
      }
      return updatedNote
    } catch (e: any) {
      error.value = 'Error al actualizar la nota'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteNote(id: string) {
    loading.value = true
    error.value = null
    try {
      await storage.deleteNote(id)
      notes.value = notes.value.filter(n => n.id !== id)
    } catch (e: any) {
      error.value = 'Error al eliminar la nota'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    notes,
    loading,
    error,
    fetchNotesByItemId,
    createNote,
    updateNote,
    deleteNote
  }
})
