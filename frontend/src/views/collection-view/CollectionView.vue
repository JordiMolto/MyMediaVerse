<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useCategoriesStore } from "@/stores/categories";
import { useUIStore } from "@/stores/ui";
import { Item, ItemStatus } from "@/types";
import MediaCard from "@/components/common/media-card/MediaCard.vue";
import AppSelect from "@/components/common/app-select/AppSelect.vue";
import { collectionItemPath, slugify } from "@/utils/slugify";
import "./collection-view.css";

const route = useRoute();
const router = useRouter();
const itemsStore = useItemsStore();
const categoriesStore = useCategoriesStore();
const uiStore = useUIStore();

// State
const selectedStatus = ref<string>("todos");
const sortBy = ref<string>("recent");
const currentPage = ref(1);

// Derived from route — el param llega como slug (ej: "juegos-de-mesa")
const categorySlug = computed(() => route.params.nombre as string);
const category = computed(() =>
  categoriesStore.categories.find((c) => slugify(c.nombre) === categorySlug.value),
);
// Nombre real para mostrar en UI y filtrar items
const categoryName = computed(() => category.value?.nombre ?? categorySlug.value);

const sortOptions = [
  { value: "recent", label: "Recientes" },
  { value: "alpha", label: "Alfabético" },
  { value: "rating", label: "Valoración" },
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
  selectedStatus.value = "todos";
  currentPage.value = 1;
});

watch([selectedStatus, sortBy], () => {
  currentPage.value = 1;
});

// Filtering by status reuses the store's already-filtered computeds
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

const filteredItems = computed(() => {
  const base = getItemsForStatus(selectedStatus.value);
  return [...base].sort((a, b) => {
    if (sortBy.value === "recent") {
      return new Date(b.fechaCreacion || 0).getTime() - new Date(a.fechaCreacion || 0).getTime();
    }
    if (sortBy.value === "alpha") return a.titulo.localeCompare(b.titulo);
    if (sortBy.value === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });
});

function getCount(status: string): number {
  return getItemsForStatus(status).length;
}

// Pagination
const itemsPerPage = 12;
const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage));
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

function goToDetail(item: Item) {
  router.push(collectionItemPath(item.tipo, item.titulo, item.id));
}

const headerStyle = computed(() => {
  if (!category.value?.color) return {};
  return {
    background: `linear-gradient(135deg, ${category.value.color}12 0%, transparent 60%)`,
  };
});

function getTabStyle(tabValue: string) {
  if (selectedStatus.value !== tabValue || !category.value?.color) return {};
  return {
    borderBottomColor: category.value.color,
    color: category.value.color,
  };
}
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
            {{ getCount("todos") }}
            {{ getCount("todos") === 1 ? "item" : "items" }} en tu colección
          </p>
        </div>
        <button
          class="collection-add-btn"
          @click="uiStore.toggleQuickAdd(true, { type: categoryName })"
        >
          <i class="fas fa-plus"></i>
          <span>Añadir</span>
        </button>
      </div>
    </header>

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
      <div class="tabs-sort">
        <AppSelect v-model="sortBy" :options="sortOptions" pill />
      </div>
    </div>

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
        <div class="items-grid">
          <MediaCard
            v-for="item in paginatedItems"
            :key="item.id"
            :item="item"
            @click="goToDetail"
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
