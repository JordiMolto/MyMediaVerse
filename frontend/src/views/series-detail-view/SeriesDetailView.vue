<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useNotesStore } from "@/stores/notes";
import { Item, ItemStatus, HitoType } from "@/types";
import AppButton from "@/components/common/app-button/AppButton.vue";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import ItemForm from "@/components/items/ItemForm.vue";
import NoteForm from "@/components/notes/note-form/NoteForm.vue";
import NoteCard from "@/components/notes/note-card/NoteCard.vue";
import { useTMDBEnrichment } from "@/composables/useTMDBEnrichment";
import { useConfirm } from "@/composables/useConfirm";
import "./series-detail-view.css";

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
const showEnrichmentModal = ref(false);
const enrichmentResult = ref<any>(null);

const { enrichMultipleItems, isEnriching } = useTMDBEnrichment();
const { showConfirm } = useConfirm();

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

const statusLabels: Record<ItemStatus, string> = {
  [ItemStatus.PENDING]: "Pendiente",
  [ItemStatus.IN_PROGRESS]: "Viendo",
  [ItemStatus.COMPLETED]: "Completada",
  [ItemStatus.ABANDONED]: "Abandonada",
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
  const ok = await showConfirm({
    title: "Eliminar nota",
    message:
      "¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.",
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

const platformLinks: Record<string, string> = {
  netflix: "https://www.netflix.com",
  "amazon prime video": "https://www.amazon.com/gp/video/storefront",
  "prime video": "https://www.amazon.com/gp/video/storefront",
  "disney plus": "https://www.disneyplus.com",
  "disney+": "https://www.disneyplus.com",
  "hbo max": "https://www.max.com",
  max: "https://www.max.com",
  "apple tv": "https://tv.apple.com",
  movistar: "https://ver.movistarplus.es",
  filmin: "https://www.filmin.es",
  rakuten: "https://rakuten.tv",
  crunchyroll: "https://www.crunchyroll.com",
};

function getPlatformUrl(name: string) {
  const n = name.toLowerCase();
  const match = Object.entries(platformLinks).find(([key]) => n.includes(key));
  return match
    ? match[1]
    : `https://www.google.com/search?q=${encodeURIComponent(name)}`;
}

async function handleSingleEnrich() {
  if (!item.value) return;
  const ok = await showConfirm({
    title: "Enriquecer con TMDB",
    message: `¿Quieres enriquecer "${item.value.titulo}" con datos de TMDB?`,
    confirmLabel: "Enriquecer",
  });
  if (!ok) return;
  showEnrichmentModal.value = true;
  const result = await enrichMultipleItems([item.value]);
  enrichmentResult.value = result;
  if (result.success > 0) await loadItem();
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
</script>

<template>
  <div v-if="item" class="series-view">
    <div class="series-hero" :style="backdropStyle">
      <div class="hero-overlay">
        <div class="detail-container">
          <div class="hero-nav">
            <router-link to="/" class="back-link">
              <i class="fas fa-arrow-left"></i>
              Volver
            </router-link>
            <button
              class="favorite-toggle"
              :class="{ active: item.favorito }"
              @click="toggleFavorite"
              title="Marcar como favorito"
            >
              <i class="fa-heart" :class="item.favorito ? 'fas' : 'far'"></i>
            </button>
          </div>

          <div class="hero-main">
            <h1 class="series-title">{{ item.titulo }}</h1>
            <p v-if="item.tagline" class="series-tagline">{{ item.tagline }}</p>

            <div class="series-meta">
              <span v-if="item.fechaInicio" class="meta-tag">
                <i class="fas fa-calendar"></i>
                {{ new Date(item.fechaInicio).getFullYear() }}
              </span>
              <span v-if="item.numberOfSeasons" class="meta-tag">
                <i class="fas fa-layer-group"></i>
                {{ item.numberOfSeasons }}
                {{ item.numberOfSeasons === 1 ? "Temporada" : "Temporadas" }}
              </span>
              <span v-if="item.numberOfEpisodes" class="meta-tag">
                <i class="fas fa-list-ol"></i>
                {{ item.numberOfEpisodes }} Episodios
              </span>
              <span v-if="item.duracion" class="meta-tag">
                <i class="fas fa-clock"></i>
                {{ item.duracion }} min/ep
              </span>
              <span v-if="item.rating" class="meta-tag meta-tag--rating">
                <i class="fas fa-star"></i>
                {{ item.rating.toFixed(1) }}
              </span>
            </div>

            <div v-if="item.genero?.length" class="series-genres">
              <span
                v-for="genre in item.genero"
                :key="genre"
                class="genre-tag"
                >{{ genre }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-container main-content">
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
              <i class="fas fa-tv"></i>
            </div>
          </div>

          <div class="actions-group">
            <AppButton
              variant="primary"
              icon="fa-edit"
              block
              @click="showEditModal = true"
              >Editar Serie</AppButton
            >
            <AppButton
              variant="glass"
              icon="fa-magic"
              block
              :loading="isEnriching"
              @click="handleSingleEnrich"
              >Enriquecer Datos</AppButton
            >
            <AppButton
              variant="ghost"
              icon="fa-trash"
              block
              @click="showDeleteConfirm = true"
              >Eliminar Serie</AppButton
            >
          </div>

          <div v-if="item.progresoTemporadas" class="info-card">
            <h3 class="card-title">
              <i class="fas fa-chart-line"></i> Tu Progreso
            </h3>
            <div class="status-badge" style="color: var(--color-accent)">
              <span
                class="status-dot"
                style="background: var(--color-accent)"
              ></span>
              {{ item.progresoTemporadas }} Temporadas vistas
            </div>
          </div>

          <div v-if="item.streamingPlatforms?.length" class="info-card">
            <h3 class="card-title"><i class="fas fa-play"></i> Dónde Ver</h3>
            <div class="platforms-grid">
              <a
                v-for="platform in item.streamingPlatforms"
                :key="platform"
                :href="getPlatformUrl(platform)"
                target="_blank"
                rel="noopener noreferrer"
                class="platform-link"
              >
                {{ platform }}
                <i class="fas fa-external-link-alt link-icon"></i>
              </a>
            </div>
          </div>

          <div v-if="item.trailer" class="info-card">
            <h3 class="card-title">
              <i class="fab fa-youtube"></i> Tráiler Oficial
            </h3>
            <a
              :href="item.trailer"
              target="_blank"
              rel="noopener noreferrer"
              class="youtube-action"
            >
              <i class="fab fa-youtube"></i> Ver en YouTube
            </a>
          </div>

          <div class="info-card">
            <h3 class="card-title">
              <i class="fas fa-info-circle"></i> Detalles
            </h3>
            <div class="meta-list">
              <div v-if="item.director" class="meta-row">
                <span class="meta-key">Creador</span>
                <span class="meta-val">{{ item.director }}</span>
              </div>
              <div v-if="item.fechaInicio" class="meta-row">
                <span class="meta-key">Estreno</span>
                <span class="meta-val">{{ formatDate(item.fechaInicio) }}</span>
              </div>
              <div v-if="item.numberOfSeasons" class="meta-row">
                <span class="meta-key">Temporadas</span>
                <span class="meta-val">{{ item.numberOfSeasons }}</span>
              </div>
              <div v-if="item.numberOfEpisodes" class="meta-row">
                <span class="meta-key">Episodios</span>
                <span class="meta-val">{{ item.numberOfEpisodes }}</span>
              </div>
              <div v-if="item.duracion" class="meta-row">
                <span class="meta-key">Duración Ep.</span>
                <span class="meta-val">~{{ item.duracion }} min</span>
              </div>
            </div>
          </div>
        </aside>

        <main class="content-column">
          <div class="info-card status-indicator-card">
            <div class="status-group">
              <span class="indicator-label">Estado</span>
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
            <div class="rating-group">
              <span class="indicator-label">Tu Valoración</span>
              <div class="rating-score">
                {{ item.rating?.toFixed(1) || "—" }}
                <span class="rating-max">/ 10</span>
              </div>
            </div>
          </div>

          <div v-if="item.descripcion" class="info-card description-card">
            <h2 class="section-title">
              <i class="fas fa-align-left"></i> Sinopsis
            </h2>
            <p class="description-text">{{ item.descripcion }}</p>
          </div>

          <div v-if="item.reparto?.length" class="info-card cast-card">
            <h2 class="section-title">
              <i class="fas fa-users"></i> Reparto Principal
            </h2>
            <div class="actors-list">
              <span
                v-for="(actor, index) in item.reparto"
                :key="actor"
                class="actor-name"
              >
                {{ actor
                }}<span v-if="index < item.reparto.length - 1">, </span>
              </span>
            </div>
          </div>

          <div class="info-card thoughts-box-card">
            <h2 class="section-title">
              <i class="fas fa-quote-left"></i> Tu Reseña
            </h2>
            <textarea
              v-model="item.miniReseña"
              placeholder="¿Qué te ha parecido la serie hasta ahora?..."
              class="thoughts-editor"
              @change="updateMiniReview(item.miniReseña || '')"
            ></textarea>
            <div class="editor-hint">
              <i class="fas fa-check-circle"></i> Se guarda automáticamente al
              salir
            </div>
          </div>

          <div class="activity-section">
            <div class="timeline-header">
              <h2 class="section-title">
                <i class="fas fa-stream"></i> Diario de Visión
              </h2>
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
                No has registrado ninguna actividad para esta serie.
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
          </div>
        </main>
      </div>
    </div>

    <AppModal
      :is-open="showEditModal"
      title="Editar Serie"
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
      :title="editingNoteId ? 'Editar Entrada' : 'Nueva Entrada'"
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
      title="Eliminar Serie"
      size="small"
      @close="showDeleteConfirm = false"
    >
      <div class="delete-confirmation">
        <p class="delete-msg">
          ¿Estás seguro de que quieres eliminar "<strong>{{
            item.titulo
          }}</strong
          >"?
        </p>
        <p class="delete-warning">
          Esta acción eliminará permanentemente la serie y todas sus notas.
        </p>
        <div class="delete-actions">
          <AppButton variant="ghost" @click="showDeleteConfirm = false"
            >Cancelar</AppButton
          >
          <AppButton variant="danger" icon="fa-trash" @click="handleDeleteItem"
            >Eliminar Serie</AppButton
          >
        </div>
      </div>
    </AppModal>

    <AppModal
      :is-open="showEnrichmentModal"
      title="Enriquecimiento TMDB"
      size="medium"
      @close="!isEnriching && (showEnrichmentModal = false)"
    >
      <div class="enrich-modal">
        <div v-if="isEnriching" class="enrich-loading">
          <i class="fas fa-circle-notch fa-spin loading-icon"></i>
          <p class="loading-msg">
            Consultando con TMDB para completar la información...
          </p>
        </div>

        <div v-else-if="enrichmentResult" class="enrich-result">
          <div
            v-if="enrichmentResult.success > 0"
            class="result-box result-box--success"
          >
            <i class="fas fa-check-circle"></i>
            <span>¡Información actualizada con éxito!</span>
          </div>
          <div
            v-if="enrichmentResult.failed > 0"
            class="result-box result-box--error"
          >
            <i class="fas fa-exclamation-circle"></i>
            <span>No pudimos encontrar la serie en TMDB.</span>
          </div>
          <AppButton
            variant="primary"
            block
            @click="showEnrichmentModal = false"
            >Cerrar</AppButton
          >
        </div>
      </div>
    </AppModal>
  </div>
</template>
