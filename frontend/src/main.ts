import { createApp } from 'vue'
import './style.css' // Estilos globales básicos
import App from './App.vue'
import router from './router' // Importamos el router

const app = createApp(App)

app.use(router) // Usamos el router

// --- COMENTARIOS PARA TI ---
// Si usas Pinia:
// import { createPinia } from 'pinia'
// const pinia = createPinia()
// app.use(pinia)
// --------------------------

app.mount('#app') 