import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login-view/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/register-view/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pendiente',
    name: 'pending',
    component: () => import('@/views/PendingView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/en-progreso',
    name: 'in-progress',
    component: () => import('@/views/InProgressView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/hecho',
    name: 'completed',
    component: () => import('@/views/CompletedView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/item/:id',
    name: 'item-detail',
    component: () => import('@/views/ItemDetailView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/buscar',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard - require authentication for all routes except login/register
router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize
  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if not authenticated
    next({ name: 'login' })
  } else if (!requiresAuth && authStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    // Redirect to home if already authenticated and trying to access login/register
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
