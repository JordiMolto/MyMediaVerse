import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
// --- COMENTARIOS PARA TI ---
// import SeriesView from '../views/SeriesView.vue';
// import AnimesView from '../views/AnimesView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';

// const isAuthenticated = () => {
//   // Lógica para verificar si el token JWT existe y es válido
//   // return !!localStorage.getItem('user-token');
//   return true; // Placeholder
// };

// const authGuard = (to: any, from: any, next: any) => {
//   if (isAuthenticated()) {
//     next(); // El usuario está autenticado, permite el acceso
//   } else {
//     next('/login'); // El usuario no está autenticado, redirige a login
//   }
// };
// --------------------------

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/movies",
    name: "Movies",
    // component: () => import(/* webpackChunkName: "movies" */ '../views/MoviesView.vue'),
    component: () => import('../views/MoviesView.vue'), // Simplificado para Vite
    // --- COMENTARIOS PARA TI ---
    // beforeEnter: authGuard, // Ejemplo de ruta protegida
    // --------------------------
  },
  {
    path: '/series',
    name: 'Series',
    component: () => import('../views/SeriesView.vue'),
  },
  {
    path: '/animes',
    name: 'Animes',
    component: () => import('../views/AnimesView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView, // Usamos la importación directa
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView, // Usamos la importación directa
  },
  // --- COMENTARIOS PARA TI ---
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: LoginView,
  // },
  // {
  //   path: '/register',
  //   name: 'Register',
  //   component: RegisterView,
  // },
  // --------------------------
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
