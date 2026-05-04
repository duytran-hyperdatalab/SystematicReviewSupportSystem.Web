// Review Process API Types - Based on Actual API Response

import type { ApiResponse } from "./project";
import type { IdentificationProcess } from "./identification";

// Review Process Status (as numbers from API)
export const ReviewProcessStatus = {
  Pending: 0,
  InProgress: 1,
  Completed: 2,
  Cancelled: 3,
} as const;

// PRISMA 2020 Phases
export const PrismaPhase = {
  Identification: 0,
  Screening: 1,
  Eligibility: 2,
  QualityAssessment: 3,
  DataExtraction: 4,
  Synthesis: 5,
  Reporting: 6,
} as const;

// StudySelectionProcess (similar structure to IdentificationProcess)
export interface StudySelectionStatistics {
  studySelectionProcessId: string;
  totalPapers: number;
  includedCount: number;
  excludedCount: number;
  conflictCount: number;
  pendingCount: number;
  completionPercentage: number;
  exclusionReasonBreakdown: unknown[];
}

export interface StudySelectionPhaseStatistics {
  titleAbstract: StudySelectionStatistics;
  fullText: StudySelectionStatistics;
}

export interface StudySelectionProcess {
  id: string;
  reviewProcessId: string;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: number;
  statusText: "Pending" | "NotStarted" | "InProgress" | "Completed" | "Cancelled";
  createdAt: string;
  modifiedAt: string;
  selectionStatistics?: StudySelectionStatistics | null;
  phaseStatistics?: StudySelectionPhaseStatistics | null;
  titleAbstractScreening?: unknown | null;
}

export interface QualityAssessmentStatistics {
  qualityAssessmentProcessId: string;
  totalPapers: number;
  highQualityPapers: number;
  lowQualityPapers: number;
  inProgressPapers: number;
  notStartedPapers: number;
  hasSetupCriteria: boolean;
}

export interface QualityAssessmentProcess {
  id: string;
  reviewProcessId: string;
  notes: string | null;
  status: number;
  statusText?: "Pending" | "NotStarted" | "InProgress" | "Completed" | "Cancelled";
  startedAt: string | null;
  completedAt: string | null;
  qualityStatistics?: QualityAssessmentStatistics | null;
  createdAt: string;
  modifiedAt: string;
}

// Data Extraction Process
export interface DataExtractionProcess {
  id: string;
  reviewProcessId: string;
  status: number;
  statusText: "NotStarted" | "InProgress" | "Completed";
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  modifiedAt: string;
}

export interface SynthesisProcess {
  id: string;
  reviewProcessId: string;
  status: number;
  statusText: "Pending" | "NotStarted" | "InProgress" | "Completed" | "Cancelled";
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  modifiedAt: string;
}

export type ReviewProcessStatusText =
  | "Pending"
  | "NotStarted"
  | "InProgress"
  | "Completed"
  | "Cancelled";

// Combined Review Process Interface (Handles both Detail and Snapshot)
export interface ReviewProcess {
  // Common / Snapshot fields
  id?: string;
  processId?: string;
  name?: string | null;
  processName?: string | null;
  statusText: ReviewProcessStatusText;
  startedAt?: string | null;
  completedAt: string | null;
  progressPercent?: number;
  totalPapersImported?: number;
  totalIncludedPapers?: number;
  totalExcludedPapers?: number;

  // Detail specific fields
  projectId?: string;
  status?: number;
  currentPhase?: number;
  currentPhaseText?: string;
  notes?: string | null;
  createdAt?: string;
  modifiedAt?: string;
  identificationProcess?: IdentificationProcess | null;
  studySelectionProcess?: StudySelectionProcess | null;
  qualityAssessmentProcess?: QualityAssessmentProcess | null;
  dataExtractionProcess?: DataExtractionProcess | null;
  synthesisProcess?: SynthesisProcess | null;
}

// Deprecated or Alias if needed (can be removed if no other dependencies)
export type ReviewProcessSnapshotResponse = ReviewProcess;

// Request Types
export interface CreateReviewProcessRequest {
  name?: string | null;
  notes?: string | null;
}

export interface UpdateReviewProcessRequest {
  notes: string;
}

export interface AddSelectedPapersRequest {
  paperIds: string[];
}

export interface AddPapersToReviewProcessResponse {
  inserted: number;
  skippedAsDuplicate: number;
  reviewProcessSnapshot: {
    reviewProcessId: string;
    reviewProcessName: string;
    statusText: string;
    progressPercent: number;
  };
}

export interface AddFromFilterSettingRequest {
  filterSettingId: string;
}

export interface AddPapersFromFilterResponse {
  inserted: number;
  skippedAsDuplicate: number;
  matchedTotal: number;
  processSnapshot: {
    processId: string;
    processName: string;
    statusText: string;
    progressPercent: number;
    existingPaperIds: string[];
  };
}

// Re-export ApiResponse for convenience
export type ReviewProcessResponse = ApiResponse<ReviewProcess>;
export type ReviewProcessListResponse = ApiResponse<ReviewProcess[]>;
export type ReviewProcessSnapshotListResponse = ApiResponse<ReviewProcessSnapshotResponse[]>;
export type AddPapersToReviewProcessResponseType = ApiResponse<AddPapersToReviewProcessResponse>;
export type AddPapersFromFilterResponseType = ApiResponse<AddPapersFromFilterResponse>;
