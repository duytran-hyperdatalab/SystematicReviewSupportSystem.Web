// Paper Import API Types
// Source: PaperAPI.md

import type { ApiResponse } from "./project";

/**
 * RIS File Import Request
 * POST /api/papers/import/ris
 */
export interface RisFileImportRequest {
  file: File; // .ris file, max 10MB
  projectId: string; // UUID format (required)
  searchSourceId?: string; // UUID format (optional)
}

/**
 * RIS Import Result DTO
 * Backend: Response from RIS file import
 */
export interface RisImportResultDto {
  importBatchId: string | null; // UUID of created ImportBatch
  totalRecords: number; // Total records found in file
  importedRecords: number; // Successfully imported (new)
  duplicateRecords: number; // Skipped because already exist
  skippedRecords: number; // Skipped due to validation errors
  updatedRecords: number; // Updated existing records
  errors: string[]; // Array of error messages
  importedPaperIds: string[]; // UUIDs of newly created papers
}

/**
 * API Response for RIS Import
 */
export type RisImportResponse = ApiResponse<RisImportResultDto>;

/**
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Import state enum for UI
 */
export const ImportState = {
  IDLE: "idle",
  VALIDATING: "validating", // Client-side validation
  UPLOADING: "uploading", // File upload in progress
  PROCESSING: "processing", // Server processing
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type ImportStateType = (typeof ImportState)[keyof typeof ImportState];

/**
 * Paper Response DTO
 * Backend: Full paper details from database
 * Source: ImportBatchAPI.md - GET /api/import-batches/{id}/papers
 */
export interface PaperResponse {
  id: string; // UUID

  // Core Metadata
  title: string;
  authors?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationType?: string | null;
  publicationYear?: string | null;
  publicationYearInt?: number | null;
  publicationDate?: string | null; // ISO 8601 DateTimeOffset
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  publisher?: string | null;
  language?: string | null;
  keywords?: string | null;
  url?: string | null;

  // Conference Metadata
  conferenceName?: string | null;
  conferenceLocation?: string | null;
  conferenceCountry?: string | null;
  conferenceYear?: number | null;

  // Journal Metadata
  journal?: string | null;
  journalIssn?: string | null;

  // Source Tracking
  source?: string | null;
  importedAt?: string | null; // ISO 8601 DateTimeOffset
  importedBy?: string | null;

  // Selection Status (derived dynamically)
  selectionStatus?: number | null; // e.g., 0, 1, 2, 3
  selectionStatusText?: string | null;

  // Review Stage
  stage?: number | null;
  stageText?: string | null;

  // Assignment
  assignmentStatus?: number | null;
  assignmentStatusText?: string | null;
  assignedReviewers?: { id: string; name: string }[] | null;

  // Access
  pdfUrl?: string | null;
  fullTextAvailable?: boolean | null;
  fullTextRetrievalStatus?: number | null;
  fullTextRetrievalStatusText?: string | null;
  accessType?: number | null; // e.g., 0, 1, 2
  accessTypeText?: string | null;

  // Audit
  createdAt: string; // ISO 8601 DateTimeOffset
  modifiedAt: string; // ISO 8601 DateTimeOffset
  decidedStatus?: string | null;
}

/**
 * API Response for Get Papers by Import Batch
 */
export type GetPapersByImportBatchResponse = ApiResponse<PaperResponse[]>;

// ============================================
// Unique Papers API Types
// GET /api/identification-processes/{id}/unique-papers
// ============================================

/**
 * Paginated response wrapper (with navigation flags)
 * Backend returns this for paginated endpoints
 */
export interface PaginatedPaperResponse {
  items: PaperResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  currentPhase: number;
  currentPhaseText: string;
}

/**
 * Query parameters for project papers endpoint (Leader Assign Papers)
 * GET /api/projects/{projectId}/papers
 */
export interface GetProjectPapersParams {
  projectId: string; // UUID (path param)
  search?: string;
  status?: number; // 0, 1, 2, 3
  stage?: number; // 0: TitleAbstract, 1: FullText
  year?: number;
  assignmentStatus?: string; // "assigned" | "unassigned"
  pageNumber?: number; // Default: 1
  pageSize?: number;
}

/**
 * Query parameters for unique papers endpoint
 */
export interface GetUniquePapersParams {
  identificationProcessId: string; // UUID (path param)
  search?: string; // Search in Title, DOI, or Authors
  year?: number; // Filter by exact publication year
  pageNumber?: number; // Default: 1
  pageSize?: number; // Default: 20, max: 100
}

/**
 * Query parameters for ready papers endpoint (snapshot-eligible papers)
 * GET /api/identification-processes/{id}/ready-papers
 */
export interface GetReadyPapersParams {
  identificationProcessId: string;
  search?: string;
  year?: number;
  searchSourceId?: string;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Query parameters for snapshot papers endpoint
 * GET /api/identification-processes/{id}/snapshot
 */
export interface GetSnapshotPapersParams {
  identificationProcessId: string;
  search?: string;
  year?: number;
  searchSourceId?: string;
  pageNumber?: number;
  pageSize?: number;
}

/**
 * Request body for adding papers to snapshot
 * POST /api/identification-processes/{id}/snapshot
 */
export interface AddPapersToSnapshotRequest {
  paperIds: string[];
}

/**
 * Query parameters for data extraction unique papers endpoint
 * GET /api/data-extraction-processes/{dataExtractionProcessId}/unique-papers
 */
export interface GetDataExtractionUniquePapersParams {
  dataExtractionProcessId: string; // UUID (path param)
  search?: string; // Search in Title, DOI, or Authors
  year?: number; // Filter by exact publication year
  pageNumber?: number; // Default: 1
  pageSize?: number; // Default: 20, max: 100
}

/**
 * API Response for Get Project Papers
 */
export type GetProjectPapersResponse = ApiResponse<PaginatedPaperResponse>;

/**
 * Query parameters for the checked-duplicates endpoint (Leader Assign Papers)
 * GET /api/papers/checked-duplicates/{studySelectionProcessId}
 */
export interface GetCheckedDuplicatesParams {
  studySelectionProcessId: string; // UUID (path param)
  search?: string;
  assignmentStatus?: string; // e.g. "assigned" | "unassigned"
  pageNumber?: number;
  pageSize?: number;
}

/**
 * API Response for Get Checked Duplicates
 */
export type GetCheckedDuplicatesResponse = ApiResponse<PaginatedPaperResponse>;

/**
 * Process phase enum
 * TitleAbstract = 1, FullText = 2
 */
export const ProcessPhase = {
  TitleAbstract: 1,
  FullText: 2,
} as const;
export type ProcessPhase = (typeof ProcessPhase)[keyof typeof ProcessPhase];

/**
 * Request for assigning papers to reviewers
 * POST /api/papers/assign
 */
export interface AssignPapersRequest {
  paperIds: string[];
  memberIds: string[];
  studySelectionProcessId: string;
  phase: number;
}

/**
 * API Response for Assign Papers
 */
export type AssignPapersResponse = ApiResponse<null>;

/**
 * API Response for Get Unique Papers
 */
export type GetUniquePapersResponse = ApiResponse<PaginatedPaperResponse>;

/**
 * API Response for Get Data Extraction Unique Papers
 */
export type GetDataExtractionUniquePapersResponse = ApiResponse<PaginatedPaperResponse>;

// Deduplication types moved to src/types/deduplication.ts

// ============================================
// Candidate Paper API Types
// Source: CandidatePaperApi.md
// ============================================

export const CandidateStatus = {
  Detected: 0,
  Matched: 1,
  Rejected: 2,
  Suggested: 3,
} as const;

export type CandidateStatus = (typeof CandidateStatus)[keyof typeof CandidateStatus];

export interface CandidatePaperDto {
  candidateId: string;
  originPaperId: string;
  originPaperTitle: string;
  title: string;
  authors?: string;
  publicationYear?: string;
  doi?: string;
  rawReference?: string;
  status: CandidateStatus;
  statusText: string;
  confidenceScore: number;
  extractionQualityScore: number;
  matchConfidenceScore: number;
  isSelectedInProjectRepository: boolean;
  validationNote?: string;
}

export interface PaperWithCandidateDto {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  publicationYear: string;
  doi: string;
  sourceType: string;
  source: string;
  pdfUrl?: string;
  importedAt: string;
  candidateCount: number;
  suggestedCount: number;
  duplicateCount: number;
}

export interface SelectCandidatePaperRequest {
  projectId: string;
  candidateIds: string[];
}

export interface RejectCandidatePaperRequest {
  candidateIds: string[];
}

/**
 * Extraction Suggestion for metadata enrichment
 */
export interface ExtractionSuggestionResponse {
  sourceMetadataId: string;
  updatedFields?: string[];
  suggestedFields?: string[];
  title?: string | null;
  authors?: string | null;
  abstract?: string | null;
  doi?: string | null;
  journal?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  keywords?: string | null;
  publisher?: string | null;
  year?: number | null;
  publishedDate?: string | null;
  issn?: string | null;
  eissn?: string | null;
  language?: string | null;
  md5?: string | null;
}

/**
 * Full details for a paper (metadata + suggestions)
 */
export interface PaperDetailsResponse {
  id: string;
  title: string;
  authors?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationType?: string | null;
  publicationYear?: string | null;
  publicationYearInt?: number | null;
  publicationDate?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  publisher?: string | null;
  language?: string | null;
  keywords?: string | null;
  url?: string | null;
  conferenceName?: string | null;
  conferenceLocation?: string | null;
  conferenceCountry?: string | null;
  conferenceYear?: number | null;
  journal?: string | null;
  journalIssn?: string | null;
  journalEIssn?: string | null;
  md5?: string | null;
  source?: string | null;
  searchSourceId?: string | null;
  importedAt?: string | null;
  importedBy?: string | null;
  extractionSuggestion?: ExtractionSuggestionResponse | null;
  pdfUrl?: string | null;
  fullTextRetrievalStatus?: number | null;
  fullTextRetrievalStatusText?: string | null;
  fullTextAvailable?: boolean | null;
  createdAt: string;
  modifiedAt: string;
}

export type GetPaperDetailsApiResponse = ApiResponse<PaperDetailsResponse>;
