import type { Dispatch, SetStateAction } from "react";
import type {
  AddCommentRequestDto,
  AssignReviewersDto,
  ExtractedValueDto,
  ExtractionDashboardSummaryDto,
  ExtractionDashboardTaskDto,
  ExtractionFieldDto,
  ExtractionPreviewDto,
  ExtractionWorkloadSummaryDto,
  TargetReviewer,
  SubmitExtractionRequestDto,
  ExtractionTemplateDto,
  ConsensusWorkspaceDto,
  ReviewerWorkspaceDto,
  SubmitConsensusRequestDto,
} from "../../../types/dataExtraction";
import type { PaperWithDecisionsResponse } from "../../../types/studySelection";
import type { DataExtractionProcess } from "../../../types/reviewProcess";

export type ExtractionTabKey = "dashboard" | "workspace" | "consensus" | "grid";
export type ExtractionMode = "single" | "double";
export type ExtractionPaperStatus = "todo" | "in-progress" | "awaiting-consensus" | "completed";

export type ExtractionValue = string | number | boolean | string[] | null;

export interface ReviewerOption {
  id: string;
  name: string;
}

export interface ReviewerSubmission {
  reviewerId: string;
  reviewerName: string;
  submittedAt: string;
  values: Record<string, ExtractionValue>;
}

export interface ExtractionPaperRecord {
  paperId: string;
  assigneeId: string | null;
  assigneeName: string | null;
  status: ExtractionPaperStatus;
  draftsByReviewer: Record<string, Record<string, ExtractionValue>>;
  submissions: ReviewerSubmission[];
  finalValues: Record<string, ExtractionValue>;
  conflictFieldIds: string[];
  updatedAt: string;
}

export interface FlattenedExtractionField {
  field: ExtractionFieldDto;
  depth: number;
}

export interface PdfHighlightCoordinate {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AskAiFieldResult {
  fieldId: string;
  value: ExtractionValue;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  isNotReported?: boolean;
  evidenceCoordinates?: string | null;
}

export interface ExtractionStudyItem {
  paperId: string;
  title: string;
  authors: string | null;
  publicationYear: number | null;
  pdfUrl: string | null;
  source: string | null;
  raw: PaperWithDecisionsResponse;
}

export type ExtractionSummaryMetrics = ExtractionDashboardSummaryDto;

export interface UseDataExtractionWorkspaceReturn {
  projectId?: string;
  processId?: string;
  currentUserId: string | null;
  isCurrentUserLeader: boolean;
  extractionProcessStatus: DataExtractionProcess["statusText"];

  isLoading: boolean;
  error: string | null;

  isMockMode: boolean;

  activeTab: ExtractionTabKey;
  setActiveTab: (tab: ExtractionTabKey) => void;

  extractionMode: ExtractionMode;
  setExtractionMode: (mode: ExtractionMode) => void;

  reviewerOptions: ReviewerOption[];
  activeReviewerId: string;
  setActiveReviewerId: (reviewerId: string) => void;

  templates: ExtractionTemplateDto[];
  selectedTemplateId: string;
  setSelectedTemplateId: (templateId: string) => void;
  selectedTemplate: ExtractionTemplateDto | null;
  refreshTemplates: () => Promise<void>;

  studies: ExtractionStudyItem[];
  selectedPaperId: string;
  setSelectedPaperId: (paperId: string) => void;
  selectedStudy: ExtractionStudyItem | null;
  selectedRecord: ExtractionPaperRecord | null;

  allFields: FlattenedExtractionField[];
  answerFields: FlattenedExtractionField[];

  summary: ExtractionSummaryMetrics;
  dashboardTasks: ExtractionDashboardTaskDto[];
  dashboardTotalCount: number;
  dashboardTotalPages: number;
  isDashboardLoading: boolean;
  workloadSummary: ExtractionWorkloadSummaryDto | null;
  isWorkloadLoading: boolean;

  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  pageNumber: number;
  setPageNumber: (value: number) => void;
  pageSize: number;
  setPageSize: (value: number) => void;

  getPaperStatus: (paperId: string) => ExtractionPaperStatus;
  getRecord: (paperId: string) => ExtractionPaperRecord;
  canCurrentUserExtractPaper: (paperId: string) => boolean;

  assignPaper: (paperId: string, payload: AssignReviewersDto) => void;
  isAssigningReviewers: boolean;
  completePhase: () => Promise<void>;
  isCompleting: boolean;
  reopenExtraction: (paperId: string, target: TargetReviewer) => void;
  isReopeningExtraction: boolean;
  hasCurrentUserSubmitted: (paperId: string) => boolean;

  setDraftValue: (
    paperId: string,
    reviewerId: string,
    fieldId: string,
    value: ExtractionValue
  ) => void;
  saveDraft: (paperId: string, reviewerId: string) => void;
  submitExtraction: (paperId: string, payload: SubmitExtractionRequestDto) => void;
  isSubmittingExtraction: boolean;
  isDirectMode: boolean;
  handleOpenDirectWorkspace: (paperId: string) => void;

  autoExtractWithAI: (
    paperId: string,
    templateId: string
  ) => Promise<ExtractedValueDto[]>;
  isAutoExtracting: boolean;

  activeHighlights: PdfHighlightCoordinate[];
  setActiveHighlights: Dispatch<SetStateAction<PdfHighlightCoordinate[]>>;

  handleAskAiForField: (
    field: ExtractionFieldDto,
    matrixColumnId: string | null,
    matrixRowIndex: number | null
  ) => Promise<AskAiFieldResult | null>;
  isAskingAi: boolean;

  resolveConsensus: (
    paperId: string,
    finalValues: Record<string, ExtractionValue>
  ) => void;

  consensusWorkspace: ConsensusWorkspaceDto | null;
  isConsensusLoading: boolean;
  fetchConsensusWorkspace: (
    paperId: string
  ) => Promise<ConsensusWorkspaceDto | null>;
  submitConsensus: (
    paperId: string,
    payload: SubmitConsensusRequestDto
  ) => void;
  isSubmittingConsensus: boolean;

  reviewerWorkspace: ReviewerWorkspaceDto | null;
  isReviewerWorkspaceLoading: boolean;
  fetchReviewerWorkspace: (
    paperId: string
  ) => Promise<ReviewerWorkspaceDto | null>;

  addFieldComment: (
    paperId: string,
    fieldId: string,
    payload: AddCommentRequestDto
  ) => Promise<void>;
  isAddingFieldComment: boolean;

  exportExtractedData: () => void;
  isExporting: boolean;

  extractionPreview: ExtractionPreviewDto | null;
  isExtractionPreviewLoading: boolean;
  isExtractionPreviewFetching: boolean;
  fetchExtractionPreview: () => Promise<ExtractionPreviewDto | null>;

  awaitingConsensus: ExtractionStudyItem[];
  completedStudies: ExtractionStudyItem[];

  handleBack: () => void;
}