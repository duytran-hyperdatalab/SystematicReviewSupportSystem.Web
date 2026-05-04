// Full-Text Screening UI Types + API Adapter Utilities
// Re-uses API types from studySelection (same backend endpoints / shape),
// adding full-text-specific concepts (PDF, sections, section highlights).

import type {
  PaperWithDecisionsResponse,
  ScreeningDecisionResponse,
  ScreeningDecisionType,
  PaperSelectionStatus,
  SelectionStatisticsResponse,
  PaperSortBy,
  ExtractionStatusResponse,
  MetadataSourcesResponse,
  ExtractionResultResponse,
  ExtractionSuggestionResponse,
  AssignedPaperResponse,
  AiAnalysisData,
} from "../../../../types/studySelection";
import type { UploadPdfOptions } from "../uploadTypes";

// ============================================
// UI Types
// ============================================

export type ScreeningDecision = "included" | "excluded";

export type ScreeningStatus = "pending" | "included" | "excluded" | "conflicted";

export interface ReviewerDecision {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: ScreeningDecision;
  reason: string | null;
  exclusionReasonCode: number | null;
  exclusionReasonName: string | null;
  decidedAt: string;
}

export interface FullTextPaper {
  id: string;
  title: string;
  authors: string | null;
  doi: string | null;
  publicationYear: number | null;
  abstract: string | null;
  journal: string | null;
  source: string | null;
  keywords: string | null;
  publicationType: string | null;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  publisher: string | null;
  language: string | null;
  url: string | null;
  pdfUrl: string | null;
  pdfFileName: string | null;
  conferenceName: string | null;
  conferenceLocation: string | null;
  journalIssn: string | null;

  // Screening state
  screeningStatus: ScreeningStatus;
  finalDecision: ScreeningDecision | null;
  finalDecisionText: string | null;
  decisions: ReviewerDecision[];
  extraction: ExtractionStatusResponse | null;
  metadataSources: MetadataSourcesResponse | null;
  extractionResult: ExtractionResultResponse | null;
  extractionSuggestion: ExtractionSuggestionResponse | null;
  resolution: {
    id: string;
    finalDecision: ScreeningDecision;
    resolutionNotes: string | null;
    resolvedBy: string;
    resolverName: string;
    resolvedAt: string;
    phase: number;
  } | null;
}

// ============================================
// PDF Section (for navigation sidebar in reader)
// ============================================

export interface PaperSection {
  id: string;
  label: string;
  page: number;
}

export interface AiHighlight {
  section: string;
  text: string;
  page: number;
}

export type MatchStatus = "match" | "partial_match" | "not_match" | "unknown";

export type { 
  AiAnalysisData,
  AiOutputData,
  AiResearchQuestionResult,
  AiCriteriaGroupResult,
  AiInclusionResult,
  AiExclusionResult,
  AiPicocMatching
} from "../../../../types/studySelection";

export type AiAnalysisResult = AiAnalysisData;

// ============================================
// Filter & Sort Types
// ============================================

export type StatusFilter = "all" | "pending" | "included" | "excluded" | "conflicted";

export interface PaperFilters {
  search: string;
  status: StatusFilter;
  sortBy: PaperSortBy;
  pageNumber: number;
  pageSize: number;
  hasFullText: boolean;
  hasConflict: boolean;
  decidedByMe: boolean;
}

// ============================================
// Pagination
// ============================================

export interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================
// Workspace Stats
// ============================================

export interface ScreeningStats {
  total: number;
  pending: number;
  included: number;
  excluded: number;
  conflicted: number;
  completionPercentage: number;
}

// ============================================
// Hook Return Type
// ============================================

export interface UseFullTextScreeningReturn {
  // Data
  papers: FullTextPaper[];
  selectedPaper: FullTextPaper | null;
  stats: ScreeningStats;
  titleAbstractStats: ScreeningStats;
  filters: PaperFilters;
  pagination: PaginationInfo;
  isLoading: boolean;
  error: string | null;

  // Paper selection
  selectPaper: (paperId: string) => void;
  selectNextPaper: () => void;
  selectPreviousPaper: () => void;

  // Screening actions
  includePaper: (paperId: string) => void;
  excludePaper: (paperId: string, exclusionReasonId: string | null, reason: string | null) => void;
  isSubmitting: boolean;

  // AI Analysis
  aiAnalysis: AiAnalysisResult | null;
  isAnalyzing: boolean;
  runAiAnalysis: (paperId: string) => void;

  // Conflict resolution (leader only)
  resolveConflict: (paperId: string, decision: ScreeningDecision, notes?: string) => void;
  isResolving: boolean;

  // Filter actions
  setSearch: (search: string) => void;
  setStatusFilter: (status: StatusFilter) => void;
  setSort: (sortBy: PaperSortBy) => void;
  setHasFullTextFilter: (enabled: boolean) => void;
  setHasConflictFilter: (enabled: boolean) => void;
  setDecidedByMeFilter: (enabled: boolean) => void;
  goToPage: (page: number) => void;

  // Full-text upload
  uploadFullText: (
    paperId: string,
    file: File,
    options?: UploadPdfOptions,
  ) => Promise<PaperWithDecisionsResponse>;
  applyMetadataSuggestion: (
    paperId: string,
    sourceMetadataId: string,
    fields: string[],
  ) => Promise<void>;
  retryMetadataExtraction: (paperId: string) => Promise<void>;
  isUploadingFullText: boolean;
  isApplyingMetadataSuggestion: boolean;
  isRetryingMetadataExtraction: boolean;

  // Navigation
  handleBack: () => void;
}

// ============================================
// Adapters: API → UI
// ============================================

function mapDecisionType(decision: ScreeningDecisionType): ScreeningDecision {
  return decision === 0 ? "included" : "excluded";
}

function mapPaperStatus(
  status: PaperSelectionStatus,
  finalDecision: ScreeningDecisionType | null,
): ScreeningStatus {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "included";
    case 2:
      return "excluded";
    case 3:
      return "conflicted";
    case 4:
      if (finalDecision !== null) {
        return finalDecision === 0 ? "included" : "excluded";
      }
      return "pending";
    default:
      return "pending";
  }
}

function mapDecisionResponse(d: ScreeningDecisionResponse): ReviewerDecision {
  return {
    id: d.id,
    reviewerId: d.reviewerId,
    reviewerName: d.reviewerName,
    decision: mapDecisionType(d.decision),
    reason: d.reason,
    exclusionReasonCode: d.exclusionReasonCode,
    exclusionReasonName: d.exclusionReasonName,
    decidedAt: d.decidedAt,
  };
}

export function adaptPaperWithDecisions(paper: PaperWithDecisionsResponse): FullTextPaper {
  return {
    id: paper.paperId,
    title: paper.title,
    authors: paper.authors,
    doi: paper.doi,
    publicationYear: paper.publicationYear,
    abstract: paper.abstract,
    journal: paper.journal,
    source: paper.source,
    keywords: paper.keywords,
    publicationType: paper.publicationType,
    volume: paper.volume,
    issue: paper.issue,
    pages: paper.pages,
    publisher: paper.publisher,
    language: paper.language,
    url: paper.url,
    pdfUrl: paper.pdfUrl,
    pdfFileName: paper.pdfFileName,
    conferenceName: paper.conferenceName,
    conferenceLocation: paper.conferenceLocation,
    journalIssn: paper.journalIssn,
    screeningStatus: mapPaperStatus(paper.status, paper.finalDecision),
    finalDecision: paper.finalDecision !== null ? mapDecisionType(paper.finalDecision) : null,
    finalDecisionText: paper.finalDecisionText,
    decisions: paper.decisions.map(mapDecisionResponse),
    extraction: paper.extraction,
    metadataSources: paper.metadataSources,
    extractionResult: paper.extractionResult,
    extractionSuggestion: paper.extractionSuggestion ?? null,
    resolution: paper.resolution
      ? {
          id: paper.resolution.id,
          finalDecision: mapDecisionType(paper.resolution.finalDecision),
          resolutionNotes: paper.resolution.resolutionNotes,
          resolvedBy: paper.resolution.resolvedBy,
          resolverName: paper.resolution.resolverName,
          resolvedAt: paper.resolution.resolvedAt,
          phase: paper.resolution.phase,
        }
      : null,
  };
}

export function adaptAssignedPaper(paper: AssignedPaperResponse): FullTextPaper {
  return {
    id: paper.paperId,
    title: paper.title,
    authors: paper.authors ?? null,
    doi: paper.doi ?? null,
    publicationYear: paper.publicationYear ? Number(paper.publicationYear) : null,
    pdfUrl: paper.pdfUrl ?? null,

    // FALLBACKS
    abstract: null,
    journal: null,
    source: null,
    keywords: null,
    publicationType: null,
    volume: null,
    issue: null,
    pages: null,
    publisher: null,
    language: null,
    url: null,
    pdfFileName: null,
    conferenceName: null,
    conferenceLocation: null,
    journalIssn: null,

    screeningStatus: mapPaperStatus(paper.status, null),
    finalDecision: null,
    finalDecisionText: null,
    decisions: paper.decisions.map(mapDecisionResponse),
    extraction: null,
    metadataSources: null,
    extractionResult: null,
    extractionSuggestion: null,
    resolution: paper.resolution
      ? {
          id: paper.resolution.id,
          finalDecision: mapDecisionType(paper.resolution.finalDecision),
          resolutionNotes: paper.resolution.resolutionNotes,
          resolvedBy: paper.resolution.resolvedBy,
          resolverName: paper.resolution.resolverName,
          resolvedAt: paper.resolution.resolvedAt,
          phase: paper.resolution.phase,
        }
      : null,
  };
}

export function adaptStatistics(stats: SelectionStatisticsResponse): ScreeningStats {
  return {
    total: stats.totalPapers,
    included: stats.includedCount,
    excluded: stats.excludedCount,
    pending: stats.pendingCount,
    conflicted: stats.conflictCount,
    completionPercentage: stats.completionPercentage,
  };
}

// Remove adaptAiAnalysis as we now use the raw AiAnalysisData for richer UI
