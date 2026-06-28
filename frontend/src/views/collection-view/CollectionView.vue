<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useCategoriesStore } from "@/stores/categories";
import { useUIStore } from "@/stores/ui";
import { useCollectionFiltersStore } from "@/stores/collectionFilters";
import { useConfirm } from "@/composables/useConfirm";
import { useItemEnrichment } from "@/composables/useItemEnrichment";
import { Item, ItemStatus } from "@/types";
import { CategoryViewMode } from "@/types/category";
import MediaCard from "@/components/common/media-card/MediaCard.vue";
import AppSelect from "@/components/common/app-select/AppSelect.vue";
import { collectionItemPath, slugify } from "@/utils/slugify";
import "./collection-view.css";

const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();
const categoriesStore = useCategoriesStore();
const uiStore = useUIStore();
const filtersStore = useCollectionFiltersStore();
const { showConfirm } = useConfirm();
const { enrichMultiple, canEnrich } = useItemEnrichment();

// ── Filters (persisted in Pinia per category slug) ─────────────────────────
const categorySlug = computed(() => route.params.nombre as string);

const selectedStatus = computed({
  get: () => filtersStore.getFilters(categorySlug.value).status,
  set: (v) => filtersStore.setFilters(categorySlug.value, { status: v, page: 1 }),
});
const selectedGenre = computed({
  get: () => filtersStore.getFilters(categorySlug.value).genre,
  set: (v) => filtersStore.setFilters(categorySlug.value, { genre: v, page: 1 }),
});
const sortBy = computed({
  get: () => filtersStore.getFilters(categorySlug.value).sortBy,
  set: (v) => filtersStore.setFilters(categorySlug.value, { sortBy: v, page: 1 }),
});
const currentPage = computed({
  get: () => filtersStore.getFilters(categorySlug.value).page,
  set: (v) => filtersStore.setFilters(categorySlug.value, { page: v }),
});
const itemsPerPage = computed({
  get: () => filtersStore.getFilters(categorySlug.value).itemsPerPage,
  set: (v) => filtersStore.setFilters(categorySlug.value, { itemsPerPage: v, page: 1 }),
});

// ── Pagination size ────────────────────────────────────────────────────────
const pageSizeOptions = [
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: 200, label: "200" },
];

// ── Selection ──────────────────────────────────────────────────────────────
const isSelecting = ref(false);
const selectedIds = ref<Set<string>>(new Set());

function enterSelectMode() {
  isSelecting.value = true;
}

function exitSelectMode() {
  isSelecting.value = false;
  selectedIds.value = new Set();
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  selectedIds.value = next;
}

const allPageSelected = computed(
  () =>
    paginatedItems.value.length > 0 &&
    paginatedItems.value.every((i) => selectedIds.value.has(i.id)),
);

function toggleSelectAll() {
  if (allPageSelected.value) {
    const next = new Set(selectedIds.value);
    paginatedItems.value.forEach((i) => next.delete(i.id));
    selectedIds.value = next;
  } else {
    const next = new Set(selectedIds.value);
    paginatedItems.value.forEach((i) => next.add(i.id));
    selectedIds.value = next;
  }
}

// Salir con Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && isSelecting.value) exitSelectMode();
}
onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));

// ── Bulk actions ───────────────────────────────────────────────────────────
const isBulkLoading = ref(false);
const bulkEnrichResult = ref<{ success: number; failed: number; skipped: number } | null>(null);

async function bulkChangeStatus(status: ItemStatus) {
  isBulkLoading.value = true;
  await Promise.all([...selectedIds.value].map((id) => itemsStore.changeStatus(id, status)));
  isBulkLoading.value = false;
  exitSelectMode();
}

async function bulkToggleFavorite() {
  isBulkLoading.value = true;
  const ids = [...selectedIds.value];
  const allFav = ids.every((id) => itemsStore.items.find((i) => i.id === id)?.favorito);
  await Promise.all(
    ids.map((id) => {
      const item = itemsStore.items.find((i) => i.id === id);
      if (item && item.favorito === allFav) return itemsStore.toggleFavorite(id);
    }),
  );
  isBulkLoading.value = false;
  exitSelectMode();
}

async function bulkEnrichInfo() {
  const ids = [...selectedIds.value];
  const items = ids.map((id) => itemsStore.items.find((i) => i.id === id)).filter(Boolean) as Item[];
  const enrichable = items.filter((i) => canEnrich(i.tipo));

  if (enrichable.length === 0) {
    await showConfirm({
      title: "Sin compatibles",
      message: "Ninguno de los items seleccionados es compatible con la regeneración automática.",
      confirmLabel: "Entendido",
      danger: false,
    });
    return;
  }

  const ok = await showConfirm({
    title: "Regenerar info automáticamente",
    message: `Se regenerará la info de ${enrichable.length} item${enrichable.length === 1 ? "" : "s"} desde fuentes externas. Los campos manuales (notas, valoración, estado, tags) no se tocarán.`,
    confirmLabel: "Sí, regenerar",
    danger: false,
  });
  if (!ok) return;

  isBulkLoading.value = true;
  bulkEnrichResult.value = null;
  const result = await enrichMultiple(enrichable);
  isBulkLoading.value = false;
  bulkEnrichResult.value = result;

  setTimeout(() => {
    bulkEnrichResult.value = null;
    exitSelectMode();
  }, 3000);
}

async function bulkDelete() {
  const n = selectedIds.value.size;
  const ok = await showConfirm({
    title: "Eliminar selección",
    message: `¿Eliminar ${n} ${n === 1 ? "item" : "items"}? Esta acción no se puede deshacer.`,
    confirmLabel: "Eliminar",
    danger: true,
  });
  if (!ok) return;
  isBulkLoading.value = true;
  await Promise.all([...selectedIds.value].map((id) => itemsStore.deleteItem(id)));
  isBulkLoading.value = false;
  exitSelectMode();
}

// ── Route / category ───────────────────────────────────────────────────────
const category = computed(() =>
  categoriesStore.categories.find((c) => slugify(c.nombre) === categorySlug.value),
);
const categoryName = computed(() => category.value?.nombre ?? categorySlug.value);

// ── View mode ──────────────────────────────────────────────────────────────
const viewMode = computed<CategoryViewMode>(() => category.value?.viewMode ?? "grid");

const viewModeOptions: { value: CategoryViewMode; icon: string; title: string }[] = [
  { value: "grid", icon: "fa-th-large", title: "Cuadrícula" },
  { value: "list", icon: "fa-list", title: "Lista" },
  { value: "compact", icon: "fa-th", title: "Compacto" },
];

async function setViewMode(mode: CategoryViewMode) {
  if (!category.value || category.value.viewMode === mode) return;
  await categoriesStore.updateCategory(category.value.id, { viewMode: mode });
}

// ── Filters / sort ─────────────────────────────────────────────────────────
const sortOptions = [
  { value: "recent", label: "Recientes" },
  { value: "alpha", label: "Alfabético" },
  { value: "rating", label: "Valoración" },
  { value: "genre", label: "Género" },
];

const statusTabs = [
  { value: "todos", label: "Todos", icon: "fa-th-large" },
  { value: ItemStatus.IN_PROGRESS, label: "En Progreso", icon: "fa-play" },
  { value: ItemStatus.PENDING, label: "Pendiente", icon: "fa-clock" },
  { value: ItemStatus.COMPLETED, label: "Completado", icon: "fa-check-circle" },
  { value: "favorites", label: "Favoritos", icon: "fa-heart" },
];

const emptyMessages: Record<string, string> = {
  todos: "Aún no hay nada en esta colección. ¡Empieza añadiendo algo!",
  [ItemStatus.IN_PROGRESS]: "Nada en curso en esta colección.",
  [ItemStatus.PENDING]: "No tienes nada pendiente en esta colección.",
  [ItemStatus.COMPLETED]: "Aún no has completado nada de esta colección.",
  favorites: "No tienes favoritos en esta colección.",
};

onMounted(() => {
  itemsStore.fetchItems();
  categoriesStore.fetchCategories();
});

watch(categorySlug, () => {
  exitSelectMode();
});

function getItemsForStatus(status: string) {
  const name = categoryName.value;
  switch (status) {
    case ItemStatus.IN_PROGRESS:
      return itemsStore.inProgressItems.filter((i) => i.tipo === name);
    case ItemStatus.PENDING:
      return itemsStore.pendingItems.filter((i) => i.tipo === name);
    case ItemStatus.COMPLETED:
      return itemsStore.completedItems.filter((i) => i.tipo === name);
    case "favorites":
      return itemsStore.favoriteItems.filter((i) => i.tipo === name);
    default:
      return itemsStore.items.filter((i) => i.tipo === name);
  }
}

const availableGenres = computed(() => {
  const all = itemsStore.items.filter((i) => i.tipo === categoryName.value);
  const genres = new Set<string>();
  all.forEach((i) => i.genero?.forEach((g) => genres.add(g)));
  return [
    { value: "todos", label: "Todos los géneros" },
    ...[...genres].sort().map((g) => ({ value: g, label: g })),
  ];
});

const filteredItems = computed(() => {
  const base = getItemsForStatus(selectedStatus.value);
  const byGenre =
    selectedGenre.value === "todos"
      ? base
      : base.filter((i) => i.genero?.includes(selectedGenre.value));
  return [...byGenre].sort((a, b) => {
    if (sortBy.value === "recent")
      return new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime();
    if (sortBy.value === "alpha") return a.titulo.localeCompare(b.titulo);
    if (sortBy.value === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });
});

function getCount(status: string): number {
  return getItemsForStatus(status).length;
}

// ── Genre grouping ─────────────────────────────────────────────────────────
const groupedByGenre = computed(() => {
  if (sortBy.value !== "genre") return null;
  const groups = new Map<string, Item[]>();
  for (const item of filteredItems.value) {
    const genres = item.genero?.length ? item.genero : ["Sin género"];
    for (const g of genres) {
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(item);
    }
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
});

// ── Pagination ─────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage.value));
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredItems.value.slice(start, start + itemsPerPage.value);
});
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  pages.push(1);
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
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

function handleCardClick(item: Item) {
  if (isSelecting.value) {
    toggleSelect(item.id);
  } else {
    router.push(collectionItemPath(item.tipo, item.titulo, item.id));
  }
}

// Long-press para activar selección desde la tarjeta
let longPressTimer: ReturnType<typeof setTimeout> | null = null;

function onCardPointerDown(item: Item) {
  if (isSelecting.value) return;
  longPressTimer = setTimeout(() => {
    enterSelectMode();
    toggleSelect(item.id);
  }, 500);
}

function onCardPointerUp() {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
}

const headerStyle = computed(() => {
  if (!category.value?.color) return {};
  return { background: `linear-gradient(135deg, ${category.value.color}12 0%, transparent 60%)` };
});

function getTabStyle(tabValue: string) {
  if (selectedStatus.value !== tabValue || !category.value?.color) return {};
  return { borderBottomColor: category.value.color, color: category.value.color };
}

const bulkStatusOptions = [
  { value: ItemStatus.IN_PROGRESS, label: "En Progreso", icon: "fa-play" },
  { value: ItemStatus.PENDING, label: "Pendiente", icon: "fa-clock" },
  { value: ItemStatus.COMPLETED, label: "Completado", icon: "fa-check-circle" },
];

const showStatusDropdown = ref(false);

function toggleStatusDropdown(e: Event) {
  e.stopPropagation();
  showStatusDropdown.value = !showStatusDropdown.value;
}

function handleDocClick() {
  showStatusDropdown.value = false;
}

onMounted(() => window.addEventListener("click", handleDocClick));
onUnmounted(() => window.removeEventListener("click", handleDocClick));
</script>

<template>
  <div class="collection-view">
    <header class="collection-header" :style="headerStyle">
      <div class="collection-hero">
        <div class="collection-icon" :style="category?.color ? { color: category.color } : {}">
          <i class="fas" :class="category?.icono || 'fa-folder'"></i>
        </div>
        <div class="collection-info">
          <h1 class="collection-title">{{ categoryName }}</h1>
          <p class="collection-meta">
            {{ getCount("todos") }} {{ getCount("todos") === 1 ? "item" : "items" }} en tu colección
          </p>
        </div>
        <div class="header-actions">
          <button
            class="collection-select-btn"
            :class="{ active: isSelecting }"
            :title="isSelecting ? 'Cancelar selección' : 'Seleccionar'"
            @click="isSelecting ? exitSelectMode() : enterSelectMode()"
          >
            <i class="fas" :class="isSelecting ? 'fa-times' : 'fa-check-square'"></i>
            <span>{{ isSelecting ? "Cancelar" : "Seleccionar" }}</span>
          </button>
          <button
            class="collection-add-btn"
            @click="uiStore.toggleQuickAdd(true, { type: categoryName })"
          >
            <i class="fas fa-plus"></i>
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ── Bulk action bar ─────────────────────────────────────────────── -->
    <Transition name="bulk-bar">
      <div v-if="isSelecting" class="bulk-bar">
        <div class="bulk-bar-left">
          <button class="bulk-select-all" @click="toggleSelectAll">
            <div class="bulk-checkbox" :class="{ checked: allPageSelected }">
              <i v-if="allPageSelected" class="fas fa-check"></i>
            </div>
            <span>{{ allPageSelected ? "Deseleccionar todo" : "Seleccionar todo" }}</span>
          </button>
          <span class="bulk-count">
            {{ selectedIds.size }} {{ selectedIds.size === 1 ? "seleccionado" : "seleccionados" }}
          </span>
        </div>

        <div class="bulk-actions" :class="{ disabled: selectedIds.size === 0 }">
          <!-- Estado dropdown -->
          <div class="bulk-dropdown-wrapper">
            <button
              class="bulk-btn"
              :disabled="selectedIds.size === 0 || isBulkLoading"
              @click="toggleStatusDropdown"
            >
              <i class="fas fa-exchange-alt"></i>
              <span>Estado</span>
              <i class="fas fa-chevron-down" style="font-size: 10px"></i>
            </button>
            <Transition name="fade">
              <div v-if="showStatusDropdown" class="bulk-dropdown" @click.stop>
                <button
                  v-for="opt in bulkStatusOptions"
                  :key="opt.value"
                  class="bulk-dropdown-item"
                  @click="showStatusDropdown = false; bulkChangeStatus(opt.value)"
                >
                  <i class="fas" :class="opt.icon"></i>
                  {{ opt.label }}
                </button>
              </div>
            </Transition>
          </div>

          <button
            class="bulk-btn"
            :disabled="selectedIds.size === 0 || isBulkLoading"
            title="Favorito"
            @click="bulkToggleFavorite"
          >
            <i class="fas fa-heart"></i>
            <span>Favorito</span>
          </button>

          <button
            class="bulk-btn"
            :disabled="selectedIds.size === 0 || isBulkLoading"
            title="Regenerar info automáticamente"
            @click="bulkEnrichInfo"
          >
            <i class="fas" :class="isBulkLoading ? 'fa-circle-notch fa-spin' : 'fa-magic'"></i>
            <span>Regenerar</span>
          </button>

          <button
            class="bulk-btn bulk-btn--danger"
            :disabled="selectedIds.size === 0 || isBulkLoading"
            title="Eliminar"
            @click="bulkDelete"
          >
            <i class="fas fa-trash"></i>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- ── Bulk enrich result toast ───────────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="bulkEnrichResult" class="bulk-enrich-toast">
        <i class="fas fa-check-circle"></i>
        <span>
          {{ bulkEnrichResult.success }} actualizados
          <template v-if="bulkEnrichResult.failed > 0">, {{ bulkEnrichResult.failed }} no encontrados</template>
          <template v-if="bulkEnrichResult.skipped > 0">, {{ bulkEnrichResult.skipped }} omitidos</template>
        </span>
      </div>
    </Transition>

    <!-- ── Tabs bar ────────────────────────────────────────────────────── -->
    <div class="status-tabs-bar">
      <div class="status-tabs-scroll">
        <div class="status-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            class="status-tab"
            :class="{ active: selectedStatus === tab.value }"
            :style="getTabStyle(tab.value)"
            @click="selectedStatus = tab.value"
          >
            <i class="fas" :class="tab.icon"></i>
            <span>{{ tab.label }}</span>
            <span class="tab-count">{{ getCount(tab.value) }}</span>
          </button>
        </div>
      </div>
      <div class="tabs-controls">
        <div class="view-mode-toggle">
          <button
            v-for="opt in viewModeOptions"
            :key="opt.value"
            class="view-mode-btn"
            :class="{ active: viewMode === opt.value }"
            :title="opt.title"
            @click="setViewMode(opt.value)"
          >
            <i class="fas" :class="opt.icon"></i>
          </button>
        </div>
        <AppSelect
          v-if="availableGenres.length > 1"
          v-model="selectedGenre"
          :options="availableGenres"
          pill
        />
        <AppSelect v-model="sortBy" :options="sortOptions" pill />
        <AppSelect v-model="itemsPerPage" :options="pageSizeOptions" pill />
      </div>
    </div>

    <!-- ── Content ─────────────────────────────────────────────────────── -->
    <div class="collection-content">
      <div v-if="itemsStore.loading" class="loading-state">
        <i class="fas fa-circle-notch fa-spin loading-icon"></i>
        <span class="loading-text">Cargando...</span>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <i
          :class="['fas', 'empty-icon', category?.icono || 'fa-folder']"
          :style="category?.color ? { color: category.color } : {}"
        ></i>
        <h3 class="empty-title">Nada por aquí</h3>
        <p class="empty-desc">{{ emptyMessages[selectedStatus] }}</p>
        <button
          v-if="selectedStatus === 'todos'"
          class="collection-add-btn"
          @click="uiStore.toggleQuickAdd(true, { type: categoryName })"
        >
          <i class="fas fa-plus"></i>
          <span>Añadir el primero</span>
        </button>
      </div>

      <div v-else class="content-wrapper">
        <!-- Agrupado por género -->
        <template v-if="groupedByGenre">
          <div v-for="[genre, items] in groupedByGenre" :key="genre" class="genre-group">
            <h3 class="genre-group-title">{{ genre }}</h3>
            <div
              class="items-grid"
              :class="{
                'items-grid--list': viewMode === 'list',
                'items-grid--compact': viewMode === 'compact',
                'items-grid--selecting': isSelecting,
              }"
            >
              <div
                v-for="item in items"
                :key="item.id"
                class="card-wrapper"
                @pointerdown="onCardPointerDown(item)"
                @pointerup="onCardPointerUp"
                @pointerleave="onCardPointerUp"
                @contextmenu.prevent="!isSelecting && (enterSelectMode(), toggleSelect(item.id))"
              >
                <MediaCard
                  :item="item"
                  :view-mode="viewMode"
                  :selectable="isSelecting"
                  :selected="selectedIds.has(item.id)"
                  @click="handleCardClick"
                  @toggle-select="toggleSelect"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Grid normal -->
        <div
          v-else
          class="items-grid"
          :class="{
            'items-grid--list': viewMode === 'list',
            'items-grid--compact': viewMode === 'compact',
            'items-grid--selecting': isSelecting,
          }"
        >
          <div
            v-for="item in paginatedItems"
            :key="item.id"
            class="card-wrapper"
            @pointerdown="onCardPointerDown(item)"
            @pointerup="onCardPointerUp"
            @pointerleave="onCardPointerUp"
            @contextmenu.prevent="!isSelecting && (enterSelectMode(), toggleSelect(item.id))"
          >
            <MediaCard
              :item="item"
              :view-mode="viewMode"
              :selectable="isSelecting"
              :selected="selectedIds.has(item.id)"
              @click="handleCardClick"
              @toggle-select="toggleSelect"
            />
          </div>
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
            :disabled="page === '...'"
            @click="changePage(page)"
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
    </div>
  </div>
</template>
