<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useItemsStore } from "@/stores/items";
import { ItemType } from "@/types";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import ProfileEditForm from "@/components/profile/profile-edit-form/ProfileEditForm.vue";
import "./profile-view.css";

const authStore = useAuthStore();
const itemsStore = useItemsStore();
const router = useRouter();

const showEditModal = ref(false);

onMounted(() => {
  itemsStore.fetchItems();
});

const userDisplayName = computed(
  () =>
    authStore.user?.user_metadata?.display_name ||
    authStore.user?.email?.split("@")[0] ||
    "Usuario",
);

const userAvatar = computed(
  () =>
    authStore.user?.user_metadata?.avatar_url ||
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
);

const stats = computed(() => {
  const completed = itemsStore.completedItems;
  return {
    total: completed.length,
    movies: completed.filter((i) => {
      const t = i.tipo.toLowerCase();
      return [
        ItemType.MOVIE,
        ItemType.SERIES,
        ItemType.ANIME,
        "película",
        "pelicula",
        "serie",
      ].some((v) => t.includes(v));
    }).length,
    games: completed.filter((i) => {
      const t = i.tipo.toLowerCase();
      return [ItemType.VIDEOGAME, "juego", "game"]
        .filter((v) => v !== "juego de mesa")
        .some((v) => t.includes(v));
    }).length,
    books: completed.filter((i) => {
      const t = i.tipo.toLowerCase();
      return [ItemType.BOOK, "libro", "book"].some((v) => t.includes(v));
    }).length,
    boardgames: completed.filter((i) => {
      const t = i.tipo.toLowerCase();
      return [ItemType.BOARDGAME, "mesa", "board"].some((v) => t.includes(v));
    }).length,
  };
});

async function handleSignOut() {
  await authStore.signOut();
  router.push("/login");
}
</script>

<template>
  <div class="profile-view">
    <div class="profile-content">
      <section class="profile-header">
        <div class="avatar-wrapper">
          <img :src="userAvatar" alt="Avatar" class="profile-avatar" />
          <div class="status-dot"></div>
        </div>

        <div class="user-greeting">
          <h1 class="greeting-text">¡Hola, {{ userDisplayName }}!</h1>
          <p class="subtitle-text">CIUDADANO DE MYMEDIAVERSE</p>
        </div>

        <div class="profile-actions">
          <button class="btn btn-glass btn-small" @click="showEditModal = true">
            <i class="fas fa-edit"></i>
            Editar Perfil
          </button>
          <button
            class="btn btn-glass btn-small"
            @click="router.push('/colecciones')"
          >
            <i class="fas fa-layer-group"></i>
            Gestionar Colecciones
          </button>
        </div>
      </section>

      <section class="impact-section">
        <div class="section-divider">
          <span class="divider-label">TU IMPACTO</span>
          <div class="divider-line"></div>
        </div>

        <div class="impact-card glass-card">
          <div class="impact-content">
            <span class="impact-label">Total de Items Completados</span>
            <h2 class="impact-value">{{ stats.total }}</h2>
          </div>
          <i class="fas fa-sparkles impact-decoration"></i>
        </div>

        <div class="category-grid">
          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--movies">
              <i class="fas fa-film"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.movies }}</span>
              <span class="stat-name">Audiovisual</span>
            </div>
          </div>

          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--games">
              <i class="fas fa-gamepad"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.games }}</span>
              <span class="stat-name">Juegos</span>
            </div>
          </div>

          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--books">
              <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.books }}</span>
              <span class="stat-name">Libros</span>
            </div>
          </div>

          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--board">
              <i class="fas fa-dice"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.boardgames }}</span>
              <span class="stat-name">Mesa</span>
            </div>
          </div>
        </div>
      </section>

      <section class="logout-section">
        <button class="btn-signout" @click="handleSignOut">
          <i class="fas fa-sign-out-alt"></i>
          Cerrar Sesión
        </button>
      </section>
    </div>

    <AppModal
      :is-open="showEditModal"
      title="Editar Perfil"
      size="medium"
      @close="showEditModal = false"
    >
      <ProfileEditForm
        @save="showEditModal = false"
        @cancel="showEditModal = false"
      />
    </AppModal>
  </div>
</template>
