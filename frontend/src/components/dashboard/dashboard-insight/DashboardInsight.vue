<script setup lang="ts">
import "./dashboard-insight.css";

defineProps<{
  insights: string[];
}>();
</script>

<template>
  <div class="insights-container">
    <div v-for="(insight, index) in insights" :key="index" class="insight-card">
      <div class="insight-icon">
        <i class="fas fa-lightbulb"></i>
      </div>
      <p class="insight-text">{{ insight }}</p>
    </div>

    <div v-if="insights.length === 0" class="insight-card insight-card--empty">
      <p class="insight-text">
        Aún no hay suficientes datos para generar insights.
      </p>
    </div>
  </div>
</template>
