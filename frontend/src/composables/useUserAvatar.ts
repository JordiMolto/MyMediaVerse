import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { generateDefaultAvatar } from "@/utils/boringAvatars";

export function useUserAvatar() {
  const authStore = useAuthStore();

  const avatarUrl = computed(() => {
    const stored = authStore.user?.user_metadata?.avatar_url;
    if (stored) return stored;
    const seed = authStore.user?.email || "default";
    return generateDefaultAvatar(seed);
  });

  return { avatarUrl };
}
