<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/layout/navbar/Navbar.vue'
import SideMenu from '@/components/layout/SideMenu.vue'
import QuickAddModal from '@/components/common/QuickAddModal.vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
</script>

<template>
    <div class="app-layout">
        <SideMenu />
        <Navbar />
        <main class="main-content">
            <RouterView />
        </main>

        <!-- Global Modals -->
        <QuickAddModal :is-open="uiStore.isQuickAddOpen" @close="uiStore.toggleQuickAdd(false)" />
    </div>
</template>

<style scoped>
/* Scoped styles for the layout if needed, 
   but most are in the design system layout.css */
</style>
