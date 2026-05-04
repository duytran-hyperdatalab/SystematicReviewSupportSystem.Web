import api from "../config/axios";
import type { ApiResponse } from "../types/project";
import type {
  AddEvidenceRequest,
  DataSynthesisStrategyDto,
  CreateThemeRequest,
  ResearchQuestionFindingDto,
  SaveFindingRequest,
  SourceDataGroupDto,
  SynthesisThemeDto,
  SynthesisWorkspaceDto,
  SynthesisProcessDto,
  ThemeEvidenceDto,
  UpsertSynthesisStrategyRequest,
  UpdateThemeRequest,
} from "../types/synthesisExecution";

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.isSuccess) {
    throw new Error(response.message || "Request failed");
  }

  return response.data;
}

const basePath = (reviewProcessId: string) => `/synthesis-execution/${reviewProcessId}`;

export const synthesisExecutionService = {
  async getWorkspace(reviewProcessId: string): Promise<SynthesisWorkspaceDto> {
    const response = await api.get<ApiResponse<SynthesisWorkspaceDto>>(
      `${basePath(reviewProcessId)}/workspace`,
    );

    return unwrapResponse(response.data);
  },

  async getSourceDataGroups(reviewProcessId: string): Promise<SourceDataGroupDto[]> {
    const response = await api.get<ApiResponse<SourceDataGroupDto[]>>(
      `${basePath(reviewProcessId)}/extracted-data`,
    );

    return unwrapResponse(response.data);
  },

  async getSynthesisStrategiesByProcessId(
    synthesisProcessId: string,
  ): Promise<DataSynthesisStrategyDto[]> {
    const response = await api.get<ApiResponse<DataSynthesisStrategyDto[]>>(
      `/synthesis/process/${synthesisProcessId}/synthesis-strategies`,
    );

    return unwrapResponse(response.data);
  },

  async upsertSynthesisStrategy(
    request: UpsertSynthesisStrategyRequest,
  ): Promise<DataSynthesisStrategyDto> {
    const response = await api.post<ApiResponse<DataSynthesisStrategyDto>>(
      `/synthesis/strategies/upsert`,
      request,
    );

    return unwrapResponse(response.data);
  },

  async start(reviewProcessId: string): Promise<SynthesisProcessDto> {
    const response = await api.post<ApiResponse<SynthesisProcessDto>>(
      `${basePath(reviewProcessId)}/start`,
    );

    return unwrapResponse(response.data);
  },

  async complete(reviewProcessId: string): Promise<void> {
    const response = await api.post<ApiResponse<null>>(
      `${basePath(reviewProcessId)}/complete`,
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "Request failed");
    }
  },

  async createTheme(processId: string, request: CreateThemeRequest): Promise<SynthesisThemeDto> {
    const response = await api.post<ApiResponse<SynthesisThemeDto>>(
      `${basePath(processId)}/themes`,
      request,
    );

    return unwrapResponse(response.data);
  },

  async updateTheme(themeId: string, request: UpdateThemeRequest): Promise<void> {
    const response = await api.put<ApiResponse<null>>(
      `/synthesis-execution/themes/${themeId}`,
      request,
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "Request failed");
    }
  },

  async deleteTheme(themeId: string): Promise<void> {
    const response = await api.delete<ApiResponse<null>>(
      `/synthesis-execution/themes/${themeId}`,
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "Request failed");
    }
  },

  async addEvidence(themeId: string, request: AddEvidenceRequest): Promise<ThemeEvidenceDto> {
    const response = await api.post<ApiResponse<ThemeEvidenceDto>>(
      `/synthesis-execution/themes/${themeId}/evidence`,
      request,
    );

    return unwrapResponse(response.data);
  },

  async removeEvidence(evidenceId: string): Promise<void> {
    const response = await api.delete<ApiResponse<null>>(
      `/synthesis-execution/evidence/${evidenceId}`,
    );

    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "Request failed");
    }
  },

  async saveFinding(
    findingId: string,
    request: SaveFindingRequest,
  ): Promise<ResearchQuestionFindingDto> {
    const response = await api.put<ApiResponse<ResearchQuestionFindingDto>>(
      `/synthesis-execution/findings/${findingId}`,
      request,
    );

    return unwrapResponse(response.data);
  },
};

export default synthesisExecutionService;