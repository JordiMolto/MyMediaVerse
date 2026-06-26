<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useCategoriesStore } from "@/stores/categories";
import { useUserAvatar } from "@/composables/useUserAvatar";
import logoUrl from "@/assets/images/logo_mymediaverse.png";
import "./side-menu.css";

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const authStore = useAuthStore();
const categoriesStore = useCategoriesStore();
const { avatarUrl } = useUserAvatar();

const activityLinks = [
  { name: "En Progreso", icon: "fa-play", path: "/en-progreso" },
  { name: "Pendiente", icon: "fa-clock", path: "/pendiente" },
  { name: "Completado", icon: "fa-check-circle", path: "/hecho" },
  { name: "Favoritos", icon: "fa-heart", path: "/favoritos" },
];

const visibleCategories = computed(() => categoriesStore.categories.filter((cat) => !cat.oculto));

onMounted(() => {
  categoriesStore.fetchCategories();
});

function navigateTo(path: string) {
  router.push(path);
  uiStore.toggleSideMenu(false);
}

function navigateToCollection(nombre: string) {
  router.push({ name: "collection", params: { nombre } });
  uiStore.toggleSideMenu(false);
}

function isCollectionActive(nombre: string): boolean {
  return route.name === "collection" && route.params.nombre === nombre;
}

function getCollectionStyle(nombre: string, color?: string) {
  if (!color || !isCollectionActive(nombre)) return {};
  return { color, background: color + "22" };
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
          <button
            class="side-link"
            :class="{ active: route.path === '/' }"
            @click="navigateTo('/')"
          >
            <i class="side-link-icon fas fa-home"></i>
            <span class="side-link-text">Inicio</span>
            <i v-if="route.path === '/'" class="active-indicator fas fa-chevron-right"></i>
          </button>

          <div class="nav-section">
            <span class="nav-section-label">Actividad</span>
            <button
              v-for="link in activityLinks"
              :key="link.path"
              class="side-link"
              :class="{ active: route.path === link.path }"
              @click="navigateTo(link.path)"
            >
              <i class="side-link-icon fas" :class="link.icon"></i>
              <span class="side-link-text">{{ link.name }}</span>
              <i v-if="route.path === link.path" class="active-indicator fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="nav-section">
            <span class="nav-section-label">Colecciones</span>

            <p v-if="visibleCategories.length === 0" class="nav-empty">
              Sin colecciones.
              <button class="nav-empty-btn" @click="navigateTo('/colecciones')">Crear una</button>
            </p>

            <button
              v-for="cat in visibleCategories"
              :key="cat.id"
              class="side-link side-link--collection"
              :class="{ active: isCollectionActive(cat.nombre) }"
              :style="getCollectionStyle(cat.nombre, cat.color)"
              @click="navigateToCollection(cat.nombre)"
            >
              <i
                class="side-link-icon fas"
                :class="cat.icono || 'fa-folder'"
                :style="cat.color ? { color: cat.color } : {}"
              ></i>
              <span class="side-link-text">{{ cat.nombre }}</span>
              <i
                v-if="isCollectionActive(cat.nombre)"
                class="active-indicator fas fa-chevron-right"
              ></i>
            </button>

            <button
              class="side-link side-link--manage"
              :class="{ active: route.path === '/colecciones' }"
              @click="navigateTo('/colecciones')"
            >
              <i class="side-link-icon fas fa-sliders-h"></i>
              <span class="side-link-text">Gestionar colecciones</span>
            </button>
          </div>
        </nav>

        <div class="side-menu-footer">
          <div
            v-if="authStore.isAuthenticated"
            class="user-profile-card"
            @click="navigateTo('/perfil')"
          >
            <img :src="avatarUrl" alt="Avatar" class="user-avatar" />
            <div class="user-details">
              <p class="user-name">
                {{
                  authStore.user?.user_metadata?.display_name ||
                  authStore.user?.email?.split("@")[0]
                }}
              </p>
              <p class="user-email">{{ authStore.user?.email }}</p>
            </div>
            <button class="settings-btn">
              <i class="fas fa-cog"></i>
            </button>
          </div>
          <div v-else class="auth-actions">
            <button class="login-btn" @click="navigateTo('/login')">Entrar</button>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
