import { ref } from "vue";
import { type Item } from "@/types";
import { useTMDBEnrichment } from "./useTMDBEnrichment";
import { useBooksEnrichment } from "./useBooksEnrichment";

export function useItemEnrichment() {
  const isEnriching = ref(false);
  const enrichmentResult = ref<{
    success: number;
    failed: number;
  } | null>(null);

  const tmdb = useTMDBEnrichment();
  const books = useBooksEnrichment();

  function canEnrich(tipo: string): boolean {
    return tmdb.isEnrichable(tipo) || books.isEnrichableBook(tipo);
  }

  async function enrichItem(item: Item): Promise<boolean> {
    isEnriching.value = true;
    enrichmentResult.value = null;

    let success = false;

    if (tmdb.isEnrichable(item.tipo)) {
      success = await tmdb.enrichItemWithTMDB(item);
    } else if (books.isEnrichableBook(item.tipo)) {
      success = await books.enrichItemWithBooks(item);
    }

    isEnriching.value = false;
    enrichmentResult.value = { success: success ? 1 : 0, failed: success ? 0 : 1 };
    return success;
  }

  return { isEnriching, enrichmentResult, canEnrich, enrichItem };
}
