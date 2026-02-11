<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useNotesStore } from '@/stores/notes'
import { Item, ItemType, ItemStatus } from '@/types'
import AppButton from '@/components/common/app-button/AppButton.vue'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import ItemForm from '@/components/items/ItemForm.vue'
import NoteForm from '@/components/notes/NoteForm.vue'
import NoteCard from '@/components/notes/NoteCard.vue'

const route = useRoute()
const router = useRouter()
const itemsStore = useItemsStore()
const notesStore = useNotesStore()

const item = ref<Item | null>(null)
const itemNotes = ref<any[]>([])
const showEditModal = ref(false)
const showNoteModal = ref(false)
const showDeleteConfirm = ref(false)
const editingNoteId = ref<string | null>(null)

const itemId = route.params.id as string

onMounted(async () => {
    await loadItem()
    await loadNotes()
})

async function loadItem() {
    const foundItem = await itemsStore.getItemById(itemId)
    if (foundItem) {
        item.value = foundItem
    } else {
        router.push('/')
    }
}

async function loadNotes() {
    itemNotes.value = await notesStore.fetchNotesByItemId(itemId)
}

const typeIcons: Record<ItemType, string> = {
    [ItemType.MOVIE]: 'fa-film',
    [ItemType.SERIES]: 'fa-tv',
    [ItemType.ANIME]: 'fa-dragon',
    [ItemType.BOOK]: 'fa-book',
    [ItemType.VIDEOGAME]: 'fa-gamepad',
    [ItemType.BOARDGAME]: 'fa-dice'
}

const statusLabels: Record<ItemStatus, string> = {
    [ItemStatus.PENDING]: 'Pendiente',
    [ItemStatus.IN_PROGRESS]: 'En Progreso',
    [ItemStatus.COMPLETED]: 'Completado',
    [ItemStatus.ABANDONED]: 'Abandonado'
}

const statusColors: Record<ItemStatus, string> = {
    [ItemStatus.PENDING]: 'var(--color-warning)',
    [ItemStatus.IN_PROGRESS]: 'hsl(200, 90%, 60%)',
    [ItemStatus.COMPLETED]: 'var(--color-success)',
    [ItemStatus.ABANDONED]: 'var(--text-muted)'
}

function getRatingStars(rating?: number) {
    if (!rating) return { fullStars: 0, halfStar: false }
    const fullStars = Math.floor(rating / 2)
    const halfStar = rating % 2 >= 1
    return { fullStars, halfStar }
}

async function handleSaveItem(updates: Partial<Item>) {
    if (!item.value) return

    try {
        await itemsStore.updateItem(item.value.id, updates)
        await loadItem()
        showEditModal.value = false
    } catch (error) {
        console.error('Error updating item:', error)
    }
}

async function handleDeleteItem() {
    if (!item.value) return

    try {
        await itemsStore.deleteItem(item.value.id)
        router.push('/')
    } catch (error) {
        console.error('Error deleting item:', error)
    }
}

async function handleSaveNote(data: { texto: string; spoilers: boolean }) {
    if (!item.value) return

    try {
        if (editingNoteId.value) {
            await notesStore.updateNote(editingNoteId.value, {
                contenido: data.texto,
                esSpoiler: data.spoilers
            })
        } else {
            await notesStore.createNote({
                itemId: item.value.id,
                contenido: data.texto,
                esSpoiler: data.spoilers
            })
        }
        await loadNotes()
        showNoteModal.value = false
        editingNoteId.value = null
    } catch (error) {
        console.error('Error saving note:', error)
    }
}

function openNoteModal(noteId?: string) {
    editingNoteId.value = noteId || null
    showNoteModal.value = true
}

async function handleDeleteNote(noteId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return

    try {
        await notesStore.deleteNote(noteId)
        await loadNotes()
    } catch (error) {
        console.error('Error deleting note:', error)
    }
}

function formatDate(date?: Date) {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const editingNote = computed(() => {
    if (!editingNoteId.value) return null
    return itemNotes.value.find(n => n.id === editingNoteId.value)
})
</script>

<template>
  <div v-if="item" class="item-detail-view py-12">
    <div class="container flex flex-col gap-8">
      <div class="detail-header">
        <AppButton variant="ghost" icon="fa-arrow-left" @click="router.back()">
          Volver
        </AppButton>
      </div>

      <div class="detail-content flex flex-col gap-10">
        <div class="item-info-card glass-card p-8 flex flex-col gap-8">
          <div class="item-header flex gap-8 items-start">
            <div class="item-icon-wrapper flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center text-4xl text-white shadow-xl" :style="{ background: statusColors[item.estado] }">
              <i class="fas" :class="typeIcons[item.tipo]"></i>
            </div>
            <div class="item-title-section flex-1 flex flex-col gap-4">
              <h1 class="item-title text-4xl fw-bold">{{ item.titulo }}</h1>
              <div class="item-meta flex gap-6 items-center flex-wrap">
                <span class="meta-badge px-3 py-1 border-2 rounded-md fw-bold text-sm"
                  :style="{ borderColor: statusColors[item.estado], color: statusColors[item.estado] }">
                  {{ statusLabels[item.estado] }}
                </span>
                <span v-if="item.rating" class="item-rating flex items-center gap-2 text-warning">
                  <div class="flex gap-1">
                    <i v-for="n in getRatingStars(item.rating).fullStars" :key="'full-' + n"
                      class="fas fa-star"></i>
                    <i v-if="getRatingStars(item.rating).halfStar" class="fas fa-star-half-alt"></i>
                  </div>
                  <span class="rating-value text-muted fw-bold">{{ item.rating }}/10</span>
                </span>
              </div>
            </div>
          </div>

          <div v-if="item.descripcion" class="item-description bg-surface p-6 rounded-xl flex flex-col gap-3">
            <h3 class="section-title text-lg fw-semibold flex items-center gap-2">
              <i class="fas fa-align-left text-primary"></i>
              Descripción
            </h3>
            <p class="text-secondary leading-relaxed">{{ item.descripcion }}</p>
          </div>

          <div class="item-details bg-surface p-6 rounded-xl flex flex-col gap-4">
            <div class="detail-row flex gap-4">
              <span class="detail-label text-muted fw-semibold w-44">Fecha de creación:</span>
              <span class="detail-value text-secondary">{{ formatDate(item.fechaCreacion) }}</span>
            </div>
            <div v-if="item.fechaInicio" class="detail-row flex gap-4">
              <span class="detail-label text-muted fw-semibold w-44">Fecha de inicio:</span>
              <span class="detail-value text-secondary">{{ formatDate(item.fechaInicio) }}</span>
            </div>
            <div v-if="item.fechaFin" class="detail-row flex gap-4">
              <span class="detail-label text-muted fw-semibold w-44">Fecha de finalización:</span>
              <span class="detail-value text-secondary">{{ formatDate(item.fechaFin) }}</span>
            </div>
            <div v-if="item.tags && item.tags.length > 0" class="detail-row flex gap-4">
              <span class="detail-label text-muted fw-semibold w-44">Tags:</span>
              <div class="tags-list flex flex-wrap gap-2">
                <span v-for="tag in item.tags" :key="tag" class="tag bg-primary px-3 py-1 rounded text-xs fw-bold text-white">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="item-actions flex gap-4 pt-6 border-t border-white/5">
            <AppButton variant="primary" icon="fa-edit" @click="showEditModal = true">
              Editar
            </AppButton>
            <AppButton variant="danger" icon="fa-trash" @click="showDeleteConfirm = true">
              Eliminar
            </AppButton>
          </div>
        </div>

        <div class="notes-section glass-card p-8 flex flex-col gap-8">
          <div class="notes-header flex justify-between items-center">
            <h2 class="section-title text-2xl fw-bold flex items-center gap-3">
              <i class="fas fa-sticky-note text-primary"></i>
              Notas ({{ itemNotes.length }})
            </h2>
            <AppButton variant="primary" icon="fa-plus" @click="openNoteModal()">
              Añadir Nota
            </AppButton>
          </div>

          <div v-if="itemNotes.length === 0" class="empty-notes py-12 flex flex-col items-center gap-4 text-secondary">
            <i class="fas fa-inbox text-5xl opacity-30"></i>
            <div class="text-center">
              <p class="text-xl">No hay notas todavía</p>
              <p class="empty-hint text-sm text-muted">¡Añade tu primera nota!</p>
            </div>
          </div>

          <div v-else class="notes-list flex flex-col gap-6">
            <NoteCard v-for="note in itemNotes" :key="note.id" :note="note" @edit="openNoteModal"
              @delete="handleDeleteNote" />
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Item Modal -->
    <AppModal :is-open="showEditModal" title="Editar Item" size="large" @close="showEditModal = false">
      <ItemForm :item="item" mode="edit" @save="handleSaveItem" @cancel="showEditModal = false" />
    </AppModal>

    <!-- Note Modal -->
    <AppModal :is-open="showNoteModal" :title="editingNoteId ? 'Editar Nota' : 'Nueva Nota'"
      @close="showNoteModal = false; editingNoteId = null">
      <NoteForm :item-id="item.id" :initial-text="editingNote?.contenido"
        :initial-spoilers="editingNote?.esSpoiler" @save="handleSaveNote"
        @cancel="showNoteModal = false; editingNoteId = null" />
    </AppModal>

    <!-- Delete Confirmation Modal -->
    <AppModal :is-open="showDeleteConfirm" title="Confirmar Eliminación" size="small"
      @close="showDeleteConfirm = false">
      <p class="mb-6 leading-relaxed">
        ¿Estás seguro de que quieres eliminar "<strong>{{ item.titulo }}</strong>"?
        Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <div class="flex gap-4 justify-end w-full">
          <AppButton variant="ghost" @click="showDeleteConfirm = false">
            Cancelar
          </AppButton>
          <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem">
            Eliminar
          </AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.item-detail-view {
  min-height: calc(100vh - var(--header-height));

  @media (max-width: 768px) {
    .item-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .detail-row {
      flex-direction: column;
      gap: var(--space-1);
    }

    .detail-label {
      width: auto;
    }

    .item-actions {
      flex-direction: column;
    }

    .notes-header {
      flex-direction: column;
      gap: var(--space-4);
      align-items: stretch;
    }
  }
}
</style>
