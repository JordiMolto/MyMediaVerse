<script setup lang="ts">
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import {
  generateAvatar,
  PALETTES,
  type AvatarVariant,
} from "@/utils/boringAvatars";
import "./avatar-picker.css";

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const authStore = useAuthStore();

const VARIANTS: { id: AvatarVariant; label: string }[] = [
  { id: "beam", label: "Beam" },
  { id: "ring", label: "Ring" },
  { id: "pixel", label: "Pixel Art" },
  { id: "sunset", label: "Sunset" },
  { id: "marble", label: "Marble" },
];

const TABS = [{ id: "all", label: "Todos" }, ...VARIANTS];

const SEEDS = ["Alpha", "Beta", "Gamma", "Nova", "Sol", "Luna"];

interface AvatarOption {
  id: string;
  dataUri: string;
  variant: AvatarVariant;
}

// 5 variants × 6 seeds × rotating palettes = 30 avatars
const allAvatars: AvatarOption[] = VARIANTS.flatMap(({ id: variant }, vi) =>
  SEEDS.map((seed, si) => ({
    id: `${variant}-${seed}`,
    dataUri: generateAvatar(variant, seed, (vi * 2 + si) % PALETTES.length),
    variant,
  })),
);

const activeVariant = ref<"all" | AvatarVariant>("all");
const selectedUri = ref(
  authStore.user?.user_metadata?.avatar_url || allAvatars[0].dataUri,
);
const isSaving = ref(false);

const filtered = computed(() =>
  activeVariant.value === "all"
    ? allAvatars
    : allAvatars.filter((a) => a.variant === activeVariant.value),
);

async function confirm() {
  isSaving.value = true;
  try {
    await authStore.updateUser({ avatar_url: selectedUri.value });
    emit("saved");
    emit("close");
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="picker-fade">
      <div v-if="isOpen" class="picker-overlay" @click.self="$emit('close')">
        <div class="picker-panel">
          <div class="picker-header">
            <h2 class="picker-title">Elige tu avatar</h2>
            <button class="picker-close-btn" @click="$emit('close')">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="variant-tabs">
            <button
              v-for="tab in TABS"
              :key="tab.id"
              class="variant-tab"
              :class="{ active: activeVariant === tab.id }"
              @click="activeVariant = tab.id as any"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="avatar-grid">
            <button
              v-for="avatar in filtered"
              :key="avatar.id"
              class="avatar-option"
              :class="{ selected: selectedUri === avatar.dataUri }"
              @click="selectedUri = avatar.dataUri"
            >
              <img
                :src="avatar.dataUri"
                :alt="avatar.id"
                class="avatar-opt-img"
              />
              <div v-if="selectedUri === avatar.dataUri" class="selected-check">
                <i class="fas fa-check"></i>
              </div>
            </button>
          </div>

          <div class="picker-footer">
            <button class="btn btn-glass" @click="$emit('close')">
              Cancelar
            </button>
            <button
              class="btn btn-primary"
              :disabled="isSaving"
              @click="confirm"
            >
              {{ isSaving ? "Guardando..." : "Guardar Avatar" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
