<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
    search: [query: string]
}>()

const query = ref('')

function handleSearch() {
    emit('search', query.value)
}
</script>

<template>
    <div class="dashboard-search-wrapper">
        <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input v-model="query" type="text" placeholder="Busca algo para disfrutar..." class="search-input"
                @keyup.enter="handleSearch" />
            <button class="search-btn" @click="handleSearch">
                BUSCAR
            </button>
        </div>
    </div>
</template>

<style scoped>
.dashboard-search-wrapper {
    width: 100%;
    max-width: 800px;
}

.search-container {
    height: var(--search-height);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    padding: 0 var(--space-6) 0 var(--space-8);
    gap: var(--space-6);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);

    &:focus-within {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: var(--shadow-md);
    }
}

.search-icon {
    color: var(--color-text-muted);
    font-size: 1.2rem;
}

.search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--color-text-primary);
    font-size: var(--fs-lg);
    font-family: var(--font-main);

    &::placeholder {
        color: var(--color-text-muted);
        opacity: 0.5;
    }
}

.search-btn {
    height: 40px;
    padding: 0 var(--space-6);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
    font-size: var(--fs-xs);
    font-weight: 800;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: all var(--transition-base);

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text-primary);
        border-color: rgba(255, 255, 255, 0.2);
    }
}

@media (max-width: 640px) {
    .search-container {
        height: 56px;
    }

    .search-btn {
        display: none;
        /* Hide on small screens to save space, or use icon */
    }
}
</style>
