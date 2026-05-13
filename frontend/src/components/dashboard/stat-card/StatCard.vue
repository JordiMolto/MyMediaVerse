<script setup lang="ts">
import "./stat-card.css";

interface Props {
  title: string;
  value: number | string;
  label: string;
  subtitle?: string;
  variant?: "primary" | "accent" | "neutral";
  progress?: number;
  icon: string;
}

withDefaults(defineProps<Props>(), {
  variant: "primary",
});
</script>

<template>
  <div class="stat-card" :class="variant">
    <div class="stat-header">
      <h3 class="stat-title">{{ title }}</h3>
      <div class="stat-icon-badge">
        <i class="fas" :class="icon"></i>
      </div>
    </div>

    <div class="stat-content">
      <div class="stat-value-row">
        <span class="stat-value">{{ value }}</span>
        <span class="stat-label">{{ label }}</span>
      </div>

      <p v-if="subtitle" class="stat-subtitle">{{ subtitle }}</p>

      <div v-if="progress !== undefined" class="stat-progress">
        <div class="stat-progress-bg">
          <div
            class="stat-progress-fill"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
