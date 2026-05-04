// Paper Service - API Integration Layer
// Handles paper-related read endpoints
// Source: UniquePapersAPI.md

import api from "../config/axios";
import type { 
  GetUniquePapersParams, 
  GetUniquePapersResponse,
  GetDataExtractionUniquePapersParams,
  GetDataExtractionUniquePapersResponse,
  AssignPapersRequest,
  AssignPapersResponse,
  GetPaperDetailsApiResponse
} from "../types/paper";

/**
 * Paper Service
 * Paper retrieval endpoints (read-only)
 */
export const paperService = {
  /**
   * Get unique (non-duplicate) papers for an identification process
   * GET /api/identification-processes/{identificationProcessId}/unique-papers
   *
   * Returns paginated results with search and year filter support.
   * Papers are sorted by createdAt descending (newest first).
   *
   * Note: selectionStatus is always null from this endpoint
   * (status lives in ScreeningResolution, not on the paper)
   */
  async getUniquePapers(params: GetUniquePapersParams): Promise<GetUniquePapersResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.set("search", params.search);
    if (params.year) queryParams.set("year", params.year.toString());
    if (params.pageNumber) queryParams.set("pageNumber", params.pageNumber.toString());
    if (params.pageSize) queryParams.set("pageSize", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `/identification-processes/${params.identificationProcessId}/unique-papers${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<GetUniquePapersResponse>(url);
    return response.data;
  },

  /**
   * Get unique papers for a data extraction process.
   * GET /api/data-extraction-processes/{dataExtractionProcessId}/unique-papers
   */
  async getDataExtractionUniquePapers(
    params: GetDataExtractionUniquePapersParams
  ): Promise<GetDataExtractionUniquePapersResponse> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.set("search", params.search);
    if (params.year) queryParams.set("year", params.year.toString());
    if (params.pageNumber) queryParams.set("pageNumber", params.pageNumber.toString());
    if (params.pageSize) queryParams.set("pageSize", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `/data-extraction-processes/${params.dataExtractionProcessId}/unique-papers${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<GetDataExtractionUniquePapersResponse>(url);
    return response.data;
  },

  async assignPapers(request: AssignPapersRequest): Promise<AssignPapersResponse> {
    const response = await api.post<AssignPapersResponse>("/papers/assign", request);
    return response.data;
  },

  /**
   * Get full metadata for a single paper
   * GET /api/papers/{paperId}
   */
  async getPaperDetails(paperId: string): Promise<GetPaperDetailsApiResponse> {
    const response = await api.get<GetPaperDetailsApiResponse>(`/papers/${paperId}`);
    return response.data;
  },
};
