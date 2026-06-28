import { ref } from "vue";
import { type Item } from "@/types";
import { useTMDBEnrichment } from "./useTMDBEnrichment";
import { useBooksEnrichment } from "./useBooksEnrichment";
import { useRAWGEnrichment } from "./useRAWGEnrichment";

export function useItemEnrichment() {
  const isEnriching = ref(false);
  const enrichmentResult = ref<{
    success: number;
    failed: number;
  } | null>(null);

  const tmdb = useTMDBEnrichment();
  const books = useBooksEnrichment();
  const rawg = useRAWGEnrichment();

  function canEnrich(tipo: string): boolean {
    return tmdb.isEnrichable(tipo) || books.isEnrichableBook(tipo) || rawg.isEnrichableGame(tipo);
  }

  async function enrichItem(item: Item): Promise<boolean> {
    isEnriching.value = true;
    enrichmentResult.value = null;

    let success = false;

    if (tmdb.isEnrichable(item.tipo)) {
      success = await tmdb.enrichItemWithTMDB(item);
    } else if (books.isEnrichableBook(item.tipo)) {
      success = await books.enrichItemWithBooks(item);
    } else if (rawg.isEnrichableGame(item.tipo)) {
      success = await rawg.enrichItemWithRAWG(item);
    }

    isEnriching.value = false;
    enrichmentResult.value = { success: success ? 1 : 0, failed: success ? 0 : 1 };
    return success;
  }

  async function enrichMultiple(items: Item[]): Promise<{ success: number; failed: number; skipped: number }> {
    isEnriching.value = true;
    enrichmentResult.value = null;

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (const item of items) {
      if (!canEnrich(item.tipo)) {
        skipped++;
        continue;
      }
      let ok = false;
      if (tmdb.isEnrichable(item.tipo)) {
        ok = await tmdb.enrichItemWithTMDB(item);
      } else if (books.isEnrichableBook(item.tipo)) {
        ok = await books.enrichItemWithBooks(item);
      } else if (rawg.isEnrichableGame(item.tipo)) {
        ok = await rawg.enrichItemWithRAWG(item);
      }
      if (ok) success++;
      else failed++;
      await new Promise((r) => setTimeout(r, 300));
    }

    isEnriching.value = false;
    enrichmentResult.value = { success, failed };
    return { success, failed, skipped };
  }

  return { isEnriching, enrichmentResult, canEnrich, enrichItem, enrichMultiple };
}
