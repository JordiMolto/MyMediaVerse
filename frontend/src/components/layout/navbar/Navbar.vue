<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAuthPage = computed(() => {
    return route.name === 'login' || route.name === 'register'
})

function goToHome() {
    router.push('/')
}

</script>

<template>
    <nav class="navbar" v-if="!isAuthPage">
        <div class="navbar-container">
            <div class="navbar-brand" @click="goToHome">
                <i class="fas fa-rocket"></i>
                <span>MyMediaVerse</span>
            </div>

            <div class="navbar-menu">
                <button class="nav-link" :class="{ active: route.name === 'home' }" @click="router.push('/')">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </button>
                <button class="nav-link" :class="{ active: route.name === 'pending' }"
                    @click="router.push('/pendiente')">
                    <i class="fas fa-clock"></i>
                    <span>Pendiente</span>
                </button>
                <button class="nav-link" :class="{ active: route.name === 'in-progress' }"
                    @click="router.push('/en-progreso')">
                    <i class="fas fa-play"></i>
                    <span>En Progreso</span>
                </button>
                <button class="nav-link" :class="{ active: route.name === 'completed' }" @click="router.push('/hecho')">
                    <i class="fas fa-check-circle"></i>
                    <span>Completado</span>
                </button>
            </div>

            <div class="navbar-actions">
                <button class="icon-btn" title="Notificaciones">
                    <i class="fas fa-bell"></i>
                </button>
                <div v-if="authStore.isAuthenticated" class="user-profile-trigger" @click="router.push('/perfil')"
                    title="Mi Perfil">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User Avatar"
                        class="avatar-img shadow-sm" />
                </div>
                <AppButton v-else variant="primary" size="small" icon="fa-sign-in-alt" @click="router.push('/login')">
                    Entrar
                </AppButton>
            </div>
        </div>
    </nav>
</template>

<style scoped src="./navbar.css"></style>
