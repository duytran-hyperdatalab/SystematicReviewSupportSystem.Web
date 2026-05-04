export interface ApiErrorDto {
  code: string;
  message: string;
}

export interface ApiResponseDto<T> {
  isSuccess: boolean;
  message: string;
  errors?: ApiErrorDto[] | null;
  data?: T | null;
}

export const ChecklistType = {
  FULL: 0,
  ABSTRACT: 1,
} as const;

export type ChecklistType = (typeof ChecklistType)[keyof typeof ChecklistType];

export interface ChecklistTemplateSummaryDto {
  id: string;
  name: string;
  description?: string | null;
  type?: ChecklistType;
  typeName: string;
  isSystem: boolean;
  version: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItemTemplateDto {
  id: string;
  templateId: string;
  sectionId?: string | null;
  parentId?: string | null;
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  hasChildren: boolean;
  canRespond: boolean;
  defaultSampleAnswer?: string | null;
  children: ChecklistItemTemplateDto[];
}

export interface ChecklistTemplateSectionDto {
  id: string;
  templateId: string;
  name: string;
  description?: string | null;
  order: number;
  sectionNumber: string;
  items: ChecklistItemTemplateDto[];
}

export interface ChecklistTemplateDetailDto {
  id: string;
  name: string;
  description?: string | null;
  type?: ChecklistType;
  isSystem: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  sections: ChecklistTemplateSectionDto[];
  items: ChecklistItemTemplateDto[];
}

export interface CreateChecklistItemTemplateDto {
  itemNumber?: string | null;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  defaultSampleAnswer?: string | null;
  parentItemNumber?: string | null;
  subItems: CreateChecklistItemTemplateDto[];
}

export interface CreateChecklistSectionTemplateDto {
  name: string;
  description?: string | null;
  order: number;
  sectionNumber?: string | null;
  items: CreateChecklistItemTemplateDto[];
}

export interface CreateChecklistTemplateDto {
  name: string;
  description?: string | null;
  type: ChecklistType;
  version: string;
  sections: CreateChecklistSectionTemplateDto[];
  items: CreateChecklistItemTemplateDto[];
}

export interface CloneChecklistRequestDto {
  templateId: string;
}

export interface ChecklistSectionDto {
  sectionId?: string | null;
  sectionNumber: string;
  section: string;
  description?: string | null;
  order: number;
  items: ChecklistItemResponseDto[];
}

export interface ChecklistItemResponseDto {
  itemTemplateId: string;
  responseId?: string | null;
  sectionId?: string | null;
  parentId?: string | null;
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  hasChildren: boolean;
  canRespond: boolean;
  location?: string | null;
  isReported: boolean;
  isCompleted: boolean;
  lastUpdatedAt?: string | null;
  children: ChecklistItemResponseDto[];
}

export interface ReviewChecklistDto {
  reviewChecklistId: string;
  reviewId: string;
  reviewTitle: string;
  templateId: string;
  templateName: string;
  templateType: ChecklistType;
  typeName: string;
  isCompleted: boolean;
  completionPercentage: number;
  lastUpdatedAt: string;
  sections: ChecklistSectionDto[];
  items: ChecklistItemResponseDto[];
}

export interface ReviewChecklistSummaryDto {
  reviewChecklistId: string;
  reviewId: string;
  reviewTitle: string;
  templateId: string;
  templateName: string;
  templateType: ChecklistType;
  typeName: string;
  isCompleted: boolean;
  completionPercentage: number;
  itemCount: number;
  lastUpdatedAt: string;
}

export interface UpdateChecklistItemDto {
  location?: string | null;
  isReported?: boolean;
}

export interface ChecklistCompletionDto {
  reviewChecklistId: string;
  completionPercentage: number;
  isCompleted: boolean;
}

export interface GenerateReportRequestDto {
  includeOnlyCompletedItems: boolean;
}

export type ChecklistReportFormat = "docx";

export interface ChecklistEditorItemView {
  id: string;
  itemTemplateId: string;
  responseId?: string | null;
  parentId?: string | null;
  itemNumber: string;
  section: string;
  topic: string;
  description: string;
  order: number;
  isRequired: boolean;
  hasLocationField: boolean;
  isSectionHeaderOnly: boolean;
  hasChildren: boolean;
  canRespond: boolean;
  defaultSampleAnswer?: string | null;
  location: string;
  isCompleted: boolean;
  lastUpdated: string;
  children: ChecklistEditorItemView[];
}
