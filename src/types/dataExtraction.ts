export type DataItemType = 
  | "Text" 
  | "Number" 
  | "SingleSelect" 
  | "MultiSelect" 
  | "Boolean" 
  | "Date"
  | "Group"; // For nested grouping

// Map Frontend types to Backend enum values
export const FieldTypeEnum = {
  Text: 0,
  Integer: 1,
  Decimal: 2,
  Boolean: 3,
  SingleSelect: 4,
  MultiSelect: 5,
} as const;

export type FieldTypeEnum = typeof FieldTypeEnum[keyof typeof FieldTypeEnum];

export const SectionTypeEnum = {
  FlatForm: 0,
  MatrixGrid: 1,
} as const;

export type SectionTypeEnum = typeof SectionTypeEnum[keyof typeof SectionTypeEnum];

export interface FieldOption {
  option_id: string;
  field_id: string;
  option_value: string;
  display_order: number;
}

export interface DataItemDefinitionExtended {
  data_item_id: string;
  form_id: string;
  parent_field_id?: string; // For nested structure
  name: string;
  data_type: DataItemType;
  description: string;
  is_required: boolean;
  display_order: number;
  options?: FieldOption[]; // For SingleSelect/MultiSelect
  subItems?: DataItemDefinitionExtended[]; // For nested items
}

// Backend DTOs
export interface FieldOptionDto {
  optionId?: string | null;
  fieldId?: string | null;
  value: string;
  displayOrder: number;
}

export interface ExtractionFieldDto {
  fieldId?: string | null;
  templateId?: string | null;
  sectionId?: string | null;
  parentFieldId?: string | null;
  name: string;
  instruction?: string | null;
  fieldType: FieldTypeEnum;
  isRequired: boolean;
  orderIndex: number;
  options: FieldOptionDto[];
  subFields: ExtractionFieldDto[];
}

export interface ExtractionMatrixColumnDto {
  columnId?: string | null;
  name: string;
  orderIndex: number;
}

export interface ExtractionSectionDto {
  sectionId?: string | null;
  templateId?: string | null;
  name: string;
  orderIndex: number;
  sectionType: SectionTypeEnum;
  isPicoc?: boolean;
  linkedResearchQuestionId?: string | null;
  fields: ExtractionFieldDto[];
  matrixColumns?: ExtractionMatrixColumnDto[];
}

export interface ExtractionTemplateDto {
  templateId?: string | null;
  dataExtractionProcessId: string;
  name: string;
  description?: string | null;
  sections?: ExtractionSectionDto[];
  // Backward-compatible optional shape for older callers.
  fields?: ExtractionFieldDto[];
}

/** Response type after a successful upsert — templateId is always present */
export interface ExtractionTemplateResponseDto {
  templateId: string;
  dataExtractionProcessId: string;
  name: string;
  description?: string | null;
  sections?: ExtractionSectionDto[];
  fields?: ExtractionFieldDto[];
}

export interface CreateFieldOptionInput {
  field_id: string;
  option_value: string;
  display_order: number;
}

// ============================================
// Data Extraction Conducting Phase DTOs
// ============================================

export interface ExtractionDashboardFilterDto {
  searchQuery?: string;
  statusFilter?: string;
  pageNumber: number;
  pageSize: number;
}

export interface ExtractionDashboardSummaryDto {
  totalIncluded: number;
  inProgress: number;
  awaitingConsensus: number;
  completed: number;
}

export interface ExtractionDashboardTaskDto {
  taskId: string;
  paperId: string;
  title: string;
  authors?: string;
  publicationYear?: number;
  pdfUrl?: string | null;
  reviewer1Id?: string | null;
  reviewer1Status?: string | null;
  reviewer2Id?: string | null;
  reviewer2Status?: string | null;
  status: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ExtractionDashboardResponseDto {
  summary: ExtractionDashboardSummaryDto;
  tasks: PaginatedResponse<ExtractionDashboardTaskDto>;
}

export interface ReviewerWorkloadDto {
  reviewerId: string;
  reviewerName: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  notStarted: number;
}

export interface ExtractionWorkloadSummaryDto {
  overallProgressPercentage: number;
  reviewerWorkloads: ReviewerWorkloadDto[];
}

export type ExtractionPreviewRowDto = Record<string, unknown> | unknown[];

export interface ExtractionPreviewDto {
  headers: string[];
  rows: ExtractionPreviewRowDto[];
}

export interface ExtractionGridCellDto {
  value: string | null;
  paperId: string | null;
  fieldId: string | null;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  isNotReported?: boolean;
  fieldType?: string | null;
}

export interface GridFieldOptionDto {
  optionId: string;
  value: string;
}

export interface ExtractionGridColumnMetaDto {
  fieldId: string;
  headerName: string;
  fieldType: string;
  options: GridFieldOptionDto[];
}

export interface ExtractionGridRowDto {
  rowId: string;
  paperTitle: string;
  citation: string;
  cells: Record<string, ExtractionGridCellDto>;
}

export interface ExtractionEditableGridDto {
  columns: ExtractionGridColumnMetaDto[];
  rows: ExtractionGridRowDto[];
}

export interface UpdateGridCellRequestDto {
  paperId: string;
  fieldId: string;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  newValue: string | null;
  isNotReported?: boolean;
}

export interface ExtractedDataAuditLogDto {
  id: string;
  paperId: string;
  fieldId: string;
  userId: string;
  userName: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
}

export interface AssignReviewersDto {
  reviewer1Id?: string | null;
  reviewer2Id?: string | null;
}

export const TargetReviewer = {
  Reviewer1: 0,
  Reviewer2: 1,
  Both: 2,
  Direct: 3,
} as const;

export type TargetReviewer =
  (typeof TargetReviewer)[keyof typeof TargetReviewer];

export interface ReopenExtractionRequestDto {
  target: TargetReviewer;
}

export interface ExtractedValueDto {
  fieldId: string;
  optionId: string | null;
  stringValue: string | null;
  numericValue: number | null;
  booleanValue: boolean | null;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  isNotReported?: boolean;
  evidenceCoordinates?: string | null;
  EvidenceCoordinates?: string | null;
}

export interface SubmitExtractionRequestDto {
  values: ExtractedValueDto[];
}

export interface AskAiFieldRequestDto {
  paperId: string;
  fieldId: string;
  fieldName: string;
  instruction: string;
  fieldType: string;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  optionsJson: string;
}

export interface ExtractionCommentDto {
  id: string;
  fieldId: string;
  threadOwnerId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface AddCommentRequestDto {
  threadOwnerId: string;
  content: string;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
}

// ============================================
// Consensus Resolution Phase DTOs
// ============================================

export interface AnswerDetailDto {
  optionId: string | null;
  stringValue: string | null;
  numericValue: number | null;
  booleanValue: boolean | null;
  isNotReported?: boolean;
  displayValue: string;
  evidenceCoordinates?: string | null;
  comments?: ExtractionCommentDto[];
}

export interface ExtractedAnswerDto {
  matrixColumnId?: string | null;
  matrixRowIndex?: number | null;
  reviewer1Answer: AnswerDetailDto | null;
  reviewer2Answer: AnswerDetailDto | null;
  finalAnswer?: AnswerDetailDto | null;
}

export interface ConsensusAnswerGroupDto {
  matrixColumnId?: string | null;
  matrixRowIndex?: number | null;
  reviewer1Answer: AnswerDetailDto | null;
  reviewer2Answer: AnswerDetailDto | null;
  finalAnswer?: AnswerDetailDto | null;
}

export interface ConsensusFieldDto {
  fieldId: string;
  name: string;
  instruction?: string | null;
  fieldType: FieldTypeEnum;
  isRequired: boolean;
  orderIndex?: number;
  options?: FieldOptionDto[];
  answers: ConsensusAnswerGroupDto[];
  subFields?: ConsensusFieldDto[];
}

export interface ConsensusSectionDto {
  sectionId: string;
  name: string;
  description?: string | null;
  sectionType: SectionTypeEnum;
  orderIndex?: number;
  fields: ConsensusFieldDto[];
  matrixColumns?: ExtractionMatrixColumnDto[];
}

export interface ConsensusWorkspaceDto {
  paperId?: string;
  templateId?: string;
  reviewer1Id?: string;
  reviewer2Id?: string;
  sections: ConsensusSectionDto[];
}

export interface ConsensusValueDto {
  fieldId: string;
  optionId: string | null;
  stringValue: string | null;
  numericValue: number | null;
  booleanValue: boolean | null;
  isNotReported?: boolean;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  evidenceCoordinates?: string | null;
}

export interface SubmitConsensusRequestDto {
  values: ConsensusValueDto[];
}

export interface ReviewerExtractedAnswerDto {
  matrixColumnId?: string | null;
  matrixRowIndex?: number | null;
  answer: AnswerDetailDto | null;
}

export interface ReviewerFieldDto {
  fieldId: string;
  name: string;
  instruction?: string | null;
  fieldType: FieldTypeEnum;
  isRequired: boolean;
  orderIndex?: number;
  options?: FieldOptionDto[];
  answers: ReviewerExtractedAnswerDto[];
  subFields?: ReviewerFieldDto[];
}

export interface ReviewerSectionDto {
  sectionId: string;
  name: string;
  description?: string | null;
  sectionType: SectionTypeEnum;
  orderIndex?: number;
  fields: ReviewerFieldDto[];
  matrixColumns?: ExtractionMatrixColumnDto[];
}

export interface ReviewerWorkspaceDto {
  paperId?: string;
  templateId?: string;
  reviewerId?: string;
  sections: ReviewerSectionDto[];
}