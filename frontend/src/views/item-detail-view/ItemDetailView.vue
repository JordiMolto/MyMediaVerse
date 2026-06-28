<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useNotesStore } from "@/stores/notes";
import { Item, ItemType, ItemStatus, HitoType } from "@/types";
import AppButton from "@/components/common/app-button/AppButton.vue";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import ItemForm from "@/components/items/item-form/ItemForm.vue";
import NoteForm from "@/components/notes/note-form/NoteForm.vue";
import NoteCard from "@/components/notes/note-card/NoteCard.vue";
import { useConfirm } from "@/composables/useConfirm";
import { useItemEnrichment } from "@/composables/useItemEnrichment";
import { useDetailTemplate } from "@/composables/useDetailTemplate";
import { useDetailTemplatesStore } from "@/stores/detailTemplates";
import { extractIdFromSlug } from "@/utils/slugify";
import "./item-detail-view.css";

const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();
const notesStore = useNotesStore();

const item = ref<Item | null>(null);
const itemNotes = ref<any[]>([]);
const showEditModal = ref(false);
const showNoteModal = ref(false);
const showDeleteConfirm = ref(false);
const editingNoteId = ref<string | null>(null);
const { showConfirm } = useConfirm();
const { isEnriching, enrichmentResult, canEnrich, enrichItem } = useItemEnrichment();
const { bloques } = useDetailTemplate(item);
const showEnrichConfirm = ref(false);

const templatesStore = useDetailTemplatesStore();

// Soporta /:categoria/:slug--id y /item/:id (legacy)
const itemId = route.params.slug
  ? extractIdFromSlug(route.params.slug as string)
  : (route.params.id as string);

onMounted(async () => {
  await Promise.all([loadItem(), loadNotes(), templatesStore.fetchTemplates()]);
});

async function loadItem() {
  const foundItem = await itemsStore.getItemById(itemId);
  if (foundItem) {
    item.value = foundItem;
  } else {
    router.push("/");
  }
}

async function loadNotes() {
  itemNotes.value = await notesStore.fetchNotesByItemId(itemId);
}

// ─── Tipo helpers ─────────────────────────────────────────────────────────────

function tipoMatches(tipo: string, ...keywords: string[]): boolean {
  const t = (tipo || "").toLowerCase();
  return keywords.some((k) => t.includes(k.toLowerCase()));
}

const isSeries = computed(() =>
  item.value ? tipoMatches(item.value.tipo, "series", "serie", "anime") : false,
);
const isMovie = computed(() =>
  item.value && !isSeries.value
    ? tipoMatches(item.value.tipo, "movie", "película", "pelicula", "film")
    : false,
);
const isBook = computed(() =>
  item.value ? tipoMatches(item.value.tipo, "book", "libro") : false,
);
const isGame = computed(() =>
  item.value
    ? tipoMatches(item.value.tipo, "videogame", "videojuego", "juego", "game")
    : false,
);

const typeIcons: Record<string, string> = {
  [ItemType.MOVIE]: "fa-film",
  [ItemType.SERIES]: "fa-tv",
  [ItemType.ANIME]: "fa-dragon",
  [ItemType.BOOK]: "fa-book",
  [ItemType.VIDEOGAME]: "fa-gamepad",
  [ItemType.BOARDGAME]: "fa-dice",
};

function getTypeIcon(tipo: string): string {
  const t = (tipo || "").toLowerCase();
  if (t.includes("anime")) return "fa-dragon";
  if (t.includes("serie") || t.includes("series")) return "fa-tv";
  if (t.includes("movie") || t.includes("película") || t.includes("pelicula")) return "fa-film";
  if (t.includes("libro") || t.includes("book")) return "fa-book";
  if (t.includes("videojuego") || t.includes("videogame") || t.includes("game")) return "fa-gamepad";
  if (t.includes("mesa") || t.includes("boardgame")) return "fa-dice";
  return typeIcons[tipo] || "fa-star";
}

// ─── Status labels adaptativos ────────────────────────────────────────────────

const statusLabels = computed((): Record<ItemStatus, string> => {
  if (isSeries.value) {
    return {
      [ItemStatus.PENDING]: "Pendiente",
      [ItemStatus.IN_PROGRESS]: "Viendo",
      [ItemStatus.COMPLETED]: "Completada",
      [ItemStatus.ABANDONED]: "Abandonada",
    };
  }
  if (isMovie.value) {
    return {
      [ItemStatus.PENDING]: "Pendiente",
      [ItemStatus.IN_PROGRESS]: "Viendo",
      [ItemStatus.COMPLETED]: "Vista",
      [ItemStatus.ABANDONED]: "Abandonada",
    };
  }
  if (isBook.value) {
    return {
      [ItemStatus.PENDING]: "Pendiente",
      [ItemStatus.IN_PROGRESS]: "Leyendo",
      [ItemStatus.COMPLETED]: "Leído",
      [ItemStatus.ABANDONED]: "Abandonado",
    };
  }
  if (isGame.value) {
    return {
      [ItemStatus.PENDING]: "Pendiente",
      [ItemStatus.IN_PROGRESS]: "Jugando",
      [ItemStatus.COMPLETED]: "Completado",
      [ItemStatus.ABANDONED]: "Abandonado",
    };
  }
  return {
    [ItemStatus.PENDING]: "Pendiente",
    [ItemStatus.IN_PROGRESS]: "En Progreso",
    [ItemStatus.COMPLETED]: "Completado",
    [ItemStatus.ABANDONED]: "Abandonado",
  };
});

const statusColors: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: "var(--color-warning)",
  [ItemStatus.IN_PROGRESS]: "hsl(200, 90%, 60%)",
  [ItemStatus.COMPLETED]: "var(--color-success)",
  [ItemStatus.ABANDONED]: "var(--text-muted)",
};

// ─── Diario label adaptativo ──────────────────────────────────────────────────

const diarioLabel = computed(() => {
  if (isSeries.value || isMovie.value) return "Diario de Visión";
  if (isBook.value) return "Diario de Lectura";
  if (isGame.value) return "Diario de Juego";
  return "Diario de Actividad";
});

const diarioEmptyText = computed(() => {
  if (isSeries.value) return "No has registrado ninguna actividad para esta serie.";
  if (isMovie.value) return "No has registrado ninguna actividad para esta película.";
  if (isBook.value) return "No has registrado ninguna actividad para este libro.";
  if (isGame.value) return "No has registrado ninguna actividad para este juego.";
  return "Nada por aquí aún. Comienza tu viaje añadiendo un hito o nota.";
});

// ─── Metadata adaptativa para el sidebar ──────────────────────────────────────

const displayedMetadata = computed(() => {
  if (!item.value) return [];
  const meta: { label: string; value: string; icon: string }[] = [];
  const i = item.value;

  if (isMovie.value) {
    if (i.director) meta.push({ label: "Director", value: i.director, icon: "fa-user-tie" });
    if (i.duracion) meta.push({ label: "Duración", value: `${i.duracion} min`, icon: "fa-clock" });
  }

  if (isSeries.value) {
    if (i.director) meta.push({ label: "Creador / Showrunner", value: i.director, icon: "fa-user-tie" });
    if (i.numberOfSeasons) meta.push({ label: "Temporadas", value: `${i.numberOfSeasons}`, icon: "fa-layer-group" });
    if (i.numberOfEpisodes) meta.push({ label: "Episodios", value: `${i.numberOfEpisodes}`, icon: "fa-list-ol" });
    if (i.duracion) meta.push({ label: "Duración ep.", value: `${i.duracion} min`, icon: "fa-clock" });
    if (i.progresoTemporadas) meta.push({ label: "Progreso", value: i.progresoTemporadas, icon: "fa-chart-line" });
  }

  if (isBook.value) {
    if (i.autor) meta.push({ label: "Autor", value: i.autor, icon: "fa-pen-nib" });
    if (i.editorial) meta.push({ label: "Editorial", value: i.editorial, icon: "fa-book-open" });
    if (i.duracion) meta.push({ label: "Páginas", value: `${i.duracion}`, icon: "fa-file-alt" });
    if (i.progresoLectura) meta.push({ label: "Progreso", value: i.progresoLectura, icon: "fa-bookmark" });
  }

  if (isGame.value) {
    if (i.developer) meta.push({ label: "Desarrollador", value: i.developer, icon: "fa-code" });
    if (i.plataforma) meta.push({ label: "Plataforma", value: i.plataforma, icon: "fa-laptop" });
    if (i.tiempoEstimado) meta.push({ label: "Tiempo Est.", value: i.tiempoEstimado, icon: "fa-hourglass-half" });
  }

  if (!isMovie.value && !isSeries.value && !isBook.value && !isGame.value) {
    if (i.fechaInicio) meta.push({ label: "Fecha", value: formatDate(i.fechaInicio), icon: "fa-calendar" });
  }

  if (i.fechaInicio && (isMovie.value || isSeries.value)) {
    meta.push({ label: "Estreno", value: formatDate(i.fechaInicio), icon: "fa-calendar" });
  }

  return meta;
});

const hasStreamingInfo = computed(
  () => item.value?.streamingPlatforms && item.value.streamingPlatforms.length > 0,
);
const hasCastInfo = computed(() => item.value?.reparto && item.value.reparto.length > 0);
const hasGenres = computed(() => item.value?.genero && item.value.genero.length > 0);
const hasTrailer = computed(() => !!item.value?.trailer);

const backdropStyle = computed(() => {
  if (!item.value?.backdropImage) return {};
  return {
    backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 15, 0.7), rgba(10, 10, 15, 0.95)), url(${item.value.backdropImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
});

// ─── Acciones ─────────────────────────────────────────────────────────────────

async function handleSaveItem(updates: Partial<Item>) {
  if (!item.value) return;
  try {
    await itemsStore.updateItem(item.value.id, updates);
    await loadItem();
    showEditModal.value = false;
  } catch (error) {
    console.error("Error updating item:", error);
  }
}

async function handleDeleteItem() {
  if (!item.value) return;
  try {
    await itemsStore.deleteItem(item.value.id);
    router.push("/");
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

async function toggleFavorite() {
  if (!item.value) return;
  try {
    await itemsStore.toggleFavorite(item.value.id);
    await loadItem();
  } catch (error) {
    console.error("Error toggling favorite:", error);
  }
}

async function confirmAndEnrich() {
  if (!item.value) return;
  showEnrichConfirm.value = false;
  await enrichItem(item.value);
  if (enrichmentResult.value?.success) await loadItem();
}

// ─── Notas ────────────────────────────────────────────────────────────────────

function openNoteModal(noteId?: string) {
  editingNoteId.value = noteId || null;
  showNoteModal.value = true;
}

async function handleDeleteNote(noteId: string) {
  const ok = await showConfirm({
    title: "Eliminar nota",
    message: "¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.",
    confirmLabel: "Eliminar",
    danger: true,
  });
  if (!ok) return;
  try {
    await notesStore.deleteNote(noteId);
    await loadNotes();
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

async function handleSaveNote(data: { texto: string; spoilers: boolean; hito: HitoType }) {
  if (!item.value) return;
  try {
    if (editingNoteId.value) {
      await notesStore.updateNote(editingNoteId.value, {
        contenido: data.texto,
        esSpoiler: data.spoilers,
        tipoHito: data.hito,
      });
    } else {
      await notesStore.createNote({
        itemId: item.value.id,
        contenido: data.texto,
        esSpoiler: data.spoilers,
        tipoHito: data.hito,
      });
    }
    await loadNotes();
    showNoteModal.value = false;
    editingNoteId.value = null;
  } catch (error) {
    console.error("Error saving note:", error);
  }
}

const editingNote = computed(() => {
  if (!editingNoteId.value) return null;
  return itemNotes.value.find((n) => n.id === editingNoteId.value);
});

// ─── Utils ────────────────────────────────────────────────────────────────────

function formatDate(date?: Date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
          <button
            class="favorite-toggle"
            :class="{ active: item.favorito }"
            @click="toggleFavorite"
            title="Marcar como favorito"
          >
            <i class="fa-heart" :class="item.favorito ? 'fas' : 'far'"></i>
          </button>
          <AppButton variant="ghost" icon="fa-edit" size="small" @click="showEditModal = true">
            Editar
          </AppButton>
          <AppButton
            variant="ghost"
            icon="fa-trash"
            size="small"
            class="delete-action"
            @click="showDeleteConfirm = true"
          />
        </div>
      </nav>

      <div class="detail-layout">
        <aside class="sidebar-column">
          <div v-if="bloques.poster" class="poster-wrap">
            <img v-if="item.imagen" :src="item.imagen" :alt="item.titulo" class="poster-image" />
            <div v-else class="poster-fallback">
              <i class="fas" :class="getTypeIcon(item.tipo)"></i>
            </div>
          </div>

          <section v-if="bloques.detalles && displayedMetadata.length > 0" class="info-card specs-card">
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

          <div v-if="bloques.acciones" class="sidebar-actions">
            <AppButton
              v-if="canEnrich(item.tipo)"
              variant="glass"
              icon="fa-magic"
              full-width
              :loading="isEnriching"
              @click="showEnrichConfirm = true"
            >
              Regenerar info automáticamente
            </AppButton>
          </div>
        </aside>

        <main class="main-column">
          <div v-if="bloques.hero && item.backdropImage" class="hero-backdrop" :style="backdropStyle">
            <div class="hero-content">
              <h1 class="hero-title">{{ item.titulo }}</h1>
              <p v-if="bloques.heroTagline && item.tagline" class="hero-tagline">{{ item.tagline }}</p>
            </div>
          </div>

          <header class="main-header">
            <div v-if="!item.backdropImage || !bloques.hero" class="header-titles">
              <div class="title-row">
                <h1 class="main-title">{{ item.titulo }}</h1>
                <div class="type-pill">{{ item.tipo }}</div>
              </div>
              <p v-if="item.tagline" class="main-tagline">{{ item.tagline }}</p>
              <div v-if="item.tags?.length" class="tags-list">
                <span v-for="tag in item.tags" :key="tag" class="tag-chip">#{{ tag }}</span>
              </div>
            </div>

            <div v-if="bloques.heroGeneros && hasGenres" class="genres-row">
              <span v-for="genre in item.genero" :key="genre" class="genre-pill">
                <i class="fas fa-tag"></i> {{ genre }}
              </span>
            </div>

            <div v-if="bloques.plataformasStreaming && hasStreamingInfo" class="info-card streaming-box">
              <div class="card-header">
                <i class="fas fa-tv accent-icon"></i>
                <h3 class="card-title">Disponible en</h3>
              </div>
              <div class="platforms-list">
                <span
                  v-for="platform in item.streamingPlatforms"
                  :key="platform"
                  class="platform-chip"
                >
                  {{ platform }}
                </span>
              </div>
            </div>

            <div v-if="bloques.trailer && hasTrailer" class="info-card trailer-box">
              <div class="card-header">
                <i class="fas fa-play-circle accent-icon"></i>
                <h3 class="card-title">Tráiler</h3>
              </div>
              <a :href="item.trailer" target="_blank" rel="noopener noreferrer" class="youtube-btn">
                <i class="fab fa-youtube"></i> Ver tráiler en YouTube
              </a>
            </div>

            <div v-if="bloques.reparto && hasCastInfo" class="info-card cast-box">
              <div class="card-header">
                <i class="fas fa-users accent-icon"></i>
                <h3 class="card-title">Reparto Principal</h3>
              </div>
              <div class="cast-text">
                <span v-for="actor in item.reparto" :key="actor" class="actor-name">
                  {{ actor }} |
                </span>
              </div>
            </div>

            <div v-if="bloques.sinopsis && item.descripcion" class="info-card synopsis-box">
              <h3 class="synopsis-label">Sinopsis</h3>
              <p class="synopsis-text">{{ item.descripcion }}</p>
            </div>

            <div v-if="bloques.estado" class="status-bar">
              <div class="status-indicator">
                <span class="indicator-label">Estado:</span>
                <div class="status-badge" :style="{ color: statusColors[item.estado] }">
                  <span class="status-dot" :style="{ background: statusColors[item.estado] }"></span>
                  {{ statusLabels[item.estado] }}
                </div>
              </div>

              <div v-if="item.estado === ItemStatus.COMPLETED" class="rating-indicator">
                <span class="indicator-label">Valoración:</span>
                <div class="rating-value">
                  {{ item.rating?.toFixed(1) || "—" }}
                  <span class="rating-max">/ 10</span>
                </div>
              </div>
            </div>
          </header>

          <section v-if="bloques.diario" class="timeline-section">
            <div class="timeline-header">
              <div class="section-heading">
                <i class="fas fa-stream heading-icon heading-icon--primary"></i>
                <h2 class="section-title">{{ diarioLabel }}</h2>
              </div>
              <AppButton variant="glass" icon="fa-plus" size="small" @click="openNoteModal()">
                Nueva Entrada
              </AppButton>
            </div>

            <div v-if="itemNotes.length === 0" class="empty-timeline">
              <i class="fas fa-feather-alt empty-icon"></i>
              <p class="empty-text">{{ diarioEmptyText }}</p>
            </div>

            <div v-else class="timeline-list">
              <NoteCard
                v-for="note in itemNotes"
                :key="note.id"
                :note="note"
                @edit="openNoteModal"
                @delete="handleDeleteNote"
              />
            </div>
          </section>
        </main>
      </div>
    </div>

    <!-- Modal editar -->
    <AppModal
      :is-open="showEditModal"
      title="Editar Item"
      size="large"
      @close="showEditModal = false"
    >
      <ItemForm :item="item" mode="edit" @save="handleSaveItem" @cancel="showEditModal = false" />
    </AppModal>

    <!-- Modal nota -->
    <AppModal
      :is-open="showNoteModal"
      :title="editingNoteId ? 'Editar Entrada' : 'Nueva Entrada en el Diario'"
      @close="showNoteModal = false; editingNoteId = null"
    >
      <NoteForm
        :item-id="item.id"
        :initial-text="editingNote?.contenido"
        :initial-spoilers="editingNote?.esSpoiler"
        :initial-hito="editingNote?.tipoHito"
        @save="handleSaveNote"
        @cancel="showNoteModal = false; editingNoteId = null"
      />
    </AppModal>

    <!-- Modal eliminar -->
    <AppModal
      :is-open="showDeleteConfirm"
      title="Confirmar Eliminación"
      size="small"
      @close="showDeleteConfirm = false"
    >
      <div class="confirm-body">
        <p class="confirm-text">
          ¿Estás seguro de que quieres eliminar "<strong>{{ item.titulo }}</strong>"?
          Esta acción no se puede deshacer.
        </p>
        <div class="confirm-actions">
          <AppButton variant="ghost" @click="showDeleteConfirm = false">Cancelar</AppButton>
          <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem">Eliminar</AppButton>
        </div>
      </div>
    </AppModal>

    <!-- Modal enriquecer -->
    <AppModal
      :is-open="showEnrichConfirm"
      title="Regenerar información"
      size="small"
      @close="showEnrichConfirm = false"
    >
      <div class="confirm-body">
        <p class="confirm-text">
          Se va a buscar y sobrescribir la información de <strong>{{ item.titulo }}</strong> con
          datos de fuentes externas (TMDB / Google Books).
        </p>
        <p class="confirm-text" style="margin-top: 0.5rem; opacity: 0.7; font-size: 0.85em">
          Los campos como director, reparto, sinopsis, póster y géneros se actualizarán. Cualquier
          edición manual sobre esos campos se perderá. Mientras que campos como Notas, Valoración,
          Estado y Tags no se verán afectados.
        </p>
        <div class="confirm-actions">
          <AppButton variant="ghost" @click="showEnrichConfirm = false">Cancelar</AppButton>
          <AppButton
            variant="primary"
            icon="fa-magic"
            :loading="isEnriching"
            @click="confirmAndEnrich"
          >
            Sí, regenerar
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>
