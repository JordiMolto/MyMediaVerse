<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ItemStatus, ItemType, Priority } from "@/types";
import { useCategoriesStore } from "@/stores/categories";
import { useItemsStore } from "@/stores/items";
import {
  searchTMDBResults,
  getTMDBImageUrl,
  getTMDBDetails,
  getYouTubeTrailerUrl,
  getStreamingPlatforms,
} from "@/services/external/tmdb.service";
import {
  searchGoogleBooksMultiple,
  type GoogleBookResult,
} from "@/services/external/google-books.service";
import {
  searchRawgGamesMultiple,
  type RawgGameResult,
} from "@/services/external/rawg.service";
import AppModal from "../app-modal/AppModal.vue";
import AppButton from "../app-button/AppButton.vue";
import AppSelect from "../app-select/AppSelect.vue";
import AppInput from "../app-input/AppInput.vue";
import ItemForm from "../../items/item-form/ItemForm.vue";
import { useUIStore } from "@/stores/ui";
import "./quick-add-modal.css";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const categoriesStore = useCategoriesStore();
const itemsStore = useItemsStore();
const uiStore = useUIStore();

type SearchSource = "tmdb_movie" | "tmdb_tv" | "googlebooks" | "rawg";

interface NormalizedResult {
  id: string;
  title: string;
  posterUrl: string | null;
  year: string | null;
  rating: number | null;
  mediaTypeLabel: string;
  source: SearchSource;
  raw: any;
}

const step = ref<
  "setup" | "search" | "bulk" | "processing" | "success" | "manual"
>("setup");
const selectedType = ref<string>("");
const selectedStatus = ref<ItemStatus>(ItemStatus.PENDING);
const searchQuery = ref("");
const results = ref<NormalizedResult[]>([]);
const selectedIds = ref<Set<string>>(new Set());
const isSearching = ref(false);
const hasSearched = ref(false);
const isSaving = ref(false);
const progress = ref({ current: 0, total: 0 });
const manualId = ref("");
const isAddingManual = ref(false);
const bulkTitles = ref<string[]>([]);
const bulkInput = ref("");

const typeOptions = computed(() => {
  return categoriesStore.categories
    .filter((c) => !c.oculto)
    .map((c) => ({
      value: c.nombre,
      label: c.nombre,
    }));
});

const statusOptions = [
  { value: ItemStatus.PENDING, label: "Pendiente" },
  { value: ItemStatus.IN_PROGRESS, label: "En Progreso" },
  { value: ItemStatus.COMPLETED, label: "Completado" },
  { value: ItemStatus.ABANDONED, label: "Abandonado" },
];

function getSearchSource(categoryName: string): SearchSource {
  const low = categoryName.toLowerCase();
  if (low.includes("serie") || low.includes("anime")) return "tmdb_tv";
  if (low.includes("libro") || low.includes("book")) return "googlebooks";
  if (
    low.includes("juego") ||
    low.includes("game") ||
    low.includes("videojuego")
  )
    return "rawg";
  return "tmdb_movie";
}

const currentSource = computed(() => getSearchSource(selectedType.value));
const isTmdbSource = computed(
  () =>
    currentSource.value === "tmdb_movie" || currentSource.value === "tmdb_tv",
);

function normalizeTMDB(
  items: any[],
  source: "tmdb_movie" | "tmdb_tv",
): NormalizedResult[] {
  return items.map((r) => ({
    id: String(r.id),
    title: r.title || r.name || "",
    posterUrl: getTMDBImageUrl(r.poster_path) || null,
    year: (r.release_date || r.first_air_date || "").split("-")[0] || null,
    rating: r.vote_average || null,
    mediaTypeLabel: source === "tmdb_tv" ? "Serie" : "Película",
    source,
    raw: r,
  }));
}

function normalizeGoogleBooks(items: GoogleBookResult[]): NormalizedResult[] {
  return items.map((r) => ({
    id: r.id,
    title: r.volumeInfo.title,
    posterUrl:
      r.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:") || null,
    year: r.volumeInfo.publishedDate?.split("-")[0] || null,
    rating: null,
    mediaTypeLabel: "Libro",
    source: "googlebooks" as const,
    raw: r,
  }));
}

function normalizeRawg(items: RawgGameResult[]): NormalizedResult[] {
  return items.map((r) => ({
    id: String(r.id),
    title: r.name,
    posterUrl: r.background_image,
    year: r.released?.split("-")[0] || null,
    rating: r.rating || null,
    mediaTypeLabel: "Videojuego",
    source: "rawg" as const,
    raw: r,
  }));
}

const handleContinue = () => {
  if (selectedType.value && selectedStatus.value) {
    step.value = "search";
  }
};

const addBulkTitle = () => {
  const lines = bulkInput.value
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return;
  bulkTitles.value.push(...lines);
  bulkInput.value = "";
};

const removeBulkTitle = (index: number) => {
  bulkTitles.value.splice(index, 1);
};

const saveBulkTitles = async () => {
  if (bulkTitles.value.length === 0) return;
  step.value = "processing";
  progress.value = { current: 0, total: bulkTitles.value.length };
  try {
    for (const titulo of bulkTitles.value) {
      await itemsStore.createItem({
        titulo,
        tipo: selectedType.value,
        estado: selectedStatus.value,
        prioridad: Priority.MEDIUM,
      } as any);
      progress.value.current++;
      await new Promise((r) => setTimeout(r, 50));
    }
    step.value = "success";
    setTimeout(() => {
      handleClose();
      itemsStore.fetchItems();
    }, 2000);
  } catch (error) {
    console.error("Error saving bulk titles:", error);
    alert("Hubo un error al guardar.");
    step.value = "bulk";
  }
};

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return;

  isSearching.value = true;
  hasSearched.value = true;
  results.value = [];
  try {
    const source = currentSource.value;
    if (source === "tmdb_movie" || source === "tmdb_tv") {
      const tmdbType = source === "tmdb_tv" ? ItemType.SERIES : ItemType.MOVIE;
      const raw = await searchTMDBResults(searchQuery.value, tmdbType);
      results.value = normalizeTMDB(raw, source);
    } else if (source === "googlebooks") {
      const raw = await searchGoogleBooksMultiple(searchQuery.value);
      results.value = normalizeGoogleBooks(raw);
    } else if (source === "rawg") {
      const raw = await searchRawgGamesMultiple(searchQuery.value);
      results.value = normalizeRawg(raw);
    }
  } finally {
    isSearching.value = false;
  }
};

const toggleSelection = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
};

const handleSave = async () => {
  if (selectedIds.value.size === 0) return;

  step.value = "processing";
  isSaving.value = true;
  progress.value = { current: 0, total: selectedIds.value.size };

  try {
    const selectedResults = results.value.filter((r) =>
      selectedIds.value.has(r.id),
    );

    for (const result of selectedResults) {
      const baseData: any = {
        tipo: selectedType.value,
        estado: selectedStatus.value,
        prioridad: Priority.MEDIUM,
      };

      if (result.source === "tmdb_movie" || result.source === "tmdb_tv") {
        const tmdbType =
          result.source === "tmdb_tv" ? ItemType.SERIES : ItemType.MOVIE;
        const details = await getTMDBDetails(Number(result.id), tmdbType);
        if (details) {
          Object.assign(baseData, {
            titulo: details.title || details.name || "Sin título",
            imagen: getTMDBImageUrl(details.poster_path),
            backdropImage: getTMDBImageUrl(details.backdrop_path),
            descripcion: details.overview,
            tagline: details.tagline,
            rating: details.vote_average
              ? Math.round(details.vote_average / 2)
              : undefined,
            genero: details.genres?.map((g: any) => g.name) || [],
            reparto:
              details.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [],
            trailer: getYouTubeTrailerUrl(details.videos),
            streamingPlatforms: getStreamingPlatforms(
              details["watch/providers"],
            ),
          });
          if (details.runtime) baseData.duracion = details.runtime;
          else if (details.episode_run_time?.length)
            baseData.duracion = details.episode_run_time[0];
          if (result.source === "tmdb_tv") {
            baseData.numberOfSeasons = details.number_of_seasons;
            baseData.numberOfEpisodes = details.number_of_episodes;
          }
          if (details.release_date || details.first_air_date) {
            baseData.fechaInicio = new Date(
              details.release_date || details.first_air_date!,
            );
          }
          await itemsStore.createItem(baseData);
        }
      } else if (result.source === "googlebooks") {
        const book = result.raw as GoogleBookResult;
        Object.assign(baseData, {
          titulo: book.volumeInfo.title,
          imagen: book.volumeInfo.imageLinks?.thumbnail?.replace(
            "http:",
            "https:",
          ),
          descripcion: book.volumeInfo.description,
          reparto: book.volumeInfo.authors || [],
          genero: book.volumeInfo.categories || [],
          duracion: book.volumeInfo.pageCount,
        });
        if (book.volumeInfo.publishedDate) {
          baseData.fechaInicio = new Date(book.volumeInfo.publishedDate);
        }
        await itemsStore.createItem(baseData);
      } else if (result.source === "rawg") {
        const game = result.raw as RawgGameResult;
        Object.assign(baseData, {
          titulo: game.name,
          imagen: game.background_image,
          descripcion: game.description_raw,
          rating: game.rating ? Math.round(game.rating) : undefined,
          genero: game.genres?.map((g) => g.name) || [],
        });
        if (game.released) baseData.fechaInicio = new Date(game.released);
        await itemsStore.createItem(baseData);
      }

      progress.value.current++;
      await new Promise((r) => setTimeout(r, 100));
    }

    step.value = "success";
    setTimeout(() => {
      handleClose();
      itemsStore.fetchItems();
    }, 2000);
  } catch (error) {
    console.error("Error in Quick Add:", error);
    alert("Hubo un error al añadir los items.");
    step.value = "search";
  } finally {
    isSaving.value = false;
  }
};

const handleManualIdAdd = async () => {
  if (!manualId.value || !isTmdbSource.value) return;
  const id = parseInt(manualId.value);
  if (isNaN(id)) return;

  isAddingManual.value = true;
  try {
    const tmdbType =
      currentSource.value === "tmdb_tv" ? ItemType.SERIES : ItemType.MOVIE;
    const details = await getTMDBDetails(id, tmdbType);
    if (details) {
      const strId = String(details.id);
      if (!results.value.some((r) => r.id === strId)) {
        results.value.unshift(
          normalizeTMDB(
            [
              {
                id: details.id,
                title: details.title || details.name || "",
                name: details.name,
                overview: details.overview,
                poster_path: details.poster_path,
                backdrop_path: details.backdrop_path,
                release_date: details.release_date,
                first_air_date: details.first_air_date,
                vote_average: details.vote_average,
                media_type: currentSource.value === "tmdb_tv" ? "tv" : "movie",
              },
            ],
            currentSource.value as "tmdb_movie" | "tmdb_tv",
          )[0],
        );
      }
      selectedIds.value.add(strId);
      manualId.value = "";
    } else {
      alert("No se encontró nada con ese ID.");
    }
  } finally {
    isAddingManual.value = false;
  }
};

const handleClose = () => {
  emit("close");
  setTimeout(() => {
    step.value = "setup";
    selectedType.value = uiStore.quickAddContext.type || "";
    selectedStatus.value =
      (uiStore.quickAddContext.status as ItemStatus) || ItemStatus.PENDING;
    searchQuery.value = "";
    results.value = [];
    selectedIds.value.clear();
    manualId.value = "";
    hasSearched.value = false;
    bulkTitles.value = [];
    bulkInput.value = "";
  }, 300);
};

const handleManualMode = () => {
  step.value = "manual";
};

const handleManualSave = async () => {
  handleClose();
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (uiStore.quickAddContext.type)
        selectedType.value = uiStore.quickAddContext.type;
      if (uiStore.quickAddContext.status)
        selectedStatus.value = uiStore.quickAddContext.status as ItemStatus;

      if (typeOptions.value.length > 0 && !selectedType.value) {
        selectedType.value = typeOptions.value[0].value;
      }
    }
  },
);
</script>

<template>
  <AppModal
    :is-open="isOpen"
    :title="
      step === 'manual' ? 'Añadir Item Manualmente' : 'Selector Modal Universal'
    "
    @close="handleClose"
    size="xl"
  >
    <div class="quick-add-container">
      <!-- STEP 1: SETUP -->
      <div v-if="step === 'setup'" class="setup-view">
        <div class="setup-heading">
          <h3 class="setup-title">¿Qué vamos a añadir?</h3>
          <p class="setup-subtitle">
            Configura el destino de tus nuevos descubrimientos.
          </p>
        </div>

        <div class="setup-fields">
          <div class="field-group">
            <label class="field-label">Colección</label>
            <AppSelect v-model="selectedType" :options="typeOptions" pill />
          </div>
          <div class="field-group">
            <label class="field-label">Estado Inicial</label>
            <AppSelect v-model="selectedStatus" :options="statusOptions" pill />
          </div>
        </div>

        <div class="setup-actions">
          <AppButton
            variant="primary"
            size="large"
            icon="fa-search"
            @click="handleContinue"
            :disabled="!selectedType"
          >
            Buscar y añadir
          </AppButton>

          <button class="setup-alt-btn" @click="step = 'bulk'">
            <i class="fas fa-list-ul"></i>
            Añadir lista de títulos
          </button>

          <button class="setup-link-btn" @click="handleManualMode">
            Añadir manualmente con formulario
          </button>
        </div>
      </div>

      <!-- STEP 2: SEARCH & SELECT -->
      <div v-else-if="step === 'search'" class="search-view">
        <div class="search-bar-row">
          <div class="search-input-wrapper">
            <AppInput
              v-model="searchQuery"
              placeholder="Busca por título, año..."
              icon="fa-search"
              @keyup.enter="handleSearch"
            />
          </div>
          <AppButton
            variant="primary"
            @click="handleSearch"
            :loading="isSearching"
            class="search-btn"
          >
            Buscar
          </AppButton>
        </div>

        <div class="results-grid custom-scrollbar">
          <div v-if="!hasSearched && !isSearching" class="empty-state">
            <i class="fas fa-search empty-icon"></i>
            <p class="empty-title">¿Qué vamos a ver hoy?</p>
            <p class="empty-sub">Busca por título para empezar a añadir.</p>
          </div>

          <div
            v-else-if="hasSearched && results.length === 0 && !isSearching"
            class="empty-state"
          >
            <i class="fas fa-ghost empty-icon"></i>
            <p class="empty-title">Sin resultados</p>
            <p class="empty-sub">
              No encontramos nada para <strong>"{{ searchQuery }}"</strong>.
              Prueba con otro término.
            </p>
            <div v-if="isTmdbSource" class="tmdb-id-helper">
              <p class="field-label">O añade por ID de TMDB</p>
              <div class="tmdb-id-row">
                <input
                  v-model="manualId"
                  type="text"
                  placeholder="ID de TMDB"
                  class="manual-input"
                  @keyup.enter="handleManualIdAdd"
                />
                <button
                  class="btn btn-primary btn-small"
                  @click="handleManualIdAdd"
                  :disabled="isAddingManual"
                >
                  <i
                    class="fas"
                    :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"
                  ></i>
                </button>
              </div>
            </div>
          </div>

          <div
            v-for="item in results"
            :key="item.id"
            class="result-card"
            :class="{ selected: selectedIds.has(item.id) }"
            @click="toggleSelection(item.id)"
          >
            <div class="card-poster">
              <img
                v-if="item.posterUrl"
                :src="item.posterUrl"
                :alt="item.title"
                class="poster-img"
              />
              <div v-else class="poster-placeholder">
                <i class="fas fa-image"></i>
                <span>{{ item.title }}</span>
              </div>

              <div class="card-badges">
                <span v-if="item.year" class="badge badge-year">{{
                  item.year
                }}</span>
                <span v-if="item.rating" class="badge badge-rating">
                  <i class="fas fa-star"></i>
                  {{ item.rating.toFixed(1) }}
                </span>
              </div>

              <div class="selection-overlay">
                <div class="selection-icon">
                  <i
                    class="fas"
                    :class="selectedIds.has(item.id) ? 'fa-check' : 'fa-plus'"
                  ></i>
                </div>
              </div>
            </div>

            <div class="card-info">
              <h4 class="info-title">{{ item.title }}</h4>
              <div class="info-meta">
                <span class="meta-type">{{ item.mediaTypeLabel }}</span>
                <span v-if="selectedIds.has(item.id)" class="meta-selected"
                  >Seleccionado</span
                >
              </div>
            </div>
          </div>

          <div v-if="results.length > 0 && isTmdbSource" class="tmdb-id-footer">
            <p class="field-label">
              ¿No está en la lista? Añade por ID de TMDB
            </p>
            <div class="tmdb-id-row">
              <input
                v-model="manualId"
                type="text"
                placeholder="ID de TMDB"
                class="manual-input"
                @keyup.enter="handleManualIdAdd"
              />
              <button
                class="btn btn-primary btn-small"
                @click="handleManualIdAdd"
                :disabled="isAddingManual"
              >
                <i
                  class="fas"
                  :class="isAddingManual ? 'fa-spinner fa-spin' : 'fa-plus'"
                ></i>
              </button>
            </div>
          </div>
        </div>

        <div class="footer-actions">
          <button class="back-btn" @click="step = 'setup'">
            <i class="fas fa-chevron-left"></i> Cambiar destino
          </button>
          <AppButton
            variant="primary"
            :disabled="selectedIds.size === 0"
            @click="handleSave"
          >
            {{
              selectedIds.size > 0
                ? `Añadir ${selectedIds.size} items`
                : "Selecciona para añadir"
            }}
          </AppButton>
        </div>
      </div>

      <!-- STEP: BULK -->
      <div v-else-if="step === 'bulk'" class="bulk-view">
        <div class="bulk-header">
          <p class="empty-title">Lista rápida de títulos</p>
          <p class="empty-sub">
            Un título por línea, o pega una lista. Pulsa <kbd>Ctrl+Enter</kbd> o
            el botón + para añadirlos todos.
          </p>
        </div>

        <div class="bulk-input-row">
          <textarea
            v-model="bulkInput"
            placeholder="Un título por línea, o pega una lista completa..."
            class="bulk-text-input"
            rows="5"
            @keydown.ctrl.enter.prevent="addBulkTitle"
            @keydown.meta.enter.prevent="addBulkTitle"
            autofocus
          />
          <button
            class="bulk-add-btn"
            @click="addBulkTitle"
            title="Añadir títulos (Ctrl+Enter)"
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>

        <div
          v-if="bulkTitles.length > 0"
          class="bulk-tags-container custom-scrollbar"
        >
          <span class="field-label"
            >{{ bulkTitles.length }} título{{
              bulkTitles.length !== 1 ? "s" : ""
            }}
            añadido{{ bulkTitles.length !== 1 ? "s" : "" }}</span
          >
          <div class="bulk-tags">
            <div v-for="(title, i) in bulkTitles" :key="i" class="bulk-tag">
              <span class="bulk-tag-text">{{ title }}</span>
              <button class="bulk-tag-remove" @click="removeBulkTitle(i)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-state empty-state--sm">
          <i class="fas fa-list-ul empty-icon"></i>
          <p class="empty-sub">Aún no has añadido ningún título.</p>
        </div>

        <div class="footer-actions">
          <button class="back-btn" @click="step = 'setup'">
            <i class="fas fa-chevron-left"></i> Atrás
          </button>
          <AppButton
            variant="primary"
            :disabled="bulkTitles.length === 0"
            @click="saveBulkTitles"
          >
            Guardar
            {{ bulkTitles.length > 0 ? bulkTitles.length + " items" : "" }}
          </AppButton>
        </div>
      </div>

      <!-- STEP: PROCESSING -->
      <div v-else-if="step === 'processing'" class="processing-view">
        <div class="progress-spinner">
          <i class="fas fa-circle-notch fa-spin"></i>
          <div class="progress-percent">
            {{ Math.round((progress.current / progress.total) * 100) }}%
          </div>
        </div>
        <div class="processing-info">
          <h3 class="processing-title">Añadiendo a tu biblioteca...</h3>
          <p class="processing-subtitle">
            Procesando {{ progress.current }} de {{ progress.total }}
          </p>
        </div>
      </div>

      <!-- STEP: SUCCESS -->
      <div v-else-if="step === 'success'" class="success-view">
        <div class="success-icon">
          <i class="fas fa-check"></i>
        </div>
        <div class="success-info">
          <h3 class="success-title">¡Todo listo!</h3>
          <p class="success-subtitle">
            Los items se han añadido correctamente a tu lista.
          </p>
        </div>
      </div>

      <!-- STEP: MANUAL -->
      <div v-else-if="step === 'manual'" class="manual-view">
        <ItemForm
          mode="create"
          :initial-type="selectedType"
          :initial-status="selectedStatus"
          @save="handleManualSave"
          @cancel="step = 'setup'"
        />
      </div>
    </div>
  </AppModal>
</template>
