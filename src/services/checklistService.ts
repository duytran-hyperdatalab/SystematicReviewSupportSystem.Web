import api from "../config/axios";
import type {
  ApiResponseDto,
  ChecklistCompletionDto,
  ChecklistEditorItemView,
  ChecklistItemResponseDto,
  ChecklistType,
  ChecklistTemplateDetailDto,
  ChecklistTemplateSummaryDto,
  CloneChecklistRequestDto,
  CreateChecklistTemplateDto,
  GenerateReportRequestDto,
  ReviewChecklistDto,
  ReviewChecklistSummaryDto,
  UpdateChecklistItemDto,
} from "../types/checklistApi";
import { ChecklistType as ChecklistTypeValue } from "../types/checklistApi";

const unwrapApiResponse = <T>(response: ApiResponseDto<T>): T => {
  if (!response.isSuccess) {
    const message = response.message || "Request failed";
    throw new Error(message);
  }

  if (response.data === undefined || response.data === null) {
    throw new Error(response.message || "Empty response data");
  }

  return response.data;
};

const appendAuthHeaders = () => ({
  headers: {
    "Content-Type": "application/json",
  },
});

const normalizeCreateChecklistItems = (
  items: CreateChecklistTemplateDto["items"],
  checklistType: ChecklistType,
): CreateChecklistTemplateDto["items"] => {
  return items.map((item) => {
    const normalizedSubItems = normalizeCreateChecklistItems(item.subItems, checklistType);
    const hasChildren = normalizedSubItems.length > 0;

    return {
      ...item,
      isSectionHeaderOnly: hasChildren,
      hasLocationField:
        hasChildren || checklistType === ChecklistTypeValue.ABSTRACT
          ? false
          : item.hasLocationField,
      subItems: normalizedSubItems,
    };
  });
};

const normalizeCreateTemplatePayload = (
  payload: CreateChecklistTemplateDto,
): CreateChecklistTemplateDto => {
  const type = payload.type ?? ChecklistTypeValue.FULL;

  return {
    ...payload,
    type,
    sections: payload.sections.map((section) => ({
      ...section,
      items: normalizeCreateChecklistItems(section.items, type),
    })),
    items: normalizeCreateChecklistItems(payload.items, type),
  };
};

export const checklistApi = {
  async getTemplates(isSystem?: boolean): Promise<ChecklistTemplateSummaryDto[]> {
    const response = await api.get<ApiResponseDto<ChecklistTemplateSummaryDto[]>>(
      "checklist/templates",
      {
        params: isSystem === undefined ? undefined : { isSystem },
        ...appendAuthHeaders(),
      },
    );

    return unwrapApiResponse(response.data);
  },

  async getTemplateById(id: string): Promise<ChecklistTemplateDetailDto> {
    const response = await api.get<ApiResponseDto<ChecklistTemplateDetailDto>>(
      `checklist/templates/${id}`,
      appendAuthHeaders(),
    );

    return unwrapApiResponse(response.data);
  },

  async createCustomTemplate(
    payload: CreateChecklistTemplateDto,
  ): Promise<ChecklistTemplateDetailDto> {
    const normalizedPayload = normalizeCreateTemplatePayload(payload);

    const response = await api.post<ApiResponseDto<ChecklistTemplateDetailDto>>(
      "checklist/templates",
      normalizedPayload,
      appendAuthHeaders(),
    );

    return unwrapApiResponse(response.data);
  },

  async cloneTemplateToReview(
    reviewId: string,
    payload: CloneChecklistRequestDto,
  ): Promise<ReviewChecklistDto> {
    const response = await api.post<ApiResponseDto<ReviewChecklistDto>>(
      `reviews/${reviewId}/checklist`,
      payload,
      appendAuthHeaders(),
    );

    return unwrapApiResponse(response.data);
  },

  async getReviewChecklists(reviewId: string): Promise<ReviewChecklistSummaryDto[]> {
    const response = await api.get<ApiResponseDto<ReviewChecklistSummaryDto[]>>(
      `reviews/${reviewId}/checklist`,
      appendAuthHeaders(),
    );

    return unwrapApiResponse(response.data);
  },

  async getChecklistById(checkListId: string): Promise<ReviewChecklistDto> {
    const response = await api.get<ApiResponseDto<ReviewChecklistDto>>(
      `checklist/${checkListId}`,
      appendAuthHeaders(),
    );

    return unwrapApiResponse(response.data);
  },

  async updateChecklistItem(
    checkListId: string,
    itemId: string,
    payload: UpdateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    const response = await api.put<ApiResponseDto<ChecklistItemResponseDto>>(
      `checklist/${checkListId}/items/${itemId}`,
      payload,
      appendAuthHeaders(),
    );

    return unwrapApiResponse(response.data);
  },

  async getChecklistCompletion(checkListId: string): Promise<ChecklistCompletionDto> {
    const response = await api.get<ApiResponseDto<ChecklistCompletionDto>>(
      `checklist/${checkListId}/completion`,
      appendAuthHeaders(),
    );

    return unwrapApiResponse(response.data);
  },

  async generateReport(checkListId: string, payload: GenerateReportRequestDto): Promise<Blob> {
    const response = await api.post(`checklist/${checkListId}/generate-report`, payload, {
      responseType: "blob",
    });

    return response.data as Blob;
  },
};

export const downloadChecklistReport = (blob: Blob, reviewId: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `checklist-report-${reviewId}.docx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const mapReviewChecklistItem = (
  item: ChecklistItemResponseDto,
): ChecklistEditorItemView => ({
  id: item.responseId ?? item.itemTemplateId,
  itemTemplateId: item.itemTemplateId,
  responseId: item.responseId,
  parentId: item.parentId ?? null,
  itemNumber: item.itemNumber,
  section: item.section,
  topic: item.topic,
  description: item.description,
  order: item.order,
  isRequired: item.isRequired,
  hasLocationField: item.hasLocationField,
  isSectionHeaderOnly: item.isSectionHeaderOnly,
  hasChildren: item.hasChildren,
  canRespond: item.canRespond,
  location: item.location ?? "",
  isCompleted: item.isCompleted,
  lastUpdated: item.lastUpdatedAt ?? new Date().toISOString(),
  children: item.children.map(mapReviewChecklistItem),
});
