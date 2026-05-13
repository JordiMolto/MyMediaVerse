<script setup lang="ts">
import { ref } from "vue";
import "./dashboard-search.css";

const emit = defineEmits<{
  search: [query: string];
}>();

const query = ref("");

function handleSearch() {
  emit("search", query.value);
}
</script>

<template>
  <div class="dashboard-search-wrapper">
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input
        v-model="query"
        type="text"
        placeholder="Busca algo para disfrutar..."
        class="search-input"
        @keyup.enter="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">BUSCAR</button>
    </div>
  </div>
</template>
