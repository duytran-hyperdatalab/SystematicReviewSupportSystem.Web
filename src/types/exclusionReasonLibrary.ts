import type { ApiResponse, PaginatedResponse } from "./project";

export interface ExclusionReasonLibrary {
    id: string;
    code: number;
    name: string;
    isActive: boolean;
    createdAt: string;
}

export interface GetExclusionReasonLibraryParams {
    search?: string;
    onlyActive?: boolean;
    pageNumber?: number;
    pageSize?: number;
}

export interface CreateExclusionReasonRequest {
    code: number;
    name: string;
}

export type ExclusionReasonLibraryResponse = ApiResponse<PaginatedResponse<ExclusionReasonLibrary>>;
export type BulkCreateExclusionReasonResponse = ApiResponse<ExclusionReasonLibrary[]>;
