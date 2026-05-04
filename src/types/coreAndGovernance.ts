export type { DataSynthesisStrategy, ProjectTimetable } from "./synthesis";

// Core and Governance Types
export interface SystematicReviewProject {
  project_id: string;
  title: string;
  domain: string;
  description: string;
  status: "planning" | "in-progress" | "completed" | "on-hold";
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface ReviewNeed {
  need_id: string;
  project_id: string;
  description: string;
  justification: string;
  identified_by: string;
  created_at: string;
}

export interface CommissioningDocument {
  document_id: string;
  project_id: string;
  sponsor: string;
  scope: string;
  budget: number;
  document_url: string;
  created_at: string;
}

export interface ReviewObjective {
  objective_id: string;
  project_id: string;
  objective_statement: string;
  created_at: string;
}

export interface QuestionType {
  question_type_id: string;
  name: string;
  description: string;
}

export interface ResearchQuestion {
  research_question_id: string;
  project_id: string;
  question_type_id: string;
  question_text: string;
  rationale: string;
  created_at: string;
  question_type?: QuestionType;
}

export interface PICOCElement {
  picoc_id: string;
  research_question_id: string;
  element_type: "population" | "intervention" | "comparison" | "outcome" | "context";
  description: string;
}

export interface Population {
  population_id: string;
  picoc_id: string;
  description: string;
}

export interface Intervention {
  intervention_id: string;
  picoc_id: string;
  description: string;
}

export interface Comparison {
  comparison_id: string;
  picoc_id: string;
  description: string;
}

export interface Outcome {
  outcome_id: string;
  picoc_id: string;
  metric: string;
  description: string;
}

export interface Context {
  context_id: string;
  picoc_id: string;
  environment: string;
  description: string;
}

// Form types
export type CreateProjectInput = Omit<SystematicReviewProject, "project_id" | "created_at">;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateReviewNeedInput = Omit<ReviewNeed, "need_id" | "created_at">;
export type CreateCommissioningDocumentInput = Omit<
  CommissioningDocument,
  "document_id" | "created_at"
>;
export type CreateReviewObjectiveInput = Omit<ReviewObjective, "objective_id" | "created_at">;
export type CreateResearchQuestionInput = Omit<
  ResearchQuestion,
  "research_question_id" | "created_at" | "question_type"
>;
export type CreatePICOCElementInput = Omit<PICOCElement, "picoc_id">;
