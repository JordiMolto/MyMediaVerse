<script setup lang="ts">
import { computed } from "vue";
import { Item, ItemType } from "@/types";
import "./media-card.css";

interface Props {
  item: Item;
  selectable?: boolean;
  selected?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [id: string];
  quickNote: [id: string];
  toggleSelect: [id: string];
}>();

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

const hasImage = computed(() => !!props.item.imagen);

function handleSelect(e: Event) {
  e.stopPropagation();
  emit("toggleSelect", props.item.id);
}

function handleCardClick() {
  if (props.selectable) {
    emit("toggleSelect", props.item.id);
  } else {
    emit("click", props.item.id);
  }
}
</script>

<template>
  <div
    class="media-card"
    :class="{ selectable: selectable, selected: selected }"
    @click="handleCardClick"
  >
    <div class="card-inner">
      <div class="poster-wrapper">
        <img
          v-if="hasImage"
          :src="item.imagen"
          :alt="item.titulo"
          class="poster-image"
        />
        <div v-else class="poster-placeholder">
          <i class="fas" :class="typeIcon"></i>
        </div>

        <Transition name="fade">
          <div
            v-if="selectable"
            class="selection-checkbox"
            @click="handleSelect"
          >
            <div class="checkbox-inner" :class="{ checked: selected }">
              <i v-if="selected" class="fas fa-check"></i>
            </div>
          </div>
        </Transition>

        <div class="card-status-overlays">
          <div v-if="item.favorito" class="favorite-tag">
            <i class="fas fa-heart"></i>
          </div>
          <div class="type-tag">
            <i class="fas" :class="typeIcon"></i>
          </div>
        </div>

        <div class="info-overlay">
          <div class="info-header">
            <h3 class="item-title">{{ item.titulo }}</h3>
            <div v-if="item.rating" class="item-rating">
              <i class="fas fa-star"></i>
              <span>{{ item.rating }}</span>
            </div>
          </div>
          <p v-if="item.descripcion" class="item-description">
            {{ item.descripcion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
