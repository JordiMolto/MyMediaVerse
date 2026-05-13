<script setup lang="ts">
import { useConfirm } from "@/composables/useConfirm";
import "./confirm-modal.css";

const { isOpen, options, accept, cancel } = useConfirm();
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="isOpen" class="confirm-overlay" @click.self="cancel">
        <div class="confirm-dialog" role="dialog" aria-modal="true">
          <p v-if="options.title" class="confirm-title">{{ options.title }}</p>
          <p class="confirm-message">{{ options.message }}</p>
          <div class="confirm-actions">
            <button class="confirm-btn confirm-btn--cancel" @click="cancel">
              {{ options.cancelLabel ?? "Cancelar" }}
            </button>
            <button
              class="confirm-btn confirm-btn--confirm"
              :class="{ 'is-danger': options.danger }"
              @click="accept"
            >
              {{ options.confirmLabel ?? "Confirmar" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
