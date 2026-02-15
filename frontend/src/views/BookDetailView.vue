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
import { useBooksEnrichment } from '@/composables/useBooksEnrichment'

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
const showEnrichmentModal = ref(false)
const enrichmentResult = ref<any>(null)

const {
    enrichMultipleBooks,
    isEnriching
} = useBooksEnrichment()

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

async function handleSingleEnrich() {
    if (!item.value) return
    if (!confirm(`¿Quieres enriquecer "${item.value.titulo}" con datos de Google Books?`)) return

    showEnrichmentModal.value = true
    const result = await enrichMultipleBooks([item.value])
    enrichmentResult.value = result

    if (result.success > 0) {
        await loadItem()
    }
}
const backdropStyle = computed(() => {
    if (!item.value?.imagen) return {}
    return {
        backgroundImage: `url(${item.value.imagen})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(40px)',
        opacity: '0.4'
    }
})
</script>

<template>
    <div v-if="item" class="book-view">
        <!-- Backdrop Hero (Uses cover as blurred background) -->
        <div class="book-hero" :style="backdropStyle">
            <div class="hero-overlay">
                <div class="detail-container">
                    <div class="hero-nav">
                        <router-link to="/" class="back-link">
                            <i class="fas fa-arrow-left"></i>
                            Volver
                        </router-link>

                        <button class="favorite-toggle" :class="{ 'active': item.favorito }" @click="toggleFavorite"
                            title="Marcar como favorito">
                            <i class="fa-heart" :class="item.favorito ? 'fas' : 'far'"></i>
                        </button>
                    </div>

                    <div class="hero-main">
                        <h1 class="book-title">{{ item.titulo }}</h1>
                        <p v-if="item.autor" class="book-author">por {{ item.autor }}</p>

                        <div class="book-meta">
                            <span v-if="item.fechaInicio" class="meta-tag">
                                <i class="fas fa-calendar"></i>
                                {{ new Date(item.fechaInicio).getFullYear() }}
                            </span>
                            <span v-if="item.duracion" class="meta-tag">
                                <i class="fas fa-file-alt"></i>
                                {{ item.duracion }} páginas
                            </span>
                            <span v-if="item.rating" class="meta-tag rating">
                                <i class="fas fa-star"></i>
                                {{ item.rating.toFixed(1) }}
                            </span>
                        </div>

                        <!-- Genres -->
                        <div v-if="item.genero?.length" class="book-genres">
                            <span v-for="genre in item.genero" :key="genre" class="genre-tag">
                                {{ genre }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="detail-container main-content">
            <div class="detail-layout">
                <!-- Sidebar Column -->
                <aside class="sidebar-column">
                    <div class="poster-wrap">
                        <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" class="poster-image" />
                        <div v-else class="poster-fallback">
                            <i class="fas fa-book"></i>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="actions-group">
                        <AppButton variant="primary" icon="fa-magic" block @click="handleSingleEnrich"
                            :loading="isEnriching">
                            Enriquecer Libro
                        </AppButton>
                        <AppButton variant="ghost" icon="fa-edit" block @click="showEditModal = true">
                            Editar Libro
                        </AppButton>
                        <AppButton variant="ghost" icon="fa-trash" block @click="showDeleteConfirm = true">
                            Eliminar Libro
                        </AppButton>
                    </div>

                    <!-- Reading Progress -->
                    <div v-if="item.progresoLectura" class="info-card">
                        <h3 class="card-title">
                            <i class="fas fa-bookmark"></i>
                            Progreso
                        </h3>
                        <div class="status-badge" style="color: var(--color-accent)">
                            <span class="status-dot" style="background: var(--color-accent)"></span>
                            {{ item.progresoLectura }}
                        </div>
                    </div>

                    <!-- Book Details -->
                    <div class="info-card">
                        <h3 class="card-title">
                            <i class="fas fa-info-circle"></i>
                            Detalles
                        </h3>
                        <div class="meta-list">
                            <div v-if="item.autor" class="meta-row">
                                <span class="meta-key">Autor</span>
                                <span class="meta-val">{{ item.autor }}</span>
                            </div>
                            <div v-if="item.editorial" class="meta-row">
                                <span class="meta-key">Editorial</span>
                                <span class="meta-val">{{ item.editorial }}</span>
                            </div>
                            <div v-if="item.fechaInicio" class="meta-row">
                                <span class="meta-key">Publicación</span>
                                <span class="meta-val">{{ formatDate(item.fechaInicio) }}</span>
                            </div>
                            <div v-if="item.duracion" class="meta-row">
                                <span class="meta-key">Páginas</span>
                                <span class="meta-val">{{ item.duracion }}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- Detail Content -->
                <main class="content-column">
                    <!-- Status Indicator -->
                    <div class="info-card status-indicator-card">
                        <div class="status-group">
                            <span class="indicator-label">Estado</span>
                            <div class="status-badge" :style="{ color: statusColors[item.estado] }">
                                <span class="status-dot" :style="{ background: statusColors[item.estado] }"></span>
                                {{ statusLabels[item.estado] }}
                            </div>
                        </div>
                        <div class="rating-group">
                            <span class="indicator-label">Tu Valoración</span>
                            <div class="rating-score">
                                {{ item.rating?.toFixed(1) || '—' }} <span class="rating-max">/ 10</span>
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div v-if="item.descripcion" class="info-card description-card">
                        <h2 class="section-title">
                            <i class="fas fa-align-left"></i>
                            Sinopsis
                        </h2>
                        <p class="description-text">{{ item.descripcion }}</p>
                    </div>

                    <!-- Personal Thoughts -->
                    <div class="info-card thoughts-box-card">
                        <h2 class="section-title">
                            <i class="fas fa-quote-left"></i>
                            Tu Reseña
                        </h2>
                        <textarea v-model="item.miniReseña" placeholder="¿Qué te ha parecido el libro hasta ahora?..."
                            class="thoughts-editor" @change="updateMiniReview(item.miniReseña || '')"></textarea>
                        <div class="editor-hint">
                            <i class="fas fa-check-circle"></i>
                            Se guarda automáticamente al salir
                        </div>
                    </div>

                    <!-- Activity Journal -->
                    <div class="activity-section">
                        <div class="timeline-header">
                            <h2 class="section-title">
                                <i class="fas fa-stream"></i>
                                Diario de Lectura
                            </h2>
                            <AppButton variant="glass" icon="fa-plus" size="small" @click="openNoteModal()">
                                Nueva Entrada
                            </AppButton>
                        </div>

                        <div v-if="itemNotes.length === 0" class="empty-timeline">
                            <i class="fas fa-feather-alt empty-icon"></i>
                            <p class="empty-text">No has registrado ninguna actividad para este libro.</p>
                        </div>

                        <div v-else class="timeline-list">
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

        <AppModal :is-open="showDeleteConfirm" title="Eliminar Libro" size="small" @close="showDeleteConfirm = false">
            <div class="delete-confirmation">
                <p class="delete-msg">¿Estás seguro de que quieres eliminar "<strong>{{ item.titulo }}</strong>"?</p>
                <p class="delete-warning">Esta acción eliminará permanentemente el libro y todas sus notas.</p>
                <div class="delete-actions">
                    <AppButton variant="ghost" @click="showDeleteConfirm = false">Cancelar</AppButton>
                    <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem">Eliminar Libro</AppButton>
                </div>
            </div>
        </AppModal>

        <!-- Enrichment Progress Modal -->
        <AppModal :is-open="showEnrichmentModal" title="Enriqueciendo con Google Books" size="medium"
            @close="!isEnriching && (showEnrichmentModal = false)">
            <div class="enrich-modal">
                <div v-if="isEnriching" class="enrich-loading">
                    <i class="fas fa-book fa-spin loading-icon"></i>
                    <p class="loading-msg">Enriqueciendo con datos de Google Books...</p>
                </div>

                <div v-else-if="enrichmentResult" class="enrich-result">
                    <div v-if="enrichmentResult.success > 0" class="result-box success">
                        <i class="fas fa-check-circle"></i> <span>¡Completado con éxito!</span>
                    </div>
                    <div v-if="enrichmentResult.failed > 0" class="result-box error">
                        <i class="fas fa-exclamation-circle"></i> <span>No se pudo encontrar información.</span>
                    </div>
                    <AppButton variant="primary" block class="close-enrich-btn" @click="showEnrichmentModal = false">
                        Cerrar </AppButton>
                </div>
            </div>
        </AppModal>
    </div>
</template>

<style scoped lang="scss">
.book-view {
    min-height: 100vh;
}

.book-hero {
    position: relative;
    min-height: 480px;
    display: flex;
    align-items: flex-end;
    padding-bottom: 48px;
    background-size: cover;
    background-position: center;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(to bottom, rgba(10, 10, 15, 0.4), rgba(10, 10, 15, 0.95));
        z-index: 1;
    }
}

.hero-overlay {
    position: relative;
    z-index: 2;
    width: 100%;
}

.detail-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px;
    width: 100%;
}

.hero-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;

    &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateX(-4px);
    }
}

.favorite-toggle {
    background: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
    opacity: 0.7;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &:hover {
        opacity: 1;
        transform: scale(1.1);
    }

    &.active {
        color: #ff3399;
        opacity: 1;
        filter: drop-shadow(0 0 8px rgba(255, 51, 153, 0.4));
    }
}

.hero-main {
    max-width: 800px;
}

.book-title {
    font-size: 64px;
    font-weight: 900;
    color: white;
    margin-bottom: 16px;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    line-height: 1.1;
    letter-spacing: -2px;
}

.book-author {
    font-size: 24px;
    color: var(--color-accent);
    font-style: italic;
    margin-bottom: 24px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.book-meta {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
}

.meta-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    font-weight: 600;

    i {
        color: var(--color-accent);
    }

    &.rating {
        color: var(--color-warning);

        i {
            color: var(--color-warning);
        }
    }
}

.book-genres {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.genre-tag {
    padding: 6px 16px;
    background: rgba(0, 245, 255, 0.1);
    border: 1px solid var(--color-accent);
    border-radius: 99px;
    color: var(--color-accent);
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.main-content {
    margin-top: -32px;
    padding-bottom: 64px;
}

.detail-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 40px;

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
}

.poster-wrap {
    aspect-ratio: 2/3;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    margin-bottom: 24px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);

    .poster-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .poster-fallback {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 80px;
        color: var(--color-text-muted);
        opacity: 0.3;
    }
}

.actions-group {
    padding: 16px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
}

.info-card {
    padding: 24px;
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    margin-bottom: 24px;
}

.card-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-text-muted);
    margin-bottom: 20px;

    i {
        color: var(--color-accent);
    }
}

.meta-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.meta-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.meta-key {
    font-size: 11px;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.meta-val {
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 15px;
}

.status-indicator-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;

    @media (max-width: 640px) {
        flex-direction: column;
        gap: 24px;
        align-items: flex-start;
    }
}

.status-group,
.rating-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.indicator-label {
    font-size: 11px;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1px;
}

.status-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 20px;
    font-weight: 800;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 12px currentColor;
}

.rating-score {
    font-size: 40px;
    font-weight: 900;
    color: var(--color-warning);
    font-style: italic;
    line-height: 1;

    .rating-max {
        font-size: 16px;
        color: var(--color-text-muted);
        font-style: normal;
    }
}

.section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 700;
    color: white;
    margin-bottom: 24px;

    i {
        color: var(--color-accent);
    }
}

.description-text {
    color: var(--color-text-secondary);
    line-height: 1.8;
    font-size: 16px;
}

.thoughts-editor {
    width: 100%;
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 16px;
    color: var(--color-text-secondary);
    font-family: inherit;
    font-size: 15px;
    line-height: 1.7;
    resize: vertical;
    min-height: 140px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
        border-color: var(--color-accent);
    }
}

.editor-hint {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--color-success);
    opacity: 0.8;
}

.activity-section {
    margin-top: 32px;
}

.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
}

.empty-timeline {
    padding: 64px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    opacity: 0.5;
}

.empty-icon {
    font-size: 48px;
    color: var(--color-text-muted);
}

.empty-text {
    color: var(--color-text-muted);
    font-style: italic;
}

.timeline-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.delete-confirmation {
    padding: 16px;
}

.delete-msg {
    font-size: 16px;
    line-height: 1.5;
    margin-bottom: 8px;
}

.delete-warning {
    color: var(--color-danger);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 24px;
}

.delete-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* Enrichment Modal Styles */
.enrich-modal {
    padding: 24px;
}

.enrich-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px 0;
}

.loading-icon {
    font-size: 48px;
    color: var(--color-accent);
}

.loading-msg {
    color: var(--color-text-secondary);
    font-weight: 500;
}

.result-box {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 24px;
    font-weight: 600;

    &.success {
        background: rgba(var(--color-success-rgb), 0.1);
        color: var(--color-success);
        border: 1px solid rgba(var(--color-success-rgb), 0.2);
    }

    &.error {
        background: rgba(var(--color-danger-rgb), 0.1);
        color: var(--color-danger);
        border: 1px solid rgba(var(--color-danger-rgb), 0.2);
    }

    i {
        font-size: 24px;
    }
}

.close-enrich-btn {
    margin-top: 24px;
}
</style>
