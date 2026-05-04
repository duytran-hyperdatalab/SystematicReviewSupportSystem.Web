export interface QualityAssessmentAssignmentRequest {
    qualityAssessmentProcessId: string;
    userIds: string[];
    paperIds: string[];
}

export interface QualityAssessmentStrategy {
    qaStrategyId: string;
    reviewProcessId: string;
    description: string;
    checklists: QualityAssessmentChecklist[];
}

export interface QualityAssessmentChecklist {
    checklistId: string;
    qaStrategyId: string;
    name: string;
    criteria: QualityAssessmentCriterion[];
}

export interface QualityAssessmentCriterion {
    criterionId: string;
    checklistId: string;
    question: string;
}

export interface Paper {
    paperId: string;
    title: string;
    authors: string | null;
    abstract: string | null;
    doi: string | null;
    publicationType: string | null;
    publicationYear: string | null;
    publicationYearInt: number | null;
    publicationDate: string | null;
    volume: string | null;
    issue: string | null;
    pages: string | null;
    publisher: string | null;
    language: string | null;
    keywords: string | null;
    url: string | null;
    conferenceName: string | null;
    conferenceLocation: string | null;
    conferenceCountry: string | null;
    conferenceYear: number | null;
    journal: string | null;
    journalIssn: string | null;
    source: string | null;
    importedAt: string;
    importedBy: string;
    selectionStatus: number;
    selectionStatusText: string;
    pdfUrl: string | null;
    fullTextAvailable: boolean;
    accessType: number;
    accessTypeText: string;
    createdAt: string;
    modifiedAt: string;
}

// Response Types
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: ApiError[] | null;
}

export interface QAPaperResponse extends Paper {
    completionPercentage: number;
    decisions: QualityAssessmentDecisionResponse[];
    resolution?: QualityAssessmentResolutionResponse | null;
}

export interface LeaderQAPaperResponse extends Paper {
    reviewers: {
        id: string;
        username: string;
        fullname: string;
    }[];
    decisions: QualityAssessmentDecisionResponse[];
    resolution?: QualityAssessmentResolutionResponse | null;
    completionPercentage: number;
}

export interface CreateQualityAssessmentDecisionRequest {
    paperId: string;
    qualityAssessmentProcessId: string;
    notes: string | null;
    decisionItems: CreateQualityAssessmentDecisionItem[];
}

export interface CreateQualityAssessmentDecisionItem {
    qualityCriterionId: string;
    value: number;
    comment?: string | null;
    pdfHighlightCoordinates?: string | null;
}


export interface UpdateQualityAssessmentDecisionRequest {
    id: string;
    notes: string | null;
    decisionItems: UpdateQualityAssessmentDecisionItem[];
}

export interface UpdateQualityAssessmentDecisionItem {
    id: string | null;
    qualityCriterionId?: string;
    value: number;
    comment?: string | null;
    pdfHighlightCoordinates?: string | null;
}

export interface QualityAssessmentResolutionRequest {
    qualityAssessmentProcessId: string;
    paperId: string;
    finalDecision: number;
    finalScore: number;
    resolutionNotes?: string | null;
}

export interface UpdateQualityAssessmentResolutionRequest {
    id: string;
    finalDecision: number;
    finalScore: number;
    resolutionNotes?: string | null;
}

export interface AutoResolveQualityAssessmentRequest {
    qualityAssessmentProcessId: string;
    score?: number | null;
    percentage?: number | null;
}

export interface QualityAssessmentResolutionResponse {
    id: string;
    qualityAssessmentProcessId: string;
    paperId: string;
    finalDecision: number;
    finalScore: number;
    resolutionNotes: string | null;
    resolvedBy: string;
    resolvedByName: string;
    resolvedAt: string;
}

export interface QualityAssessmentDecisionResponse {
    id: string | null;
    reviewerId: string;
    reviewerName: string | null;
    paperId: string;
    score: number | null;
    decisionItems: QualityAssessmentDecisionItemResponse[];
}

export interface QualityAssessmentDecisionItemResponse {
    id: string | null;
    qualityCriterionId: string;
    criterionQuestion: string | null;
    value: number;
    comment: string | null;
    pdfHighlightCoordinates?: string | null;
}

export interface AiDecisionRequest {
    paperId: string;
}

export interface AiDecisionResponseItem {
    qualityCriterionId: string;
    value: number;
    comment: string;
    pdfHighlightCoordinates: string;
}

export interface QAReviewerProgressResponse {
    reviewerId: string;
    reviewerName: string | null;
    completionPercentage: number;
    completedPapers: number;
    inProgressPapers: number;
    notStartedPapers: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface QAMemberDashboardResponse {
    papers: PaginatedResponse<QAPaperResponse>;
    completionPercentage: number;
    totalPapers: number;
    completedPapers: number;
    inProgressPapers: number;
    notStartedPapers: number;
}

export interface LeaderQADashboardResponse {
    papers: PaginatedResponse<LeaderQAPaperResponse>;
    reviewerProgresses: QAReviewerProgressResponse[];
    completionPercentage: number;
    totalPapers: number;
    completedPapers: number;
    inProgressPapers: number;
    notStartedPapers: number;
}

export interface QADashboardParams {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
}