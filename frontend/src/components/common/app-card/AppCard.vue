<script setup lang="ts">
import "./app-card.css";

interface Props {
  hoverable?: boolean;
  clickable?: boolean;
  padding?: "none" | "small" | "medium" | "large";
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  clickable: false,
  padding: "medium",
});
</script>

<template>
  <div
    class="app-card"
    :class="[`padding-${padding}`, { hoverable, clickable }]"
  >
    <slot></slot>
  </div>
</template>
