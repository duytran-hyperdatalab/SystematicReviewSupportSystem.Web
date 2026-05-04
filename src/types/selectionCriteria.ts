import type { ApiResponse } from "./project";

export interface CriterionSource {
  sourceType: "PICOC" | "RQ";
  sourceId: string;
}

export interface CriterionItem {
  text: string;
  sources: CriterionSource[];
  localId?: string; // For FE internal use
}

export interface CriteriaGroup {
  description: string;
  inclusionCriteria: CriterionItem[];
  exclusionCriteria: CriterionItem[];
  localId?: string; // For FE internal use
  isAiGenerated?: boolean;
  isExpanded?: boolean;
}

export interface InclusionCriterionDto {
  inclusionId: string;
  criteriaId: string;
  rule: string;
}

export interface ExclusionCriterionDto {
  exclusionId: string;
  criteriaId: string;
  rule: string;
}

export interface StudySelectionCriteriaDto {
  criteriaId: string;
  studySelectionProcessId: string;
  description: string | null;
  inclusionCriteria: InclusionCriterionDto[];
  exclusionCriteria: ExclusionCriterionDto[];
}

export interface AICriteriaResponse {
  rawJson: string;
  criteriaGroups: CriteriaGroup[];
}

export interface SaveAiResultRequest {
  studySelectionProcessId: string;
  rawJson: string;
  criteriaGroups: {
    description: string;
    inclusionCriteria: string[];
    exclusionCriteria: string[];
  }[];
}

export type GenerateAICriteriaResponse = ApiResponse<AICriteriaResponse>;
export type GetSelectionCriteriaResponse = ApiResponse<StudySelectionCriteriaDto[]>;
