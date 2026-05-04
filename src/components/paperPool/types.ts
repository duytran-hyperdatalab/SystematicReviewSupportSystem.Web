export interface PaperPoolItem {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  doi: string | null;
  source: string;
  searchSourceId: string;
  importBatchId: string;
  hasFullText: boolean;
  abstract: string;
  keywords: string[];
  pdfUrl: string | null;
  fullTextRetrievalStatus: number | null;
  fullTextRetrievalStatusText: string | null;
}

export interface PaperPoolFilters {
  keyword: string;
  yearFrom: number | null;
  yearTo: number | null;
  searchSourceId: string;
  importBatchId: string;
  doiState: "all" | "has" | "missing";
  fullTextState: "all" | "has" | "missing";
  onlyUnused: boolean;
  recentlyImported: boolean;
}

export interface PaperPoolFilterOption {
  id: string;
  name: string;
}

export interface PaperPoolFilterMetadata {
  searchSources: PaperPoolFilterOption[];
  importBatches: PaperPoolFilterOption[];
}

export interface PaperPoolFilterSetting {
  id: string;
  name: string;
  searchText?: string;
  filters: PaperPoolFilters;
  createdAt: string;
}

export interface ProcessSnapshot {
  processId: string;
  processName: string;
  statusText: "Pending" | "NotStarted" | "InProgress" | "Completed" | "Cancelled";
  progressPercent: number;
  existingPaperIds: string[];
  totalPapers?: number;
  totalIncludedPapers?: number;
  totalExcludedPapers?: number;
  notes?: string;
}

export interface SelectionInsertResult {
  inserted: number;
  skippedAsDuplicate: number;
}

export interface PaperPoolQueryParams {
  searchText?: string;
  keyword?: string;
  yearFrom?: number;
  yearTo?: number;
  searchSourceId?: string;
  importBatchId?: string;
  doiState?: PaperPoolFilters["doiState"];
  fullTextState?: PaperPoolFilters["fullTextState"];
  onlyUnused?: boolean;
  recentlyImported?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaperPoolApiResponse {
  id: string;
  title: string;
  authors?: string;
  abstract?: string;
  doi?: string;
  publicationYear?: string;
  publicationYearInt?: number;
  keywords?: string;
  source?: string;
  searchSourceId?: string;
  fullTextAvailable?: boolean;
  pdfUrl?: string;
  fullTextRetrievalStatus?: number;
  fullTextRetrievalStatusText?: string;
}

export interface FilterSettingRequest {
  name: string;
  searchText?: string;
  filters: {
    keyword?: string;
    yearFrom?: number;
    yearTo?: number;
    searchSourceId: string;
    importBatchId: string;
    doiState: PaperPoolFilters["doiState"];
    fullTextState: PaperPoolFilters["fullTextState"];
    onlyUnused: boolean;
    recentlyImported: boolean;
  };
}
