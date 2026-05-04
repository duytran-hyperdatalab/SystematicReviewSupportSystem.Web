import api from "../config/axios";
import type { IdentificationProcessResponse } from "../types/identification";
import type {
  GetReadyPapersParams,
  GetSnapshotPapersParams,
  GetUniquePapersResponse,
  AddPapersToSnapshotRequest,
} from "../types/paper";
import type { ApiResponse } from "../types/project";

export const identificationProcessService = {
  async getById(id: string): Promise<IdentificationProcessResponse> {
    const response = await api.get<IdentificationProcessResponse>(
      `/identification-processes/${id}`,
    );
    const data = response.data;
    if (!data.isSuccess) {
      throw new Error(data.message || "Failed to fetch identification process");
    }
    return data;
  },

  async start(id: string): Promise<IdentificationProcessResponse> {
    const response = await api.post<IdentificationProcessResponse>(
      `/identification-processes/${id}/start`,
    );
    const data = response.data;
    if (!data.isSuccess) {
      throw new Error(data.message || "Failed to start identification process");
    }
    return data;
  },

  async complete(id: string): Promise<IdentificationProcessResponse> {
    const response = await api.post<IdentificationProcessResponse>(
      `/identification-processes/${id}/complete`,
    );
    const data = response.data;
    if (!data.isSuccess) {
      throw new Error(data.message || "Failed to complete identification process");
    }
    return data;
  },

  async reopen(id: string): Promise<IdentificationProcessResponse> {
    const response = await api.post<IdentificationProcessResponse>(
      `/identification-processes/${id}/reopen`,
    );
    const data = response.data;
    if (!data.isSuccess) {
      throw new Error(data.message || "Failed to reopen identification process");
    }
    return data;
  },


  /**
   * Get papers eligible for snapshot (not duplicates, not pending, not already in snapshot)
   * GET /api/identification-processes/{id}/ready-papers
   */
  async getReadyPapers(params: GetReadyPapersParams): Promise<GetUniquePapersResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set("search", params.search);
    if (params.year) queryParams.set("year", params.year.toString());
    if (params.searchSourceId) queryParams.set("searchSourceId", params.searchSourceId);
    if (params.pageNumber) queryParams.set("pageNumber", params.pageNumber.toString());
    if (params.pageSize) queryParams.set("pageSize", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `/identification-processes/${params.identificationProcessId}/ready-papers${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<GetUniquePapersResponse>(url);
    return response.data;
  },

  /**
   * Get papers currently in the snapshot (the screening dataset)
   * GET /api/identification-processes/{id}/snapshot
   */
  async getSnapshotPapers(params: GetSnapshotPapersParams): Promise<GetUniquePapersResponse> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set("search", params.search);
    if (params.year) queryParams.set("year", params.year.toString());
    if (params.searchSourceId) queryParams.set("searchSourceId", params.searchSourceId);
    if (params.pageNumber) queryParams.set("pageNumber", params.pageNumber.toString());
    if (params.pageSize) queryParams.set("pageSize", params.pageSize.toString());

    const queryString = queryParams.toString();
    const url = `/identification-processes/${params.identificationProcessId}/snapshot${queryString ? `?${queryString}` : ""}`;

    const response = await api.get<GetUniquePapersResponse>(url);
    return response.data;
  },

  /**
   * Add selected papers to the snapshot (append-only)
   * POST /api/identification-processes/{id}/snapshot
   */
  async addPapersToSnapshot(
    processId: string,
    request: AddPapersToSnapshotRequest,
  ): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      `/identification-processes/${processId}/snapshot`,
      request,
    );
    const data = response.data;
    if (!data.isSuccess) {
      throw new Error(data.message || "Failed to add papers to snapshot");
    }
    return data;
  },
};
