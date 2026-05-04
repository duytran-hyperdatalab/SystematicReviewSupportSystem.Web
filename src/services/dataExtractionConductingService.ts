import api from "../config/axios";
import type {
  AddCommentRequestDto,
  AskAiFieldRequestDto,
  AssignReviewersDto,
  ExtractedValueDto,
  ExtractionDashboardFilterDto,
  ExtractionDashboardResponseDto,
  ExtractedDataAuditLogDto,
  ExtractionEditableGridDto,
  ExtractionPreviewDto,
  ExtractionWorkloadSummaryDto,
  ReopenExtractionRequestDto,
  ReviewerWorkspaceDto,
  SubmitExtractionRequestDto,
  ConsensusWorkspaceDto,
  SubmitConsensusRequestDto,
  UpdateGridCellRequestDto,
} from "../types/dataExtraction";
import type { ApiResponse } from "../types/project";

export const dataExtractionConductingService = {
  async getDashboard(
    extractionProcessId: string,
    filters: ExtractionDashboardFilterDto
  ): Promise<ApiResponse<ExtractionDashboardResponseDto>> {
    const response = await api.get<ApiResponse<ExtractionDashboardResponseDto>>(
      `/data-extraction-processes/${extractionProcessId}/dashboard`,
      {
        params: filters,
      }
    );

    return response.data;
  },

  async assignReviewers(
    extractionProcessId: string,
    paperId: string,
    payload: AssignReviewersDto
  ): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/assign`,
      payload
    );

    return response.data;
  },

  async submitExtraction(
    extractionProcessId: string,
    paperId: string,
    payload: SubmitExtractionRequestDto
  ): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/submit`,
      payload
    );

    return response.data;
  },

  async directExtractByLeader(
    extractionProcessId: string,
    paperId: string,
    payload: SubmitExtractionRequestDto
  ): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/direct-extract`,
      payload
    );

    return response.data;
  },

  async autoExtractWithAI(
    extractionProcessId: string,
    paperId: string,
    templateId: string
  ): Promise<ApiResponse<ExtractedValueDto[]>> {
    const response = await api.post<ApiResponse<ExtractedValueDto[]>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/auto-extract`,
      { templateId }
    );

    return response.data;
  },

  async askAiSingleField(
    extractionProcessId: string,
    payload: AskAiFieldRequestDto
  ): Promise<ApiResponse<ExtractedValueDto>> {
    const response = await api.post<ApiResponse<ExtractedValueDto>>(
      `/data-extraction-processes/${extractionProcessId}/ask-ai-field`,
      payload
    );

    return response.data;
  },

  async getConsensusWorkspace(
    extractionProcessId: string,
    paperId: string
  ): Promise<ApiResponse<ConsensusWorkspaceDto>> {
    const response = await api.get<ApiResponse<ConsensusWorkspaceDto>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/consensus`
    );

    return response.data;
  },

  async getReviewerWorkspace(
    extractionProcessId: string,
    paperId: string
  ): Promise<ApiResponse<ReviewerWorkspaceDto>> {
    const response = await api.get<ApiResponse<ReviewerWorkspaceDto>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/reviewer-workspace`
    );

    return response.data;
  },

  async addFieldComment(
    extractionProcessId: string,
    paperId: string,
    fieldId: string,
    payload: AddCommentRequestDto
  ): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/fields/${fieldId}/comments`,
      payload
    );

    return response.data;
  },

  async submitConsensus(
    extractionProcessId: string,
    paperId: string,
    payload: SubmitConsensusRequestDto
  ): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/consensus/submit`,
      payload
    );

    return response.data;
  },

  async exportExtractedData(extractionProcessId: string): Promise<Blob> {
    const response = await api.get<Blob>(
      `/data-extraction-processes/${extractionProcessId}/export`,
      { responseType: "blob" }
    );

    return response.data;
  },

  async exportExtractedDataCsv(extractionProcessId: string): Promise<Blob> {
    const response = await api.get<Blob>(
      `/data-extraction-processes/${extractionProcessId}/export/csv`,
      { responseType: "blob" }
    );

    return response.data;
  },

  async getExtractionPreview(
    extractionProcessId: string
  ): Promise<ApiResponse<ExtractionPreviewDto>> {
    const response = await api.get<ApiResponse<ExtractionPreviewDto>>(
      `/data-extraction-processes/${extractionProcessId}/export/preview`
    );

    return response.data;
  },

  async getEditableGrid(
    extractionProcessId: string
  ): Promise<ApiResponse<ExtractionEditableGridDto>> {
    const response = await api.get<ApiResponse<ExtractionEditableGridDto>>(
      `/data-extraction-processes/${extractionProcessId}/editable-grid`
    );

    return response.data;
  },

  async updateGridCell(
    extractionProcessId: string,
    payload: UpdateGridCellRequestDto
  ): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>(
      `/data-extraction-processes/${extractionProcessId}/editable-grid/cell`,
      payload
    );

    return response.data;
  },

  async getCellAuditLogs(
    extractionProcessId: string,
    paperId: string,
    fieldId: string,
    matrixColumnId: string | null,
    matrixRowIndex: number | null
  ): Promise<ApiResponse<ExtractedDataAuditLogDto[]>> {
    const response = await api.get<ApiResponse<ExtractedDataAuditLogDto[]>>(
      `/data-extraction-processes/${extractionProcessId}/audit-logs`,
      {
        params: {
          paperId,
          fieldId,
          matrixColumnId,
          matrixRowIndex,
        },
      }
    );

    return response.data;
  },

  async getWorkloadSummary(
    extractionProcessId: string
  ): Promise<ApiResponse<ExtractionWorkloadSummaryDto>> {
    const response = await api.get<ApiResponse<ExtractionWorkloadSummaryDto>>(
      `/data-extraction-processes/${extractionProcessId}/workload-summary`
    );

    return response.data;
  },

  async reopenExtraction(
    extractionProcessId: string,
    paperId: string,
    payload: ReopenExtractionRequestDto
  ): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(
      `/data-extraction-processes/${extractionProcessId}/papers/${paperId}/reopen`,
      payload
    );

    return response.data;
  },
};
