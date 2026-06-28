import { defineStore } from "pinia";
import { ref } from "vue";
import { DetailTemplate, TemplateBlocks } from "@/types";
import * as storage from "@/services/storage/detail-templates.storage";

export const ALL_BLOCKS_ON: TemplateBlocks = {
  hero: true,
  heroTagline: true,
  heroMeta: true,
  heroGeneros: true,
  poster: true,
  acciones: true,
  progreso: true,
  plataformasStreaming: true,
  trailer: true,
  detalles: true,
  estado: true,
  sinopsis: true,
  reparto: true,
  diario: true,
};

const DEFAULT_TEMPLATES: Omit<DetailTemplate, "id" | "userId" | "createdAt" | "updatedAt">[] = [
  {
    nombre: "Películas",
    tipoAsociado: "Películas",
    esPredeterminada: true,
    bloques: { ...ALL_BLOCKS_ON, progreso: false },
  },
  {
    nombre: "Series",
    tipoAsociado: "Series",
    esPredeterminada: true,
    bloques: { ...ALL_BLOCKS_ON },
  },
  {
    nombre: "Animes",
    tipoAsociado: "Animes",
    esPredeterminada: true,
    bloques: { ...ALL_BLOCKS_ON },
  },
  {
    nombre: "Libros",
    tipoAsociado: "Libros",
    esPredeterminada: true,
    bloques: {
      ...ALL_BLOCKS_ON,
      plataformasStreaming: false,
      trailer: false,
      reparto: false,
    },
  },
  {
    nombre: "Videojuegos",
    tipoAsociado: "Videojuegos",
    esPredeterminada: true,
    bloques: {
      ...ALL_BLOCKS_ON,
      plataformasStreaming: false,
      reparto: false,
    },
  },
  {
    nombre: "Juegos de Mesa",
    tipoAsociado: "Juegos de Mesa",
    esPredeterminada: true,
    bloques: {
      ...ALL_BLOCKS_ON,
      heroTagline: false,
      heroMeta: false,
      plataformasStreaming: false,
      trailer: false,
      progreso: false,
      reparto: false,
    },
  },
  {
    nombre: "Por defecto",
    tipoAsociado: null,
    esPredeterminada: true,
    bloques: { ...ALL_BLOCKS_ON },
  },
];

export const useDetailTemplatesStore = defineStore("detailTemplates", () => {
  const templates = ref<DetailTemplate[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTemplates() {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      let data = await storage.fetchTemplates();

      if (data.length === 0) {
        for (const tpl of DEFAULT_TEMPLATES) {
          const created = await storage.createTemplate(tpl);
          data.push(created);
        }
      }

      templates.value = data;
    } catch (err: any) {
      error.value = err.message || "Error al cargar plantillas";
    } finally {
      loading.value = false;
    }
  }

  async function createTemplate(
    tpl: Omit<DetailTemplate, "id" | "userId" | "createdAt" | "updatedAt">,
  ) {
    const created = await storage.createTemplate(tpl);
    templates.value.push(created);
    return created;
  }

  async function updateTemplate(
    id: string,
    updates: Partial<Pick<DetailTemplate, "nombre" | "tipoAsociado" | "bloques">>,
  ) {
    const updated = await storage.updateTemplate(id, updates);
    const idx = templates.value.findIndex((t) => t.id === id);
    if (idx !== -1) templates.value[idx] = updated;
    return updated;
  }

  async function deleteTemplate(id: string) {
    await storage.deleteTemplate(id);
    templates.value = templates.value.filter((t) => t.id !== id);
  }

  return { templates, loading, error, fetchTemplates, createTemplate, updateTemplate, deleteTemplate };
});
