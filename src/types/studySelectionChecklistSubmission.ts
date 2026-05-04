import type { ApiResponse } from "./project";

export interface StudySelectionChecklistSubmissionItem {
  id: string;
  sectionId: string;
  text: string;
  order: number;
  isChecked: boolean;
}

export interface StudySelectionChecklistSubmissionSection {
  id: string;
  templateId: string;
  title: string;
  description: string;
  order: number;
  items: StudySelectionChecklistSubmissionItem[];
  isChecked: boolean;
}

export interface StudySelectionChecklistSubmissionContext {
  submissionId: string | null;
  isFromTemplate: boolean;
  checklistTemplateId: string;
  name: string;
  description: string;
  submittedAt: string | null;
  sections: StudySelectionChecklistSubmissionSection[];
}

export interface CreateStudySelectionChecklistSubmissionRequest {
  studySelectionProcessId: string;
  paperId: string;
  reviewerId: string;
  phase: number;
  checklistTemplateId: string;
  sectionAnswers: {
    sectionId: string;
    isChecked: boolean;
  }[];
  itemAnswers: {
    itemId: string;
    isChecked: boolean;
  }[];
}

export interface StudySelectionChecklistSubmissionDto {
  id: string;
  studySelectionProcessId: string;
  paperId: string;
  reviewerId: string;
  phase: number;
  checklistTemplateId: string;
  submittedAt: string;
  sectionAnswers: {
    sectionId: string;
    isChecked: boolean;
  }[];
  itemAnswers: {
    itemId: string;
    isChecked: boolean;
  }[];
}

export type GetStudySelectionChecklistSubmissionContextResponse = ApiResponse<StudySelectionChecklistSubmissionContext>;
export type CreateStudySelectionChecklistSubmissionResponse = ApiResponse<StudySelectionChecklistSubmissionDto>;
export type GetReviewerSubmissionResponse = ApiResponse<StudySelectionChecklistSubmissionContext>;
