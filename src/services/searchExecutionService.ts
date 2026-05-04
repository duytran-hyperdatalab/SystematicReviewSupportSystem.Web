// Search Execution Service - API Integration Layer
// Handles all HTTP calls to Search Execution API endpoints

import api from "../config/axios";
import type {
  CreateSearchExecutionRequest,
  CreateSearchExecutionResponse,
  UpdateSearchExecutionRequest,
  UpdateSearchExecutionResponse,
  GetSearchExecutionResponse,
  GetSearchExecutionsResponse,
  DeleteSearchExecutionResponse,
  GetPrismaStatisticsResponse,
} from "../types/searchExecution";

/**
 * Search Execution Service
 * Implements all endpoints from SearchExecutionAPI.md
 */
export const searchExecutionService = {
  /**
   * Create a new search execution
   * POST /api/identification-processes/{identificationProcessId}/search-executions
   *
   * ⚠️ WARNING: identificationProcessId in route MUST match request body
   */
  async createSearchExecution(
    identificationProcessId: string,
    request: CreateSearchExecutionRequest,
  ): Promise<CreateSearchExecutionResponse> {
    // Validate route-body consistency (client-side safety check)
    if (request.identificationProcessId !== identificationProcessId) {
      throw new Error(
        "Route identificationProcessId does not match request body. This will cause 400 error.",
      );
    }

    const response = await api.post<CreateSearchExecutionResponse>(
      `/identification-processes/${identificationProcessId}/search-executions`,
      request,
    );
    return response.data;
  },

  /**
   * Get search execution by ID
   * GET /api/search-executions/{id}
   */
  async getSearchExecutionById(id: string): Promise<GetSearchExecutionResponse> {
    const response = await api.get<GetSearchExecutionResponse>(`/search-executions/${id}`);
    return response.data;
  },

  /**
   * Get all search executions for an identification process
   * GET /api/identification-processes/{identificationProcessId}/search-executions
   *
   * ⚠️ WARNING: No pagination - returns ALL results
   */
  async getSearchExecutionsByProcess(
    identificationProcessId: string,
  ): Promise<GetSearchExecutionsResponse> {
    const response = await api.get<GetSearchExecutionsResponse>(
      `/identification-processes/${identificationProcessId}/search-executions`,
    );
    return response.data;
  },

  /**
   * Update an existing search execution
   * PUT /api/search-executions/{id}
   *
   * ⚠️ WARNING: id in route MUST match request body
   * Note: Only send fields you want to update (partial update)
   */
  async updateSearchExecution(
    id: string,
    request: UpdateSearchExecutionRequest,
  ): Promise<UpdateSearchExecutionResponse> {
    // Validate route-body consistency (client-side safety check)
    if (request.id !== id) {
      throw new Error("Route id does not match request body. This will cause 400 error.");
    }

    const response = await api.put<UpdateSearchExecutionResponse>(
      `/search-executions/${id}`,
      request,
    );
    return response.data;
  },

  /**
   * Delete a search execution
   * DELETE /api/search-executions/{id}
   *
   * ✅ Server-side validation: Returns 400 error if import batches exist
   * 💡 Optional: Client can pre-validate importBatchCount for better UX
   */
  async deleteSearchExecution(id: string): Promise<DeleteSearchExecutionResponse> {
    const response = await api.delete<DeleteSearchExecutionResponse>(`/search-executions/${id}`);
    return response.data;
  },

  /**
   * Get PRISMA statistics for identification process
   * GET /api/identification-processes/{id}/statistics
   *
   * Returns aggregated metrics:
   * - totalRecordsImported: Sum of all imported papers
   * - importBatchCount: Total number of import batches
   * - duplicateRecords: Currently 0 (deduplication feature pending)
   * - uniqueRecords: Equals totalRecordsImported until deduplication
   */
  async getPrismaStatistics(identificationProcessId: string): Promise<GetPrismaStatisticsResponse> {
    const response = await api.get<GetPrismaStatisticsResponse>(
      `/identification-processes/${identificationProcessId}/statistics`,
    );
    return response.data;
  },
};
