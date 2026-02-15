<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useNotesStore } from '@/stores/notes'
import { Item, ItemStatus, HitoType } from '@/types'
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

const statusLabels: Record<ItemStatus, string> = {
    [ItemStatus.PENDING]: 'Pendiente',
    [ItemStatus.IN_PROGRESS]: 'Leyendo',
    [ItemStatus.COMPLETED]: 'Leído',
    [ItemStatus.ABANDONED]: 'Abandonado'
}

const statusColors: Record<ItemStatus, string> = {
    [ItemStatus.PENDING]: 'var(--color-warning)',
    [ItemStatus.IN_PROGRESS]: 'hsl(200, 90%, 60%)',
    [ItemStatus.COMPLETED]: 'var(--color-success)',
    [ItemStatus.ABANDONED]: 'var(--text-muted)'
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

async function updateMiniReview(review: string) {
    if (!item.value) return
    try {
        await itemsStore.updateItem(item.value.id, { miniReseña: review })
        item.value.miniReseña = review
    } catch (error) {
        console.error('Error updating review:', error)
    }
}

async function toggleFavorite() {
    if (!item.value) return
    try {
        await itemsStore.toggleFavorite(item.value.id)
        await loadItem()
    } catch (error) {
        console.error('Error toggling favorite:', error)
    }
}

async function handleSaveNote(data: { texto: string; spoilers: boolean; hito: HitoType }) {
    if (!item.value) return
    try {
        if (editingNoteId.value) {
            await notesStore.updateNote(editingNoteId.value, {
                contenido: data.texto,
                esSpoiler: data.spoilers,
                tipoHito: data.hito
            })
        } else {
            await notesStore.createNote({
                itemId: item.value.id,
                contenido: data.texto,
                esSpoiler: data.spoilers,
                tipoHito: data.hito
            })
        }
        await loadNotes()
        showNoteModal.value = false
        editingNoteId.value = null
    } catch (error) {
        console.error('Error saving note:', error)
    }
}
</script>

<template>
    <div v-if="item" class="book-detail-view">
        <div class="container-detail">
            <!-- Header -->
            <nav class="detail-nav">
                <button class="back-btn" @click="router.back()">
                    <i class="fas fa-arrow-left"></i>
                    Volver
                </button>
                <div class="header-actions flex items-center gap-3">
                    <button class="favorite-btn" :class="{ 'is-favorite': item.favorito }" @click="toggleFavorite"
                        title="Marcar como favorito">
                        <i class="fa-heart" :class="item.favorito ? 'fas' : 'far'"></i>
                    </button>
                    <AppButton variant="ghost" icon="fa-edit" size="small" @click="showEditModal = true">Editar
                    </AppButton>
                    <AppButton variant="ghost" icon="fa-trash" size="small" @click="showDeleteConfirm = true">
                    </AppButton>
                </div>
            </nav>

            <div class="content-grid">
                <!-- Left: Book Cover -->
                <aside class="left-column">
                    <div class="book-cover">
                        <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" class="cover-img" />
                        <div v-else class="cover-placeholder">
                            <i class="fas fa-book"></i>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="quick-actions glass-card">
                        <AppButton variant="primary" icon="fa-edit" block @click="showEditModal = true">
                            Editar
                        </AppButton>
                        <AppButton variant="ghost" icon="fa-trash" block @click="showDeleteConfirm = true">
                            Eliminar
                        </AppButton>
                    </div>

                    <!-- Reading Progress -->
                    <div v-if="item.progresoLectura" class="progress-card glass-card">
                        <h3 class="card-title">
                            <i class="fas fa-bookmark"></i>
                            Progreso de Lectura
                        </h3>
                        <div class="progress-display">
                            <span class="progress-value">{{ item.progresoLectura }}</span>
                        </div>
                    </div>

                    <!-- Book Info -->
                    <div class="info-card glass-card">
                        <h3 class="card-title">
                            <i class="fas fa-info-circle"></i>
                            Información
                        </h3>
                        <div class="info-list">
                            <div v-if="item.autor" class="info-item">
                                <span class="info-label">Autor</span>
                                <span class="info-value">{{ item.autor }}</span>
                            </div>
                            <div v-if="item.editorial" class="info-item">
                                <span class="info-label">Editorial</span>
                                <span class="info-value">{{ item.editorial }}</span>
                            </div>
                            <div v-if="item.fechaInicio" class="info-item">
                                <span class="info-label">Publicación</span>
                                <span class="info-value">{{ formatDate(item.fechaInicio) }}</span>
                            </div>
                            <div v-if="item.duracion" class="info-item">
                                <span class="info-label">Páginas</span>
                                <span class="info-value">{{ item.duracion }}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- Right: Content -->
                <main class="right-column">
                    <!-- Title & Metadata -->
                    <header class="book-header">
                        <h1 class="book-title">{{ item.titulo }}</h1>
                        <p v-if="item.autor" class="book-author">por {{ item.autor }}</p>

                        <!-- Genres -->
                        <div v-if="item.genero?.length" class="genres-row">
                            <span v-for="genre in item.genero" :key="genre" class="genre-badge">
                                {{ genre }}
                            </span>
                        </div>
                    </header>

                    <!-- Status & Rating -->
                    <div class="status-card glass-card">
                        <div class="status-section">
                            <span class="label">Estado</span>
                            <div class="status-badge" :style="{ color: statusColors[item.estado] }">
                                <span class="dot" :style="{ background: statusColors[item.estado] }"></span>
                                {{ statusLabels[item.estado] }}
                            </div>
                        </div>
                        <div class="rating-section">
                            <span class="label">Tu Valoración</span>
                            <div class="rating-value">
                                {{ item.rating?.toFixed(1) || '—' }} <span class="max">/ 10</span>
                            </div>
                        </div>
                    </div>

                    <!-- Synopsis -->
                    <div v-if="item.descripcion" class="synopsis-card glass-card">
                        <h2 class="section-title">
                            <i class="fas fa-align-left"></i>
                            Sinopsis
                        </h2>
                        <p class="synopsis-text">{{ item.descripcion }}</p>
                    </div>

                    <!-- Personal Review -->
                    <div class="review-card glass-card">
                        <h2 class="section-title">
                            <i class="fas fa-quote-left"></i>
                            Tus Pensamientos
                        </h2>
                        <textarea v-model="item.miniReseña"
                            placeholder="Escribe tu opinión personal sobre este libro..." class="review-textarea"
                            @change="updateMiniReview(item.miniReseña || '')"></textarea>
                        <div class="autosave-hint">
                            <i class="fas fa-check-circle"></i>
                            Autoguardado
                        </div>
                    </div>

                    <!-- Activity Journal -->
                    <div class="activity-card">
                        <div class="activity-header">
                            <h2 class="section-title">
                                <i class="fas fa-stream"></i>
                                Diario de Lectura
                            </h2>
                            <AppButton variant="glass" icon="fa-plus" size="small" @click="openNoteModal()">
                                Nueva Entrada
                            </AppButton>
                        </div>

                        <div v-if="itemNotes.length === 0" class="empty-state">
                            <i class="fas fa-feather-alt"></i>
                            <p>No hay entradas aún. Documenta tu experiencia de lectura.</p>
                        </div>

                        <div v-else class="notes-timeline">
                            <NoteCard v-for="note in itemNotes" :key="note.id" :note="note" @edit="openNoteModal"
                                @delete="handleDeleteNote" />
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Modals -->
        <AppModal :is-open="showEditModal" title="Editar Libro" size="large" @close="showEditModal = false">
            <ItemForm :item="item" mode="edit" @save="handleSaveItem" @cancel="showEditModal = false" />
        </AppModal>

        <AppModal :is-open="showNoteModal" :title="editingNoteId ? 'Editar Entrada' : 'Nueva Entrada'"
            @close="showNoteModal = false; editingNoteId = null">
            <NoteForm :item-id="item.id" :initial-text="editingNote?.contenido"
                :initial-spoilers="editingNote?.esSpoiler" :initial-hito="editingNote?.tipoHito" @save="handleSaveNote"
                @cancel="showNoteModal = false; editingNoteId = null" />
        </AppModal>

        <AppModal :is-open="showDeleteConfirm" title="Confirmar Eliminación" size="small"
            @close="showDeleteConfirm = false">
            <div class="delete-confirm">
                <p>¿Estás seguro de que quieres eliminar "<strong>{{ item.titulo }}</strong>"?</p>
                <p class="warning">Esta acción no se puede deshacer.</p>
                <div class="actions">
                    <AppButton variant="ghost" @click="showDeleteConfirm = false">Cancelar</AppButton>
                    <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem">Eliminar</AppButton>
                </div>
            </div>
        </AppModal>
    </div>
</template>

<style scoped>
.book-detail-view {
    min-height: 100vh;
    background: var(--color-bg-main);
    padding: var(--space-8) var(--space-4);
}

.container-detail {
    max-width: 1200px;
    margin: 0 auto;
}

.detail-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-8);
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-base);
}

.back-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    transform: translateX(-4px);
}

.header-actions {
    display: flex;
    gap: var(--space-3);
}

.content-grid {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--space-10);

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
}

.book-cover {
    aspect-ratio: 2/3;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    margin-bottom: var(--space-6);

    .cover-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .cover-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-surface);
        font-size: 4rem;
        color: var(--color-text-muted);
        opacity: 0.3;
    }
}

.quick-actions {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
}

.progress-card,
.info-card {
    padding: var(--space-5);
    margin-bottom: var(--space-6);
}

.card-title {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin-bottom: var(--space-4);

    i {
        color: var(--color-accent);
    }
}

.progress-display {
    text-align: center;
    padding: var(--space-4);
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
    border-radius: var(--radius-md);
}

.progress-value {
    font-size: 1.5rem;
    font-weight: 900;
    color: var(--color-bg-main);
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
}

.info-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.info-value {
    color: var(--color-text-secondary);
    font-weight: 500;
}

.book-header {
    margin-bottom: var(--space-8);
}

.book-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900;
    color: white;
    margin-bottom: var(--space-3);
    line-height: 1.2;
}

.book-author {
    font-size: 1.25rem;
    color: var(--color-accent);
    font-style: italic;
    margin-bottom: var(--space-5);
}

.genres-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
}

.genre-badge {
    padding: var(--space-2) var(--space-4);
    background: rgba(0, 245, 255, 0.2);
    border: 1px solid var(--color-accent);
    border-radius: var(--radius-full);
    color: var(--color-accent);
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.status-card {
    display: flex;
    justify-content: space-between;
    padding: var(--space-6);
    margin-bottom: var(--space-6);

    @media (max-width: 640px) {
        flex-direction: column;
        gap: var(--space-6);
    }
}

.status-section,
.rating-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
}

.label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.status-badge {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: 1.25rem;
    font-weight: 800;

    .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        box-shadow: 0 0 12px currentColor;
    }
}

.rating-value {
    font-size: 2.5rem;
    font-weight: 900;
    color: var(--color-warning);
    font-style: italic;

    .max {
        font-size: 1rem;
        color: var(--color-text-muted);
        font-style: normal;
    }
}

.synopsis-card,
.review-card {
    padding: var(--space-6);
    margin-bottom: var(--space-6);
}

.section-title {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin-bottom: var(--space-5);

    i {
        color: var(--color-accent);
    }
}

.synopsis-text {
    color: var(--color-text-secondary);
    line-height: 1.8;
    font-size: 1rem;
}

.review-textarea {
    width: 100%;
    min-height: 150px;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    color: var(--color-text-secondary);
    font-family: var(--font-main);
    font-size: 1rem;
    line-height: 1.7;
    resize: vertical;
    transition: border-color var(--transition-base);

    &:focus {
        outline: none;
        border-color: var(--color-accent);
    }

    &::placeholder {
        color: var(--color-text-muted);
        font-style: italic;
    }
}

.autosave-hint {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-3);
    font-size: 0.75rem;
    color: var(--color-success);

    i {
        font-size: 0.875rem;
    }
}

.activity-card {
    padding: var(--space-6);
    background: transparent;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-12) var(--space-6);
    text-align: center;

    i {
        font-size: 3rem;
        color: var(--color-text-muted);
        opacity: 0.3;
    }

    p {
        color: var(--color-text-muted);
        font-style: italic;
    }
}

.notes-timeline {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.delete-confirm {
    padding: var(--space-6);

    p {
        margin-bottom: var(--space-4);
        line-height: 1.6;
        color: var(--color-text-secondary);
    }

    .warning {
        color: var(--color-danger);
        font-weight: 600;
    }

    .actions {
        display: flex;
        gap: var(--space-4);
        justify-content: flex-end;
        margin-top: var(--space-6);
    }
}

.favorite-btn {
    background: transparent;
    border: none;
    font-size: 1.4rem;
    cursor: pointer;
    color: var(--color-text-muted);
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 50%;

    &:hover {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }

    &.is-favorite {
        color: #ff3399;
        filter: drop-shadow(0 0 8px rgba(255, 51, 153, 0.4));
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.9);
    }
}
</style>
