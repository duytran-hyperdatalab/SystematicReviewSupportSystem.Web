import api from "../config/axios";
import type { GenerateAICriteriaResponse, SaveAiResultRequest, StudySelectionCriteriaDto } from "../types/selectionCriteria";
import type { ApiResponse } from "../types/project";

export const selectionCriteriaService = {
  /**
   * Generate study selection criteria using AI
   * @param studySelectionProcessId The ID of the study selection process
   */
  async generateAi(studySelectionProcessId: string): Promise<GenerateAICriteriaResponse> {
    const response = await api.post<GenerateAICriteriaResponse>(
      `/selection-criteria/generate-ai/${studySelectionProcessId}`
    );
    return response.data;
  },

  /**
   * Save AI suggested and custom criteria result
   * @param data The criteria data to save
   */
  async saveAiResult(data: SaveAiResultRequest): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
      `/selection-criteria/save-ai-result`,
      data
    );
    return response.data;
  },

  /**
   * Get criteria groups by process ID
   * @param studySelectionProcessId The ID of the study selection process
   */
  async getByProcessId(studySelectionProcessId: string): Promise<ApiResponse<StudySelectionCriteriaDto[]>> {
    const response = await api.get<ApiResponse<StudySelectionCriteriaDto[]>>(
      `/selection-criteria/process/${studySelectionProcessId}`
    );
    return response.data;
  },
};
