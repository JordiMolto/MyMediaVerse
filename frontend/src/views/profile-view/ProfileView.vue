<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useItemsStore } from "@/stores/items";
import { useUserAvatar } from "@/composables/useUserAvatar";
import { ItemType } from "@/types";
import AppModal from "@/components/common/app-modal/AppModal.vue";
import ProfileEditForm from "@/components/profile/profile-edit-form/ProfileEditForm.vue";
import AvatarPickerModal from "@/components/profile/avatar-picker/AvatarPickerModal.vue";
import "./profile-view.css";

const authStore = useAuthStore();
const itemsStore = useItemsStore();
const router = useRouter();
const { avatarUrl } = useUserAvatar();

const showEditModal = ref(false);
const showAvatarPicker = ref(false);

onMounted(() => {
  itemsStore.fetchItems();
});

const userDisplayName = computed(
  () =>
    authStore.user?.user_metadata?.display_name ||
    authStore.user?.email?.split("@")[0] ||
    "Usuario",
);

function filterByCategory(
  list: typeof itemsStore.items,
  category: "movies" | "games" | "books" | "boardgames",
) {
  return list.filter((i) => {
    const t = i.tipo.toLowerCase();
    if (category === "movies")
      return [
        ItemType.MOVIE,
        ItemType.SERIES,
        ItemType.ANIME,
        "película",
        "pelicula",
        "serie",
      ].some((v) => t.includes(v));
    if (category === "games")
      return [ItemType.VIDEOGAME, "juego", "game"]
        .filter((v) => v !== "juego de mesa")
        .some((v) => t.includes(v));
    if (category === "books") return [ItemType.BOOK, "libro", "book"].some((v) => t.includes(v));
    if (category === "boardgames")
      return [ItemType.BOARDGAME, "mesa", "board"].some((v) => t.includes(v));
    return false;
  });
}

const stats = computed(() => {
  const all = itemsStore.items;
  const completed = itemsStore.completedItems;

  function categoryStats(cat: "movies" | "games" | "books" | "boardgames") {
    return {
      completed: filterByCategory(completed, cat).length,
      total: filterByCategory(all, cat).length,
    };
  }

  return {
    totalCompleted: completed.length,
    totalItems: all.length,
    movies: categoryStats("movies"),
    games: categoryStats("games"),
    books: categoryStats("books"),
    boardgames: categoryStats("boardgames"),
  };
});

const completionPercent = computed(() => {
  if (stats.value.totalItems === 0) return 0;
  return Math.round((stats.value.totalCompleted / stats.value.totalItems) * 100);
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
        <div class="avatar-wrapper" @click="showAvatarPicker = true">
          <img :src="avatarUrl" alt="Avatar" class="profile-avatar" />
          <div class="avatar-edit-hint">
            <i class="fas fa-camera"></i>
          </div>
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
          <button class="btn btn-glass btn-small" @click="router.push('/colecciones')">
            <i class="fas fa-layer-group"></i>
            Gestionar Colecciones
          </button>
        </div>
      </section>

      <section class="impact-section">
        <div class="section-divider">
          <span class="divider-label">TU BIBLIOTECA</span>
          <div class="divider-line"></div>
        </div>

        <div class="impact-card glass-card">
          <div class="impact-content">
            <span class="impact-label">Completados de tu biblioteca</span>
            <h2 class="impact-value">
              {{ stats.totalCompleted }}
              <span class="impact-value-total">/ {{ stats.totalItems }}</span>
            </h2>
            <div class="progress-bar-track">
              <div class="progress-bar-fill" :style="{ width: completionPercent + '%' }"></div>
            </div>
            <span class="impact-percent">{{ completionPercent }}% completado</span>
          </div>
          <i class="fas fa-sparkles impact-decoration"></i>
        </div>

        <div class="category-grid">
          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--movies">
              <i class="fas fa-film"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.movies.completed }}</span>
              <span class="stat-name">Audiovisual</span>
              <span class="stat-context">de {{ stats.movies.total }} en total</span>
            </div>
          </div>

          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--games">
              <i class="fas fa-gamepad"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.games.completed }}</span>
              <span class="stat-name">Juegos</span>
              <span class="stat-context">de {{ stats.games.total }} en total</span>
            </div>
          </div>

          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--books">
              <i class="fas fa-book"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.books.completed }}</span>
              <span class="stat-name">Libros</span>
              <span class="stat-context">de {{ stats.books.total }} en total</span>
            </div>
          </div>

          <div class="mini-stat-card glass-card">
            <div class="stat-icon-box stat-icon-box--board">
              <i class="fas fa-dice"></i>
            </div>
            <div class="stat-info">
              <span class="stat-num">{{ stats.boardgames.completed }}</span>
              <span class="stat-name">Mesa</span>
              <span class="stat-context">de {{ stats.boardgames.total }} en total</span>
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

    <AvatarPickerModal
      :is-open="showAvatarPicker"
      @close="showAvatarPicker = false"
      @saved="showAvatarPicker = false"
    />

    <AppModal
      :is-open="showEditModal"
      title="Editar Perfil"
      size="medium"
      @close="showEditModal = false"
    >
      <ProfileEditForm @save="showEditModal = false" @cancel="showEditModal = false" />
    </AppModal>
  </div>
</template>
