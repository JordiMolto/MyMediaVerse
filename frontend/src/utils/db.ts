import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Item, Note } from '@/types'

interface MyMediaVerseDB extends DBSchema {
  items: {
    key: string
    value: Item
    indexes: { 'by-tipo': string; 'by-estado': string }
  }
  notes: {
    key: string
    value: Note
    indexes: { 'by-itemId': string }
  }
  categories: {
    key: string
    value: any
  }
}

const DB_NAME = 'MyMediaVerseDB'
const DB_VERSION = 2

let dbInstance: IDBPDatabase<MyMediaVerseDB> | null = null

export async function initDB(): Promise<IDBPDatabase<MyMediaVerseDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<MyMediaVerseDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Create items store
      if (!db.objectStoreNames.contains('items')) {
        const itemStore = db.createObjectStore('items', { keyPath: 'id' })
        itemStore.createIndex('by-tipo', 'tipo')
        itemStore.createIndex('by-estado', 'estado')
      }

      // Create notes store
      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' })
        noteStore.createIndex('by-itemId', 'itemId')
      }

      // Create categories store
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' })
      }
    }
  })

  return dbInstance
}

// Items CRUD
export async function getAllItems(): Promise<Item[]> {
  const db = await initDB()
  return db.getAll('items')
}

export async function getItemById(id: string): Promise<Item | undefined> {
  const db = await initDB()
  return db.get('items', id)
}

export async function addItem(item: Item): Promise<string> {
  const db = await initDB()
  return db.add('items', item)
}

export async function updateItem(item: Item): Promise<string> {
  const db = await initDB()
  return db.put('items', item)
}

export async function deleteItem(id: string): Promise<void> {
  const db = await initDB()
  await db.delete('items', id)
}

// Notes CRUD
export async function getAllNotes(): Promise<Note[]> {
  const db = await initDB()
  return db.getAll('notes')
}

export async function getNotesByItemId(itemId: string): Promise<Note[]> {
  const db = await initDB()
  return db.getAllFromIndex('notes', 'by-itemId', itemId)
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  const db = await initDB()
  return db.get('notes', id)
}

export async function addNote(note: Note): Promise<string> {
  const db = await initDB()
  return db.add('notes', note)
}

export async function updateNote(note: Note): Promise<string> {
  const db = await initDB()
  return db.put('notes', note)
}

export async function deleteNote(id: string): Promise<void> {
  const db = await initDB()
  await db.delete('notes', id)
}

// Categories CRUD
export async function getAllCategories(): Promise<any[]> {
  const db = await initDB()
  return db.getAll('categories')
}

export async function addCategory(category: any): Promise<string> {
  const db = await initDB()
  return db.add('categories', category)
}

export async function updateCategory(category: any): Promise<string> {
  const db = await initDB()
  return db.put('categories', category)
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await initDB()
  await db.delete('categories', id)
}
