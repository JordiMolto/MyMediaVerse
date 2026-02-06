<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/common/app-button/AppButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAuthPage = computed(() => {
    return route.name === 'login' || route.name === 'register'
})

function goToHome() {
    router.push('/')
}

function goToPending() {
    router.push('/pendiente')
}

function goToInProgress() {
    router.push('/en-progreso')
}

function goToCompleted() {
    router.push('/hecho')
}

function goToSearch() {
    router.push('/buscar')
}

function goToLogin() {
    router.push('/login')
}

async function handleLogout() {
    await authStore.signOut()
    router.push('/login')
}
</script>

<template>
    <nav class="navbar" v-if="!isAuthPage">
        <div class="navbar-container">
            <div class="navbar-brand" @click="goToHome">
                <i class="fas fa-film"></i>
                <span>MyMediaVerse</span>
            </div>

            <div class="navbar-menu">
                <button class="nav-link" :class="{ active: route.name === 'home' }" @click="goToHome">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </button>

                <button class="nav-link" :class="{ active: route.name === 'pending' }" @click="goToPending">
                    <i class="fas fa-clock"></i>
                    <span>Pendiente</span>
                </button>

                <button class="nav-link" :class="{ active: route.name === 'in-progress' }" @click="goToInProgress">
                    <i class="fas fa-play-circle"></i>
                    <span>En Progreso</span>
                </button>

                <button class="nav-link" :class="{ active: route.name === 'completed' }" @click="goToCompleted">
                    <i class="fas fa-check-circle"></i>
                    <span>Completado</span>
                </button>

                <button class="nav-link" :class="{ active: route.name === 'search' }" @click="goToSearch">
                    <i class="fas fa-search"></i>
                    <span>Buscar</span>
                </button>
            </div>

            <div class="navbar-actions">
                <div v-if="authStore.isAuthenticated" class="user-info">
                    <span class="user-email">{{ authStore.user?.email }}</span>
                    <AppButton variant="ghost" size="small" icon="fa-sign-out-alt" @click="handleLogout">
                        Salir
                    </AppButton>
                </div>
                <AppButton v-else variant="primary" size="small" icon="fa-sign-in-alt" @click="goToLogin">
                    Iniciar Sesión
                </AppButton>
            </div>
        </div>
    </nav>
</template>

<style scoped src="./navbar.css"></style>
