import type { ApiResponse } from "./project";

/**
 * Deduplication detection method enum.
 * Integer values match the backend DeduplicationMethod enum.
 */
export const DeduplicationMethod = {
  DOI_MATCH: 0,
  TITLE_FUZZY: 1,
  TITLE_AUTHOR: 2,
  HYBRID: 3,
  MANUAL: 4,
  SEMANTIC: 5,
} as const;
export type DeduplicationMethod = (typeof DeduplicationMethod)[keyof typeof DeduplicationMethod];

/**
 * Deduplication review status enum.
 * Integer values match the backend ReviewStatus enum.
 */
export const DeduplicationReviewStatus = {
  Pending: 0,
  Confirmed: 1,
  Rejected: 2,
} as const;
export type DeduplicationReviewStatus =
  (typeof DeduplicationReviewStatus)[keyof typeof DeduplicationReviewStatus];

/**
 * Decision enum for resolving a duplicate pair.
 * 0 = KEEP_BOTH (not duplicates, both remain), 1 = CANCEL (confirmed duplicate, paper removed).
 */
export const DuplicateResolutionDecision = {
  KEEP_BOTH: 0,
  CANCEL: 1,
} as const;
export type DuplicateResolutionDecision =
  (typeof DuplicateResolutionDecision)[keyof typeof DuplicateResolutionDecision];

/**
 * Lightweight paper DTO returned inside a duplicate pair.
 */
export interface DuplicatePairPaperDto {
  id: string;
  title: string;
  authors?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationType?: string | null;
  publicationYear?: string | null;
  publicationYearInt?: number | null;
  source?: string | null;
  journal?: string | null;
  keywords?: string | null;
  url?: string | null;
  importedAt?: string | null;
}

/**
 * A duplicate pair response — contains both the original and duplicate paper
 * with deduplication metadata for side-by-side review.
 */
export interface DuplicatePairResponse {
  id: string;
  originalPaper: DuplicatePairPaperDto;
  duplicatePaper: DuplicatePairPaperDto;
  method: DeduplicationMethod;
  methodText: string;
  confidenceScore?: number;
  deduplicationNotes?: string;
  resolvedDecision?: DuplicateResolutionDecision;
  reviewStatus: DeduplicationReviewStatus;
  reviewStatusText: string;
  reviewedBy?: string;
  reviewedAt?: string;
  detectedAt: string;
}

/**
 * Paginated wrapper for duplicate pairs.
 */
export interface PaginatedDuplicatePairResponse {
  items: DuplicatePairResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/**
 * Sort options for the duplicate-pairs endpoint.
 */
export type DuplicatePairSortBy = "confidenceDesc" | "confidenceAsc" | "detectedAtDesc";

/**
 * Query parameters for GET /api/projects/{projectId}/duplicate-pairs
 */
export interface GetDuplicatePairsParams {
  projectId: string;
  search?: string;
  status?: DeduplicationReviewStatus;
  minConfidence?: number;
  method?: DeduplicationMethod;
  sortBy?: DuplicatePairSortBy;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Request body for PATCH /api/projects/{projectId}/duplicate-pairs/{pairId}/resolve
 */
export interface ResolveDuplicatePairRequest {
  decision: DuplicateResolutionDecision;
  notes?: string | null;
}

/**
 * Slim response returned by the resolve endpoint.
 */
export interface ResolveDuplicatePairResponse {
  id: string;
  reviewStatus: DeduplicationReviewStatus;
  reviewStatusText: string;
  resolvedDecision?: DuplicateResolutionDecision;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Request body for POST /api/projects/{projectId}/papers/{paperId}/mark-as-duplicate
 */
export interface MarkAsDuplicateRequest {
  duplicateOfPaperId: string;
  reason?: string;
}

/**
 * API Response wrappers for duplicate pairs endpoints.
 */
export type GetDuplicatePairsResponse = ApiResponse<PaginatedDuplicatePairResponse>;
export type ResolveDuplicatePairApiResponse = ApiResponse<ResolveDuplicatePairResponse>;

// ============================================
// UI-specific Deduplication Types
// ============================================

export interface DuplicatePaperInfo {
  id: string;
  title: string;
  authors: string;
  year: string;
  doi?: string;
  source: string;
  abstract: string;
}

export interface DuplicatePair {
  id: string;
  originalPaper: DuplicatePaperInfo;
  duplicatePaper: DuplicatePaperInfo;
  similarityScore: number;
  status: "pending" | "resolved";
  /** Detection method enum value */
  method?: number;
  /** Detection method display text (e.g. "DOI_MATCH") */
  methodText?: string;
  /** Decision made when resolved: "cancel" or "keep-both" */
  resolvedDecision?: string | null;
  /** Notes explaining why it was flagged */
  deduplicationNotes?: string | null;
  /** ISO 8601 timestamp when the duplicate was detected */
  detectedAt?: string;
}

export type DuplicateResolution = "keep-both" | "cancel";

/** Filter options for the duplicate pairs queue */
export type DuplicateFilterType = "all" | "unresolved" | "resolved" | "high-confidence";

/** Sort options for the duplicate pairs queue */
export type DuplicateSortType = "similarity-desc" | "similarity-asc" | "newest";

/** Confidence level derived from similarity score */
export type ConfidenceLevel = "high" | "medium" | "low";

/** A resolved action that can be undone */
export interface UndoableResolution {
  pairId: string;
  decision: DuplicateResolution;
  timestamp: number;
}

/** Diff segment for highlighting text differences */
export interface DiffSegment {
  text: string;
  type: "same" | "added" | "removed";
}
