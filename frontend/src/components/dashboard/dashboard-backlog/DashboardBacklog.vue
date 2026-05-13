<script setup lang="ts">
import { Item } from "@/types";
import { useRouter } from "vue-router";
import "./dashboard-backlog.css";

const props = defineProps<{
  oldest: Item | null;
  best: Item | null;
  random: Item | null;
}>();

const router = useRouter();

const goToItem = (id?: string) => {
  if (id) router.push(`/item/${id}`);
};
</script>

<template>
  <div class="backlog-section">
    <h3 class="section-title">Tu Backlog Real</h3>

    <div class="backlog-grid">
      <div class="backlog-card" @click="goToItem(oldest?.id)">
        <div class="card-tag">MÁS ANTIGUO</div>
        <div v-if="oldest" class="card-content">
          <img v-if="oldest.imagen" :src="oldest.imagen" class="card-bg" />
          <div class="overlay"></div>
          <div class="info">
            <h4 class="title">{{ oldest.titulo }}</h4>
            <span class="date">Añadido hace poco tiempo</span>
          </div>
        </div>
        <div v-else class="empty-card">No hay pendientes</div>
      </div>

      <div class="backlog-card" @click="goToItem(best?.id)">
        <div class="card-tag">MEJOR VALORADO</div>
        <div v-if="best" class="card-content">
          <img v-if="best.imagen" :src="best.imagen" class="card-bg" />
          <div class="overlay"></div>
          <div class="info">
            <h4 class="title">{{ best.titulo }}</h4>
            <span class="rating">★ {{ best.rating || "N/A" }}</span>
          </div>
        </div>
        <div v-else class="empty-card">No hay pendientes</div>
      </div>

      <div
        class="backlog-card backlog-card--random"
        @click="goToItem(random?.id)"
      >
        <div class="card-tag">QUÉ CONSUMIR AHORA</div>
        <div v-if="random" class="random-inner">
          <i class="fas fa-dice dice-icon"></i>
          <p>¿No te decides? Prueba con:</p>
          <h4 class="title">{{ random.titulo }}</h4>
        </div>
        <div v-else class="empty-card">Nada que recomendar</div>
      </div>
    </div>
  </div>
</template>
