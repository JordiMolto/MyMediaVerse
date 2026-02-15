<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useItemsStore } from '@/stores/items'
import { ItemType } from '@/types'
import AppModal from '@/components/common/app-modal/AppModal.vue'
import ProfileEditForm from '@/components/profile/ProfileEditForm.vue'

const authStore = useAuthStore()
const itemsStore = useItemsStore()
const router = useRouter()

const showEditModal = ref(false)

onMounted(() => {
    itemsStore.fetchItems()
})

const userDisplayName = computed(() =>
    authStore.user?.user_metadata?.display_name || authStore.user?.email?.split('@')[0] || 'Usuario'
)

const userAvatar = computed(() =>
    authStore.user?.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
)

const stats = computed(() => {
    const completed = itemsStore.completedItems
    return {
        total: completed.length,
        movies: completed.filter(i => {
            const t = i.tipo.toLowerCase()
            return [ItemType.MOVIE, ItemType.SERIES, ItemType.ANIME, 'película', 'pelicula', 'serie'].some(v => t.includes(v))
        }).length,
        games: completed.filter(i => {
            const t = i.tipo.toLowerCase()
            return [ItemType.VIDEOGAME, 'juego', 'game'].filter(v => v !== 'juego de mesa').some(v => t.includes(v))
        }).length,
        books: completed.filter(i => {
            const t = i.tipo.toLowerCase()
            return [ItemType.BOOK, 'libro', 'book'].some(v => t.includes(v))
        }).length,
        boardgames: completed.filter(i => {
            const t = i.tipo.toLowerCase()
            return [ItemType.BOARDGAME, 'mesa', 'board'].some(v => t.includes(v))
        }).length
    }
})

async function handleSignOut() {
    await authStore.signOut()
    router.push('/login')
}
</script>

<template>
    <div class="profile-view">
        <div class="profile-content flex flex-col items-center">

            <!-- Header Section -->
            <section class="app-section profile-header-section flex flex-col items-center gap-8">
                <div class="avatar-wrapper relative">
                    <img :src="userAvatar" alt="Avatar" class="profile-avatar shadow-glow" />
                    <div class="status-dot"></div>
                </div>

                <div class="user-greeting text-center">
                    <h1 class="greeting-text">¡Hola, {{ userDisplayName }}!</h1>
                    <p class="subtitle-text">CIUDADANO DE MYMEDIAVERSE</p>
                </div>

                <div class="flex gap-4">
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

            <!-- Impact Section -->
            <section class="app-section impact-section flex flex-col items-center gap-10">
                <div class="section-divider flex flex-col items-center gap-3">
                    <span class="divider-label">TU IMPACTO</span>
                    <div class="divider-line"></div>
                </div>

                <div class="impact-card glass-card relative overflow-hidden">
                    <div class="impact-content flex flex-col gap-2">
                        <span class="impact-label">Total de Items Completados</span>
                        <h2 class="impact-value">{{ stats.total }}</h2>
                    </div>
                    <i class="fas fa-sparkles impact-decoration"></i>
                </div>

                <div class="category-grid">
                    <div class="mini-stat-card glass-card">
                        <div class="stat-icon-box movies">
                            <i class="fas fa-film"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-num">{{ stats.movies }}</span>
                            <span class="stat-name">Audiovisual</span>
                        </div>
                    </div>

                    <div class="mini-stat-card glass-card">
                        <div class="stat-icon-box games">
                            <i class="fas fa-gamepad"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-num">{{ stats.games }}</span>
                            <span class="stat-name">Juegos</span>
                        </div>
                    </div>

                    <div class="mini-stat-card glass-card">
                        <div class="stat-icon-box books">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-num">{{ stats.books }}</span>
                            <span class="stat-name">Libros</span>
                        </div>
                    </div>

                    <div class="mini-stat-card glass-card">
                        <div class="stat-icon-box board">
                            <i class="fas fa-dice"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-num">{{ stats.boardgames }}</span>
                            <span class="stat-name">Mesa</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Logout Section -->
            <section class="app-section logout-section pt-10">
                <button class="btn btn-signout" @click="handleSignOut">
                    <i class="fas fa-sign-out-alt"></i>
                    Cerrar Sesión
                </button>
            </section>
        </div>

        <!-- Edit Profile Modal -->
        <AppModal :is-open="showEditModal" title="Editar Perfil" size="medium" @close="showEditModal = false">
            <ProfileEditForm @save="showEditModal = false" @cancel="showEditModal = false" />
        </AppModal>
    </div>
</template>

<style scoped>
.profile-view {
    width: 100%;
}

.profile-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-6);
}

.profile-avatar {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 5px solid #FF5722;
    /* Orange border as in image */
    background: var(--color-bg-surface);
    object-fit: cover;
    padding: 6px;
    background-clip: content-box;
}

.status-dot {
    position: absolute;
    bottom: 12px;
    right: 12px;
    width: 22px;
    height: 22px;
    background: #4CAF50;
    border: 4px solid var(--color-bg-main);
    border-radius: 50%;
}

.shadow-glow {
    box-shadow: 0 0 40px rgba(255, 87, 34, 0.2);
}

.greeting-text {
    font-size: var(--fs-4xl);
    font-weight: 900;
    letter-spacing: -0.04em;
    color: white;
    margin: 0;
}

.subtitle-text {
    font-size: var(--fs-xs);
    font-weight: 800;
    letter-spacing: 0.2em;
    color: #FF5722;
    text-transform: uppercase;
    margin-top: var(--space-2);
}

.divider-label {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.15em;
    color: var(--color-text-muted);
}

.divider-line {
    width: 40px;
    height: 3px;
    background: #FF5722;
    border-radius: var(--radius-full);
}

.impact-card {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-10);
    background: linear-gradient(135deg, rgba(255, 87, 34, 0.1) 0%, rgba(20, 20, 25, 0.5) 100%);
    border: 1px solid rgba(255, 87, 34, 0.2);
    min-height: 140px;
    display: flex;
    align-items: center;
}

.impact-label {
    font-size: var(--fs-sm);
    color: var(--color-text-secondary);
    font-weight: 600;
}

.impact-value {
    font-size: 56px;
    font-weight: 900;
    color: #FF5722;
    margin: 0;
    line-height: 1;
}

.impact-decoration {
    position: absolute;
    right: var(--space-10);
    font-size: 3rem;
    opacity: 0.2;
    color: #FF5722;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-4);
    width: 100%;
    max-width: 800px;
}

.mini-stat-card {
    padding: var(--space-6) var(--space-5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    text-align: center;
    min-width: 140px;
}

.stat-icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;

    &.movies {
        background: rgba(168, 85, 247, 0.1);
        color: #A855F7;
    }

    &.games {
        background: rgba(0, 245, 2FF, 0.1);
        color: #00F5FF;
    }

    &.books {
        background: rgba(76, 175, 80, 0.1);
        color: #4CAF50;
    }

    &.board {
        background: rgba(255, 193, 7, 0.1);
        color: #FFC107;
    }
}

.stat-num {
    display: block;
    font-size: var(--fs-2xl);
    font-weight: 900;
    color: white;
}

.stat-name {
    font-size: 11px;
    font-weight: 700;
    color: var(--color-text-muted);
}

.logout-section {
    width: 100%;
    display: flex;
    justify-content: center;
}

.btn-signout {
    background: #FF5722;
    color: white;
    padding: var(--space-4) var(--space-12);
    border-radius: var(--radius-full);
    font-weight: 800;
    font-size: var(--fs-base);
    box-shadow: 0 10px 20px rgba(255, 87, 34, 0.2);
    transition: all var(--transition-base);
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 30px rgba(255, 87, 34, 0.4);
        filter: brightness(1.1);
    }
}

@media (max-width: 768px) {
    .category-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .greeting-text {
        font-size: var(--fs-4xl);
    }
}
</style>
