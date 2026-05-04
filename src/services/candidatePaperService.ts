// Candidate Paper Service - API Integration Layer
// Handles all HTTP calls related to backward snowballing candidates

import api from "../config/axios";

import type {
  CandidatePaperDto,
  SelectCandidatePaperRequest,
  RejectCandidatePaperRequest,
  PaperWithCandidateDto,
} from "../types/paper";
import type { ApiResponse, PaginatedResponse } from "../types/project";

export interface GetCandidatePapersParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: number;
  year?: string;
}

export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface GetPapersWithCandidatesOverviewParams extends PaginationParams {
  searchTerm?: string;
  year?: string;
}

export const candidatePaperService = {
  /**
   * Retrieves a paginated and filtered list of candidate papers.
   * Note: This endpoint is not explicitly listed in the new guide but kept for compatibility.
   * GET /api/candidate-papers
   */
  async getCandidatesByReviewProcess(
    processId: string,
    params?: GetCandidatePapersParams,
  ): Promise<ApiResponse<PaginatedResponse<CandidatePaperDto>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<CandidatePaperDto>>>(
      `/candidate-papers`,
      { params: { ...params, processId } },
    );
    return response.data;
  },

  /**
   * Rejects one or multiple candidate papers from the pool.
   * POST /api/candidate-papers/reject
   */
  async rejectCandidates(
    request: RejectCandidatePaperRequest,
  ): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>(
      `/candidate-papers/reject`,
      request,
    );
    return response.data;
  },

  /**
   * Promotes candidates to the main screening queue after deduplication.
   * POST /api/candidate-papers/select
   */
  async selectCandidates(
    request: SelectCandidatePaperRequest,
  ): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>(
      `/candidate-papers/select`,
      request,
    );
    return response.data;
  },

  /**
   * Retrieves a paginated list of source papers and their candidate counts for a project.
   * GET /api/projects/{projectId}/papers/papers-with-candidates
   */
  async getPapersWithCandidatesOverview(
    projectId: string,
    params?: GetPapersWithCandidatesOverviewParams
  ): Promise<ApiResponse<PaginatedResponse<PaperWithCandidateDto>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<PaperWithCandidateDto>>>(
      `/projects/${projectId}/papers/papers-with-candidates`,
      { params }
    );
    return response.data;
  },

  /**
   * Retrieves extracted candidates for one specific source paper.
   * GET /api/papers/{paperId}/candidates
   */
  async getCandidatesByPaperId(
    paperId: string,
    params?: GetCandidatePapersParams
  ): Promise<ApiResponse<PaginatedResponse<CandidatePaperDto>>> {
    const response = await api.get<ApiResponse<PaginatedResponse<CandidatePaperDto>>>(
      `/papers/${paperId}/candidates`,
      { params }
    );
    return response.data;
  },

  /**
   * Extracts references from a paper's full-text PDF and populates the candidate pool.
   * POST /api/papers/{paperId}/extract-references
   */
  async extractReferences(paperId: string): Promise<ApiResponse<undefined>> {
    const response = await api.post<ApiResponse<undefined>>(
      `/papers/${paperId}/extract-references`,
    );
    return response.data;
  },
};
