<script setup lang="ts">
import "./app-fab.css";

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button class="app-fab" @click="$emit('click')">
    <i class="fas fa-plus"></i>
  </button>
</template>
