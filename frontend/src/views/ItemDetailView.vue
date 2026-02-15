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
  <div v-if="item" class="item-detail-view">
    <div class="detail-container">
      <nav class="detail-nav">
        <button class="back-link" @click="router.back()">
          <i class="fas fa-arrow-left"></i>
          <span>Volver</span>
        </button>
        <div class="header-tools">
          <button class="favorite-toggle" :class="{ 'active': item.favorito }" @click="toggleFavorite"
            title="Marcar como favorito">
            <i class="fa-heart" :class="item.favorito ? 'fas' : 'far'"></i>
          </button>
          <AppButton variant="ghost" icon="fa-edit" size="small" @click="showEditModal = true">Editar</AppButton>
          <AppButton variant="ghost" icon="fa-trash" size="small" class="delete-action"
            @click="showDeleteConfirm = true"></AppButton>
        </div>
      </nav>

      <div class="detail-layout">
        <aside class="sidebar-column">
          <div class="poster-wrap">
            <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" class="poster-image" />
            <div v-else class="poster-fallback">
              <i class="fas" :class="typeIcons[item.tipo as ItemType] || 'fa-star'"></i>
            </div>
          </div>

          <section class="info-card specs-card">
            <h3 class="card-label">Especificaciones</h3>
            <div class="specs-grid">
              <div v-for="meta in displayedMetadata" :key="meta.label" class="spec-row">
                <i class="fas spec-icon" :class="meta.icon"></i>
                <div class="spec-content">
                  <span class="spec-key">{{ meta.label }}</span>
                  <p class="spec-val">{{ meta.value }}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="info-card stats-card">
            <h3 class="card-label">Estadísticas</h3>
            <div class="stats-summary">
              <div class="stat-item">
                <span class="stat-key">Veces consumed</span>
                <p class="stat-val">{{ item.vecesConsumido || 0 }}</p>
              </div>
              <div class="stat-item">
                <span class="stat-key">Última vez</span>
                <p class="stat-val-date">{{ formatDate(item.ultimaVez) }}</p>
              </div>
            </div>
          </section>
        </aside>

        <!-- RIGHT COLUMN: Activity & Soul (70%) -->
        <main class="main-column">
          <div v-if="item.backdropImage" class="hero-backdrop" :style="backdropStyle">
            <div class="hero-content">
              <h1 class="hero-title">{{ item.titulo }}</h1>
              <p v-if="item.tagline" class="hero-tagline">{{ item.tagline }}</p>
            </div>
          </div>

          <header class="main-header">
            <div v-if="!item.backdropImage" class="header-titles">
              <div class="title-row">
                <h1 class="main-title">{{ item.titulo }}</h1>
                <div class="type-pill">{{ item.tipo }}</div>
              </div>
              <p v-if="item.tagline" class="main-tagline">{{ item.tagline }}</p>
              <div v-if="item.tags?.length" class="tags-list">
                <span v-for="tag in item.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
              </div>
            </div>

            <div v-if="hasGenres" class="genres-row">
              <span v-for="genre in item.genero" :key="genre" class="genre-pill">
                <i class="fas fa-tag"></i> {{ genre }}
              </span>
            </div>

            <div v-if="hasStreamingInfo" class="info-card streaming-box">
              <div class="card-header">
                <i class="fas fa-tv accent-icon"></i>
                <h3 class="card-title">Disponible en</h3>
              </div>
              <div class="platforms-list">
                <span v-for="platform in item.streamingPlatforms" :key="platform" class="platform-chip">
                  {{ platform }}
                </span>
              </div>
            </div>

            <div v-if="hasTrailer" class="info-card trailer-box">
              <div class="card-header">
                <i class="fas fa-play-circle accent-icon"></i>
                <h3 class="card-title">Tráiler</h3>
              </div>
              <a :href="item.trailer" target="_blank" rel="noopener noreferrer" class="youtube-btn">
                <i class="fab fa-youtube"></i> Ver tráiler en YouTube
              </a>
            </div>

            <div v-if="hasCastInfo" class="info-card cast-box">
              <div class="card-header">
                <i class="fas fa-users accent-icon"></i>
                <h3 class="card-title">Reparto Principal</h3>
              </div>
              <div class="cast-text">
                <span v-for="(actor, index) in item.reparto" :key="actor" class="actor-name">
                  {{ actor }}<span v-if="index < item.reparto!.length - 1">, </span>
                </span>
              </div>
            </div>

            <div v-if="item.descripcion" class="info-card synopsis-box">
              <h3 class="synopsis-label">Sinopsis</h3>
              <p class="synopsis-text">{{ item.descripcion }}</p>
            </div>

            <div class="status-bar">
              <div class="status-indicator">
                <span class="indicator-label">Estado:</span>
                <div class="status-badge" :style="{ color: statusColors[item.estado] }">
                  <span class="status-dot" :style="{ background: statusColors[item.estado] }"></span>
                  {{ statusLabels[item.estado] }}
                </div>
              </div>

              <div class="rating-indicator">
                <span class="indicator-label">Valoración:</span>
                <div class="rating-value">
                  {{ item.rating?.toFixed(1) || '—' }} <span class="rating-max">/ 10</span>
                </div>
              </div>
            </div>
          </header>

          <section class="notes-section">
            <div class="section-heading">
              <i class="fas fa-quote-left heading-icon"></i>
              <h2 class="section-title">Pensamientos</h2>
            </div>
            <div class="thoughts-card">
              <textarea v-model="item.miniReseña" placeholder="Escribe una breve reflexión o reseña personal..."
                class="thoughts-editor" @change="updateMiniReview(item.miniReseña || '')"></textarea>
              <div class="editor-footer">
                <span class="editor-hint">Autoguardado al salir del campo</span>
              </div>
            </div>
          </section>

          <section class="timeline-section">
            <div class="timeline-header">
              <div class="section-heading">
                <i class="fas fa-stream heading-icon primary"></i>
                <h2 class="section-title">Diario de Actividad</h2>
              </div>
              <AppButton variant="glass" icon="fa-plus" size="small" @click="openNoteModal()">Nueva Entrada</AppButton>
            </div>

            <div v-if="itemNotes.length === 0" class="empty-timeline">
              <i class="fas fa-feather-alt empty-icon"></i>
              <p class="empty-text">Nada por aquí aún. Comienza tu viaje añadiendo un hito o nota.</p>
            </div>

            <div v-else class="timeline-list">
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
  min-height: 100vh;
  padding: 32px 16px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
}

.detail-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 16px;
}

.favorite-toggle {
  background: transparent;
  border: none;
  font-size: 22px;
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

  &.active {
    color: #ff3399;
    filter: drop-shadow(0 0 8px rgba(255, 51, 153, 0.4));
    transform: scale(1.1);
  }
}

.delete-action:hover {
  color: var(--color-danger) !important;
}

.detail-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 48px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.poster-wrap {
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 24px;
  overflow: hidden;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  position: sticky;
  top: 100px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);

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
    opacity: 0.2;
  }
}

.info-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
}

.card-label {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 24px;
}

.specs-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.spec-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;

  .spec-icon {
    margin-top: 4px;
    width: 16px;
    color: var(--color-primary);
    font-size: 14px;
  }

  .spec-key {
    display: block;
    font-size: 11px;
    color: var(--color-text-muted);
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .spec-val {
    font-size: 14px;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
}

.stats-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-item {
  .stat-key {
    display: block;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-text-muted);
    margin-bottom: 4px;
  }

  .stat-val {
    font-size: 20px;
    font-weight: 800;
    color: var(--color-accent);
  }

  .stat-val-date {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

.hero-backdrop {
  position: relative;
  padding: 64px 32px;
  border-radius: 24px;
  overflow: hidden;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-end;
  min-height: 300px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10, 10, 15, 0.95), transparent);
    z-index: 0;
  }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 8px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
}

.hero-tagline {
  font-size: 20px;
  color: var(--color-accent);
  font-style: italic;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.main-header {
  margin-bottom: 40px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  color: white;
}

.type-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: 4px;
}

.main-tagline {
  font-size: 18px;
  color: var(--color-accent);
  font-style: italic;
  margin-bottom: 16px;
}

.tags-list {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.tag-chip {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 600;
}

.genres-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.genre-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%);
  color: var(--color-bg-main);
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 245, 255, 0.3);

  i {
    font-size: 11px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.accent-icon {
  color: var(--color-accent);
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.platforms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.platform-chip {
  padding: 8px 16px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
    transform: translateY(-2px);
  }
}

.youtube-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
  color: white;
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 0, 0, 0.5);
  }
}

.cast-text {
  color: var(--color-text-secondary);
  line-height: 1.8;
  font-size: 15px;
}

.synopsis-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.synopsis-text {
  color: var(--color-text-secondary);
  line-height: 1.8;
  font-size: 16px;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: rgba(var(--color-accent-rgb), 0.05);
  border: 1px solid rgba(var(--color-accent-rgb), 0.2);
  border-radius: 16px;
  margin-top: 24px;
}

.indicator-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-right: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 18px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.rating-value {
  font-size: 32px;
  font-weight: 900;
  font-style: italic;
  color: var(--color-warning);
}

.rating-max {
  font-size: 12px;
  color: var(--color-text-muted);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.heading-icon {
  font-size: 20px;
  color: var(--color-accent);

  &.primary {
    color: var(--color-primary);
  }
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.thoughts-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
}

.thoughts-editor {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 16px;
  line-height: 1.7;
  resize: vertical;
  min-height: 120px;
  outline: none;

  &::placeholder {
    color: var(--color-text-muted);
    font-style: italic;
  }
}

.editor-footer {
  text-align: right;
  margin-top: 8px;
}

.editor-hint {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.empty-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 0;
  text-align: center;
}

.empty-icon {
  font-size: 40px;
  opacity: 0.1;
}

.empty-text {
  color: var(--color-text-muted);
  font-style: italic;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
}
</style>
