<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Item } from "@/types";
import "./dashboard-top-rated.css";

defineProps<{
  items: Item[];
}>();

const router = useRouter();
const timeFrame = ref<"year" | "total">("total");

const goToItem = (id: string) => {
  router.push(`/item/${id}`);
};
</script>

<template>
  <div class="top-rated-section">
    <div class="section-header">
      <h3 class="section-title">Top 5 Personal</h3>
      <div class="toggle-group">
        <button
          class="toggle-btn"
          :class="{ active: timeFrame === 'year' }"
          @click="timeFrame = 'year'"
        >
          Año
        </button>
        <button
          class="toggle-btn"
          :class="{ active: timeFrame === 'total' }"
          @click="timeFrame = 'total'"
        >
          Histórico
        </button>
      </div>
    </div>

    <div class="top-list">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="top-item"
        @click="goToItem(item.id)"
      >
        <div class="rank">{{ index + 1 }}</div>
        <img
          v-if="item.imagen"
          :src="item.imagen"
          alt="Cover"
          class="item-thumb"
        />
        <div v-else class="thumb-placeholder">
          <i class="fas fa-image"></i>
        </div>
        <div class="item-info">
          <h4 class="item-title">{{ item.titulo }}</h4>
          <span class="item-type">{{ item.tipo }}</span>
        </div>
        <div class="item-rating">
          <i class="fas fa-star"></i>
          <span>{{ item.rating }}</span>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-top">
        <p>Completa y puntúa items para ver tu top aquí.</p>
      </div>
    </div>
  </div>
</template>
