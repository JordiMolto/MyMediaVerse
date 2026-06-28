<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useCategoriesStore } from "@/stores/categories";
import { useDashboardStats } from "@/composables/useDashboardStats";
import { Item, ItemType } from "@/types";
import { collectionItemPath } from "@/utils/slugify";

import logoUrl from "@/assets/images/logo_mymediaverse.png";
import DashboardSearch from "@/components/dashboard/dashboard-search/DashboardSearch.vue";
import StatCard from "@/components/dashboard/stat-card/StatCard.vue";
import DashboardTopRated from "@/components/dashboard/dashboard-top-rated/DashboardTopRated.vue";
import "./home-view.css";

const router = useRouter();
const itemsStore = useItemsStore();
const categoriesStore = useCategoriesStore();
const { selectedType, stats, formatType } = useDashboardStats();

onMounted(() => {
  itemsStore.fetchItems();
  categoriesStore.fetchCategories();
});

const types = computed(() =>
  categoriesStore.categories
    .filter((cat) => !cat.oculto)
    .map((cat) => ({
      value: cat.nombre,
      label: cat.nombre,
      icon: cat.icono,
      color: cat.color,
    })),
);

const TYPE_ICONS: Record<string, string> = {
  [ItemType.MOVIE]: "fa-film",
  [ItemType.SERIES]: "fa-tv",
  [ItemType.ANIME]: "fa-dragon",
  [ItemType.BOOK]: "fa-book",
  [ItemType.VIDEOGAME]: "fa-gamepad",
  [ItemType.BOARDGAME]: "fa-dice",
};

function typeIcon(tipo: string): string {
  return TYPE_ICONS[tipo] ?? "fa-folder";
}

function setType(value: string) {
  selectedType.value = value as ItemType | "all";
}

function handleSearch(query: string) {
  router.push({ name: "search", query: { q: query } });
}

function goToItem(item: Item) {
  router.push(collectionItemPath(item.tipo, item.titulo, item.id));
}

function timeAgo(date: Date | string | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`;
  return `Hace ${Math.floor(days / 30)} meses`;
}
</script>

<template>
  <div class="home-view">
    <div class="dashboard-layout">
      <section class="hero-section">
        <img :src="logoUrl" alt="MyMediaVerse" class="hero-logo" />
        <div class="hero-text">
          <h1 class="hero-title">MyMediaVerse</h1>
          <p class="hero-subtitle">Tu universo de entretenimiento</p>
        </div>
      </section>

      <section class="top-nav-section">
        <DashboardSearch @search="handleSearch" />
        <div class="filter-tabs-wrapper">
          <div class="filter-tabs">
            <button
              class="type-tab"
              :class="{ active: selectedType === 'all' }"
              @click="setType('all')"
            >
              <i class="fas fa-th-large"></i>
              <span>Todo</span>
            </button>
            <button
              v-for="type in types"
              :key="type.value"
              class="type-tab"
              :class="{ active: selectedType === type.value }"
              :style="
                selectedType === type.value && type.color
                  ? { borderColor: type.color, background: type.color + '22' }
                  : {}
              "
              @click="setType(type.value)"
            >
              <i
                class="fas"
                :class="type.icon"
                :style="type.color ? { color: type.color } : {}"
              ></i>
              <span>{{ type.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-label">
          RESUMEN
          {{ selectedType === "all" ? "GLOBAL" : formatType(selectedType).toUpperCase() }}
        </div>
        <div class="stats-grid">
          <StatCard
            title="En Curso"
            :value="stats.totalInProgress"
            label="ahora mismo"
            variant="primary"
            icon="fa-play"
          />
          <StatCard
            title="Completados este año"
            :value="stats.totalThisYear"
            label="títulos terminados"
            variant="accent"
            icon="fa-calendar-check"
          />
          <StatCard
            title="Total biblioteca"
            :value="stats.totalItems"
            label="en tu colección"
            variant="neutral"
            icon="fa-archive"
          />
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-label">CONTINÚA DONDE LO DEJASTE</div>

        <div v-if="stats.inProgressItems.length > 0" class="in-progress-row">
          <div
            v-for="item in stats.inProgressItems"
            :key="item.id"
            class="in-progress-card"
            @click="goToItem(item)"
          >
            <div
              class="in-progress-thumb"
              :style="item.imagen ? { backgroundImage: `url(${item.imagen})` } : {}"
            >
              <div v-if="!item.imagen" class="in-progress-thumb-placeholder">
                <i class="fas" :class="typeIcon(item.tipo)"></i>
              </div>
              <div class="in-progress-overlay">
                <span class="in-progress-badge">
                  <i class="fas fa-play"></i>
                  En curso
                </span>
              </div>
            </div>
            <div class="in-progress-info">
              <p class="in-progress-title">{{ item.titulo }}</p>
              <span class="in-progress-type">{{ item.tipo }}</span>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-play-circle empty-state-icon"></i>
          <p>Nada en curso. Marca algo como "en progreso" para verlo aquí.</p>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-label">AÑADIDOS RECIENTEMENTE A LA LISTA</div>

        <div v-if="stats.recentlyAdded.length > 0" class="recent-list">
          <div
            v-for="item in stats.recentlyAdded"
            :key="item.id"
            class="recent-item"
            @click="goToItem(item)"
          >
            <div class="recent-icon-box">
              <i class="fas" :class="typeIcon(item.tipo)"></i>
            </div>
            <div class="recent-info">
              <p class="recent-title">{{ item.titulo }}</p>
              <span class="recent-meta">{{ item.tipo }} · {{ timeAgo(item.fechaCreacion) }}</span>
            </div>
            <i class="fas fa-chevron-right recent-arrow"></i>
          </div>
        </div>

        <div v-else class="empty-state">
          <i class="fas fa-inbox empty-state-icon"></i>
          <p>Tu lista de espera está vacía. Añade cosas que quieras consumir.</p>
        </div>
      </section>

      <section class="dashboard-section">
        <DashboardTopRated :items="stats.topRated" />
      </section>
    </div>
  </div>
</template>
