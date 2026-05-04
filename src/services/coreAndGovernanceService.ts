import api from "../config/axios";

import type {
  ReviewNeed,
  CreateReviewNeedInput,
  CommissioningDocument,
  CreateCommissioningDocumentInput,
  ReviewObjective,
  CreateReviewObjectiveInput,
  ResearchQuestion,
  CreateResearchQuestionInput,
  QuestionType,
  PICOCElement,
  CreatePICOCElementInput,
} from "../types/coreAndGovernance";

// API Response Types (for Backend API)
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors?: ApiError[];
}

interface ApiError {
  field?: string;
  message: string;
}

// ==================== PROPERTY MAPPING HELPERS — GOVERNANCE ====================

function mapReviewNeedFromBackend(d: any): ReviewNeed {
  return {
    need_id: d.needId,
    project_id: d.projectId,
    description: d.description,
    justification: d.justification,
    identified_by: d.identifiedBy,
    created_at: d.createdAt,
  };
}

function mapReviewNeedToBackend(data: CreateReviewNeedInput): any {
  return {
    projectId: data.project_id,
    description: data.description,
    justification: data.justification,
    identifiedBy: data.identified_by,
  };
}

function mapCommissioningDocumentFromBackend(d: any): CommissioningDocument {
  return {
    document_id: d.documentId,
    project_id: d.projectId,
    sponsor: d.sponsor,
    scope: d.scope,
    budget: d.budget,
    document_url: d.documentUrl,
    created_at: d.createdAt,
  };
}

function mapCommissioningDocumentToBackend(data: CreateCommissioningDocumentInput): any {
  return {
    projectId: data.project_id,
    sponsor: data.sponsor,
    scope: data.scope,
    budget: data.budget,
    documentUrl: data.document_url,
  };
}

function mapReviewObjectiveFromBackend(d: any): ReviewObjective {
  return {
    objective_id: d.objectiveId,
    project_id: d.projectId,
    objective_statement: d.objectiveStatement,
    created_at: d.createdAt,
  };
}

function mapReviewObjectiveToBackend(data: CreateReviewObjectiveInput): any {
  return {
    projectId: data.project_id,
    objectiveStatement: data.objective_statement,
  };
}

function mapQuestionTypeFromBackend(d: any): QuestionType {
  return {
    question_type_id: d.questionTypeId,
    name: d.name,
    description: d.description,
  };
}

function mapResearchQuestionFromBackend(d: any): ResearchQuestion {
  return {
    research_question_id: d.researchQuestionId,
    project_id: d.projectId,
    question_type_id: d.questionTypeId,
    question_text: d.questionText,
    rationale: d.rationale,
    created_at: d.createdAt,
    question_type: d.questionType ? mapQuestionTypeFromBackend(d.questionType) : undefined,
  };
}

function mapResearchQuestionToBackend(data: CreateResearchQuestionInput): any {
  return {
    projectId: data.project_id,
    questionTypeId: data.question_type_id,
    questionText: data.question_text,
    rationale: data.rationale,
  };
}

function mapPicocElementFromBackend(d: any): PICOCElement {
  return {
    picoc_id: d.picocId,
    research_question_id: d.researchQuestionId,
    element_type: d.elementType,
    description: d.description,
  };
}

function mapPicocElementToBackend(data: CreatePICOCElementInput): any {
  return {
    researchQuestionId: data.research_question_id,
    elementType: data.element_type,
    description: data.description,
  };
}

// ==================== CORE & GOVERNANCE BE SERVICE ====================

const GOVERN_BASE = "core-govern";

export const coreAndGovernanceService = {
  // ── Review Needs ────────────────────────────────────────────────────────

  async getReviewNeeds(projectId: string): Promise<ApiResponse<ReviewNeed[]>> {
    const response = await api.get<ApiResponse<any[]>>(
      `${GOVERN_BASE}/review-needs/project/${projectId}`,
    );
    return { ...response.data, data: response.data.data.map(mapReviewNeedFromBackend) };
  },

  async createReviewNeed(data: CreateReviewNeedInput): Promise<ApiResponse<ReviewNeed>> {
    const response = await api.post<ApiResponse<any>>(
      `${GOVERN_BASE}/review-needs`,
      mapReviewNeedToBackend(data),
    );
    return { ...response.data, data: mapReviewNeedFromBackend(response.data.data) };
  },

  async deleteReviewNeed(needId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`${GOVERN_BASE}/review-needs/${needId}`);
    return response.data;
  },

  // ── Commissioning Documents ─────────────────────────────────────────────

  async getDocuments(projectId: string): Promise<ApiResponse<CommissioningDocument[]>> {
    const response = await api.get<ApiResponse<any[]>>(
      `${GOVERN_BASE}/commissioning-documents/project/${projectId}`,
    );

    return { ...response.data, data: response.data.data.map(mapCommissioningDocumentFromBackend) };
  },

  async createDocument(
    data: CreateCommissioningDocumentInput,
  ): Promise<ApiResponse<CommissioningDocument>> {
    const response = await api.post<ApiResponse<any>>(
      `${GOVERN_BASE}/commissioning-documents`,
      mapCommissioningDocumentToBackend(data),
    );
    return { ...response.data, data: mapCommissioningDocumentFromBackend(response.data.data) };
  },

  async deleteDocument(documentId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `${GOVERN_BASE}/commissioning-documents/${documentId}`,
    );
    return response.data;
  },

  // ── Review Objectives ───────────────────────────────────────────────────

  async getObjectives(projectId: string): Promise<ApiResponse<ReviewObjective[]>> {
    const response = await api.get<ApiResponse<any[]>>(
      `${GOVERN_BASE}/review-objectives/project/${projectId}`,
    );
    return { ...response.data, data: response.data.data.map(mapReviewObjectiveFromBackend) };
  },

  async createObjective(data: CreateReviewObjectiveInput): Promise<ApiResponse<ReviewObjective>> {
    const response = await api.post<ApiResponse<any>>(
      `${GOVERN_BASE}/review-objectives`,
      mapReviewObjectiveToBackend(data),
    );
    return { ...response.data, data: mapReviewObjectiveFromBackend(response.data.data) };
  },

  async deleteObjective(objectiveId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `${GOVERN_BASE}/review-objectives/${objectiveId}`,
    );
    return response.data;
  },

  // ── Research Questions ──────────────────────────────────────────────────

  async getResearchQuestions(projectId: string): Promise<ApiResponse<ResearchQuestion[]>> {
    const response = await api.get<ApiResponse<any[]>>(`/research-questions/project/${projectId}`);
    return { ...response.data, data: response.data.data.map(mapResearchQuestionFromBackend) };
  },

  async createResearchQuestion(
    data: CreateResearchQuestionInput,
  ): Promise<ApiResponse<ResearchQuestion>> {
    const response = await api.post<ApiResponse<any>>(
      `${GOVERN_BASE}/research-questions`,
      mapResearchQuestionToBackend(data),
    );
    return { ...response.data, data: mapResearchQuestionFromBackend(response.data.data) };
  },

  async deleteResearchQuestion(questionId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `${GOVERN_BASE}/research-questions/${questionId}`,
    );
    return response.data;
  },

  // ── Question Types ──────────────────────────────────────────────────────

  async getQuestionTypes(): Promise<ApiResponse<QuestionType[]>> {
    const response = await api.get<ApiResponse<any[]>>(`${GOVERN_BASE}/question-types`);
    return { ...response.data, data: response.data.data.map(mapQuestionTypeFromBackend) };
  },

  async updateQuestionType(
    id: string,
    data: Partial<Pick<QuestionType, "name" | "description">>,
  ): Promise<ApiResponse<QuestionType>> {
    const response = await api.put<ApiResponse<any>>(`${GOVERN_BASE}/question-types/${id}`, data);
    return { ...response.data, data: mapQuestionTypeFromBackend(response.data.data) };
  },

  // ── PICOC Elements ──────────────────────────────────────────────────────

  async getPicocElements(questionId: string): Promise<ApiResponse<PICOCElement[]>> {
    const response = await api.get<ApiResponse<any[]>>(
      `${GOVERN_BASE}/picoc-elements/research-question/${questionId}`,
    );
    return { ...response.data, data: response.data.data.map(mapPicocElementFromBackend) };
  },

  async createPicocElement(data: CreatePICOCElementInput): Promise<ApiResponse<PICOCElement>> {
    const response = await api.post<ApiResponse<any>>(
      `${GOVERN_BASE}/picoc-elements`,
      mapPicocElementToBackend(data),
    );
    return { ...response.data, data: mapPicocElementFromBackend(response.data.data) };
  },

  async deletePicocElement(picocId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `${GOVERN_BASE}/picoc-elements/${picocId}`,
    );
    return response.data;
  },
};
