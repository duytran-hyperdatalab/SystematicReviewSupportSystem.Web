import type { PaperPoolFilters } from "./types";

export const DEFAULT_PAGE_SIZE = 25;

export const DEFAULT_FILTERS: PaperPoolFilters = {
  keyword: "",
  yearFrom: null,
  yearTo: null,
  searchSourceId: "all",
  importBatchId: "all",
  doiState: "all",
  fullTextState: "all",
  onlyUnused: false,
  recentlyImported: false,
};
