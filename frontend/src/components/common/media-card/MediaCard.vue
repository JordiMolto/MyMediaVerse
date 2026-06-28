<script setup lang="ts">
import { computed } from "vue";
import { Item, ItemType } from "@/types";
import { CategoryViewMode } from "@/types/category";
import { useCategoriesStore } from "@/stores/categories";
import { useItemsStore } from "@/stores/items";
import "./media-card.css";

interface Props {
  item: Item;
  viewMode?: CategoryViewMode;
  selectable?: boolean;
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), { viewMode: "grid" });

const emit = defineEmits<{
  click: [item: Item];
  quickNote: [id: string];
  toggleSelect: [id: string];
}>();

const categoriesStore = useCategoriesStore();
const itemsStore = useItemsStore();

const category = computed(() =>
  categoriesStore.categories.find((cat) => cat.nombre === props.item.tipo),
);

const typeIcon = computed(() => {
  if (category.value?.icono) return category.value.icono;
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

const typeColor = computed(() => category.value?.color ?? null);

const hasImage = computed(() => !!props.item.imagen);

function handleSelect(e: Event) {
  e.stopPropagation();
  emit("toggleSelect", props.item.id);
}

function handleToggleFavorite(e: Event) {
  e.stopPropagation();
  itemsStore.toggleFavorite(props.item.id);
}

function handleCardClick() {
  if (props.selectable) {
    emit("toggleSelect", props.item.id);
  } else {
    emit("click", props.item);
  }
}
</script>

<template>
  <!-- ── LIST MODE ─────────────────────────────────────────────────────── -->
  <div
    v-if="viewMode === 'list'"
    class="media-card media-card--list"
    :class="{ selectable, selected }"
    @click="handleCardClick"
  >
    <div class="list-thumbnail">
      <img v-if="hasImage" :src="item.imagen" :alt="item.titulo" class="list-thumbnail-img" />
      <div v-else class="list-thumbnail-placeholder" :style="typeColor ? { color: typeColor } : {}">
        <i class="fas" :class="typeIcon"></i>
      </div>
      <Transition name="fade">
        <div v-if="selectable" class="selection-checkbox" @click="handleSelect">
          <div class="checkbox-inner" :class="{ checked: selected }">
            <i v-if="selected" class="fas fa-check"></i>
          </div>
        </div>
      </Transition>
    </div>

    <div class="list-info">
      <div class="list-info-header">
        <h3 class="list-title">{{ item.titulo }}</h3>
        <div class="list-badges">
          <div v-if="item.rating" class="item-rating">
            <i class="fas fa-star"></i>
            <span>{{ item.rating }}</span>
          </div>
          <div
            class="favorite-tag"
            :class="{ active: item.favorito }"
            @click="handleToggleFavorite"
          >
            <i class="fas fa-heart"></i>
          </div>
        </div>
      </div>
      <p v-if="item.descripcion" class="list-description">{{ item.descripcion }}</p>
    </div>
  </div>

  <!-- ── COMPACT MODE ───────────────────────────────────────────────────── -->
  <div
    v-else-if="viewMode === 'compact'"
    class="media-card media-card--compact"
    :class="{ selectable, selected }"
    @click="handleCardClick"
    :title="item.titulo"
  >
    <div class="compact-inner">
      <img v-if="hasImage" :src="item.imagen" :alt="item.titulo" class="compact-image" />
      <div v-else class="compact-placeholder" :style="typeColor ? { color: typeColor } : {}">
        <i class="fas" :class="typeIcon"></i>
      </div>
      <div class="compact-name">{{ item.titulo }}</div>
      <Transition name="fade">
        <div v-if="selectable" class="selection-checkbox" @click="handleSelect">
          <div class="checkbox-inner" :class="{ checked: selected }">
            <i v-if="selected" class="fas fa-check"></i>
          </div>
        </div>
      </Transition>
    </div>
  </div>

  <!-- ── GRID MODE (default) ────────────────────────────────────────────── -->
  <div
    v-else
    class="media-card"
    :class="{ selectable, selected }"
    @click="handleCardClick"
  >
    <div class="card-inner">
      <div class="poster-wrapper">
        <img v-if="hasImage" :src="item.imagen" :alt="item.titulo" class="poster-image" />
        <div v-else class="poster-placeholder" :style="typeColor ? { color: typeColor } : {}">
          <i class="fas" :class="typeIcon"></i>
        </div>

        <Transition name="fade">
          <div v-if="selectable" class="selection-checkbox" @click="handleSelect">
            <div class="checkbox-inner" :class="{ checked: selected }">
              <i v-if="selected" class="fas fa-check"></i>
            </div>
          </div>
        </Transition>

        <div class="card-status-overlays">
          <div
            class="type-tag"
            :style="
              typeColor
                ? {
                    background: typeColor + '33',
                    borderColor: typeColor + '66',
                  }
                : {}
            "
          >
            <i class="fas" :class="typeIcon" :style="typeColor ? { color: typeColor } : {}"></i>
          </div>
          <div
            class="favorite-tag"
            :class="{ active: item.favorito }"
            @click="handleToggleFavorite"
          >
            <i class="fas fa-heart"></i>
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
