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
    [ItemStatus.IN_PROGRESS]: 'Viendo',
    [ItemStatus.COMPLETED]: 'Completada',
    [ItemStatus.ABANDONED]: 'Abandonada'
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

const backdropStyle = computed(() => {
    if (!item.value?.backdropImage) return {}
    return {
        backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 15, 0.7), rgba(10, 10, 15, 0.95)), url(${item.value.backdropImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }
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
    <div v-if="item" class="series-detail-view">
        <!-- Backdrop Hero -->
        <div class="backdrop-hero" :style="backdropStyle">
            <div class="backdrop-overlay">
                <div class="container-detail">
                    <button class="back-btn" @click="router.back()">
                        <i class="fas fa-arrow-left"></i>
                        Volver
                    </button>

                    <div class="hero-content">
                        <h1 class="series-title">{{ item.titulo }}</h1>
                        <p v-if="item.tagline" class="tagline">{{ item.tagline }}</p>

                        <div class="hero-meta">
                            <span v-if="item.fechaInicio" class="meta-item">
                                <i class="fas fa-calendar"></i>
                                {{ new Date(item.fechaInicio).getFullYear() }}
                            </span>
                            <span v-if="item.numberOfSeasons" class="meta-item">
                                <i class="fas fa-layer-group"></i>
                                {{ item.numberOfSeasons }} {{ item.numberOfSeasons === 1 ? 'Temporada' : 'Temporadas' }}
                            </span>
                            <span v-if="item.numberOfEpisodes" class="meta-item">
                                <i class="fas fa-list-ol"></i>
                                {{ item.numberOfEpisodes }} Episodios
                            </span>
                            <span v-if="item.duracion" class="meta-item">
                                <i class="fas fa-clock"></i>
                                {{ item.duracion }} min/ep
                            </span>
                            <span v-if="item.rating" class="meta-item rating">
                                <i class="fas fa-star"></i>
                                {{ item.rating.toFixed(1) }}
                            </span>
                        </div>

                        <!-- Genres -->
                        <div v-if="item.genero?.length" class="genres-row">
                            <span v-for="genre in item.genero" :key="genre" class="genre-badge">
                                {{ genre }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="container-detail main-content">
            <div class="content-grid">
                <!-- Left Column: Poster & Info -->
                <aside class="left-column">
                    <div class="poster-card">
                        <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" class="poster-img" />
                        <div v-else class="poster-placeholder">
                            <i class="fas fa-tv"></i>
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

                    <!-- Progress Tracker -->
                    <div v-if="item.progresoTemporadas" class="progress-card glass-card">
                        <h3 class="card-title">
                            <i class="fas fa-chart-line"></i>
                            Tu Progreso
                        </h3>
                        <div class="progress-display">
                            <span class="progress-value">{{ item.progresoTemporadas }}</span>
                            <span class="progress-label">Temporadas vistas</span>
                        </div>
                    </div>

                    <!-- Streaming Platforms -->
                    <div v-if="item.streamingPlatforms?.length" class="platforms-card glass-card">
                        <h3 class="card-title">
                            <i class="fas fa-tv"></i>
                            Disponible en
                        </h3>
                        <div class="platforms-list">
                            <span v-for="platform in item.streamingPlatforms" :key="platform" class="platform-badge">
                                {{ platform }}
                            </span>
                        </div>
                    </div>

                    <!-- Trailer -->
                    <div v-if="item.trailer" class="trailer-card glass-card">
                        <h3 class="card-title">
                            <i class="fas fa-play-circle"></i>
                            Tráiler
                        </h3>
                        <a :href="item.trailer" target="_blank" rel="noopener noreferrer" class="trailer-btn">
                            <i class="fab fa-youtube"></i>
                            Ver en YouTube
                        </a>
                    </div>

                    <!-- Series Info -->
                    <div class="info-card glass-card">
                        <h3 class="card-title">
                            <i class="fas fa-info-circle"></i>
                            Información
                        </h3>
                        <div class="info-list">
                            <div v-if="item.director" class="info-item">
                                <span class="info-label">Creador/Showrunner</span>
                                <span class="info-value">{{ item.director }}</span>
                            </div>
                            <div v-if="item.fechaInicio" class="info-item">
                                <span class="info-label">Estreno</span>
                                <span class="info-value">{{ formatDate(item.fechaInicio) }}</span>
                            </div>
                            <div v-if="item.numberOfSeasons" class="info-item">
                                <span class="info-label">Temporadas</span>
                                <span class="info-value">{{ item.numberOfSeasons }}</span>
                            </div>
                            <div v-if="item.numberOfEpisodes" class="info-item">
                                <span class="info-label">Episodios Totales</span>
                                <span class="info-value">{{ item.numberOfEpisodes }}</span>
                            </div>
                            <div v-if="item.duracion" class="info-item">
                                <span class="info-label">Duración Episodio</span>
                                <span class="info-value">~{{ item.duracion }} min</span>
                            </div>
                        </div>
                    </div>
                </aside>

                <!-- Right Column: Details & Activity -->
                <main class="right-column">
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

                    <!-- Cast -->
                    <div v-if="item.reparto?.length" class="cast-card glass-card">
                        <h2 class="section-title">
                            <i class="fas fa-users"></i>
                            Reparto Principal
                        </h2>
                        <div class="cast-list">
                            <span v-for="(actor, index) in item.reparto" :key="actor" class="actor-name">
                                {{ actor }}<span v-if="index < item.reparto.length - 1">, </span>
                            </span>
                        </div>
                    </div>

                    <!-- Personal Review -->
                    <div class="review-card glass-card">
                        <h2 class="section-title">
                            <i class="fas fa-quote-left"></i>
                            Tus Pensamientos
                        </h2>
                        <textarea v-model="item.miniReseña"
                            placeholder="Escribe tu opinión personal sobre esta serie..." class="review-textarea"
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
                                Diario de Actividad
                            </h2>
                            <AppButton variant="glass" icon="fa-plus" size="small" @click="openNoteModal()">
                                Nueva Entrada
                            </AppButton>
                        </div>

                        <div v-if="itemNotes.length === 0" class="empty-state">
                            <i class="fas fa-feather-alt"></i>
                            <p>No hay entradas aún. Documenta tu experiencia viendo la serie.</p>
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
        <AppModal :is-open="showEditModal" title="Editar Serie" size="large" @close="showEditModal = false">
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
.series-detail-view {
    min-height: 100vh;
    background: var(--color-bg-main);
}

.backdrop-hero {
    position: relative;
    min-height: 60vh;
    display: flex;
    align-items: flex-end;
    padding-bottom: var(--space-12);
}

.backdrop-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(10, 10, 15, 0.4), rgba(10, 10, 15, 0.95));
}

.container-detail {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 var(--space-8);
    position: relative;
    z-index: 1;
}

.back-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-md);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-base);
    margin-bottom: var(--space-8);
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(-4px);
}

.hero-content {
    max-width: 800px;
}

.series-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 900;
    color: white;
    margin-bottom: var(--space-4);
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
    line-height: 1.1;
}

.tagline {
    font-size: 1.25rem;
    color: var(--color-accent);
    font-style: italic;
    margin-bottom: var(--space-6);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}

.hero-meta {
    display: flex;
    gap: var(--space-6);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
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

.main-content {
    margin-top: calc(var(--space-12) * -1);
    padding-bottom: var(--space-16);
}

.content-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: var(--space-10);

    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
}

.poster-card {
    aspect-ratio: 2/3;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    margin-bottom: var(--space-6);

    .poster-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .poster-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-bg-surface);
        font-size: 5rem;
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

.progress-card {
    padding: var(--space-5);
    margin-bottom: var(--space-6);
}

.progress-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
    border-radius: var(--radius-md);
}

.progress-value {
    font-size: 2rem;
    font-weight: 900;
    color: var(--color-bg-main);
}

.progress-label {
    font-size: 0.75rem;
    color: var(--color-bg-main);
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.platforms-card,
.trailer-card,
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

.platforms-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
}

.platform-badge {
    padding: var(--space-3);
    background: var(--color-bg-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    transition: all var(--transition-base);

    &:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
    }
}

.trailer-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
    color: white;
    border-radius: var(--radius-md);
    font-weight: 700;
    text-decoration: none;
    transition: all var(--transition-base);

    i {
        font-size: 1.25rem;
    }

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(255, 0, 0, 0.4);
    }
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
.cast-card,
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

.cast-list {
    color: var(--color-text-secondary);
    line-height: 1.8;

    .actor-name {
        font-size: 1rem;
    }
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
</style>
