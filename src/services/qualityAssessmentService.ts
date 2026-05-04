import api from "../config/axios";
import type {
  ApiResponse,
  QualityAssessmentAssignmentRequest,
  CreateQualityAssessmentDecisionRequest,
  QualityAssessmentResolutionRequest,
  AutoResolveQualityAssessmentRequest,
  QualityAssessmentStrategy,
  UpdateQualityAssessmentDecisionRequest,
  UpdateQualityAssessmentResolutionRequest,
  AiDecisionRequest,
  AiDecisionResponseItem as AiDecisionItemResponse,
  LeaderQADashboardResponse,
  QAMemberDashboardResponse,
  QADashboardParams,
  QualityAssessmentChecklist,
  QualityAssessmentCriterion
} from "../types/qualityAssessment";

export interface QualityAssessmentProcessResponse {
  id: string;
  reviewProcessId: string;
  status: number;
  statusText: string;
}

export const qualityAssessmentService = {
  async getProcess(id: string): Promise<ApiResponse<QualityAssessmentProcessResponse>> {
    const response = await api.get<ApiResponse<QualityAssessmentProcessResponse>>(`/quality-assessment/${id}`);
    return response.data;
  },

  async start(id: string): Promise<ApiResponse<QualityAssessmentProcessResponse>> {
    const response = await api.post<ApiResponse<QualityAssessmentProcessResponse>>(`/quality-assessment/${id}/start`);
    return response.data;
  },

  async complete(id: string): Promise<ApiResponse<QualityAssessmentProcessResponse>> {
    const response = await api.post<ApiResponse<QualityAssessmentProcessResponse>>(`/quality-assessment/${id}/complete`);
    return response.data;
  },

  async assignReviewers(data: QualityAssessmentAssignmentRequest): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(`/quality-assessment/assignments`, data);
    return response.data;
  },

  async autoResolve(data: AutoResolveQualityAssessmentRequest): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(`/quality-assessment/auto-resolve`, data);
    return response.data;
  },

  async getPapers(qaProcessId: string, params?: QADashboardParams): Promise<ApiResponse<LeaderQADashboardResponse>> {
    const response = await api.get<ApiResponse<LeaderQADashboardResponse>>(`/quality-assessment/${qaProcessId}/leader`, { params });
    return response.data;
  },

  async getMyAssignedPapers(qaProcessId: string, params?: QADashboardParams): Promise<ApiResponse<QAMemberDashboardResponse>> {
    const response = await api.get<ApiResponse<QAMemberDashboardResponse>>(`/quality-assessment/${qaProcessId}/assignments/my`, { params });
    return response.data;
  },

  async getProcessStrategies(qaProcessId: string): Promise<ApiResponse<QualityAssessmentStrategy[]>> {
    const response = await api.get<ApiResponse<QualityAssessmentStrategy[]>>(`/quality-assessment/${qaProcessId}/strategies`);
    return response.data;
  },

  async submitDecisions(request: CreateQualityAssessmentDecisionRequest): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(`/quality-assessment/decisions`, request);
    return response.data;
  },

  async updateDecisions(request: UpdateQualityAssessmentDecisionRequest): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>(`/quality-assessment/decisions/${request.id}`, request);
    return response.data;
  },

  async submitResolution(data: QualityAssessmentResolutionRequest): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(`/quality-assessment/resolutions/`, data);
    return response.data;
  },

  async updateResolution(data: UpdateQualityAssessmentResolutionRequest): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>(`/quality-assessment/resolutions/${data.id}`, data);
    return response.data;
  },

  async getAiDecision(data: AiDecisionRequest): Promise<ApiResponse<AiDecisionItemResponse[]>> {
    const response = await api.post<ApiResponse<AiDecisionItemResponse[]>>(`/quality-assessment/decisions/ai`, data);
    return response.data;
  },

  async upsertStrategy(data: QualityAssessmentStrategy): Promise<ApiResponse<QualityAssessmentStrategy>> {
    const response = await api.post<ApiResponse<QualityAssessmentStrategy>>(`/quality-assessment/strategies/upsert`, data);
    return response.data;
  },

  async bulkChecklists(data: QualityAssessmentChecklist[]): Promise<ApiResponse<QualityAssessmentChecklist[]>> {
    const response = await api.post<ApiResponse<QualityAssessmentChecklist[]>>(`/quality-assessment/checklists/bulk`, data);
    return response.data;
  },

  async bulkCriteria(data: QualityAssessmentCriterion[]): Promise<ApiResponse<QualityAssessmentCriterion[]>> {
    const response = await api.post<ApiResponse<QualityAssessmentCriterion[]>>(`/quality-assessment/criteria/bulk`, data);
    return response.data;
  },

  async exportExcel(qaProcessId: string): Promise<Blob> {
    const response = await api.get(`/quality-assessment/${qaProcessId}/export/excel`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
