<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/layout/navbar/Navbar.vue'
</script>

<template>
    <div class="app-layout">
        <Navbar />
        <main class="main-content">
            <RouterView />
        </main>
    </div>
</template>

<style scoped>
/* Scoped styles for the layout if needed, 
   but most are in the design system layout.css */
</style>
