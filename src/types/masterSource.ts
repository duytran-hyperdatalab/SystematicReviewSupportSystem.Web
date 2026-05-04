export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: ApiError[];
}

export interface MasterSearchSource {
  id: string;
  sourceName: string;
  baseUrl: string;
  isActive: boolean;
  logoUrl?: string;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMasterSearchSourceRequest {
  sourceName: string;
  baseUrl: string;
  isActive: boolean;
  logoUrl?: string;
}

export interface UpdateMasterSearchSourceRequest {
  sourceName?: string;
  baseUrl?: string;
  isActive?: boolean;
  logoUrl?: string;
}

export interface MasterSourceFilters {
  isActive?: boolean;
  sourceName?: string;
}

export interface AvailableMasterSearchSourceResponse {
  id: string;
  name: string;
}
