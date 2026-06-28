import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { extractIdFromSlug } from "@/utils/slugify";

const routes: RouteRecordRaw[] = [
  // ─── Autenticación (sin guard) ───────────────────────────────────────────────
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

  // ─── Rutas estáticas (deben ir antes que las dinámicas) ──────────────────────
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

  // ─── Alias de compatibilidad: /item/:id → URL semántica ───────────────────────
  // ItemDetailView se encarga de leer el id directamente cuando la ruta es /item/:id
  {
    path: "/item/:id",
    name: "item-detail-legacy",
    component: () => import("@/views/item-detail-view/ItemDetailView.vue"),
    meta: { requiresAuth: true },
  },

  // ─── Rutas dinámicas (van al final para no eclipsar las estáticas) ────────────
  {
    path: "/coleccion/:nombre",
    name: "collection",
    component: () => import("@/views/collection-view/CollectionView.vue"),
    meta: { requiresAuth: true },
  },
  {
    // URL canónica: /coleccion/:nombre/:titulo--id
    // Ejemplo: /coleccion/peliculas/interstellar--abc123
    path: "/coleccion/:nombre/:slug",
    name: "item-detail",
    component: () => import("@/views/item-detail-view/ItemDetailView.vue"),
    meta: { requiresAuth: true },
    beforeEnter: (to, _, next) => {
      if (!(to.params.slug as string).includes("--")) {
        next({ name: "home" });
        return;
      }
      next();
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard - require authentication for all routes except login/register
router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  if (!authStore.initialized) {
    await authStore.initialize();
  }

  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login" });
  } else if (
    !requiresAuth &&
    authStore.isAuthenticated &&
    (to.name === "login" || to.name === "register")
  ) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
