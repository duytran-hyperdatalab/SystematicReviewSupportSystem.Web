import type { SynthesisType } from "./synthesis";

export type SynthesisProcessStatus = "NotStarted" | "InProgress" | "Completed";

export type FindingStatus = "Draft" | "Finalized";

export interface SynthesisProcessDto {
  id: string;
  reviewProcessId: string;
  status: SynthesisProcessStatus;
  startedAt: string | null;
  completedAt: string | null;
}

export interface ThemeEvidenceDto {
  id: string;
  themeId: string;
  extractedDataValueId: string;
  paperTitle: string;
  fieldName: string;
  stringValue: string | null;
  numericValue: number | null;
  booleanValue: boolean | null;
  optionId: string | null;
  displayValue: string;
  notes: string | null;
  createdById: string;
  createdAt: string;
  modifiedAt: string;
}

export interface SynthesisThemeDto {
  id: string;
  name: string;
  description: string | null;
  colorCode: string | null;
  createdById: string;
  createdAt: string;
  modifiedAt: string;
  evidences: ThemeEvidenceDto[];
}

export interface ResearchQuestionFindingDto {
  id: string;
  researchQuestionId: string;
  questionText: string;
  answerText: string;
  status: FindingStatus;
  authorId: string;
  createdAt: string;
  modifiedAt: string;
}

export interface SynthesisWorkspaceDto {
  process: SynthesisProcessDto;
  themes: SynthesisThemeDto[];
  findings: ResearchQuestionFindingDto[];
}

export interface SourceDataValueDto {
  extractedDataValueId: string;
  paperId: string;
  paperTitle: string;
  stringValue: string | null;
  numericValue: number | null;
  booleanValue: boolean | null;
  optionId: string | null;
  displayValue: string;
}

export interface SourceDataGroupDto {
  fieldId: string;
  fieldName: string;
  values: SourceDataValueDto[];
}

export interface CreateThemeRequest {
  name: string;
  description?: string | null;
  colorCode?: string | null;
}

export interface UpdateThemeRequest {
  name: string;
  description?: string | null;
  colorCode?: string | null;
}

export interface AddEvidenceRequest {
  extractedDataValueId: string;
  notes?: string | null;
}

export interface SaveFindingRequest {
  answerText: string;
  status: FindingStatus;
}

export interface DataSynthesisStrategyDto {
  synthesisStrategyId: string;
  synthesisProcessId: string;
  synthesisType: SynthesisType;
  description: string;
  targetResearchQuestionIds: string[];
  dataGroupingPlan: string | null;
  sensitivityAnalysisPlan: string | null;
}

export interface UpsertSynthesisStrategyRequest {
  synthesisStrategyId?: string | null;
  synthesisProcessId: string;
  synthesisType: SynthesisType;
  description: string;
  targetResearchQuestionIds: string[];
  dataGroupingPlan?: string | null;
  sensitivityAnalysisPlan?: string | null;
}