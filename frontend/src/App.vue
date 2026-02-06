<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/layout/navbar/Navbar.vue'
</script>

<template>
  <div id="app">
    <Navbar />
    <RouterView />
  </div>
</template>

<style>
@import './assets/styles/main.css';
</style>
