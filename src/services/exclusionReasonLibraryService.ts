import api from "../config/axios";
import type { 
    ExclusionReasonLibrary, 
    GetExclusionReasonLibraryParams, 
    ExclusionReasonLibraryResponse,
    CreateExclusionReasonRequest,
    BulkCreateExclusionReasonResponse
} from "../types/exclusionReasonLibrary";
import type { ApiResponse } from "../types/project";

class ExclusionReasonLibraryService {
    private readonly endpoint = "/exclusion-reason-libraries";

    /**
     * Get all exclusion reason library items with filtering and pagination
     * GET /api/exclusion-reason-libraries
     */
    getExclusionReasonLibraries = async (params?: GetExclusionReasonLibraryParams): Promise<ExclusionReasonLibraryResponse> => {
        const response = await api.get<ExclusionReasonLibraryResponse>(this.endpoint, {
            params,
        });
        return response.data;
    };

    /**
     * Get a single exclusion reason library item by ID
     * GET /api/exclusion-reason-libraries/{id}
     */
    getExclusionReasonLibraryById = async (id: string): Promise<ApiResponse<ExclusionReasonLibrary>> => {
        const response = await api.get<ApiResponse<ExclusionReasonLibrary>>(`${this.endpoint}/${id}`);
        return response.data;
    };
    
    /**
     * Create multiple exclusion reason library items in bulk
     * POST /api/exclusion-reason-libraries/bulk
     */
    createExclusionReasonBulk = async (data: CreateExclusionReasonRequest[]): Promise<BulkCreateExclusionReasonResponse> => {
        const response = await api.post<BulkCreateExclusionReasonResponse>(`${this.endpoint}/bulk`, data);
        return response.data;
    };

    /**
     * Delete an exclusion reason library item permanently
     * DELETE /api/exclusion-reason-libraries/{id}
     */
    deleteExclusionReason = async (id: string): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
        return response.data;
    };

    /**
     * Toggle the active status of an exclusion reason library item
     * PATCH /api/exclusion-reason-libraries/{id}/toggle-active
     */
    toggleActive = async (id: string): Promise<ApiResponse<ExclusionReasonLibrary>> => {
        const response = await api.patch<ApiResponse<ExclusionReasonLibrary>>(`${this.endpoint}/${id}/toggle-active`);
        return response.data;
    };

    // Additional methods (Update) can be added here as needed
}

export const exclusionReasonLibraryService = new ExclusionReasonLibraryService();
