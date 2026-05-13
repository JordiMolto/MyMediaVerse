<script setup lang="ts">
import { computed } from "vue";
import { Item, ItemType, ItemStatus } from "@/types";
import "./dashboard-list-item.css";

interface Props {
  item: Item;
}

const props = defineProps<Props>();

const typeIcon = computed(() => {
  switch (props.item.tipo) {
    case ItemType.MOVIE:
      return "fa-film";
    case ItemType.SERIES:
      return "fa-tv";
    case ItemType.ANIME:
      return "fa-dragon";
    case ItemType.BOOK:
      return "fa-book";
    case ItemType.VIDEOGAME:
      return "fa-gamepad";
    case ItemType.BOARDGAME:
      return "fa-dice";
    default:
      return "fa-folder";
  }
});

const statusLabel = computed(() => {
  switch (props.item.estado) {
    case ItemStatus.IN_PROGRESS:
      return "ACTIVO";
    case ItemStatus.PENDING:
      return "EN COLA";
    case ItemStatus.COMPLETED:
      return "HECHO";
    default:
      return "EN COLA";
  }
});

const statusClass = computed(() => {
  switch (props.item.estado) {
    case ItemStatus.IN_PROGRESS:
      return "active";
    case ItemStatus.PENDING:
      return "queued";
    case ItemStatus.COMPLETED:
      return "done";
    default:
      return "queued";
  }
});

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "AHORA";
  if (hours < 24) return `HACE ${hours}H`;
  if (hours < 48) return "AYER";
  return new Date(date)
    .toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    .toUpperCase();
}
</script>

<template>
  <div class="dashboard-list-item">
    <div class="item-leading">
      <div class="type-icon-box">
        <i class="fas" :class="typeIcon"></i>
      </div>
      <div class="item-content">
        <h4 class="item-title">{{ item.titulo }}</h4>
        <div class="item-meta">
          <span class="type-badge">{{ item.tipo.toUpperCase() }}</span>
          <span class="dot-separator">•</span>
          <span class="time-stamp">{{
            formatRelativeTime(item.fechaCreacion)
          }}</span>
        </div>
      </div>
    </div>

    <div class="item-trailing">
      <div class="status-badge" :class="statusClass">
        {{ statusLabel }}
      </div>
      <button class="options-btn">
        <i class="fas fa-ellipsis-h"></i>
      </button>
    </div>
  </div>
</template>
