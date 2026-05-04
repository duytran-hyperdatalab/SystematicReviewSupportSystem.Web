// Search Execution Types - Based on Backend API Contract
// Source: SearchExecutionAPI.md

import type { ApiResponse } from "./project";

/**
 * Search execution type - Maps to backend: SRSS.IAM.Repositories.Entities.SearchExecutionType
 */
export const SearchExecutionType = {
  DatabaseSearch: 0,
  ManualImport: 1,
} as const;

export type SearchExecutionType = (typeof SearchExecutionType)[keyof typeof SearchExecutionType];

/**
 * Request to create a new search execution
 * Backend: SRSS.IAM.Services.DTOs.Identification.CreateSearchExecutionRequest
 */
export interface CreateSearchExecutionRequest {
  identificationProcessId: string; // UUID - Must match route param
  searchSourceId: string; // Required - Must reference a valid SearchSource defined in the protocol
  searchQuery?: string; // Optional - The search query string
  type: SearchExecutionType; // 0 = DatabaseSearch, 1 = ManualImport
  notes?: string | null; // Optional - Additional notes
}

/**
 * Request to update an existing search execution
 * Backend: SRSS.IAM.Services.DTOs.Identification.UpdateSearchExecutionRequest
 */
export interface UpdateSearchExecutionRequest {
  id: string; // UUID - Must match route param
  searchSourceId?: string | null; // Optional - Update source ID
  searchQuery?: string | null; // Optional - Update query
  type?: SearchExecutionType | null; // Optional - Update type
  notes?: string | null; // Optional - Update notes
}

/**
 * Search execution response from API
 * Backend: SRSS.IAM.Services.DTOs.Identification.SearchExecutionResponse
 *
 * ✅ RESOLVED: importBatchCount field added (Jan 2024)
 */
export interface SearchExecutionResponse {
  id: string; // UUID
  identificationProcessId: string; // UUID - Parent process
  searchSource: string; // e.g., "PubMed"
  searchQuery: string; // The search query
  executedAt: string; // ISO 8601 datetime - Auto-set by backend

  /**
   * Total number of papers imported via all import batches
   * Updated during paper import process (manual tracking)
   * Use this to display paper count to users
   */
  resultCount: number; // Count of results - Starts at 0, updated during import

  /**
   * Number of import batches linked to this search execution
   * Computed server-side (always accurate)
   * Use this to track import operations
   */
  importBatchCount: number; // ✅ NEW FIELD (Jan 2024)

  type: SearchExecutionType; // 0 or 1
  typeText: string; // "DatabaseSearch" or "ManualImport"
  notes: string | null; // Optional notes
  createdAt: string; // ISO 8601 datetime
  modifiedAt: string; // ISO 8601 datetime
}

/**
 * PRISMA statistics response for identification process
 * Backend: SRSS.IAM.Services.DTOs.Identification.PrismaStatisticsResponse
 *
 * @remarks
 * - duplicateRecords is currently 0 (deduplication not yet implemented)
 * - uniqueRecords equals totalRecordsImported until deduplication is added
 * - importBatchCount is the total across all search executions
 */
export interface PrismaStatisticsResponse {
  /**
   * Sum of all imported papers across all import batches
   */
  totalRecordsImported: number;

  /**
   * Number of duplicate records found (currently 0 - deduplication pending)
   */
  duplicateRecords: number;

  /**
   * Number of pending selections
   */
  pendingSelectionCount: number;

  /**
   * Number of unique records after deduplication
   * Currently equals totalRecordsImported
   */
  uniqueRecords: number;

  /**
   * Total number of import batches across all search executions
   */
  importBatchCount: number;
}

/**
 * GET single search execution by ID
 */
export type GetSearchExecutionResponse = ApiResponse<SearchExecutionResponse>;

/**
 * GET all search executions for identification process
 */
export type GetSearchExecutionsResponse = ApiResponse<SearchExecutionResponse[]>;

/**
 * POST create search execution
 */
export type CreateSearchExecutionResponse = ApiResponse<SearchExecutionResponse>;

/**
 * PUT update search execution
 */
export type UpdateSearchExecutionResponse = ApiResponse<SearchExecutionResponse>;

/**
 * DELETE search execution (returns no data, just success)
 * ✅ Server validates import batches automatically (Jan 2024)
 */
export type DeleteSearchExecutionResponse = ApiResponse<void>;

/**
 * GET PRISMA statistics for identification process
 */
export type GetPrismaStatisticsResponse = ApiResponse<PrismaStatisticsResponse>;
