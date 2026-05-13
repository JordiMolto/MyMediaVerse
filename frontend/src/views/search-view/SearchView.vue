<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { ItemType, ItemStatus } from "@/types";
import AppInput from "@/components/common/app-input/AppInput.vue";
import AppSelect from "@/components/common/app-select/AppSelect.vue";
import MediaCard from "@/components/common/media-card/MediaCard.vue";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import NoteForm from "@/components/notes/note-form/NoteForm.vue";
import { useNotesStore } from "@/stores/notes";
import "./search-view.css";

const router = useRouter();
const route = useRoute();
const itemsStore = useItemsStore();
const notesStore = useNotesStore();

const searchQuery = ref("");
const selectedType = ref<ItemType | "all">("all");
const selectedStatus = ref<ItemStatus | "all">("all");
const showQuickNoteModal = ref(false);
const quickNoteItemId = ref<string | null>(null);

onMounted(() => {
  itemsStore.fetchItems();
  if (route.query.q) {
    searchQuery.value = route.query.q as string;
  }
});

watch(
  () => route.query.q,
  (newQuery) => {
    searchQuery.value = (newQuery as string) || "";
  },
);

const filteredResults = computed(() => {
  return itemsStore.filterItems({
    search: searchQuery.value,
    type:
      selectedType.value === "all"
        ? undefined
        : (selectedType.value as ItemType),
    status:
      selectedStatus.value === "all"
        ? undefined
        : (selectedStatus.value as ItemStatus),
  });
});

const typeOptions = [
  { value: "all", label: "Todos los tipos" },
  { value: ItemType.MOVIE, label: "Películas" },
  { value: ItemType.SERIES, label: "Series" },
  { value: ItemType.ANIME, label: "Anime" },
  { value: ItemType.BOOK, label: "Libros" },
  { value: ItemType.VIDEOGAME, label: "Videojuegos" },
  { value: ItemType.BOARDGAME, label: "Juegos de Mesa" },
];

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: ItemStatus.PENDING, label: "Pendiente" },
  { value: ItemStatus.IN_PROGRESS, label: "En Progreso" },
  { value: ItemStatus.COMPLETED, label: "Completado" },
  { value: ItemStatus.ABANDONED, label: "Abandonado" },
];

function goToDetail(id: string) {
  router.push(`/item/${id}`);
}

function clearFilters() {
  searchQuery.value = "";
  selectedType.value = "all";
  selectedStatus.value = "all";
}

function handleQuickNote(itemId: string) {
  quickNoteItemId.value = itemId;
  showQuickNoteModal.value = true;
}

async function saveQuickNote(data: { texto: string; spoilers: boolean }) {
  if (!quickNoteItemId.value) return;
  try {
    await notesStore.createNote({
      itemId: quickNoteItemId.value,
      contenido: data.texto,
      esSpoiler: data.spoilers,
    });
    showQuickNoteModal.value = false;
    quickNoteItemId.value = null;
  } catch (error) {
    console.error("Error saving quick note:", error);
  }
}
</script>

<template>
  <div class="search-view">
    <div class="search-container">
      <header class="search-header">
        <h1 class="search-title">
          <i class="fas fa-search"></i>
          Buscar
        </h1>
        <p class="search-subtitle">Encuentra tus items rápidamente</p>
      </header>

      <div class="search-controls">
        <AppInput
          v-model="searchQuery"
          placeholder="Buscar por título, descripción o tags..."
          icon="fa-search"
          type="text"
        />

        <div class="filters-row">
          <div class="filter-item">
            <AppSelect
              v-model="selectedType"
              :options="typeOptions"
              label="Tipo"
            />
          </div>
          <div class="filter-item">
            <AppSelect
              v-model="selectedStatus"
              :options="statusOptions"
              label="Estado"
            />
          </div>
          <button
            v-if="
              searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
            "
            class="clear-filters-btn"
            @click="clearFilters"
          >
            <i class="fas fa-times"></i>
            Limpiar filtros
          </button>
        </div>
      </div>

      <div
        v-if="
          !searchQuery && selectedType === 'all' && selectedStatus === 'all'
        "
        class="empty-state"
      >
        <i class="fas fa-search empty-icon"></i>
        <div class="empty-text">
          <p class="empty-primary">Comienza a buscar</p>
          <p class="empty-secondary">
            Escribe algo en el campo de búsqueda o selecciona filtros
          </p>
        </div>
      </div>

      <div v-else-if="filteredResults.length === 0" class="empty-state">
        <i class="fas fa-inbox empty-icon"></i>
        <div class="empty-text">
          <p class="empty-primary">No se encontraron resultados</p>
          <p class="empty-secondary">
            Intenta con otros términos de búsqueda o filtros
          </p>
        </div>
      </div>

      <div v-else class="results-section">
        <h2 class="results-count">
          {{ filteredResults.length }} resultado{{
            filteredResults.length !== 1 ? "s" : ""
          }}
        </h2>

        <div class="results-grid">
          <div
            v-for="item in filteredResults"
            :key="item.id"
            class="result-item"
          >
            <MediaCard
              :item="item"
              @click="goToDetail"
              @quick-note="handleQuickNote"
            />
          </div>
        </div>
      </div>
    </div>

    <AppModal
      :is-open="showQuickNoteModal"
      title="Añadir Nota Rápida"
      @close="
        showQuickNoteModal = false;
        quickNoteItemId = null;
      "
    >
      <NoteForm
        v-if="quickNoteItemId"
        :item-id="quickNoteItemId"
        @save="saveQuickNote"
        @cancel="showQuickNoteModal = false"
      />
    </AppModal>
  </div>
</template>
