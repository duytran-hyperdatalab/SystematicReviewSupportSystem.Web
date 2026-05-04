import api from "../config/axios";
import type { ApiResponse } from "../types/masterSource";
import type { SearchSourceDto } from "../types/searchSource";

export const searchSourceService = {
  getByProjectId: async (projectId: string): Promise<ApiResponse<SearchSourceDto[]>> => {
    const response = await api.get<ApiResponse<SearchSourceDto[]>>(
      `/projects/${projectId}/sources`,
    );
    return response.data;
  },

  bulkUpsert: async (sources: SearchSourceDto[]): Promise<ApiResponse<SearchSourceDto[]>> => {
    const response = await api.post<ApiResponse<SearchSourceDto[]>>(
      "/search-sources/bulk",
      sources,
    );
    return response.data;
  },
};
