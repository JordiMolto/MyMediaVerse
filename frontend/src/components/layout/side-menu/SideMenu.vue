<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import logoUrl from "@/assets/images/logo_mymediaverse.png";
import "./side-menu.css";

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const authStore = useAuthStore();

const menuItems = [
  { name: "Inicio", icon: "fa-home", path: "/" },
  { name: "Pendiente", icon: "fa-clock", path: "/pendiente" },
  { name: "En Progreso", icon: "fa-play", path: "/en-progreso" },
  { name: "Completado", icon: "fa-check-circle", path: "/hecho" },
  { name: "Favoritos", icon: "fa-heart", path: "/favoritos", accent: true },
  { name: "Colecciones", icon: "fa-layer-group", path: "/colecciones" },
];

function navigateTo(path: string) {
  router.push(path);
  uiStore.toggleSideMenu(false);
}

function handleOverlayClick() {
  uiStore.toggleSideMenu(false);
}
</script>

<template>
  <div class="side-menu-wrapper" :class="{ 'is-open': uiStore.isSideMenuOpen }">
    <div class="side-menu-overlay" @click="handleOverlayClick"></div>

    <aside class="side-menu">
      <div class="side-menu-header">
        <div class="navbar-brand" @click="navigateTo('/')">
          <img :src="logoUrl" alt="MyMediaVerse" class="brand-logo" />
          <span>MyMediaVerse</span>
        </div>
        <button class="close-btn" @click="uiStore.toggleSideMenu(false)">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="side-menu-body">
        <nav class="side-nav">
          <template v-for="item in menuItems" :key="item.path">
            <button
              class="side-link"
              :class="{
                active: route.path === item.path,
                accent: item.accent,
              }"
              @click="navigateTo(item.path)"
            >
              <i class="side-link-icon fas" :class="item.icon"></i>
              <span class="side-link-text">{{ item.name }}</span>
              <i
                v-if="route.path === item.path"
                class="active-indicator fas fa-chevron-right"
              ></i>
            </button>
          </template>
        </nav>

        <div class="side-menu-footer">
          <div v-if="authStore.isAuthenticated" class="user-profile-card">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Avatar"
              class="user-avatar"
            />
            <div class="user-details">
              <p class="user-name">
                {{ authStore.user?.email?.split("@")[0] }}
              </p>
              <p class="user-email">{{ authStore.user?.email }}</p>
            </div>
            <button class="settings-btn" @click="navigateTo('/perfil')">
              <i class="fas fa-cog"></i>
            </button>
          </div>
          <div v-else class="auth-actions">
            <button class="login-btn" @click="navigateTo('/login')">
              Entrar
            </button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
