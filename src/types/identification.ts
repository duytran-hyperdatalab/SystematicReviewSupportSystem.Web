// Identification Phase Types - Based on Backend Entities

import type { ApiResponse } from "./project";

// Re-export SearchExecution types from dedicated module
// See: src/types/searchExecution.ts for full API contract
export { SearchExecutionType } from "./searchExecution";
export type {
  SearchExecutionResponse as SearchExecution,
  CreateSearchExecutionRequest,
  UpdateSearchExecutionRequest,
} from "./searchExecution";

// PRISMA Statistics returned with IdentificationProcess
export interface PrismaStatistics {
  totalRecordsImported: number;
  duplicateRecords: number;
  uniqueRecords: number;
  importBatchCount: number;
  pendingSelectionCount: number;
}

export type IdentificationStatus = 0 | 1 | 2;
// 0 = NotStarted, 1 = InProgress, 2 = Completed

// IdentificationProcess
export interface IdentificationProcess {
  id: string;
  reviewProcessId: string;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: IdentificationStatus;
  statusText: "NotStarted" | "InProgress" | "Completed";
  createdAt: string;
  modifiedAt: string;
  prismaStatistics?: PrismaStatistics | null;
}

// ImportBatch
export interface ImportBatch {
  id: string;
  fileName: string | null;
  fileType: string | null;
  source: string | null;
  totalRecords: number;
  importedBy: string | null;
  importedAt: string;
  searchExecutionId: string | null;
  createdAt: string;
  modifiedAt: string;
}

// Paper (basic reference - full definition may be in separate file)
export interface Paper {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  doi?: string;
  abstract?: string;
  importBatchId: string;
  status?: string;
  createdAt: string;
  modifiedAt: string;
}

// API Response Types
export type IdentificationProcessResponse = ApiResponse<IdentificationProcess>;

// Import Batch API Response Types
export type GetImportBatchResponse = ApiResponse<ImportBatch>;
export type GetImportBatchesResponse = ApiResponse<ImportBatch[]>;
export type CreateImportBatchResponse = ApiResponse<ImportBatch>;
export type UpdateImportBatchResponse = ApiResponse<ImportBatch>;
export type DeleteImportBatchResponse = ApiResponse<void>;

// Paper API Response Types
export type PaperResponse = ApiResponse<Paper>;
export type PaperListResponse = ApiResponse<Paper[]>;

// Import Batch Request Types
export interface CreateImportBatchRequest {
  searchExecutionId: string; // Required - Must match route parameter
  fileName?: string | null; // Optional - Name of imported file
  fileType?: string | null; // Optional - e.g., "RIS", "CSV", "BibTeX"
  source?: string | null; // Optional - e.g., "IEEE Xplore", "PubMed"
  totalRecords: number; // Required - Number of records in this batch
  importedBy?: string | null; // Optional - User who performed import
}

export interface UpdateImportBatchRequest {
  id: string; // Required - Must match route parameter
  fileName?: string | null; // Optional - Update file name
  fileType?: string | null; // Optional - Update file type
  source?: string | null; // Optional - Update source
  totalRecords?: number | null; // Optional - Update record count
  importedBy?: string | null; // Optional - Update importer
}
