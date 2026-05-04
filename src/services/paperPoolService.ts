import api from "../config/axios";
import type { PaginatedResponse, ApiResponse } from "../types/project";
import type {
  FilterSettingRequest,
  PaperPoolApiResponse,
  PaperPoolFilterMetadata,
  PaperPoolFilterSetting,
  PaperPoolQueryParams,
} from "../components/paperPool/types";

function unwrapResponse<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.isSuccess) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.data;
}

function cleanQueryParams(params: PaperPoolQueryParams): Record<string, string | number | boolean> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as Record<string, string | number | boolean>;
}

class PaperPoolService {
  async getPapers(
    projectId: string,
    params: PaperPoolQueryParams,
  ): Promise<PaginatedResponse<PaperPoolApiResponse>> {
    const response = await api.get<ApiResponse<PaginatedResponse<PaperPoolApiResponse>>>(
      `/projects/${projectId}/papers`,
      {
        params: cleanQueryParams(params),
      },
    );

    return unwrapResponse(response.data, "Failed to load paper pool");
  }

  async getFilterMetadata(projectId: string): Promise<PaperPoolFilterMetadata> {
    const response = await api.get<ApiResponse<PaperPoolFilterMetadata>>(
      `/projects/${projectId}/filter-metadata`,
    );

    return unwrapResponse(response.data, "Failed to load paper pool metadata");
  }

  async getFilterSettings(projectId: string): Promise<PaperPoolFilterSetting[]> {
    const response = await api.get<ApiResponse<PaperPoolFilterSetting[]>>(
      `/projects/${projectId}/filter-settings`,
    );

    return unwrapResponse(response.data, "Failed to load saved filters");
  }

  async getFilterSettingById(projectId: string, filterId: string): Promise<PaperPoolFilterSetting> {
    const response = await api.get<ApiResponse<PaperPoolFilterSetting>>(
      `/projects/${projectId}/filter-settings/${filterId}`,
    );

    return unwrapResponse(response.data, "Failed to load saved filter detail");
  }

  async createFilterSetting(
    projectId: string,
    payload: FilterSettingRequest,
  ): Promise<PaperPoolFilterSetting> {
    const response = await api.post<ApiResponse<PaperPoolFilterSetting>>(
      `/projects/${projectId}/filter-settings`,
      payload,
    );

    return unwrapResponse(response.data, "Failed to create saved filter");
  }

  async updateFilterSetting(
    projectId: string,
    filterId: string,
    payload: FilterSettingRequest,
  ): Promise<PaperPoolFilterSetting> {
    const response = await api.put<ApiResponse<PaperPoolFilterSetting>>(
      `/projects/${projectId}/filter-settings/${filterId}`,
      payload,
    );

    return unwrapResponse(response.data, "Failed to update saved filter");
  }

  async deleteFilterSetting(projectId: string, filterId: string): Promise<void> {
    const response = await api.delete<ApiResponse<unknown>>(
      `/projects/${projectId}/filter-settings/${filterId}`,
    );

    unwrapResponse(response.data, "Failed to delete saved filter");
  }
}

const paperPoolService = new PaperPoolService();

export default paperPoolService;
