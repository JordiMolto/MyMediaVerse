<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import AppButton from "@/components/common/app-button/AppButton.vue";
import logoUrl from "@/assets/images/logo_mymediaverse.png";
import { useUserAvatar } from "@/composables/useUserAvatar";
import "./navbar.css";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { avatarUrl } = useUserAvatar();

const isAuthPage = computed(() => {
  return route.name === "login" || route.name === "register";
});

function goToHome() {
  router.push("/");
}
</script>

<template>
  <div v-if="!isAuthPage" class="navbar-wrapper">
    <nav class="navbar">
      <div class="navbar-container">
        <!-- Left: Hamburger -->
        <button
          class="hamburger-btn"
          @click="uiStore.toggleSideMenu(true)"
          title="Menú"
        >
          <i class="fas fa-bars"></i>
        </button>

        <!-- Right: Actions -->
        <div class="navbar-actions">
          <button
            v-if="authStore.isAuthenticated"
            class="navbar-add-btn"
            @click="uiStore.toggleQuickAdd(true)"
            title="Añadir contenido"
          >
            <i class="fas fa-plus"></i>
            <span class="navbar-add-label">Añadir</span>
          </button>
          <div
            v-if="authStore.isAuthenticated"
            class="user-profile-trigger"
            @click="router.push('/perfil')"
            title="Mi Perfil"
          >
            <img :src="avatarUrl" alt="User Avatar" class="avatar-img" />
          </div>
          <AppButton
            v-else
            variant="primary"
            size="small"
            icon="fa-sign-in-alt"
            @click="router.push('/login')"
          >
            Entrar
          </AppButton>
        </div>
      </div>
    </nav>
  </div>
</template>
