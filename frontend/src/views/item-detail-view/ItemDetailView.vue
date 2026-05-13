<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useNotesStore } from "@/stores/notes";
import { Item, ItemType, ItemStatus, HitoType } from "@/types";
import AppButton from "@/components/common/app-button/AppButton.vue";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import ItemForm from "@/components/items/ItemForm.vue";
import NoteForm from "@/components/notes/note-form/NoteForm.vue";
import NoteCard from "@/components/notes/note-card/NoteCard.vue";
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

const itemId = route.params.id as string;

onMounted(async () => {
  await loadItem();
  await loadNotes();
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

const typeIcons: Record<ItemType, string> = {
  [ItemType.MOVIE]: "fa-film",
  [ItemType.SERIES]: "fa-tv",
  [ItemType.ANIME]: "fa-dragon",
  [ItemType.BOOK]: "fa-book",
  [ItemType.VIDEOGAME]: "fa-gamepad",
  [ItemType.BOARDGAME]: "fa-dice",
};

const statusLabels: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: "Pendiente",
  [ItemStatus.IN_PROGRESS]: "En Progreso",
  [ItemStatus.COMPLETED]: "Completado",
  [ItemStatus.ABANDONED]: "Abandonado",
};

const statusColors: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: "var(--color-warning)",
  [ItemStatus.IN_PROGRESS]: "hsl(200, 90%, 60%)",
  [ItemStatus.COMPLETED]: "var(--color-success)",
  [ItemStatus.ABANDONED]: "var(--text-muted)",
};

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

function openNoteModal(noteId?: string) {
  editingNoteId.value = noteId || null;
  showNoteModal.value = true;
}

async function handleDeleteNote(noteId: string) {
  if (!confirm("¿Estás seguro de que quieres eliminar esta nota?")) return;
  try {
    await notesStore.deleteNote(noteId);
    await loadNotes();
  } catch (error) {
    console.error("Error deleting note:", error);
  }
}

function formatDate(date?: Date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const editingNote = computed(() => {
  if (!editingNoteId.value) return null;
  return itemNotes.value.find((n) => n.id === editingNoteId.value);
});

const displayedMetadata = computed(() => {
  if (!item.value) return [];
  const meta = [];

  if (
    item.value.tipo === ItemType.MOVIE ||
    item.value.tipo === ItemType.ANIME
  ) {
    if (item.value.director)
      meta.push({
        label: "Director",
        value: item.value.director,
        icon: "fa-user-tie",
      });
    if (item.value.duracion)
      meta.push({
        label: "Duración",
        value: `${item.value.duracion} min`,
        icon: "fa-clock",
      });
  }

  if (item.value.tipo === ItemType.SERIES) {
    if (item.value.director)
      meta.push({
        label: "Showrunner",
        value: item.value.director,
        icon: "fa-user-tie",
      });
    if (item.value.numberOfSeasons)
      meta.push({
        label: "Temporadas",
        value: `${item.value.numberOfSeasons}`,
        icon: "fa-layer-group",
      });
    if (item.value.numberOfEpisodes)
      meta.push({
        label: "Episodios",
        value: `${item.value.numberOfEpisodes}`,
        icon: "fa-list-ol",
      });
    if (item.value.duracion)
      meta.push({
        label: "Duración ep.",
        value: `${item.value.duracion} min`,
        icon: "fa-clock",
      });
    if (item.value.progresoTemporadas)
      meta.push({
        label: "Progreso",
        value: item.value.progresoTemporadas,
        icon: "fa-chart-line",
      });
  }

  if (item.value.tipo === ItemType.BOOK) {
    if (item.value.autor)
      meta.push({
        label: "Autor",
        value: item.value.autor,
        icon: "fa-pen-nib",
      });
    if (item.value.editorial)
      meta.push({
        label: "Editorial",
        value: item.value.editorial,
        icon: "fa-book-open",
      });
    if (item.value.progresoLectura)
      meta.push({
        label: "Progreso",
        value: item.value.progresoLectura,
        icon: "fa-bookmark",
      });
  }

  if (item.value.tipo === ItemType.VIDEOGAME) {
    if (item.value.developer)
      meta.push({
        label: "Desarrollador",
        value: item.value.developer,
        icon: "fa-code",
      });
    if (item.value.plataforma)
      meta.push({
        label: "Plataforma",
        value: item.value.plataforma,
        icon: "fa-laptop",
      });
    if (item.value.tiempoEstimado)
      meta.push({
        label: "Tiempo Est.",
        value: item.value.tiempoEstimado,
        icon: "fa-hourglass-half",
      });
  }

  if (item.value.fechaInicio)
    meta.push({
      label: "Estreno",
      value: formatDate(item.value.fechaInicio),
      icon: "fa-calendar",
    });

  return meta;
});

const hasStreamingInfo = computed(
  () =>
    item.value?.streamingPlatforms && item.value.streamingPlatforms.length > 0,
);
const hasCastInfo = computed(
  () => item.value?.reparto && item.value.reparto.length > 0,
);
const hasGenres = computed(
  () => item.value?.genero && item.value.genero.length > 0,
);
const hasTrailer = computed(() => !!item.value?.trailer);

const backdropStyle = computed(() => {
  if (!item.value?.backdropImage) return {};
  return {
    backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 15, 0.7), rgba(10, 10, 15, 0.95)), url(${item.value.backdropImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
});

async function updateMiniReview(review: string) {
  if (!item.value) return;
  try {
    await itemsStore.updateItem(item.value.id, { miniReseña: review });
    item.value.miniReseña = review;
  } catch (error) {
    console.error("Error updating review:", error);
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

async function handleSaveNote(data: {
  texto: string;
  spoilers: boolean;
  hito: HitoType;
}) {
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
          <AppButton
            variant="ghost"
            icon="fa-edit"
            size="small"
            @click="showEditModal = true"
            >Editar</AppButton
          >
          <AppButton
            variant="ghost"
            icon="fa-trash"
            size="small"
            class="delete-action"
            @click="showDeleteConfirm = true"
          ></AppButton>
        </div>
      </nav>

      <div class="detail-layout">
        <aside class="sidebar-column">
          <div class="poster-wrap">
            <img
              v-if="item.imagen"
              :src="item.imagen"
              :alt="item.titulo"
              class="poster-image"
            />
            <div v-else class="poster-fallback">
              <i
                class="fas"
                :class="typeIcons[item.tipo as ItemType] || 'fa-star'"
              ></i>
            </div>
          </div>

          <section class="info-card specs-card">
            <h3 class="card-label">Especificaciones</h3>
            <div class="specs-grid">
              <div
                v-for="meta in displayedMetadata"
                :key="meta.label"
                class="spec-row"
              >
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
                <span class="stat-key">Veces consumido</span>
                <p class="stat-val">{{ item.vecesConsumido || 0 }}</p>
              </div>
              <div class="stat-item">
                <span class="stat-key">Última vez</span>
                <p class="stat-val-date">{{ formatDate(item.ultimaVez) }}</p>
              </div>
            </div>
          </section>
        </aside>

        <main class="main-column">
          <div
            v-if="item.backdropImage"
            class="hero-backdrop"
            :style="backdropStyle"
          >
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
                <span v-for="tag in item.tags" :key="tag" class="tag-chip"
                  >#{{ tag }}</span
                >
              </div>
            </div>

            <div v-if="hasGenres" class="genres-row">
              <span
                v-for="genre in item.genero"
                :key="genre"
                class="genre-pill"
              >
                <i class="fas fa-tag"></i> {{ genre }}
              </span>
            </div>

            <div v-if="hasStreamingInfo" class="info-card streaming-box">
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

            <div v-if="hasTrailer" class="info-card trailer-box">
              <div class="card-header">
                <i class="fas fa-play-circle accent-icon"></i>
                <h3 class="card-title">Tráiler</h3>
              </div>
              <a
                :href="item.trailer"
                target="_blank"
                rel="noopener noreferrer"
                class="youtube-btn"
              >
                <i class="fab fa-youtube"></i> Ver tráiler en YouTube
              </a>
            </div>

            <div v-if="hasCastInfo" class="info-card cast-box">
              <div class="card-header">
                <i class="fas fa-users accent-icon"></i>
                <h3 class="card-title">Reparto Principal</h3>
              </div>
              <div class="cast-text">
                <span
                  v-for="(actor, index) in item.reparto"
                  :key="actor"
                  class="actor-name"
                >
                  {{ actor
                  }}<span v-if="index < item.reparto!.length - 1">, </span>
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
                <div
                  class="status-badge"
                  :style="{ color: statusColors[item.estado] }"
                >
                  <span
                    class="status-dot"
                    :style="{ background: statusColors[item.estado] }"
                  ></span>
                  {{ statusLabels[item.estado] }}
                </div>
              </div>

              <div class="rating-indicator">
                <span class="indicator-label">Valoración:</span>
                <div class="rating-value">
                  {{ item.rating?.toFixed(1) || "—" }}
                  <span class="rating-max">/ 10</span>
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
              <textarea
                v-model="item.miniReseña"
                placeholder="Escribe una breve reflexión o reseña personal..."
                class="thoughts-editor"
                @change="updateMiniReview(item.miniReseña || '')"
              ></textarea>
              <div class="editor-footer">
                <span class="editor-hint">Autoguardado al salir del campo</span>
              </div>
            </div>
          </section>

          <section class="timeline-section">
            <div class="timeline-header">
              <div class="section-heading">
                <i class="fas fa-stream heading-icon heading-icon--primary"></i>
                <h2 class="section-title">Diario de Actividad</h2>
              </div>
              <AppButton
                variant="glass"
                icon="fa-plus"
                size="small"
                @click="openNoteModal()"
                >Nueva Entrada</AppButton
              >
            </div>

            <div v-if="itemNotes.length === 0" class="empty-timeline">
              <i class="fas fa-feather-alt empty-icon"></i>
              <p class="empty-text">
                Nada por aquí aún. Comienza tu viaje añadiendo un hito o nota.
              </p>
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

    <AppModal
      :is-open="showEditModal"
      title="Editar Item"
      size="large"
      @close="showEditModal = false"
    >
      <ItemForm
        :item="item"
        mode="edit"
        @save="handleSaveItem"
        @cancel="showEditModal = false"
      />
    </AppModal>

    <AppModal
      :is-open="showNoteModal"
      :title="editingNoteId ? 'Editar Entrada' : 'Nueva Entrada en el Diario'"
      @close="
        showNoteModal = false;
        editingNoteId = null;
      "
    >
      <NoteForm
        :item-id="item.id"
        :initial-text="editingNote?.contenido"
        :initial-spoilers="editingNote?.esSpoiler"
        :initial-hito="editingNote?.tipoHito"
        @save="handleSaveNote"
        @cancel="
          showNoteModal = false;
          editingNoteId = null;
        "
      />
    </AppModal>

    <AppModal
      :is-open="showDeleteConfirm"
      title="Confirmar Eliminación"
      size="small"
      @close="showDeleteConfirm = false"
    >
      <div class="confirm-body">
        <p class="confirm-text">
          ¿Estás seguro de que quieres eliminar "<strong>{{
            item.titulo
          }}</strong
          >"? Esta acción no se puede deshacer.
        </p>
        <div class="confirm-actions">
          <AppButton variant="ghost" @click="showDeleteConfirm = false"
            >Cancelar</AppButton
          >
          <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem"
            >Eliminar</AppButton
          >
        </div>
      </div>
    </AppModal>
  </div>
</template>
