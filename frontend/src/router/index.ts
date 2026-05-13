import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login-view/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/register-view/RegisterView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home-view/HomeView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/pendiente",
    name: "pending",
    component: () => import("@/views/pending-view/PendingView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/en-progreso",
    name: "in-progress",
    component: () => import("@/views/in-progress-view/InProgressView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/hecho",
    name: "completed",
    component: () => import("@/views/completed-view/CompletedView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/favoritos",
    name: "favorites",
    component: () => import("@/views/favorites-view/FavoritesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/item/:id",
    name: "item-detail",
    component: () => import("@/views/item-detail-view/ItemDetailView.vue"),
    meta: { requiresAuth: true },
    beforeEnter: async (to, _, next) => {
      // Dynamically load the correct detail view based on item type
      const { useItemsStore } = await import("@/stores/items");
      const itemsStore = useItemsStore();

      const itemId = to.params.id as string;
      const item = await itemsStore.getItemById(itemId);

      if (!item) {
        next({ name: "home" });
        return;
      }

      // Route to specialized view based on type (with robust check)
      const t = (item.tipo || "").toLowerCase();
      let targetRoute = "";

      if (t === "movie" || t === "película" || t === "pelicula") {
        targetRoute = "movie-detail";
      } else if (t === "series" || t === "serie" || t === "anime") {
        targetRoute = "series-detail";
      } else if (t === "book" || t === "libro") {
        targetRoute = "book-detail";
      } else if (t === "videogame" || t === "videojuego" || t === "juego") {
        targetRoute = "videogame-detail";
      } else if (t === "boardgame" || t === "juego de mesa") {
        targetRoute = "boardgame-detail";
      }

      if (targetRoute && to.name !== targetRoute) {
        next({ name: targetRoute, params: { id: itemId } });
      } else {
        next();
      }
    },
  },
  {
    path: "/movie/:id",
    name: "movie-detail",
    component: () => import("@/views/movie-detail-view/MovieDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/series/:id",
    name: "series-detail",
    component: () => import("@/views/series-detail-view/SeriesDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/book/:id",
    name: "book-detail",
    component: () => import("@/views/book-detail-view/BookDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/videogame/:id",
    name: "videogame-detail",
    component: () => import("@/views/item-detail-view/ItemDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/boardgame/:id",
    name: "boardgame-detail",
    component: () => import("@/views/item-detail-view/ItemDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/buscar",
    name: "search",
    component: () => import("@/views/search-view/SearchView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/perfil",
    name: "profile",
    component: () => import("@/views/profile-view/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/colecciones",
    name: "collections",
    component: () => import("@/views/collections-view/CollectionsView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard - require authentication for all routes except login/register
router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  // Wait for auth to initialize
  if (!authStore.initialized) {
    await authStore.initialize();
  }

  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: "login" });
  } else if (
    !requiresAuth &&
    authStore.isAuthenticated &&
    (to.name === "login" || to.name === "register")
  ) {
    // Redirect to home if already authenticated and trying to access login/register
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
