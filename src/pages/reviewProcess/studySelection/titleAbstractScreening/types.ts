// Study Selection UI Types + API Adapter Utilities
// UI types stay string-based for readability; adapters map from API enums.

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
  PaperNodeDto,
  CitationGraphDto,
  AssignedReviewer,
} from "../../../../types/studySelection";
import type { UploadPdfOptions } from "../uploadTypes";

// ============================================
// UI Types (string-based for rendering)
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

export interface ScreeningPaper {
  id: string;
  title: string;
  authors: string | null;
  doi: string | null;
  publicationYear: number | null;
  publicationDate: string | null;
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
  journalEIssn: string | null;
  md5: string | null;
  referenceCount: number;
  citationCount: number;

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
  assignedReviewers?: AssignedReviewer[];
  hasConflict?: boolean;
}

// ============================================
// AI Analysis Types
// ============================================

export type MatchStatus = "match" | "partial_match" | "not_match" | "unknown";

export interface ProtocolMatch {
  label: string;
  status: MatchStatus;
}

export interface PicocMatch {
  population: MatchStatus;
  intervention: MatchStatus;
  comparison: MatchStatus;
  outcome: MatchStatus;
  context: MatchStatus;
}

export interface CriteriaMatch {
  inclusionMatches: string[];
  exclusionMatches: string[];
  violatingSentences: string[];
}

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
// Filter & Sort Types (server-side)
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
  hasReferences: boolean;
  hasCitations: boolean;
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

export interface UseStudySelectionReturn {
  // Data
  papers: ScreeningPaper[];
  selectedPaper: ScreeningPaper | null;
  stats: ScreeningStats;
  fullTextStats: ScreeningStats;
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
  uploadPaperPdf: (
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
  isSubmitting: boolean;
  isUploadingPdf: boolean;
  isApplyingMetadataSuggestion: boolean;
  isRetryingExtraction: boolean;

  // AI Analysis
  aiAnalysis: AiAnalysisResult | null;
  isAnalyzing: boolean;
  runAiAnalysis: (paperId: string) => void;

  // Paper Discovery
  references: PaperNodeDto[];
  citations: PaperNodeDto[];
  suggestions: PaperNodeDto[];
  citationGraph: CitationGraphDto | null;
  isDiscoveryLoading: boolean;
  graphDepth: number;
  setGraphDepth: (depth: number) => void;
  minConfidence: number;
  setMinConfidence: (confidence: number) => void;

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
  setHasReferencesFilter: (enabled: boolean) => void;
  setHasCitationsFilter: (enabled: boolean) => void;
  goToPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

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
    case 4: // Resolved — map based on final decision
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

export function adaptPaperWithDecisions(paper: PaperWithDecisionsResponse): ScreeningPaper {
  return {
    id: paper.paperId,
    assignedReviewers: paper.assignedReviewers,
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
    journalEIssn: paper.journalEIssn,
    md5: paper.md5,
    publicationDate: paper.publicationDate,

    screeningStatus: mapPaperStatus(paper.status, paper.finalDecision),
    finalDecision: paper.finalDecision !== null ? mapDecisionType(paper.finalDecision) : null,
    finalDecisionText: paper.finalDecisionText,
    decisions: paper.decisions.map(mapDecisionResponse),
    extraction: paper.extraction,
    metadataSources: paper.metadataSources,
    extractionResult: paper.extractionResult,
    citationCount: paper.citationCount,
    referenceCount: paper.referenceCount,
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

export function adaptAssignedPaper(paper: AssignedPaperResponse): ScreeningPaper {
  return {
    id: paper.paperId,
    assignedReviewers: paper.assignedReviewers,
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
    journalEIssn: paper.journalEIssn,
    md5: paper.md5,
    publicationDate: paper.publicationDate,

    screeningStatus: mapPaperStatus(paper.status, paper.finalDecision),
    finalDecision: paper.finalDecision !== null ? mapDecisionType(paper.finalDecision) : null,
    finalDecisionText: paper.finalDecisionText,
    decisions: paper.decisions.map(mapDecisionResponse),
    extraction: paper.extraction,
    metadataSources: paper.metadataSources,
    extractionResult: paper.extractionResult,
    citationCount: paper.citationCount,
    referenceCount: paper.referenceCount,
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
