import type { ApiResponse } from "./project";

export interface StudySelectionChecklistItem {
  id: string;
  sectionId: string;
  text: string;
  order: number;
}

export interface StudySelectionChecklistTemplateSection {
  id: string;
  templateId: string;
  title: string;
  description: string;
  order: number;
  items: StudySelectionChecklistItem[];
}

export interface StudySelectionChecklistTemplate {
  id: string;
  projectId: string;
  name: string;
  description: string;
  version: number;
  isActive: boolean;
  sections?: StudySelectionChecklistTemplateSection[];
}

export interface CreateStudySelectionChecklistTemplateRequest {
  name: string;
  description: string;
  sections: {
    title: string;
    description: string;
    order: number;
    items: {
      text: string;
      order: number;
    }[];
  }[];
}

export const ScreeningPhase = {
  TitleAbstract: 0,
  FullText: 1,
} as const;

export type ScreeningPhase = (typeof ScreeningPhase)[keyof typeof ScreeningPhase];

export type GetStudySelectionChecklistTemplateResponse = ApiResponse<StudySelectionChecklistTemplate[]>;
export type GetStudySelectionChecklistTemplateDetailResponse = ApiResponse<StudySelectionChecklistTemplate>;
export type CreateStudySelectionChecklistTemplateResponse = ApiResponse<StudySelectionChecklistTemplate>;

