<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useCategoriesStore } from "@/stores/categories";
import MediaCard from "@/components/common/media-card/MediaCard.vue";
import { exportToCSV } from "@/utils/export";
import AppSelect from "@/components/common/app-select/AppSelect.vue";
import AppFab from "@/components/common/app-fab/AppFab.vue";
import BulkActionsBar from "@/components/common/bulk-actions-bar/BulkActionsBar.vue";
import { useBulkSelection } from "@/composables/useBulkSelection";
import { useTMDBEnrichment } from "@/composables/useTMDBEnrichment";
import { useUIStore } from "@/stores/ui";
import { ItemStatus, ItemType } from "@/types";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import { useConfirm } from "@/composables/useConfirm";
import "./in-progress-view.css";

const router = useRouter();
const itemsStore = useItemsStore();
const categoriesStore = useCategoriesStore();
const uiStore = useUIStore();

const selectedType = ref<string | null>(null);
const sortBy = ref("recent");
const showEnrichmentModal = ref(false);
const enrichmentResult = ref<{
  total: number;
  success: number;
  failed: number;
  errors: string[];
} | null>(null);

const {
  selectedIds,
  selectedCount,
  isSelectionMode,
  toggleSelection,
  isSelected,
  selectAll,
  clearSelection,
  getSelectedItems,
} = useBulkSelection();
const { showConfirm } = useConfirm();

const {
  isEnriching,
  enrichmentProgress,
  enrichmentTotal,
  enrichMultipleItems,
} = useTMDBEnrichment();

const sortOptions = [
  { value: "recent", label: "Recientes" },
  { value: "alpha", label: "Alfabético" },
];

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && selectedCount.value > 0) clearSelection();
}

onMounted(() => {
  itemsStore.fetchItems();
  categoriesStore.fetchCategories();
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const filteredItems = computed(() => {
  let items = itemsStore.inProgressItems;

  if (selectedType.value) {
    items = items.filter((item) => item.tipo === selectedType.value);
  }

  return [...items].sort((a, b) => {
    if (sortBy.value === "recent")
      return (
        new Date(b.fechaInicio || 0).getTime() -
        new Date(a.fechaInicio || 0).getTime()
      );
    if (sortBy.value === "alpha") return a.titulo.localeCompare(b.titulo);
    return 0;
  });
});

const TMDB_ENRICHABLE = [
  ItemType.MOVIE,
  ItemType.SERIES,
  ItemType.ANIME,
  "película",
  "pelicula",
  "serie",
  "anime",
];

const hasEnrichableSelected = computed(() =>
  filteredItems.value.some(
    (item) =>
      selectedIds.value.has(item.id) &&
      TMDB_ENRICHABLE.some((t) =>
        (item.tipo || "").toLowerCase().includes(t.toLowerCase()),
      ),
  ),
);

const types = computed(() => {
  return categoriesStore.categories
    .filter((cat) => !cat.oculto)
    .map((cat) => ({ value: cat.nombre, label: cat.nombre, icon: cat.icono }));
});

function handleExport() {
  exportToCSV(filteredItems.value, "items-en-progreso.csv");
}

const currentPage = ref(1);
const itemsPerPage = 12;
const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / itemsPerPage),
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredItems.value.slice(start, start + itemsPerPage);
});

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
});

function changePage(page: number | string) {
  if (typeof page === "string") return;
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

watch([selectedType, sortBy], () => {
  currentPage.value = 1;
});
watch(isSelectionMode, (v) => {
  if (!v) clearSelection();
});

function goToDetail(id: string) {
  router.push(`/item/${id}`);
}

async function handleBulkChangeStatus(status: ItemStatus) {
  const items = getSelectedItems(filteredItems.value);
  try {
    await Promise.all(
      items.map((item) => itemsStore.changeStatus(item.id, status)),
    );
    clearSelection();
  } catch (error) {
    console.error("Error changing status:", error);
    alert("Error al cambiar el estado de los items");
  }
}

async function handleBulkDelete() {
  const items = getSelectedItems(filteredItems.value);
  const ok = await showConfirm({
    title: "Eliminar items",
    message: `¿Estás seguro de que quieres eliminar ${items.length} items? Esta acción no se puede deshacer.`,
    confirmLabel: "Eliminar",
    danger: true,
  });
  if (!ok) return;
  try {
    await Promise.all(items.map((item) => itemsStore.deleteItem(item.id)));
    clearSelection();
  } catch (error) {
    alert("Error al eliminar los items");
  }
}

function handleSelectAll() {
  selectAll(filteredItems.value);
}

async function handleEnrichWithTMDB() {
  const items = getSelectedItems(filteredItems.value);
  const enrichableItems = items.filter((item) => {
    const t = (item.tipo || "").toLowerCase();
    return [
      ItemType.MOVIE,
      ItemType.SERIES,
      ItemType.ANIME,
      "película",
      "pelicula",
      "serie",
      "anime",
    ].some((v) => t.includes(v.toLowerCase()));
  });

  if (enrichableItems.length === 0) {
    alert(
      "Selecciona al menos una película, serie o anime para enriquecer con TMDB",
    );
    return;
  }

  const ok = await showConfirm({
    title: "Enriquecer con TMDB",
    message: `¿Quieres enriquecer ${enrichableItems.length} items con datos de TMDB? Esto puede tardar unos minutos.`,
    confirmLabel: "Enriquecer",
  });
  if (!ok) return;

  showEnrichmentModal.value = true;
  const result = await enrichMultipleItems(enrichableItems);
  enrichmentResult.value = result;
  await itemsStore.fetchItems();
  clearSelection();
}
</script>

<template>
  <div class="in-progress-view">
    <header class="view-header">
      <div class="header-info">
        <h1 class="header-title">En Progreso</h1>
        <p class="header-subtitle">
          Tienes {{ filteredItems.length }} historias abiertas ahora mismo
        </p>
      </div>
      <div class="header-actions">
        <button
          class="action-btn"
          :class="{ active: isSelectionMode }"
          @click="isSelectionMode = !isSelectionMode"
        >
          <i
            class="fas"
            :class="isSelectionMode ? 'fa-times' : 'fa-check-square'"
          ></i>
          {{ isSelectionMode ? "Cancelar" : "Seleccionar" }}
        </button>
        <button class="action-btn" @click="handleExport">
          <i class="fas fa-download"></i>
          Exportar CSV
        </button>
      </div>
    </header>

    <section class="filter-section">
      <div class="filter-bar">
        <div class="category-tabs-wrapper">
          <div class="category-tabs">
            <button
              class="tab-btn"
              :class="{ active: selectedType === null }"
              @click="selectedType = null"
            >
              <i class="fas fa-th-large"></i>
              Todo
            </button>
            <button
              v-for="type in types"
              :key="type.value"
              class="tab-btn"
              :class="{ active: selectedType === type.value }"
              @click="selectedType = type.value"
            >
              <i class="fas" :class="type.icon"></i>
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="sort-controls">
          <span class="sort-label">ORDENAR POR</span>
          <div class="sort-select">
            <AppSelect v-model="sortBy" :options="sortOptions" pill />
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div v-if="itemsStore.loading" class="loading-state">
        <i class="fas fa-circle-notch fa-spin loading-icon"></i>
        <span class="loading-text">Abriendo el baúl...</span>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <i class="fas fa-play empty-icon"></i>
        <div class="empty-info">
          <h3 class="empty-title">No hay nada "en curso"</h3>
          <p class="empty-desc">Empieza un nuevo item para verlo aquí</p>
        </div>
      </div>

      <div v-else class="content-wrapper">
        <div class="items-grid">
          <MediaCard
            v-for="item in paginatedItems"
            :key="item.id"
            :item="item"
            :selectable="isSelectionMode"
            :selected="isSelected(item.id)"
            @click="goToDetail"
            @toggle-select="toggleSelection"
          />
        </div>

        <div v-if="totalPages > 1" class="pagination-controls">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <button
            v-for="(page, index) in visiblePages"
            :key="index"
            class="page-btn"
            :class="{ active: currentPage === page, dots: page === '...' }"
            @click="changePage(page)"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

    <AppFab
      @click="
        uiStore.toggleQuickAdd(true, {
          type: selectedType || undefined,
          status: ItemStatus.IN_PROGRESS,
        })
      "
    />

    <BulkActionsBar
      :selected-count="selectedCount"
      :total-count="filteredItems.length"
      :show-tmdb-enrich="hasEnrichableSelected"
      @select-all="handleSelectAll"
      @clear-selection="clearSelection"
      @change-status="handleBulkChangeStatus"
      @delete-selected="handleBulkDelete"
      @enrich-with-tmdb="handleEnrichWithTMDB"
    />

    <AppModal
      :is-open="showEnrichmentModal"
      title="Enriqueciendo con TMDB"
      size="medium"
      @close="!isEnriching && (showEnrichmentModal = false)"
    >
      <div class="enrichment-modal">
        <div v-if="isEnriching" class="enrichment-progress">
          <div class="progress-info">
            <i class="fas fa-film fa-spin"></i>
            <p>Enriqueciendo items con datos de TMDB...</p>
            <p class="progress-text">
              {{ enrichmentProgress }} / {{ enrichmentTotal }}
            </p>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${(enrichmentProgress / enrichmentTotal) * 100}%`,
              }"
            ></div>
          </div>
        </div>

        <div v-else-if="enrichmentResult" class="enrichment-result">
          <div class="result-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Enriquecimiento Completado</h3>
          <div class="result-stats">
            <div class="stat">
              <span class="stat-value">{{ enrichmentResult.total }}</span
              ><span class="stat-label">Total</span>
            </div>
            <div class="stat stat--success">
              <span class="stat-value">{{ enrichmentResult.success }}</span
              ><span class="stat-label">Exitosos</span>
            </div>
            <div class="stat stat--error">
              <span class="stat-value">{{ enrichmentResult.failed }}</span
              ><span class="stat-label">Fallidos</span>
            </div>
          </div>

          <div v-if="enrichmentResult.errors.length > 0" class="errors-list">
            <h4>Errores:</h4>
            <ul>
              <li
                v-for="(error, index) in enrichmentResult.errors"
                :key="index"
              >
                {{ error }}
              </li>
            </ul>
          </div>

          <button class="btn btn-primary" @click="showEnrichmentModal = false">
            Cerrar
          </button>
        </div>
      </div>
    </AppModal>
  </div>
</template>
