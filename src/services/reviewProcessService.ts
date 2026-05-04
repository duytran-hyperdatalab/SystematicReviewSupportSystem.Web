import api from "../config/axios";
import type {
  ReviewProcess,
  CreateReviewProcessRequest,
  UpdateReviewProcessRequest,
  ReviewProcessSnapshotResponse,
  AddSelectedPapersRequest,
  AddPapersToReviewProcessResponse,
  AddFromFilterSettingRequest,
  AddPapersFromFilterResponse,
} from "../types/reviewProcess";
import type { ApiResponse } from "../types/project";

/**
 * Review Process Service
 * Handles all API calls related to review processes following PRISMA 2020 workflow
 */
class ReviewProcessService {
  /**
   * Create a new review process for a project
   * POST /api/projects/{projectId}/review-processes
   */
  async createReviewProcess(
    projectId: string,
    data: CreateReviewProcessRequest,
  ): Promise<ApiResponse<ReviewProcess>> {
    const response = await api.post<ApiResponse<ReviewProcess>>(
      `/projects/${projectId}/review-processes`,
      data,
    );
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "Failed to create review process");
    }
    return response.data;
  }

  /**
   * Get all review processes for a specific project
   * GET /api/projects/{projectId}/review-processes
   */
  async getReviewProcessesByProject(
    projectId: string,
  ): Promise<ApiResponse<ReviewProcessSnapshotResponse[]>> {
    const response = await api.get<ApiResponse<ReviewProcessSnapshotResponse[]>>(
      `/projects/${projectId}/review-processes`,
    );
    return response.data;
  }

  /**
   * Get a review process by ID
   * GET /api/review-processes/{id}
   */
  async getReviewProcessById(id: string): Promise<ApiResponse<ReviewProcess>> {
    const response = await api.get<ApiResponse<ReviewProcess>>(`/review-processes/${id}`);
    return response.data;
  }

  /**
   * Update review process notes and description
   * PUT /api/review-processes/{id}
   */
  async updateReviewProcess(
    id: string,
    data: UpdateReviewProcessRequest,
  ): Promise<ApiResponse<ReviewProcess>> {
    const response = await api.put<ApiResponse<ReviewProcess>>(`/review-processes/${id}`, data);
    return response.data;
  }

  /**
   * Start a review process (Pending -> InProgress)
   * POST /api/review-processes/{id}/start
   */
  async startReviewProcess(id: string): Promise<ApiResponse<ReviewProcess>> {
    const response = await api.post<ApiResponse<ReviewProcess>>(`/review-processes/${id}/start`);
    return response.data;
  }

  /**
   * Complete a review process (InProgress -> Completed)
   * POST /api/review-processes/{id}/complete
   */
  async completeReviewProcess(id: string): Promise<ApiResponse<ReviewProcess>> {
    const response = await api.post<ApiResponse<ReviewProcess>>(`/review-processes/${id}/complete`);
    return response.data;
  }

  /**
   * Cancel a review process (Pending/InProgress -> Cancelled)
   * POST /api/review-processes/{id}/cancel
   */
  async cancelReviewProcess(id: string): Promise<ApiResponse<ReviewProcess>> {
    const response = await api.post<ApiResponse<ReviewProcess>>(`/review-processes/${id}/cancel`);
    return response.data;
  }

  /**
   * Delete a review process
   * DELETE /api/review-processes/{id}
   */
  async deleteReviewProcess(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/review-processes/${id}`);
    return response.data;
  }





  /**
   * Reopen a specific review phase (Completed -> InProgress)
   * POST /api/review-processes/{id}/reopen-phase/{phase}
   */
  async reopenPhase(id: string, phase: number): Promise<ApiResponse<ReviewProcess>> {
    const response = await api.post<ApiResponse<ReviewProcess>>(
      `/review-processes/${id}/reopen-phase/${phase}`,
    );
    return response.data;
  }

  /**
   * Get review process snapshots by project (for selection API)
   * GET /api/projects/{projectId}/review-processes
   */
  async getReviewProcessSnapshots(
    projectId: string,
  ): Promise<ApiResponse<ReviewProcessSnapshotResponse[]>> {
    const response = await api.get<ApiResponse<ReviewProcessSnapshotResponse[]>>(
      `/projects/${projectId}/review-processes`,
    );
    return response.data;
  }

  /**
   * Add selected papers to a review process
   * POST /api/review-processes/{reviewProcessId}/papers
   */
  async addSelectedPapers(
    reviewProcessId: string,
    data: AddSelectedPapersRequest,
  ): Promise<ApiResponse<AddPapersToReviewProcessResponse>> {
    const response = await api.post<ApiResponse<AddPapersToReviewProcessResponse>>(
      `/review-processes/${reviewProcessId}/papers`,
      data,
    );
    return response.data;
  }

  /**
   * Add papers from a filter setting to a review process
   * POST /api/review-processes/{processId}/papers/add-from-filter-setting
   */
  async addPapersFromFilterSetting(
    processId: string,
    data: AddFromFilterSettingRequest,
  ): Promise<ApiResponse<AddPapersFromFilterResponse>> {
    const response = await api.post<ApiResponse<AddPapersFromFilterResponse>>(
      `/review-processes/${processId}/papers/add-from-filter-setting`,
      data,
    );
    return response.data;
  }
}

// Export singleton instance
export const reviewProcessService = new ReviewProcessService();
export default reviewProcessService;
