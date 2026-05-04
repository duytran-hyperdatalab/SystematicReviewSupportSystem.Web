import api from "../config/axios";
import type { ApiResponse } from "../types/project";
import type { 
  GetStudySelectionChecklistTemplateResponse,
  GetStudySelectionChecklistTemplateDetailResponse,
  CreateStudySelectionChecklistTemplateRequest,
  CreateStudySelectionChecklistTemplateResponse,
} from "../types/studySelectionChecklistTemplate";

export const studySelectionChecklistTemplateService = {
  async getTemplate(projectId: string): Promise<GetStudySelectionChecklistTemplateResponse> {
    const response = await api.get<GetStudySelectionChecklistTemplateResponse>(
      `/projects/${projectId}/study-selection-checklist-template`
    );
    return response.data;
  },

  async createTemplate(
    projectId: string, 
    request: CreateStudySelectionChecklistTemplateRequest
  ): Promise<CreateStudySelectionChecklistTemplateResponse> {
    const response = await api.post<CreateStudySelectionChecklistTemplateResponse>(
      `/projects/${projectId}/study-selection-checklist-template`,
      request
    );
    return response.data;
  },

  async getTemplateDetail(projectId: string, templateId: string): Promise<GetStudySelectionChecklistTemplateDetailResponse> {
    const response = await api.get<GetStudySelectionChecklistTemplateDetailResponse>(
      `/projects/${projectId}/study-selection-checklist-templates/${templateId}`
    );
    return response.data;
  },

  async activateTemplate(templateId: string): Promise<ApiResponse<boolean>> {
    const response = await api.post<ApiResponse<boolean>>(
      `/study-selection-checklist-templates/${templateId}/activate`
    );
    return response.data;
  },
};
