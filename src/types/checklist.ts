/**
 * Checklist Module Types and Interfaces
 * Supports PRISMA 2020 Main, Abstract, and Custom Templates
 */

/**
 * Represents a PRISMA section (e.g., TITLE, ABSTRACT, METHODS, etc.)
 */
export type ChecklistSection =
  | "TITLE"
  | "ABSTRACT"
  | "INTRODUCTION"
  | "METHODS"
  | "RESULTS"
  | "DISCUSSION"
  | "OTHER_INFORMATION";

export const ChecklistType = {
  FULL: 0,
  ABSTRACT: 1,
} as const;

export type ChecklistType = (typeof ChecklistType)[keyof typeof ChecklistType];

/**
 * Enum for checklist template types
 */
export const ChecklistTemplate = {
  PRISMA_2020_MAIN: "prisma_2020_main",
  PRISMA_2020_ABSTRACT: "prisma_2020_abstract",
  CUSTOM: "custom",
} as const;

export type ChecklistTemplate = (typeof ChecklistTemplate)[keyof typeof ChecklistTemplate];

/**
 * Represents a single item in a checklist template (e.g., Item 5 "Methods - Study design")
 */
export interface ChecklistItemTemplate {
  id: string;
  itemNumber: string; // e.g., "5", "10a", "13d"
  topic: string; // e.g., "Study design"
  description: string; // Full PRISMA description
  section: ChecklistSection;
  isRequired: boolean;
  isSubItem: boolean;
  parentId?: string; // For sub-items (10a -> 10, 13b -> 13)
  defaultSampleAnswer?: string; // Example answer from PRISMA
  hasLocationField?: boolean;
  isSectionHeaderOnly?: boolean;
  hasChildren?: boolean;
  canRespond?: boolean;
  children?: ChecklistItemTemplate[];
  order: number; // Display order within section
  customNotes?: string; // For custom templates
}

export interface ChecklistTemplateSection {
  id: string;
  templateId: string;
  name: string;
  description?: string | null;
  order: number;
  sectionNumber: string;
  items: ChecklistItemTemplate[];
}

export interface UpdateCustomTemplateSection {
  key: ChecklistSection;
  name: string;
  description?: string | null;
  order: number;
  sectionNumber?: string | null;
}

/**
 * Represents the complete structure of a checklist template
 */
export interface ChecklistTemplateDetail {
  id: string;
  name: string;
  description: string;
  type: ChecklistType;
  version?: string;
  isSystem?: boolean;
  templateType: ChecklistTemplate;
  isCustom: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  sections?: ChecklistTemplateSection[];
  items: ChecklistItemTemplate[];
  totalItems: number;
}

/**
 * Represents a user's response to a single checklist item
 */
export interface ChecklistItemResponse {
  id: string;
  checklistId: string;
  itemTemplateId: string;
  itemNumber: string;
  topic: string;
  section?: ChecklistSection;
  parentId?: string | null;
  description?: string;
  hasLocationField?: boolean;
  isSectionHeaderOnly?: boolean;
  hasChildren?: boolean;
  canRespond?: boolean;
  defaultSampleAnswer?: string | null;
  isRequired?: boolean;
  order?: number;
  reportLocation: string; // Where item is reported in the paper (e.g., "Section 4, Page 5")
  isReported?: boolean;
  isCompleted: boolean;
  lastUpdated: string;
  lastUpdatedAt?: string;
  completionPercentage?: number; // For tracking completion per item
  children?: ChecklistItemResponse[];
}

export interface ReviewChecklistSection {
  sectionId?: string | null;
  sectionNumber?: string;
  section: ChecklistSection;
  displayName: string;
  description?: string | null;
  order: number;
  items?: ChecklistItemResponse[];
}

/**
 * Represents a complete checklist for a specific review and template
 */
export interface ReviewChecklist {
  id: string;
  projectId: string;
  reviewId?: string;
  templateId: string;
  templateName: string;
  typeName: string;
  templateType: ChecklistType;
  title: string; // Title/name of the review
  createdAt: string;
  updatedAt: string;
  lastEditorId?: string;
  lastEditorName?: string;
  sections?: ReviewChecklistSection[];
  responses: ChecklistItemResponse[];
  completionPercentage: number;
  totalItems: number;
  completedItems: number;
}

/**
 * Grouped responses by section for easier rendering
 */
export interface ChecklistSectionGroup {
  section: ChecklistSection;
  displayName: string;
  items: (ChecklistItemTemplate & { response?: ChecklistItemResponse })[];
  completedCount: number;
  totalCount: number;
}

/**
 * Detailed section with analytics
 */
export interface SectionProgress {
  section: ChecklistSection;
  displayName: string;
  totalItems: number;
  completedItems: number;
  requiredItems: number;
  completedRequired: number;
  completionPercentage: number;
}

/**
 * Request payload for saving checklist item response
 */
export interface SaveChecklistItemRequest {
  checklistId: string;
  itemTemplateId: string;
  reportLocation: string;
}

/**
 * Request payload for creating a new checklist
 */
export interface CreateChecklistRequest {
  projectId: string;
  reviewId?: string;
  templateId: string;
  title: string;
}

/**
 * Request payload for updating custom template
 */
export interface UpdateCustomTemplateRequest {
  id: string;
  name: string;
  description?: string;
  type: ChecklistType;
  sections?: UpdateCustomTemplateSection[];
  items: ChecklistItemTemplate[];
}

/**
 * Request payload for creating a new custom template
 */
export interface CreateCustomTemplateRequest {
  projectId?: string;
  name: string;
  description?: string;
  baseTemplateId?: string; // If based on existing template
  items: ChecklistItemTemplate[];
}

/**
 * API response wrapper for paginated template list
 */
export interface ChecklistTemplateListResponse {
  templates: ChecklistTemplateDetail[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * API response for checklist list
 */
export interface ReviewChecklistListResponse {
  checklists: ReviewChecklist[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

/**
 * Utility type: Response state
 */
export type ResponseStatus = "idle" | "saving" | "saved" | "error";

/**
 * For tracking draft changes before save
 */
export interface ChecklistDraft {
  checklistId: string;
  changes: Map<string, Partial<ChecklistItemResponse>>;
  lastSaved: string;
  isDirty: boolean;
}

/**
 * Sample answer modal data
 */
export interface SampleAnswerData {
  itemNumber: string;
  topic: string;
  sampleAnswer: string;
  explanation?: string;
}

/**
 * PRISMA Section display configuration
 */
export const PRISMA_SECTIONS: Record<ChecklistSection, string> = {
  TITLE: "Title",
  ABSTRACT: "Abstract",
  INTRODUCTION: "Introduction",
  METHODS: "Methods",
  RESULTS: "Results",
  DISCUSSION: "Discussion",
  OTHER_INFORMATION: "Other Information",
};

/**
 * PRISMA Section order for proper display
 */
export const SECTION_ORDER: ChecklistSection[] = [
  "TITLE",
  "ABSTRACT",
  "INTRODUCTION",
  "METHODS",
  "RESULTS",
  "DISCUSSION",
  "OTHER_INFORMATION",
];
