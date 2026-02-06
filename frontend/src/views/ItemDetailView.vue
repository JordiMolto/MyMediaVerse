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
    itemNotes.value = await notesStore.fetchNotesByItem(itemId)
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
            await notesStore.updateNote(editingNoteId.value, data.texto, data.spoilers)
        } else {
            await notesStore.createNote({
                itemId: item.value.id,
                texto: data.texto,
                spoilers: data.spoilers
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
    <div v-if="item" class="item-detail-view">
        <div class="container">
            <div class="detail-header">
                <AppButton variant="ghost" icon="fa-arrow-left" @click="router.back()">
                    Volver
                </AppButton>
            </div>

            <div class="detail-content">
                <div class="item-info-card">
                    <div class="item-header">
                        <div class="item-icon" :style="{ background: statusColors[item.estado] }">
                            <i class="fas" :class="typeIcons[item.tipo]"></i>
                        </div>
                        <div class="item-title-section">
                            <h1 class="item-title">{{ item.titulo }}</h1>
                            <div class="item-meta">
                                <span class="meta-badge"
                                    :style="{ borderColor: statusColors[item.estado], color: statusColors[item.estado] }">
                                    {{ statusLabels[item.estado] }}
                                </span>
                                <span v-if="item.rating" class="item-rating">
                                    <i v-for="n in getRatingStars(item.rating).fullStars" :key="'full-' + n"
                                        class="fas fa-star"></i>
                                    <i v-if="getRatingStars(item.rating).halfStar" class="fas fa-star-half-alt"></i>
                                    <span class="rating-value">{{ item.rating }}/10</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div v-if="item.descripcion" class="item-description">
                        <h3 class="section-title">Descripción</h3>
                        <p>{{ item.descripcion }}</p>
                    </div>

                    <div class="item-details">
                        <div class="detail-row">
                            <span class="detail-label">Fecha de creación:</span>
                            <span class="detail-value">{{ formatDate(item.fechaCreacion) }}</span>
                        </div>
                        <div v-if="item.fechaInicio" class="detail-row">
                            <span class="detail-label">Fecha de inicio:</span>
                            <span class="detail-value">{{ formatDate(item.fechaInicio) }}</span>
                        </div>
                        <div v-if="item.fechaFin" class="detail-row">
                            <span class="detail-label">Fecha de finalización:</span>
                            <span class="detail-value">{{ formatDate(item.fechaFin) }}</span>
                        </div>
                        <div v-if="item.tags && item.tags.length > 0" class="detail-row">
                            <span class="detail-label">Tags:</span>
                            <div class="tags-list">
                                <span v-for="tag in item.tags" :key="tag" class="tag">
                                    {{ tag }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="item-actions">
                        <AppButton variant="primary" icon="fa-edit" @click="showEditModal = true">
                            Editar
                        </AppButton>
                        <AppButton variant="danger" icon="fa-trash" @click="showDeleteConfirm = true">
                            Eliminar
                        </AppButton>
                    </div>
                </div>

                <div class="notes-section">
                    <div class="notes-header">
                        <h2 class="section-title">
                            <i class="fas fa-sticky-note"></i>
                            Notas ({{ itemNotes.length }})
                        </h2>
                        <AppButton variant="primary" icon="fa-plus" @click="openNoteModal()">
                            Añadir Nota
                        </AppButton>
                    </div>

                    <div v-if="itemNotes.length === 0" class="empty-notes">
                        <i class="fas fa-inbox"></i>
                        <p>No hay notas todavía</p>
                        <p class="empty-hint">¡Añade tu primera nota!</p>
                    </div>

                    <div v-else class="notes-list">
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
            <NoteForm :item-id="item.id" :initial-text="editingNote?.texto" :initial-spoilers="editingNote?.spoilers"
                @save="handleSaveNote" @cancel="showNoteModal = false; editingNoteId = null" />
        </AppModal>

        <!-- Delete Confirmation Modal -->
        <AppModal :is-open="showDeleteConfirm" title="Confirmar Eliminación" size="small"
            @close="showDeleteConfirm = false">
            <p style="margin-bottom: var(--spacing-lg);">
                ¿Estás seguro de que quieres eliminar "<strong>{{ item.titulo }}</strong>"?
                Esta acción no se puede deshacer.
            </p>
            <template #footer>
                <AppButton variant="ghost" @click="showDeleteConfirm = false">
                    Cancelar
                </AppButton>
                <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem">
                    Eliminar
                </AppButton>
            </template>
        </AppModal>
    </div>
</template>

<style scoped>
.item-detail-view {
    min-height: 100vh;
    padding: var(--spacing-xl) 0;
}

.detail-header {
    margin-bottom: var(--spacing-lg);
}

.detail-content {
    display: grid;
    gap: var(--spacing-xl);
}

.item-info-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-md);
}

.item-header {
    display: flex;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.item-icon {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-3xl);
    color: white;
    flex-shrink: 0;
}

.item-title-section {
    flex: 1;
}

.item-title {
    font-size: var(--font-size-3xl);
    font-weight: 700;
    margin-bottom: var(--spacing-sm);
}

.item-meta {
    display: flex;
    gap: var(--spacing-md);
    align-items: center;
    flex-wrap: wrap;
}

.meta-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 2px solid;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.item-rating {
    color: var(--color-warning);
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
}

.rating-value {
    color: var(--text-secondary);
    font-weight: 600;
    margin-left: var(--spacing-xs);
}

.item-description {
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
}

.section-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.item-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
}

.detail-row {
    display: flex;
    gap: var(--spacing-sm);
    align-items: flex-start;
}

.detail-label {
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 180px;
}

.detail-value {
    color: var(--text-primary);
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
}

.tag {
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);
    font-weight: 600;
}

.item-actions {
    display: flex;
    gap: var(--spacing-sm);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--bg-secondary);
}

.notes-section {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    box-shadow: var(--shadow-md);
}

.notes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
}

.empty-notes {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
}

.empty-notes i {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
}

.empty-hint {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
}

.notes-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

@media (max-width: 768px) {
    .item-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .item-title {
        font-size: var(--font-size-2xl);
    }

    .detail-row {
        flex-direction: column;
    }

    .detail-label {
        min-width: auto;
    }

    .item-actions {
        flex-direction: column;
    }

    .notes-header {
        flex-direction: column;
        gap: var(--spacing-md);
        align-items: stretch;
    }
}
</style>
