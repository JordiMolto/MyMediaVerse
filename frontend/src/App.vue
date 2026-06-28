<script setup lang="ts">
import { useRegisterSW } from "virtual:pwa-register/vue";
import MainLayout from "@/layouts/MainLayout.vue";

const { needRefresh, updateServiceWorker } = useRegisterSW();

function update() {
  updateServiceWorker(true);
}
</script>

<template>
  <MainLayout />

  <Transition name="pwa-toast">
    <div v-if="needRefresh" class="pwa-update-toast">
      <div class="pwa-update-content">
        <i class="fas fa-arrow-up-circle"></i>
        <span>Hay una nueva versión disponible</span>
      </div>
      <button class="pwa-update-btn" @click="update">Actualizar</button>
    </div>
  </Transition>
</template>

<style>
@import "./assets/styles/main.css";

.pwa-update-toast {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-2, #1e293b);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

.pwa-update-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);

  & i {
    color: var(--color-primary);
    font-size: 1rem;
  }
}

.pwa-update-btn {
  padding: var(--space-1) var(--space-4);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-full);
  color: white;
  font-size: var(--fs-sm);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.85;
  }
}

.pwa-toast-enter-active,
.pwa-toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.pwa-toast-enter-from,
.pwa-toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
