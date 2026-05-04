import api from "../config/axios";
import type { 
  GetStudySelectionChecklistSubmissionContextResponse, 
  CreateStudySelectionChecklistSubmissionRequest,
  CreateStudySelectionChecklistSubmissionResponse,
  GetReviewerSubmissionResponse
} from "../types/studySelectionChecklistSubmission";

export const studySelectionChecklistSubmissionService = {
  async getContext(params: {
    processId: string;
    paperId: string;
    reviewerId: string;
    phase: number;
  }): Promise<GetStudySelectionChecklistSubmissionContextResponse> {
    const response = await api.get<GetStudySelectionChecklistSubmissionContextResponse>(
      "/study-selection-checklist-submissions/context",
      { params }
    );
    return response.data;
  },
  async submit(data: CreateStudySelectionChecklistSubmissionRequest): Promise<CreateStudySelectionChecklistSubmissionResponse> {
    const response = await api.post<CreateStudySelectionChecklistSubmissionResponse>(
      "/study-selection-checklist-submissions",
      data
    );
    return response.data;
  },
  async getReviewerSubmission(params: {
    processId: string;
    paperId: string;
    reviewerId: string;
    phase: number;
  }): Promise<GetReviewerSubmissionResponse> {
    const response = await api.get<GetReviewerSubmissionResponse>(
      "/study-selection-checklist-submissions/reviewer-submission",
      { params }
    );
    return response.data;
  },
};
