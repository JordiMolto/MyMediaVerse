import { ref } from "vue";
import { useItemsStore } from "@/stores/items";
import { ItemType, type Item } from "@/types";
import { searchRawgGames, getRawgGameDetail } from "@/services/external/rawg.service";

export function useRAWGEnrichment() {
  const itemsStore = useItemsStore();
  const enrichmentErrors = ref<string[]>([]);

  function isEnrichableGame(tipo: string): boolean {
    const t = (tipo || "").toLowerCase();
    return t === ItemType.VIDEOGAME || t.includes("videogame") || t.includes("videojuego") || t.includes("juego");
  }

  async function enrichItemWithRAWG(item: Item): Promise<boolean> {
    if (!isEnrichableGame(item.tipo)) return false;

    try {
      const searchResult = await searchRawgGames(item.titulo);
      if (!searchResult) {
        enrichmentErrors.value.push(`No se encontró "${item.titulo}" en RAWG`);
        return false;
      }

      // Fetch detail to get description_raw
      const detail = await getRawgGameDetail(searchResult.id);
      const game = detail ?? searchResult;

      const updates: Partial<Item> = {
        titulo: game.name || item.titulo,
        imagen: game.background_image || item.imagen,
      };

      if (game.description_raw) updates.descripcion = game.description_raw;
      if (game.released) updates.fechaInicio = new Date(game.released);
      if (game.genres?.length) updates.genero = game.genres.map((g) => g.name);
      if (game.developers?.length) updates.developer = game.developers.map((d) => d.name).join(", ");
      if (game.platforms?.length) {
        updates.plataforma = game.platforms.map((p) => p.platform.name).join(", ");
      }

      await itemsStore.updateItem(item.id, updates);
      return true;
    } catch (error) {
      console.error(`Error enriching game ${item.titulo}:`, error);
      enrichmentErrors.value.push(`Error al enriquecer "${item.titulo}"`);
      return false;
    }
  }

  return { enrichmentErrors, isEnrichableGame, enrichItemWithRAWG };
}
