import { defineStore } from "pinia";
import { ref } from "vue";

export const useCollectionFiltersStore = defineStore("collectionFilters", () => {
  const filtersBySlug = ref<
    Record<
      string,
      {
        status: string;
        genre: string;
        sortBy: string;
        itemsPerPage: number;
        page: number;
      }
    >
  >({});

  function getFilters(slug: string) {
    return (
      filtersBySlug.value[slug] ?? {
        status: "todos",
        genre: "todos",
        sortBy: "recent",
        itemsPerPage: 25,
        page: 1,
      }
    );
  }

  function setFilters(
    slug: string,
    filters: Partial<{ status: string; genre: string; sortBy: string; itemsPerPage: number; page: number }>,
  ) {
    filtersBySlug.value[slug] = { ...getFilters(slug), ...filters };
  }

  return { getFilters, setFilters };
});
