import api from "../config/axios";
import type {
  GetDuplicatePairsParams,
  GetDuplicatePairsResponse,
  ResolveDuplicatePairRequest,
  ResolveDuplicatePairApiResponse,
  MarkAsDuplicateRequest,
} from "../types/deduplication";
import type { ApiResponse } from "../types/project";

/**
 * Deduplication Service
 * Manages duplicate pair retrieval and resolution.
 */
export const deduplicationService = {
  /**
   * Get duplicate pairs for a project.
   * GET /api/projects/{projectId}/duplicate-pairs
   *
   * Supports search, status, minConfidence, method, and sortBy filters.
   */
  async getDuplicatePairs(params: GetDuplicatePairsParams): Promise<GetDuplicatePairsResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.set("search", params.search);
    if (params.status !== undefined) queryParams.set("status", params.status.toString());
    if (params.minConfidence !== undefined)
      queryParams.set("minConfidence", params.minConfidence.toString());
    if (params.method !== undefined) queryParams.set("method", params.method.toString());
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.pageNumber) queryParams.set("pageNumber", params.pageNumber.toString());
    if (params.pageSize) queryParams.set("pageSize", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `/projects/${params.projectId}/duplicate-pairs${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<GetDuplicatePairsResponse>(url);
    return response.data;
  },

  /**
   * Resolve a duplicate pair.
   * PATCH /api/projects/{projectId}/duplicate-pairs/{pairId}/resolve
   *
   * Decisions:
   * - 0 = KEEP_BOTH: papers are not duplicates, both remain
   * - 1 = CANCEL: confirmed duplicate, duplicate paper removed from project
   */
  async resolveDuplicatePair(
    projectId: string,
    pairId: string,
    request: ResolveDuplicatePairRequest,
  ): Promise<ResolveDuplicatePairApiResponse> {
    const url = `/projects/${projectId}/duplicate-pairs/${pairId}/resolve`;

    const response = await api.patch<ResolveDuplicatePairApiResponse>(url, request);
    return response.data;
  },

  /**
   * Manually flags a paper as a duplicate of another existing paper.
   * POST /api/projects/{projectId}/papers/{paperId}/mark-as-duplicate
   */
  async markAsDuplicate(
    projectId: string,
    paperId: string,
    request: MarkAsDuplicateRequest,
  ): Promise<ApiResponse<null>> {
    const url = `/projects/${projectId}/papers/${paperId}/mark-as-duplicate`;

    const response = await api.post<ApiResponse<null>>(url, request);
    return response.data;
  },
};

