// Constants for the Identification Phase Workspace

export const DEFAULT_PRISMA_STATS = {
  totalRecordsImported: 0,
  duplicateRecords: 0,
  uniqueRecords: 0,
  importBatchCount: 0,
  pendingSelectionCount: 0,
};

export const LIBRARY_PAGE_SIZE = 20;

/** Page size for Ready Papers and Snapshot tables in Build Dataset tab */
export const DATASET_PAGE_SIZE = 10;

/** Page size for fetching duplicate pairs (max API allows is 100) */
export const DUPLICATE_PAIRS_PAGE_SIZE = 100;

// --- Deduplication Constants ---

/** Similarity score thresholds for confidence levels (percentage scale 0–100) */
export const SIMILARITY_THRESHOLDS = {
  HIGH: 95,
  MEDIUM: 85,
  LOW_WARNING: 80,
} as const;

/** Labels for confidence levels in the UI */
export const CONFIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "Very Likely Duplicate", color: "text-red-600" },
  medium: { label: "Probable Duplicate", color: "text-orange-600" },
  low: { label: "Possible Duplicate", color: "text-yellow-600" },
};

/** Max undo stack depth */
export const MAX_UNDO_STACK = 20;

/** Deduplication method display labels */
export const METHOD_LABELS: Record<string, string> = {
  DOI_MATCH: "DOI Match",
  TITLE_FUZZY: "Fuzzy Title Match",
  TITLE_AUTHOR: "Title + Author Match",
  HYBRID: "Hybrid Detection",
  MANUAL: "Manual Review",
};

/** Deduplication method icons */
export const METHOD_ICONS: Record<string, string> = {
  DOI_MATCH: "🔗",
  TITLE_FUZZY: "📝",
  TITLE_AUTHOR: "👤",
  HYBRID: "🔀",
  MANUAL: "✋",
};
