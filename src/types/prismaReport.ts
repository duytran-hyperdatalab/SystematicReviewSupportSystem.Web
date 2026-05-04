// PRISMA Report Types — Based on PrismaReportApiDoc.md

import type { ApiResponse } from "./project";

// ==========================================
// Enums
// ==========================================

export type PrismaStage =
  | "RecordsIdentified" // Stage 1
  | "DuplicateRecordsRemoved" // Stage 2
  | "RecordsScreened" // Stage 3
  | "RecordsExcluded" // Stage 4
  | "ReportsSoughtForRetrieval" // Stage 5
  | "ReportsNotRetrieved" // Stage 6
  | "ReportsAssessed" // Stage 7
  | "ReportsExcluded" // Stage 8
  | "StudiesIncludedInReview"; // Stage 9

/** Human-readable labels for each PRISMA stage */
export const PRISMA_STAGE_LABELS: Record<string, string> = {
  RecordsIdentified: "Records identified ",
  DuplicateRecordsRemoved: "Records removed prior to screening",
  RecordsScreened: "Records screened",
  RecordsExcluded: "Records excluded",
  ReportsSoughtForRetrieval: "Reports sought for retrieval",
  ReportsNotRetrieved: "Reports not retrieved",
  ReportsAssessed: "Reports assessed for eligibility",
  ReportsExcluded: "Reports excluded",
  StudiesIncludedInReview: "Studies included in review",
};

// ==========================================
// Request Types
// ==========================================

export interface GeneratePrismaReportRequest {
  /** Optional notes about this report generation */
  notes?: string | null;
  /** Who generated this report */
  generatedBy?: string | null;
  /** Report version label. Defaults to "1.0" */
  version?: string;
}

// ==========================================
// Response Types
// ==========================================

export interface PrismaBreakdownResponse {
  label: string;
  count: number;
}

export interface PrismaSideBoxResponse {
  stage: string;
  total: number;
  breakdown?: PrismaBreakdownResponse[];
  reasons?: PrismaBreakdownResponse[];
}

export interface PrismaNodeResponse {
  stage: PrismaStage;
  total: number;
  breakdown?: PrismaBreakdownResponse[];
  reasons?: PrismaBreakdownResponse[];
  sideBox?: PrismaSideBoxResponse;
  /** Optional notes – internal UI use */
  notes?: string[];
}

export interface PrismaReportResponse {
  id: string;
  reviewProcessId: string;
  version: string;
  generatedAt: string;
  notes?: string | null;
  generatedBy?: string | null;
  /** Main vertical flow nodes */
  nodes: PrismaNodeResponse[];
  /** Final included studies node */
  included: PrismaNodeResponse;
  createdAt: string;
  modifiedAt: string;
}

export interface PrismaReportListResponse {
  id: string;
  reviewProcessId: string;
  version: string;
  generatedAt: string;
  generatedBy?: string | null;
  /** Count from the "Records Identified" stage */
  totalRecords: number;
  createdAt: string;
}

// ==========================================
// Convenience Aliases
// ==========================================

export type PrismaReportApiResponse = ApiResponse<PrismaReportResponse>;
export type PrismaReportListApiResponse = ApiResponse<PrismaReportListResponse[]>;

// ==========================================
// UI-specific types
// ==========================================

/** Aggregated stats derived from flow records for summary cards */
export interface PrismaSummaryStats {
  totalIdentified: number;
  duplicatesRemoved: number;
  recordsScreened: number;
  recordsExcluded: number;
  reportsAssessed: number;
  reportsExcluded: number;
  studiesIncluded: number;
}

/** PRISMA flow section grouping for the visual diagram */
export type PrismaFlowSection = "identification" | "screening" | "eligibility" | "included";
