import { computed, Ref } from "vue";
import { Item, TemplateBlocks } from "@/types";
import { useDetailTemplatesStore, ALL_BLOCKS_ON } from "@/stores/detailTemplates";

export function useDetailTemplate(item: Ref<Item | null>) {
  const store = useDetailTemplatesStore();

  const bloques = computed((): TemplateBlocks => {
    if (!item.value) return { ...ALL_BLOCKS_ON };

    const tipo = item.value.tipo;
    const byType = store.templates.filter((t) => t.tipoAsociado === tipo);

    // Personalizada tiene prioridad sobre predeterminada
    const custom = byType.find((t) => !t.esPredeterminada);
    if (custom) return custom.bloques;

    const preset = byType.find((t) => t.esPredeterminada);
    if (preset) return preset.bloques;

    // Fallback global
    const fallback = store.templates.find((t) => t.tipoAsociado === null && t.esPredeterminada);
    return fallback?.bloques ?? { ...ALL_BLOCKS_ON };
  });

  return { bloques };
}
