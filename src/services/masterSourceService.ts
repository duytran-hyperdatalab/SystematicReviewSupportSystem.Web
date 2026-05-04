import api from "../config/axios";
import type {
  ApiResponse,
  MasterSearchSource,
  CreateMasterSearchSourceRequest,
  UpdateMasterSearchSourceRequest,
  MasterSourceFilters,
  AvailableMasterSearchSourceResponse,
} from "../types/masterSource";

const BASE_URL = "/admin/master-sources";

export const masterSourceService = {
  getAll: async (params?: MasterSourceFilters): Promise<ApiResponse<MasterSearchSource[]>> => {
    const response = await api.get<ApiResponse<MasterSearchSource[]>>(BASE_URL, { params });
    return response.data;
  },

  getAvailable: async (): Promise<ApiResponse<AvailableMasterSearchSourceResponse[]>> => {
    const response = await api.get<ApiResponse<AvailableMasterSearchSourceResponse[]>>(
      "/master-sources/available",
    );
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<MasterSearchSource>> => {
    const response = await api.get<ApiResponse<MasterSearchSource>>(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (
    data: CreateMasterSearchSourceRequest,
  ): Promise<ApiResponse<MasterSearchSource>> => {
    const response = await api.post<ApiResponse<MasterSearchSource>>(BASE_URL, data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateMasterSearchSourceRequest,
  ): Promise<ApiResponse<MasterSearchSource>> => {
    const response = await api.put<ApiResponse<MasterSearchSource>>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse<MasterSearchSource>> => {
    const response = await api.patch<ApiResponse<MasterSearchSource>>(
      `${BASE_URL}/${id}/toggle-status`,
    );
    return response.data;
  },

  getUsageCount: async (id: string): Promise<ApiResponse<{ usageCount: number }>> => {
    const response = await api.get<ApiResponse<{ usageCount: number }>>(`${BASE_URL}/${id}/usage`);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`${BASE_URL}/${id}`);
    return response.data;
  },
};
