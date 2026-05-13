<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useItemsStore } from "@/stores/items";
import { useCategoriesStore } from "@/stores/categories";
import { useUIStore } from "@/stores/ui";
import { useDashboardStats } from "@/composables/useDashboardStats";
import { ItemType } from "@/types";

import logoUrl from "@/assets/images/logo_mymediaverse.png";
import DashboardSearch from "@/components/dashboard/dashboard-search/DashboardSearch.vue";
import StatCard from "@/components/dashboard/stat-card/StatCard.vue";
import DashboardTopRated from "@/components/dashboard/dashboard-top-rated/DashboardTopRated.vue";
import DashboardBacklog from "@/components/dashboard/dashboard-backlog/DashboardBacklog.vue";
import AppFab from "@/components/common/app-fab/AppFab.vue";
import "./home-view.css";

const router = useRouter();
const itemsStore = useItemsStore();
const categoriesStore = useCategoriesStore();
const uiStore = useUIStore();
const { selectedType, stats, formatType } = useDashboardStats();

onMounted(() => {
  itemsStore.fetchItems();
  categoriesStore.fetchCategories();
});

const types = [
  { value: "all", label: "Todo", icon: "fa-th-large" },
  { value: ItemType.MOVIE, label: "Películas", icon: "fa-film" },
  { value: ItemType.SERIES, label: "Series", icon: "fa-tv" },
  { value: ItemType.BOOK, label: "Libros", icon: "fa-book" },
  { value: ItemType.VIDEOGAME, label: "Videojuegos", icon: "fa-gamepad" },
  { value: ItemType.BOARDGAME, label: "Juegos de Mesa", icon: "fa-dice" },
];

function handleSearch(query: string) {
  router.push({ name: "search", query: { q: query } });
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
              v-for="type in types"
              :key="type.value"
              class="type-tab"
              :class="{ active: selectedType === type.value }"
              @click="selectedType = type.value as any"
            >
              <i class="fas" :class="type.icon"></i>
              <span>{{ type.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-label">
          RESUMEN
          {{
            selectedType === "all"
              ? "GLOBAL"
              : formatType(selectedType as ItemType).toUpperCase()
          }}
        </div>
        <div class="stats-grid">
          <StatCard
            title="Consumido este año"
            :value="stats.totalThisYear"
            label="items terminados"
            variant="primary"
            icon="fa-calendar-check"
          />
          <StatCard
            title="Total Histórico"
            :value="stats.totalCompleted"
            label="en tu colección"
            variant="accent"
            icon="fa-archive"
          />
          <StatCard
            title="Valoración Media"
            :value="stats.avgRating"
            label="/ 5 puntos"
            variant="neutral"
            icon="fa-star"
          />
          <StatCard
            title="Items en Curso"
            :value="stats.totalInProgress"
            label="ahora mismo"
            variant="neutral"
            icon="fa-play"
          />
        </div>
      </section>

      <div class="dashboard-columns">
        <section class="dashboard-section dashboard-section--flex">
          <DashboardTopRated :items="stats.topRated" />
        </section>

        <section class="dashboard-section dashboard-section--flex">
          <DashboardBacklog
            :oldest="stats.backlog.oldestPending"
            :best="stats.backlog.bestRatedPending"
            :random="stats.backlog.randomPending"
          />
        </section>
      </div>
    </div>

    <AppFab @click="uiStore.toggleQuickAdd(true, { type: selectedType })" />
  </div>
</template>
