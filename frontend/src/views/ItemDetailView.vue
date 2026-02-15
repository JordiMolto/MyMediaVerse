<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItemsStore } from '@/stores/items'
import { useNotesStore } from '@/stores/notes'
import { Item, ItemType, ItemStatus, HitoType } from '@/types'
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

const displayedMetadata = computed(() => {
  if (!item.value) return []
  const meta = []

  if (item.value.tipo === ItemType.MOVIE || item.value.tipo === ItemType.ANIME) {
    if (item.value.director) meta.push({ label: 'Director', value: item.value.director, icon: 'fa-user-tie' })
    if (item.value.duracion) meta.push({ label: 'Duración', value: `${item.value.duracion} min`, icon: 'fa-clock' })
  }

  if (item.value.tipo === ItemType.SERIES) {
    if (item.value.director) meta.push({ label: 'Showrunner', value: item.value.director, icon: 'fa-user-tie' })
    if (item.value.numberOfSeasons) meta.push({ label: 'Temporadas', value: `${item.value.numberOfSeasons}`, icon: 'fa-layer-group' })
    if (item.value.numberOfEpisodes) meta.push({ label: 'Episodios', value: `${item.value.numberOfEpisodes}`, icon: 'fa-list-ol' })
    if (item.value.duracion) meta.push({ label: 'Duración ep.', value: `${item.value.duracion} min`, icon: 'fa-clock' })
    if (item.value.progresoTemporadas) meta.push({ label: 'Progreso', value: item.value.progresoTemporadas, icon: 'fa-chart-line' })
  }

  if (item.value.tipo === ItemType.BOOK) {
    if (item.value.autor) meta.push({ label: 'Autor', value: item.value.autor, icon: 'fa-pen-nib' })
    if (item.value.editorial) meta.push({ label: 'Editorial', value: item.value.editorial, icon: 'fa-book-open' })
    if (item.value.progresoLectura) meta.push({ label: 'Progreso', value: item.value.progresoLectura, icon: 'fa-bookmark' })
  }

  if (item.value.tipo === ItemType.VIDEOGAME) {
    if (item.value.developer) meta.push({ label: 'Desarrollador', value: item.value.developer, icon: 'fa-code' })
    if (item.value.plataforma) meta.push({ label: 'Plataforma', value: item.value.plataforma, icon: 'fa-laptop' })
    if (item.value.tiempoEstimado) meta.push({ label: 'Tiempo Est.', value: item.value.tiempoEstimado, icon: 'fa-hourglass-half' })
  }

  if (item.value.fechaInicio) meta.push({ label: 'Estreno', value: formatDate(item.value.fechaInicio), icon: 'fa-calendar' })

  return meta
})

const hasStreamingInfo = computed(() => {
  return item.value?.streamingPlatforms && item.value.streamingPlatforms.length > 0
})

const hasCastInfo = computed(() => {
  return item.value?.reparto && item.value.reparto.length > 0
})

const hasGenres = computed(() => {
  return item.value?.genero && item.value.genero.length > 0
})

const hasTrailer = computed(() => {
  return !!item.value?.trailer
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
  <div v-if="item" class="item-detail-view py-8 px-4">
    <div class="container-detail">
      <!-- Top Navigation -->
      <nav class="detail-nav mb-8 flex justify-between items-center">
        <button class="back-btn flex items-center gap-2 text-secondary hover:text-primary transition-colors"
          @click="router.back()">
          <i class="fas fa-arrow-left"></i>
          <span>Volver</span>
        </button>
        <div class="header-actions flex items-center gap-4">
          <button class="favorite-btn" :class="{ 'is-favorite': item.favorito }" @click="toggleFavorite"
            title="Marcar como favorito">
            <i class="fa-heart" :class="item.favorito ? 'fas' : 'far'"></i>
          </button>
          <AppButton variant="ghost" icon="fa-edit" size="small" @click="showEditModal = true">Editar</AppButton>
          <AppButton variant="ghost" icon="fa-trash" size="small" class="text-danger-hover"
            @click="showDeleteConfirm = true"></AppButton>
        </div>
      </nav>

      <div class="detail-grid">
        <!-- LEFT COLUMN: Physicality & Specs (30%) -->
        <aside class="left-column">
          <div class="poster-container mb-8">
            <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" class="poster-img shadow-2xl" />
            <div v-else class="poster-placeholder shadow-2xl">
              <i class="fas" :class="typeIcons[item.tipo as ItemType] || 'fa-star'"></i>
            </div>
          </div>

          <section class="specs-section glass-card p-6 mb-6">
            <h3 class="section-label uppercase text-[10px] fw-bold tracking-widest text-muted mb-4">Especificaciones
            </h3>
            <div class="specs-list flex flex-col gap-4">
              <div v-for="meta in displayedMetadata" :key="meta.label" class="spec-item">
                <i class="fas spec-icon" :class="meta.icon"></i>
                <div class="spec-info">
                  <span class="spec-label">{{ meta.label }}</span>
                  <p class="spec-value text-secondary">{{ meta.value }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="stats-section glass-card p-6">
            <h3 class="section-label uppercase text-[10px] fw-bold tracking-widest text-muted mb-4">Estadísticas</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <span class="stat-label">Veces consumed</span>
                <p class="stat-value">{{ item.vecesConsumido || 0 }}</p>
              </div>
              <div class="stat-box">
                <span class="stat-label">Última vez</span>
                <p class="stat-value text-xs">{{ formatDate(item.ultimaVez) }}</p>
              </div>
            </div>
          </section>
        </aside>

        <!-- RIGHT COLUMN: Activity & Soul (70%) -->
        <main class="right-column">
          <!-- Backdrop Header (if available) -->
          <div v-if="item.backdropImage" class="backdrop-header mb-8" :style="backdropStyle">
            <div class="backdrop-content">
              <h1 class="text-5xl fw-black text-white mb-2">{{ item.titulo }}</h1>
              <p v-if="item.tagline" class="tagline text-xl text-accent italic">{{ item.tagline }}</p>
            </div>
          </div>

          <!-- Title & Core Info Header -->
          <header class="detail-header mb-10">
            <div v-if="!item.backdropImage" class="flex flex-col gap-2 mb-6">
              <div class="flex items-center gap-4">
                <h1 class="text-4xl fw-bold text-white">{{ item.titulo }}</h1>
                <div class="type-badge text-xs px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded">
                  {{ item.tipo }}
                </div>
              </div>
              <p v-if="item.tagline" class="tagline text-lg text-accent italic mt-2">{{ item.tagline }}</p>
              <div v-if="item.tags?.length" class="tags-row flex gap-2 mt-2">
                <span v-for="tag in item.tags" :key="tag" class="tag-pill">#{{ tag }}</span>
              </div>
            </div>

            <!-- Genres Pills -->
            <div v-if="hasGenres" class="genres-section mb-6">
              <div class="flex flex-wrap gap-2">
                <span v-for="genre in item.genero" :key="genre" class="genre-pill">
                  <i class="fas fa-tag"></i>
                  {{ genre }}
                </span>
              </div>
            </div>

            <!-- Streaming Platforms -->
            <div v-if="hasStreamingInfo" class="streaming-section glass-card p-4 mb-6">
              <div class="flex items-center gap-3 mb-3">
                <i class="fas fa-tv text-accent"></i>
                <h3 class="text-sm fw-bold text-white uppercase tracking-wider">Disponible en</h3>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="platform in item.streamingPlatforms" :key="platform" class="platform-badge">
                  {{ platform }}
                </span>
              </div>
            </div>

            <!-- Trailer -->
            <div v-if="hasTrailer" class="trailer-section glass-card p-4 mb-6">
              <div class="flex items-center gap-3 mb-3">
                <i class="fas fa-play-circle text-accent"></i>
                <h3 class="text-sm fw-bold text-white uppercase tracking-wider">Tráiler</h3>
              </div>
              <a :href="item.trailer" target="_blank" rel="noopener noreferrer" class="trailer-link">
                <i class="fab fa-youtube"></i>
                Ver tráiler en YouTube
              </a>
            </div>

            <!-- Cast -->
            <div v-if="hasCastInfo" class="cast-section glass-card p-4 mb-6">
              <div class="flex items-center gap-3 mb-3">
                <i class="fas fa-users text-accent"></i>
                <h3 class="text-sm fw-bold text-white uppercase tracking-wider">Reparto Principal</h3>
              </div>
              <div class="cast-list">
                <span v-for="(actor, index) in item.reparto" :key="actor" class="cast-name">
                  {{ actor }}<span v-if="index < item.reparto!.length - 1">, </span>
                </span>
              </div>
            </div>

            <!-- Description -->
            <div v-if="item.descripcion" class="description-section glass-card p-6 mb-6">
              <h3 class="text-sm fw-bold text-muted uppercase tracking-wider mb-3">Sinopsis</h3>
              <p class="text-secondary leading-relaxed">{{ item.descripcion }}</p>
            </div>

            <div
              class="core-controls-row flex items-center justify-between p-6 glass-card border-accent/20 bg-accent/5">
              <div class="status-selector-wrapper flex items-center gap-4">
                <span class="text-sm fw-bold text-muted uppercase tracking-wider">Estado:</span>
                <div class="custom-status" :style="{ color: statusColors[item.estado] }">
                  <span class="dot" :style="{ background: statusColors[item.estado] }"></span>
                  {{ statusLabels[item.estado] }}
                </div>
              </div>

              <div class="rating-display flex items-center gap-4">
                <span class="text-sm fw-bold text-muted uppercase tracking-wider">Valoración:</span>
                <div class="rating-score text-3xl fw-black italic text-warning">
                  {{ item.rating?.toFixed(1) || '—' }} <span class="text-xs text-muted">/ 10</span>
                </div>
              </div>
            </div>
          </header>

          <!-- Thoughts Section -->
          <section class="thoughts-section mb-10">
            <div class="flex items-center gap-3 mb-4">
              <i class="fas fa-quote-left text-accent text-xl"></i>
              <h2 class="text-xl fw-bold text-white">Pensamientos</h2>
            </div>
            <div class="thoughts-box glass-card p-6">
              <textarea v-model="item.miniReseña" placeholder="Escribe una breve reflexión o reseña personal..."
                class="reseña-textarea" @change="updateMiniReview(item.miniReseña || '')"></textarea>
              <div class="text-right mt-2">
                <span class="text-[10px] text-muted uppercase tracking-tighter">Autoguardado al salir del campo</span>
              </div>
            </div>
          </section>

          <!-- Activity / Journal Timeline -->
          <section class="activity-section">
            <div class="flex justify-between items-center mb-6">
              <div class="flex items-center gap-3">
                <i class="fas fa-stream text-primary text-xl"></i>
                <h2 class="text-xl fw-bold text-white">Diario de Actividad</h2>
              </div>
              <AppButton variant="glass" icon="fa-plus" size="small" @click="openNoteModal()">Nueva Entrada</AppButton>
            </div>

            <div v-if="itemNotes.length === 0"
              class="empty-timeline py-12 flex flex-col items-center gap-4 text-center">
              <i class="fas fa-feather-alt text-4xl opacity-10"></i>
              <p class="text-muted italic">Nada por aquí aún. Comienza tu viaje añadiendo un hito o nota.</p>
            </div>

            <div v-else class="timeline-container mt-8">
              <NoteCard v-for="note in itemNotes" :key="note.id" :note="note" @edit="openNoteModal"
                @delete="handleDeleteNote" />
            </div>
          </section>
        </main>
      </div>
    </div>

    <!-- Modals -->
    <AppModal :is-open="showEditModal" title="Editar Item" size="large" @close="showEditModal = false">
      <ItemForm :item="item" mode="edit" @save="handleSaveItem" @cancel="showEditModal = false" />
    </AppModal>

    <AppModal :is-open="showNoteModal" :title="editingNoteId ? 'Editar Entrada' : 'Nueva Entrada en el Diario'"
      @close="showNoteModal = false; editingNoteId = null">
      <NoteForm :item-id="item.id" :initial-text="editingNote?.contenido" :initial-spoilers="editingNote?.esSpoiler"
        :initial-hito="editingNote?.tipoHito" @save="handleSaveNote"
        @cancel="showNoteModal = false; editingNoteId = null" />
    </AppModal>

    <AppModal :is-open="showDeleteConfirm" title="Confirmar Eliminación" size="small"
      @close="showDeleteConfirm = false">
      <div class="p-4">
        <p class="mb-6 leading-relaxed">
          ¿Estás seguro de que quieres eliminar "<strong>{{ item.titulo }}</strong>"?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-4 justify-end">
          <AppButton variant="ghost" @click="showDeleteConfirm = false">Cancelar</AppButton>
          <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem">Eliminar</AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
.item-detail-view {
  background: var(--color-bg-main);
  min-height: 100vh;
}

.container-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-12);
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.poster-container {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  position: sticky;
  top: 100px;

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
    font-size: 5rem;
    color: var(--color-text-muted);
    opacity: 0.2;
  }
}

.specs-section {
  .spec-item {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;

    .spec-icon {
      margin-top: 4px;
      width: 16px;
      color: var(--color-primary);
      font-size: 0.9rem;
    }

    .spec-label {
      font-size: 0.7rem;
      color: var(--color-text-muted);
      text-transform: uppercase;
      font-weight: 700;
    }

    .spec-value {
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);

  .stat-box {
    .stat-label {
      display: block;
      font-size: 0.6rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-text-muted);
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--color-accent);
    }
  }
}

.tag-pill {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.backdrop-header {
  position: relative;
  padding: var(--space-16) var(--space-8);
  border-radius: var(--radius-xl);
  overflow: hidden;
  margin: calc(var(--space-8) * -1) calc(var(--space-8) * -1) var(--space-8);

  .backdrop-content {
    position: relative;
    z-index: 1;

    .tagline {
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    }
  }

  h1 {
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
  }
}

.genre-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  color: var(--color-bg-main);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(0, 245, 255, 0.3);

  i {
    font-size: 0.7rem;
  }
}

.platform-badge {
  padding: var(--space-2) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    transform: translateY(-2px);
  }
}

.trailer-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
  color: white;
  border-radius: var(--radius-md);
  font-weight: 700;
  text-decoration: none;
  transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);

  i {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 0, 0, 0.5);
  }
}

.cast-list {
  color: var(--color-text-secondary);
  line-height: 1.8;

  .cast-name {
    font-size: 0.95rem;
  }
}

.description-section {
  p {
    font-size: 1rem;
    line-height: 1.8;
  }
}

.tagline {
  font-style: italic;
  opacity: 0.9;
}

.custom-status {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-weight: 800;
  font-size: 1.1rem;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    box-shadow: 0 0 10px currentColor;
  }
}

.reseña-textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-family: var(--font-main);
  font-size: 1rem;
  line-height: 1.7;
  resize: vertical;
  min-height: 120px;
  outline: none;

  &::placeholder {
    color: var(--color-text-muted);
    font-style: italic;
  }
}

.text-danger-hover:hover {
  color: var(--color-danger) !important;
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
    /* Rosa vibrante */
    filter: drop-shadow(0 0 8px rgba(255, 51, 153, 0.4));
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }
}
</style>
