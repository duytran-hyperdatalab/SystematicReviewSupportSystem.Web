// Import Batch Service - API Integration Layer
// Handles all HTTP calls to Import Batch API endpoints
// Source: ImportBatchAPI.md

import api from "../config/axios";
import type {
  CreateImportBatchRequest,
  CreateImportBatchResponse,
  UpdateImportBatchRequest,
  UpdateImportBatchResponse,
  GetImportBatchResponse,
  GetImportBatchesResponse,
  DeleteImportBatchResponse,
} from "../types/identification";
import type { GetPapersByImportBatchResponse } from "../types/paper";

/**
 * Import Batch Service
 * Implements all endpoints from ImportBatchAPI.md
 */
export const importBatchService = {
  /**
   * Create a new import batch for a search execution
   * POST /api/search-executions/{searchExecutionId}/import-batches
   *
   * ⚠️ WARNING: searchExecutionId in route MUST match request body
   */
  async createImportBatch(
    searchExecutionId: string,
    request: CreateImportBatchRequest,
  ): Promise<CreateImportBatchResponse> {
    // Validate route-body consistency (client-side safety check)
    if (request.searchExecutionId !== searchExecutionId) {
      throw new Error(
        "Route searchExecutionId does not match request body. This will cause 400 error.",
      );
    }

    const response = await api.post<CreateImportBatchResponse>(
      `/search-executions/${searchExecutionId}/import-batches`,
      request,
    );
    return response.data;
  },

  /**
   * Get import batch by ID
   * GET /api/import-batches/{id}
   */
  async getImportBatchById(id: string): Promise<GetImportBatchResponse> {
    const response = await api.get<GetImportBatchResponse>(`/import-batches/${id}`);
    return response.data;
  },

  /**
   * Get all import batches for a search execution
   * GET /api/search-executions/{searchExecutionId}/import-batches
   */
  async getImportBatchesBySearchExecution(
    searchExecutionId: string,
  ): Promise<GetImportBatchesResponse> {
    const response = await api.get<GetImportBatchesResponse>(
      `/search-executions/${searchExecutionId}/import-batches`,
    );
    return response.data;
  },

  /**
   * Get all import batches for an identification process
   * GET /api/identification-processes/{identificationProcessId}/import-batches
   */
  async getImportBatchesByIdentificationProcess(
    identificationProcessId: string,
  ): Promise<GetImportBatchesResponse> {
    const response = await api.get<GetImportBatchesResponse>(
      `/identification-processes/${identificationProcessId}/import-batches`,
    );
    return response.data;
  },

  /**
   * Update an existing import batch
   * PUT /api/import-batches/{id}
   *
   * ⚠️ WARNING: id in route MUST match request body
   */
  async updateImportBatch(
    id: string,
    request: UpdateImportBatchRequest,
  ): Promise<UpdateImportBatchResponse> {
    // Validate route-body consistency (client-side safety check)
    if (request.id !== id) {
      throw new Error("Route id does not match request body. This will cause 400 error.");
    }

    const response = await api.put<UpdateImportBatchResponse>(`/import-batches/${id}`, request);
    return response.data;
  },

  /**
   * Delete an import batch
   * DELETE /api/import-batches/{id}
   *
   * ⚠️ WARNING: May cascade delete linked papers (check database constraints)
   */
  async deleteImportBatch(id: string): Promise<DeleteImportBatchResponse> {
    const response = await api.delete<DeleteImportBatchResponse>(`/import-batches/${id}`);
    return response.data;
  },

  /**
   * Get all papers for a specific import batch
   * GET /api/import-batches/{id}/papers
   *
   * Returns all papers that were imported in this batch
   */
  async getPapersByImportBatch(id: string): Promise<GetPapersByImportBatchResponse> {
    const response = await api.get<GetPapersByImportBatchResponse>(`/import-batches/${id}/papers`);
    return response.data;
  },
};
