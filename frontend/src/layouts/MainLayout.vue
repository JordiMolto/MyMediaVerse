<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from "@/components/layout/navbar/Navbar.vue";
import SideMenu from "@/components/layout/side-menu/SideMenu.vue";
import QuickAddModal from "@/components/common/quick-add-modal/QuickAddModal.vue";
import ConfirmModal from "@/components/common/confirm-modal/ConfirmModal.vue";
import { useUIStore } from "@/stores/ui";

const uiStore = useUIStore();
</script>

<template>
  <div class="app-layout">
    <SideMenu />
    <Navbar />
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Global Modals -->
    <QuickAddModal
      :is-open="uiStore.isQuickAddOpen"
      @close="uiStore.toggleQuickAdd(false)"
    />
    <ConfirmModal />
  </div>
</template>
