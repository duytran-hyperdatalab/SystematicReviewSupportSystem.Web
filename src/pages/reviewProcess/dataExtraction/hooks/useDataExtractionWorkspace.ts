import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import { useReviewProcess } from "../../../../hooks/useReviewProcesses";
import { projectService } from "../../../../services/projectService";
import { paperService } from "../../../../services/paperService";
import { dataExtractionConductingService } from "../../../../services/dataExtractionConductingService";
import { dataExtractionProcessService } from "../../../../services/dataExtractionProcessService";
import { dataExtractionTemplateService } from "../../../../services/dataExtractionService";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import { getErrorMessage } from "../../../../utils/errorUtils";
import { toastError, toastSuccess } from "../../../../utils/toast";
import { ProjectRole } from "../../../../types/project";
import type { PaperResponse } from "../../../../types/paper";
import {
  type AddCommentRequestDto,
  type ExtractionCommentDto,
  type AskAiFieldRequestDto,
  type AssignReviewersDto,
  type ConsensusWorkspaceDto,
  type ExtractedValueDto,
  type ExtractionDashboardFilterDto,
  type ExtractionDashboardTaskDto,
  type ExtractionFieldDto,
  type ExtractionPreviewDto,
  type ReopenExtractionRequestDto,
  type ReviewerWorkspaceDto,
  type TargetReviewer,
  type SubmitExtractionRequestDto,
  type ExtractionTemplateDto,
  type SubmitConsensusRequestDto,
  FieldTypeEnum,
} from "../../../../types/dataExtraction";
import { FullTextRetrievalStatus, PaperSelectionStatus } from "../../../../types/studySelection";
import type { PaperWithDecisionsResponse } from "../../../../types/studySelection";
import type {
  ExtractionMode,
  ExtractionPaperRecord,
  ExtractionPaperStatus,
  ExtractionStudyItem,
  ExtractionValue,
  FlattenedExtractionField,
  ReviewerOption,
  UseDataExtractionWorkspaceReturn,
} from "../types";
import { mapExtractedValueToFormValue } from "../components/reviewerWorkspace/reviewerFormUtils";

const DASHBOARD_QUERY_KEY = ["data-extraction-conducting", "dashboard"] as const;
const UNIQUE_PAPERS_DETAIL_QUERY_KEY =
  ["data-extraction-conducting", "unique-papers-detail"] as const;
const EXTRACTION_PREVIEW_QUERY_KEY =
  ["data-extraction-conducting", "export-preview"] as const;
const WORKLOAD_SUMMARY_QUERY_KEY =
  ["data-extraction-conducting", "workload-summary"] as const;
const REVIEWER_WORKSPACE_QUERY_KEY =
  ["data-extraction-conducting", "reviewer-workspace"] as const;
const MEMBERS_QUERY_KEY = ["data-extraction-conducting", "members"] as const;
const TEMPLATES_QUERY_KEY = ["data-extraction-conducting", "templates"] as const;
const DEFAULT_PAGE_SIZE = 10;

const EMPTY_TEMPLATES: ExtractionTemplateDto[] = [];

const EMPTY_SUMMARY = {
  totalIncluded: 0,
  inProgress: 0,
  awaitingConsensus: 0,
  completed: 0,
};

const FieldTypeMap: Record<number, string> = {
  [FieldTypeEnum.Text]: "Text",
  [FieldTypeEnum.Integer]: "Integer",
  [FieldTypeEnum.Decimal]: "Decimal",
  [FieldTypeEnum.Boolean]: "Boolean",
  [FieldTypeEnum.SingleSelect]: "SingleSelect",
  [FieldTypeEnum.MultiSelect]: "MultiSelect",
};

function normalizePaperStatus(status: string | undefined): ExtractionPaperStatus {
  const normalized = (status ?? "").trim().toLowerCase();

  if (normalized === "in-progress" || normalized === "inprogress") {
    return "in-progress";
  }

  if (normalized === "awaiting-consensus" || normalized === "awaitingconsensus") {
    return "awaiting-consensus";
  }

  if (normalized === "completed") {
    return "completed";
  }

  return "todo";
}

function buildEmptyRecord(
  paperId: string,
  status: ExtractionPaperStatus = "todo",
  assigneeId: string | null = null,
  assigneeName: string | null = null
): ExtractionPaperRecord {
  return {
    paperId,
    assigneeId,
    assigneeName,
    status,
    draftsByReviewer: {},
    submissions: [],
    finalValues: {},
    conflictFieldIds: [],
    updatedAt: new Date().toISOString(),
  };
}

function flattenFields(fields: ExtractionFieldDto[], depth = 0): FlattenedExtractionField[] {
  const sorted = [...fields].sort((a, b) => a.orderIndex - b.orderIndex);
  return sorted.flatMap((field) => {
    const children = flattenFields(field.subFields ?? [], depth + 1);
    return [{ field, depth }, ...children];
  });
}

function getTemplateFields(template: ExtractionTemplateDto | null | undefined): ExtractionFieldDto[] {
  if (!template) {
    return [];
  }

  const sectionFields = (template.sections ?? []).flatMap((section) => section.fields ?? []);

  if (sectionFields.length > 0) {
    return sectionFields;
  }

  return template.fields ?? [];
}

function mapTaskToRawPaper(
  task: ExtractionDashboardTaskDto,
  paperDetail?: PaperResponse | null
): PaperWithDecisionsResponse {
  const parsedPublicationYear = paperDetail?.publicationYear
    ? Number.parseInt(paperDetail.publicationYear, 10)
    : null;
  const publicationYear =
    paperDetail?.publicationYearInt ??
    (Number.isNaN(parsedPublicationYear ?? Number.NaN)
      ? null
      : parsedPublicationYear);

  return {
    paperId: task.paperId,
    title: paperDetail?.title ?? task.title,
    doi: paperDetail?.doi ?? null,
    authors: paperDetail?.authors ?? task.authors ?? null,
    publicationYear: publicationYear ?? task.publicationYear ?? null,
    publicationDate: paperDetail?.publicationDate ?? null,
    abstract: paperDetail?.abstract ?? null,
    journal: paperDetail?.journal ?? null,
    source: paperDetail?.source ?? null,
    keywords: paperDetail?.keywords ?? null,
    publicationType: paperDetail?.publicationType ?? null,
    volume: paperDetail?.volume ?? null,
    issue: paperDetail?.issue ?? null,
    pages: paperDetail?.pages ?? null,
    publisher: paperDetail?.publisher ?? null,
    language: paperDetail?.language ?? null,
    url: paperDetail?.url ?? null,
    pdfUrl: paperDetail?.pdfUrl ?? task.pdfUrl ?? null,
    pdfFileName: null,
    conferenceName: paperDetail?.conferenceName ?? null,
    conferenceLocation: paperDetail?.conferenceLocation ?? null,
    journalIssn: paperDetail?.journalIssn ?? null,
    journalEIssn: null,
    md5: null,
    status: PaperSelectionStatus.Included,
    statusText: "Included",
    finalDecision: null,
    finalDecisionText: null,
    citationCount: 0,
    referenceCount: 0,
    decisions: [],
    resolution: null,
    extraction: null,
    metadataSources: null,
    extractionResult: null,
    fullTextRetrievalStatus: (paperDetail?.fullTextRetrievalStatus as FullTextRetrievalStatus) ?? FullTextRetrievalStatus.Unknown,
    fullTextRetrievalStatusText: paperDetail?.fullTextRetrievalStatusText ?? "Unknown",
  };
}

function mapTaskToStudy(
  task: ExtractionDashboardTaskDto,
  paperDetail?: PaperResponse | null
): ExtractionStudyItem {
  const raw = mapTaskToRawPaper(task, paperDetail);

  return {
    paperId: task.paperId,
    title: raw.title,
    authors: raw.authors,
    publicationYear: raw.publicationYear,
    pdfUrl: raw.pdfUrl,
    source: raw.source,
    raw,
  };
}

function normalizeConsensusWorkspace(
  workspace: ConsensusWorkspaceDto
): ConsensusWorkspaceDto {
  return {
    ...workspace,
    sections: (workspace.sections ?? []).map((section) => ({
      ...section,
      fields: (section.fields ?? []).map((field) => ({
        ...field,
        answers: (field.answers ?? []).map((answerGroup) => ({
          ...answerGroup,
          reviewer1Answer: answerGroup.reviewer1Answer
            ? {
                ...answerGroup.reviewer1Answer,
                comments: (answerGroup.reviewer1Answer.comments ?? []).map((comment) => ({
                  ...comment,
                })),
              }
            : null,
          reviewer2Answer: answerGroup.reviewer2Answer
            ? {
                ...answerGroup.reviewer2Answer,
                comments: (answerGroup.reviewer2Answer.comments ?? []).map((comment) => ({
                  ...comment,
                })),
              }
            : null,
          finalAnswer: answerGroup.finalAnswer
            ? { ...answerGroup.finalAnswer }
            : null,
        })),
      })),
    })),
  };
}

function normalizeReviewerWorkspace(
  workspace: ReviewerWorkspaceDto
): ReviewerWorkspaceDto {
  return {
    ...workspace,
    sections: (workspace.sections ?? []).map((section) => ({
      ...section,
      fields: (section.fields ?? []).map((field) => ({
        ...field,
        answers: (field.answers ?? []).map((answerGroup) => ({
          ...answerGroup,
          answer: answerGroup.answer
            ? {
                ...answerGroup.answer,
                comments: (answerGroup.answer.comments ?? []).map((comment) => ({
                  ...comment,
                })),
              }
            : null,
        })),
      })),
    })),
  };
}

function appendCommentToConsensusWorkspace(
  workspace: ConsensusWorkspaceDto,
  fieldId: string,
  matrixColumnId: string | null,
  matrixRowIndex: number | null,
  threadOwnerId: string,
  comment: ExtractionCommentDto
): ConsensusWorkspaceDto {
  const isReviewer1Thread =
    Boolean(workspace.reviewer1Id) && workspace.reviewer1Id === threadOwnerId;
  const isReviewer2Thread =
    Boolean(workspace.reviewer2Id) && workspace.reviewer2Id === threadOwnerId;
  const isFinalDecisionThread = !isReviewer1Thread && !isReviewer2Thread;

  return {
    ...workspace,
    sections: (workspace.sections ?? []).map((section) => ({
      ...section,
      fields: (section.fields ?? []).map((field) => ({
        ...field,
        answers: (field.answers ?? []).map((answerGroup) => {
          const matchesTargetField = field.fieldId === fieldId;
          const matchesMatrixColumn =
            (answerGroup.matrixColumnId ?? null) === matrixColumnId;
          const matchesMatrixRow =
            (answerGroup.matrixRowIndex ?? null) === matrixRowIndex;

          if (!matchesTargetField || !matchesMatrixColumn || !matchesMatrixRow) {
            return answerGroup;
          }

          return {
            ...answerGroup,
            reviewer1Answer:
              isReviewer1Thread && answerGroup.reviewer1Answer
                ? {
                    ...answerGroup.reviewer1Answer,
                    comments: [
                      ...(answerGroup.reviewer1Answer.comments ?? []),
                      comment,
                    ],
                  }
                : answerGroup.reviewer1Answer,
            reviewer2Answer:
              isReviewer2Thread && answerGroup.reviewer2Answer
                ? {
                    ...answerGroup.reviewer2Answer,
                    comments: [
                      ...(answerGroup.reviewer2Answer.comments ?? []),
                      comment,
                    ],
                  }
                : answerGroup.reviewer2Answer,
            finalAnswer:
              isFinalDecisionThread && answerGroup.finalAnswer
                ? {
                    ...answerGroup.finalAnswer,
                    comments: [
                      ...(answerGroup.finalAnswer.comments ?? []),
                      comment,
                    ],
                  }
                : answerGroup.finalAnswer,
          };
        }),
      })),
    })),
  };
}

function appendCommentToReviewerWorkspace(
  workspace: ReviewerWorkspaceDto,
  fieldId: string,
  matrixColumnId: string | null,
  matrixRowIndex: number | null,
  threadOwnerId: string,
  comment: ExtractionCommentDto
): ReviewerWorkspaceDto {
  if (!workspace.reviewerId || workspace.reviewerId !== threadOwnerId) {
    return workspace;
  }

  return {
    ...workspace,
    sections: (workspace.sections ?? []).map((section) => ({
      ...section,
      fields: (section.fields ?? []).map((field) => ({
        ...field,
        answers: (field.answers ?? []).map((answerGroup) => {
          const matchesTargetField = field.fieldId === fieldId;
          const matchesMatrixColumn =
            (answerGroup.matrixColumnId ?? null) === matrixColumnId;
          const matchesMatrixRow =
            (answerGroup.matrixRowIndex ?? null) === matrixRowIndex;

          if (!matchesTargetField || !matchesMatrixColumn || !matchesMatrixRow) {
            return answerGroup;
          }

          return {
            ...answerGroup,
            answer: answerGroup.answer
              ? {
                  ...answerGroup.answer,
                  comments: [...(answerGroup.answer.comments ?? []), comment],
                }
              : answerGroup.answer,
          };
        }),
      })),
    })),
  };
}

export function useDataExtractionWorkspace(): UseDataExtractionWorkspaceReturn {
  const { projectId, processId, studyId } = useParams<{
    projectId: string;
    processId: string;
    studyId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserId = useSelector(
    (state: RootState) => state.auth.user?.id ?? null
  );
  const currentUserName = useSelector(
    (state: RootState) =>
      state.auth.user?.username ?? state.auth.user?.name ?? "You"
  );
  const isDirectMode = searchParams.get("mode") === "direct";

  const {
    process: reviewProcess,
    isLoading: reviewProcessLoading,
    error: reviewProcessError,
  } = useReviewProcess(processId);

  const [activeTab, setActiveTab] = useState<UseDataExtractionWorkspaceReturn["activeTab"]>("dashboard");
  const [selectedTemplateIdState, setSelectedTemplateIdState] = useState("");
  const [selectedPaperIdState, setSelectedPaperIdState] = useState("");
  const [activeReviewerIdState, setActiveReviewerIdState] = useState("");
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>("double");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [activeHighlights, setActiveHighlights] = useState<
    UseDataExtractionWorkspaceReturn["activeHighlights"]
  >([]);
  const extractionProcessId = reviewProcess?.dataExtractionProcess?.id;
  const dashboardPath = useMemo(() => {
    if (!projectId || !processId) {
      return "/projects";
    }

    return `/projects/${projectId}/processes/${processId}/extraction`;
  }, [processId, projectId]);

  const handleBack = useCallback(() => {
    if (projectId && processId) {
      navigate(`/projects/${projectId}/processes/${processId}`);
      return;
    }

    navigate("/projects");
  }, [navigate, projectId, processId]);

  const projectMembersQuery = useQuery({
    queryKey: [...MEMBERS_QUERY_KEY, projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required to load members");
      }

      const response = await projectService.getProjectMembers(projectId, {
        pageNumber: 1,
        pageSize: 100,
      });

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to load project members");
      }

      return response.data.items;
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });

  const projectMembers = useMemo(
    () => projectMembersQuery.data ?? [],
    [projectMembersQuery.data]
  );

  const isCurrentUserLeader = useMemo(() => {
    if (!currentUserId) {
      return false;
    }

    const currentMember = projectMembers.find(
      (member) => member.userId === currentUserId
    );

    return currentMember?.role === ProjectRole.Leader;
  }, [currentUserId, projectMembers]);

  const dashboardQuery = useQuery({
    queryKey: [
      ...DASHBOARD_QUERY_KEY,
      extractionProcessId,
      searchQuery,
      statusFilter,
      pageNumber,
      pageSize,
    ],
    queryFn: async () => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to load dashboard");
      }

      const filters: ExtractionDashboardFilterDto = {
        pageNumber,
        pageSize,
      };

      const normalizedSearch = searchQuery.trim();
      if (normalizedSearch) {
        filters.searchQuery = normalizedSearch;
      }

      if (statusFilter.trim()) {
        filters.statusFilter = statusFilter;
      }

      const response = await dataExtractionConductingService.getDashboard(
        extractionProcessId,
        filters
      );

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to load extraction dashboard");
      }

      return response.data;
    },
    enabled: !!extractionProcessId,
    placeholderData: (previousData) => previousData,
  });

  const uniquePaperDetailsQuery = useQuery({
    queryKey: [
      ...UNIQUE_PAPERS_DETAIL_QUERY_KEY,
      extractionProcessId,
      searchQuery,
      pageNumber,
      pageSize,
    ],
    queryFn: async () => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to load unique papers");
      }

      const normalizedSearch = searchQuery.trim();
      const response = await paperService.getDataExtractionUniquePapers({
        dataExtractionProcessId: extractionProcessId,
        search: normalizedSearch || undefined,
        pageNumber,
        pageSize,
      });

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to load unique papers");
      }

      return response.data;
    },
    enabled: !!extractionProcessId,
    placeholderData: (previousData) => previousData,
    staleTime: 60_000,
  });

  const extractionPreviewQuery = useQuery({
    queryKey: [...EXTRACTION_PREVIEW_QUERY_KEY, extractionProcessId],
    queryFn: async () => {
      if (!extractionProcessId) {
        throw new Error(
          "Data extraction process ID is required to load extraction preview"
        );
      }

      const response = await dataExtractionConductingService.getExtractionPreview(
        extractionProcessId
      );

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to load extraction preview");
      }

      return response.data;
    },
    enabled: false,
  });

  const workloadSummaryQuery = useQuery({
    queryKey: [...WORKLOAD_SUMMARY_QUERY_KEY, extractionProcessId],
    queryFn: async () => {
      if (!extractionProcessId) {
        throw new Error(
          "Data extraction process ID is required to load workload summary"
        );
      }

      const response = await dataExtractionConductingService.getWorkloadSummary(
        extractionProcessId
      );

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to load workload summary");
      }

      return response.data;
    },
    enabled: !!extractionProcessId,
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });

  const assignReviewersMutation = useMutation({
    mutationFn: async (variables: { paperId: string; payload: AssignReviewersDto }) => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to assign reviewers");
      }

      const response = await dataExtractionConductingService.assignReviewers(
        extractionProcessId,
        variables.paperId,
        variables.payload
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to assign reviewers");
      }

      return response;
    },
    onSuccess: async () => {
      if (!extractionProcessId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [...DASHBOARD_QUERY_KEY, extractionProcessId],
      });
      await queryClient.invalidateQueries({
        queryKey: [...WORKLOAD_SUMMARY_QUERY_KEY, extractionProcessId],
      });
    },
    onError: (error) => {
      toastError(
        "Assign reviewers failed",
        getErrorMessage(error, "Unable to assign reviewers right now.")
      );
    },
  });

  const reopenExtractionMutation = useMutation({
    mutationFn: async (variables: {
      paperId: string;
      payload: ReopenExtractionRequestDto;
    }) => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to reopen extraction");
      }

      const response = await dataExtractionConductingService.reopenExtraction(
        extractionProcessId,
        variables.paperId,
        variables.payload
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to reopen extraction task");
      }

      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: WORKLOAD_SUMMARY_QUERY_KEY,
      });

      toastSuccess("Paper reopened successfully");
    },
    onError: (error) => {
      toastError(
        "Reopen failed",
        getErrorMessage(error, "Unable to reopen extraction right now.")
      );
    },
  });

  const completePhaseMutation = useMutation({
    mutationFn: async () => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to complete phase");
      }

      return dataExtractionProcessService.completeProcess(extractionProcessId);
    },
    onSuccess: async () => {
      if (processId) {
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.reviewProcesses.detail(processId),
        });
      }
      await queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: WORKLOAD_SUMMARY_QUERY_KEY });

      toastSuccess("Data extraction phase completed", "Extraction data is now locked.");
    },
    onError: (error) => {
      toastError(
        "Complete phase failed",
        getErrorMessage(error, "Unable to complete data extraction phase right now.")
      );
    },
  });

  const submitExtractionMutation = useMutation({
    mutationFn: async (variables: {
      paperId: string;
      payload: SubmitExtractionRequestDto;
    }) => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to submit extraction");
      }

      const response = await dataExtractionConductingService.submitExtraction(
        extractionProcessId,
        variables.paperId,
        variables.payload
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to submit extraction");
      }

      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: WORKLOAD_SUMMARY_QUERY_KEY,
      });

      toastSuccess("Extraction submitted successfully!");

      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 500);
      });

      handleBack();
    },
    onError: (error) => {
      toastError(
        "Submit extraction failed",
        getErrorMessage(error, "Unable to submit extraction right now.")
      );
    },
  });

  const directExtractMutation = useMutation({
    mutationFn: async (variables: {
      paperId: string;
      payload: SubmitExtractionRequestDto;
    }) => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to submit direct extraction");
      }

      const response = await dataExtractionConductingService.directExtractByLeader(
        extractionProcessId,
        variables.paperId,
        variables.payload
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to submit direct extraction");
      }

      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: WORKLOAD_SUMMARY_QUERY_KEY,
      });

      toastSuccess("Direct extraction completed successfully!");
      navigate(dashboardPath);
    },
    onError: (error) => {
      toastError(
        "Direct extraction failed",
        getErrorMessage(error, "Unable to complete direct extraction right now.")
      );
    },
  });

  const submitConsensusMutation = useMutation({
    mutationFn: async (variables: {
      paperId: string;
      payload: SubmitConsensusRequestDto;
    }) => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to submit consensus");
      }

      const response = await dataExtractionConductingService.submitConsensus(
        extractionProcessId,
        variables.paperId,
        variables.payload
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to submit consensus");
      }

      return response;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: WORKLOAD_SUMMARY_QUERY_KEY,
      });

      toastSuccess("Consensus submitted successfully!");

      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 500);
      });

      handleBack();
    },
    onError: (error) => {
      toastError(
        "Submit consensus failed",
        getErrorMessage(error, "Unable to submit consensus right now.")
      );
    },
  });

  const reviewerOptions = useMemo<ReviewerOption[]>(() => {
    const options = projectMembers
      .filter((member) => member.role === ProjectRole.Member)
      .map((member) => ({
        id: member.userId,
        name: member.userName
          ? `${member.userName}`
          : member.fullName?.trim() || member.email || "Unknown",
      }));

    return options;
  }, [projectMembers]);

  const reviewerNameById = useMemo(
    () =>
      projectMembers.reduce<Record<string, string>>((accumulator, member) => {
        accumulator[member.userId] = member.userName
          ? `${member.userName}`
          : member.fullName?.trim() || member.email || "Unknown";
        return accumulator;
      }, {}),
    [projectMembers]
  );

  const effectiveActiveReviewerId = useMemo(() => {
    if (
      activeReviewerIdState &&
      reviewerOptions.some((reviewer) => reviewer.id === activeReviewerIdState)
    ) {
      return activeReviewerIdState;
    }

    return reviewerOptions[0]?.id ?? "";
  }, [activeReviewerIdState, reviewerOptions]);

  const templatesQuery = useQuery({
    queryKey: [...TEMPLATES_QUERY_KEY, extractionProcessId],
    queryFn: async () => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to load extraction templates");
      }

      return dataExtractionTemplateService.getByProcessId(extractionProcessId);
    },
    enabled: !!extractionProcessId,
    staleTime: 60_000,
  });

  const templates = useMemo(
    () => templatesQuery.data ?? EMPTY_TEMPLATES,
    [templatesQuery.data]
  );

  const effectiveSelectedTemplateId = useMemo(() => {
    if (
      selectedTemplateIdState &&
      templates.some((template) => template.templateId === selectedTemplateIdState)
    ) {
      return selectedTemplateIdState;
    }

    return templates.at(-1)?.templateId ?? "";
  }, [selectedTemplateIdState, templates]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.templateId === effectiveSelectedTemplateId) ?? null,
    [templates, effectiveSelectedTemplateId]
  );

  const allFields = useMemo(
    () => flattenFields(getTemplateFields(selectedTemplate)),
    [selectedTemplate]
  );

  const answerFields = useMemo(
    () =>
      allFields.filter(
        (item) => (item.field.subFields ?? []).length === 0 && !!item.field.fieldId
      ),
    [allFields]
  );

  const dashboardItems = dashboardQuery.data?.tasks.items;
  const dashboardTasks = useMemo(
    () => dashboardItems ?? [],
    [dashboardItems]
  );
  const dashboardTotalCount = dashboardQuery.data?.tasks.totalCount ?? 0;
  const dashboardTotalPages = dashboardQuery.data?.tasks.totalPages ?? 1;

  const uniquePaperDetailsById = useMemo(() => {
    const map: Record<string, PaperResponse> = {};

    (uniquePaperDetailsQuery.data?.items ?? []).forEach((paper) => {
      map[paper.id] = paper;
    });

    return map;
  }, [uniquePaperDetailsQuery.data?.items]);

  const studies = useMemo(
    () =>
      dashboardTasks.map((task) =>
        mapTaskToStudy(task, uniquePaperDetailsById[task.paperId] ?? null)
      ),
    [dashboardTasks, uniquePaperDetailsById]
  );

  const effectiveSelectedPaperId = useMemo(() => {
    if (studyId) {
      return studies.some((study) => study.paperId === studyId) ? studyId : "";
    }

    if (
      selectedPaperIdState &&
      studies.some((study) => study.paperId === selectedPaperIdState)
    ) {
      return selectedPaperIdState;
    }

    return studies[0]?.paperId ?? "";
  }, [selectedPaperIdState, studies, studyId]);

  const selectedStudy = useMemo(
    () => studies.find((study) => study.paperId === effectiveSelectedPaperId) ?? null,
    [studies, effectiveSelectedPaperId]
  );

  const dashboardTaskByPaperId = useMemo(
    () =>
      dashboardTasks.reduce<Record<string, ExtractionDashboardTaskDto>>((accumulator, task) => {
        accumulator[task.paperId] = task;
        return accumulator;
      }, {}),
    [dashboardTasks]
  );

  const consensusPaperId = effectiveSelectedPaperId || selectedPaperIdState;

  const canLoadConsensusWorkspace = useMemo(() => {
    if (!extractionProcessId || !consensusPaperId) {
      return false;
    }

    const status = normalizePaperStatus(
      dashboardTaskByPaperId[consensusPaperId]?.status
    );

    return status === "awaiting-consensus" || status === "completed";
  }, [dashboardTaskByPaperId, extractionProcessId, consensusPaperId]);

  const consensusWorkspaceQuery = useQuery({
    queryKey: ["data-extraction-conducting", "consensus", extractionProcessId, consensusPaperId],
    queryFn: async () => {
      if (!extractionProcessId || !consensusPaperId) {
        throw new Error("Data extraction process ID and paper ID are required");
      }

      const response = await dataExtractionConductingService.getConsensusWorkspace(
        extractionProcessId,
        consensusPaperId
      );

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to load consensus workspace");
      }

      return normalizeConsensusWorkspace(response.data);
    },
    enabled: canLoadConsensusWorkspace,
    staleTime: 10_000,
  });

  const canLoadReviewerWorkspace = useMemo(() => {
    if (!extractionProcessId || !consensusPaperId || isCurrentUserLeader) {
      return false;
    }

    const status = normalizePaperStatus(
      dashboardTaskByPaperId[consensusPaperId]?.status
    );

    return status === "awaiting-consensus" || status === "completed";
  }, [
    consensusPaperId,
    dashboardTaskByPaperId,
    extractionProcessId,
    isCurrentUserLeader,
  ]);

  const reviewerWorkspaceQuery = useQuery({
    queryKey: [
      ...REVIEWER_WORKSPACE_QUERY_KEY,
      extractionProcessId,
      consensusPaperId,
    ],
    queryFn: async () => {
      if (!extractionProcessId || !consensusPaperId) {
        throw new Error("Data extraction process ID and paper ID are required");
      }

      const response = await dataExtractionConductingService.getReviewerWorkspace(
        extractionProcessId,
        consensusPaperId
      );

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to load reviewer workspace");
      }

      return normalizeReviewerWorkspace(response.data);
    },
    enabled: canLoadReviewerWorkspace,
    staleTime: 10_000,
  });

  const addFieldCommentMutation = useMutation({
    mutationFn: async (variables: {
      paperId: string;
      fieldId: string;
      payload: AddCommentRequestDto;
    }) => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to add comments");
      }

      const response = await dataExtractionConductingService.addFieldComment(
        extractionProcessId,
        variables.paperId,
        variables.fieldId,
        variables.payload
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to add comment");
      }
    },
    onMutate: async (variables) => {
      if (!extractionProcessId) {
        return null;
      }

      const consensusQueryKey = [
        "data-extraction-conducting",
        "consensus",
        extractionProcessId,
        variables.paperId,
      ] as const;
      const reviewerQueryKey = [
        ...REVIEWER_WORKSPACE_QUERY_KEY,
        extractionProcessId,
        variables.paperId,
      ] as const;

      await queryClient.cancelQueries({ queryKey: consensusQueryKey });
      await queryClient.cancelQueries({ queryKey: reviewerQueryKey });

      const previousConsensus = queryClient.getQueryData<ConsensusWorkspaceDto>(
        consensusQueryKey
      );
      const previousReviewer = queryClient.getQueryData<ReviewerWorkspaceDto>(
        reviewerQueryKey
      );

      const optimisticComment: ExtractionCommentDto = {
        id: `optimistic-${Date.now()}`,
        fieldId: variables.fieldId,
        threadOwnerId: variables.payload.threadOwnerId,
        userId: currentUserId ?? "",
        userName: currentUserName,
        content: variables.payload.content,
        createdAt: new Date().toISOString(),
      };

      if (previousConsensus) {
        queryClient.setQueryData<ConsensusWorkspaceDto>(
          consensusQueryKey,
          appendCommentToConsensusWorkspace(
            previousConsensus,
            variables.fieldId,
            variables.payload.matrixColumnId,
            variables.payload.matrixRowIndex,
            variables.payload.threadOwnerId,
            optimisticComment
          )
        );
      }

      if (previousReviewer) {
        queryClient.setQueryData<ReviewerWorkspaceDto>(
          reviewerQueryKey,
          appendCommentToReviewerWorkspace(
            previousReviewer,
            variables.fieldId,
            variables.payload.matrixColumnId,
            variables.payload.matrixRowIndex,
            variables.payload.threadOwnerId,
            optimisticComment
          )
        );
      }

      return {
        previousConsensus,
        previousReviewer,
        paperId: variables.paperId,
      };
    },
    onError: (error, _variables, context) => {
      if (context?.previousConsensus && extractionProcessId) {
        queryClient.setQueryData(
          [
            "data-extraction-conducting",
            "consensus",
            extractionProcessId,
            context.paperId,
          ],
          context.previousConsensus
        );
      }

      if (context?.previousReviewer && extractionProcessId) {
        queryClient.setQueryData(
          [
            ...REVIEWER_WORKSPACE_QUERY_KEY,
            extractionProcessId,
            context.paperId,
          ],
          context.previousReviewer
        );
      }

      toastError(
        "Add comment failed",
        getErrorMessage(error, "Unable to send this comment right now.")
      );
    },
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({
        queryKey: [
          "data-extraction-conducting",
          "consensus",
          extractionProcessId,
          variables.paperId,
        ],
      });
      await queryClient.invalidateQueries({
        queryKey: [
          ...REVIEWER_WORKSPACE_QUERY_KEY,
          extractionProcessId,
          variables.paperId,
        ],
      });
    },
  });

  const getRecord = useCallback(
    (paperId: string): ExtractionPaperRecord => {
      const task = dashboardTaskByPaperId[paperId];
      if (!task) {
        return buildEmptyRecord(paperId);
      }

      const reviewer1Id = task.reviewer1Id ?? null;
      const reviewer1Name = reviewer1Id ? reviewerNameById[reviewer1Id] ?? null : null;

      return buildEmptyRecord(
        paperId,
        normalizePaperStatus(task.status),
        reviewer1Id,
        reviewer1Name
      );
    },
    [dashboardTaskByPaperId, reviewerNameById]
  );

  const getPaperStatus = useCallback(
    (paperId: string): ExtractionPaperStatus => {
      const task = dashboardTaskByPaperId[paperId];
      return normalizePaperStatus(task?.status);
    },
    [dashboardTaskByPaperId]
  );

  const canCurrentUserExtractPaper = useCallback(
    (paperId: string): boolean => {
      if (!currentUserId) {
        return false;
      }

      const task = dashboardTaskByPaperId[paperId];
      if (!task) {
        return false;
      }

      const reviewer1Id = task.reviewer1Id ?? null;
      const reviewer2Id = task.reviewer2Id ?? null;

      return reviewer1Id === currentUserId || reviewer2Id === currentUserId;
    },
    [currentUserId, dashboardTaskByPaperId]
  );

  const hasCurrentUserSubmitted = useCallback(
    (paperId: string): boolean => {
      if (!currentUserId) {
        return false;
      }

      const task = dashboardTaskByPaperId[paperId];
      if (!task) {
        return false;
      }

      // Check Reviewer 1
      if (task.reviewer1Id === currentUserId) {
        const reviewer1Status = (task.reviewer1Status ?? "").trim().toLowerCase();
        return reviewer1Status === "completed";
      }

      // Check Reviewer 2
      if (task.reviewer2Id === currentUserId) {
        const reviewer2Status = (task.reviewer2Status ?? "").trim().toLowerCase();
        return reviewer2Status === "completed";
      }

      return false;
    },
    [currentUserId, dashboardTaskByPaperId]
  );

  const selectedRecord = useMemo(
    () => (selectedStudy ? getRecord(selectedStudy.paperId) : null),
    [selectedStudy, getRecord]
  );

  const assignPaper = useCallback(
    (paperId: string, payload: AssignReviewersDto) => {
      if (!extractionProcessId || !isCurrentUserLeader) {
        return;
      }

      const reviewer1Id = payload.reviewer1Id ?? null;
      const reviewer2Id = payload.reviewer2Id ?? null;

      if (!reviewer1Id || !reviewer2Id || reviewer1Id === reviewer2Id) {
        return;
      }

      assignReviewersMutation.mutate({
        paperId,
        payload: {
          reviewer1Id,
          reviewer2Id,
        },
      });
    },
    [assignReviewersMutation, extractionProcessId, isCurrentUserLeader]
  );

  const setDraftValue = useCallback(
    (
      paperId: string,
      reviewerId: string,
      fieldId: string,
      value: ExtractionValue
    ) => {
      void paperId;
      void reviewerId;
      void fieldId;
      void value;
      // Draft API wiring will be added in the next backend integration phase.
    },
    []
  );

  const saveDraft = useCallback((paperId: string, reviewerId: string) => {
    void paperId;
    void reviewerId;
    // Draft API wiring will be added in the next backend integration phase.
  }, []);

  const submitExtraction = useCallback(
    (paperId: string, payload: SubmitExtractionRequestDto) => {
      if (!paperId || !extractionProcessId) {
        return;
      }

      if (isDirectMode) {
        directExtractMutation.mutate({
          paperId,
          payload,
        });

        return;
      }

      submitExtractionMutation.mutate({
        paperId,
        payload,
      });
    },
    [
      directExtractMutation,
      extractionProcessId,
      isDirectMode,
      submitExtractionMutation,
    ]
  );

  const handleOpenDirectWorkspace = useCallback(
    (paperId: string) => {
      if (!paperId) {
        return;
      }

      navigate(`${dashboardPath}/workspace/${paperId}?mode=direct`);
    },
    [dashboardPath, navigate]
  );

  const autoExtractMutation = useMutation({
    mutationFn: async (variables: {
      paperId: string;
      templateId: string;
    }): Promise<ExtractedValueDto[]> => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required for AI auto-extraction");
      }

      const response = await dataExtractionConductingService.autoExtractWithAI(
        extractionProcessId,
        variables.paperId,
        variables.templateId
      );

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to auto-extract data with AI");
      }

      return response.data ?? [];
    },
    onError: (error) => {
      toastError(
        "Auto-extract failed",
        getErrorMessage(error, "Unable to auto-extract data right now.")
      );
    },
  });

  const askAiSingleFieldMutation = useMutation({
    mutationFn: async (
      payload: AskAiFieldRequestDto
    ): Promise<ExtractedValueDto> => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required for Ask AI");
      }

      const response = await dataExtractionConductingService.askAiSingleField(
        extractionProcessId,
        payload
      );

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to ask AI for field value");
      }

      return response.data;
    },
    onError: (error) => {
      toastError(
        "Ask AI failed",
        getErrorMessage(error, "Unable to get AI answer for this field right now.")
      );
    },
  });

  const handleAskAiForField = useCallback<
    UseDataExtractionWorkspaceReturn["handleAskAiForField"]
  >(
    async (field, matrixColumnId, matrixRowIndex) => {
      const selectedPaperId = effectiveSelectedPaperId || selectedPaperIdState;
      if (!selectedPaperId || !field.fieldId) {
        return null;
      }

      // Chuyển đổi FieldTypeEnum (number) sang chuỗi (string) để khớp với Backend
      const fieldTypeName = FieldTypeMap[field.fieldType] || String(field.fieldType);

      const payload: AskAiFieldRequestDto = {
        paperId: selectedPaperId,
        fieldId: field.fieldId,
        fieldName: field.name,
        instruction: field.instruction ?? "",
        fieldType: fieldTypeName, // <--- Đã sửa ở đây
        matrixColumnId,
        matrixRowIndex,
        optionsJson: JSON.stringify(field.options ?? []),
      };

      const extractedValue = await askAiSingleFieldMutation.mutateAsync(payload);
      
      // Logic bên dưới giữ nguyên hoàn toàn
      const evidenceCoordinatesRaw =
        extractedValue.evidenceCoordinates ?? extractedValue.EvidenceCoordinates;

      if (typeof evidenceCoordinatesRaw === "string" && evidenceCoordinatesRaw.trim()) {
        try {
          const parsed = JSON.parse(evidenceCoordinatesRaw);
          setActiveHighlights(Array.isArray(parsed) ? parsed : []);
        } catch {
          setActiveHighlights([]);
        }
      } else {
        setActiveHighlights([]);
      }

      return {
        fieldId: field.fieldId,
        value: mapExtractedValueToFormValue(field, extractedValue),
        matrixColumnId,
        matrixRowIndex,
        isNotReported: extractedValue.isNotReported,
        evidenceCoordinates:
          typeof evidenceCoordinatesRaw === "string"
            ? evidenceCoordinatesRaw
            : null,
      };
    },
    [
      askAiSingleFieldMutation,
      effectiveSelectedPaperId,
      selectedPaperIdState,
      setActiveHighlights,
    ]
  );

  const resolveConsensus = useCallback(
    (paperId: string, finalValues: Record<string, ExtractionValue>) => {
      void paperId;
      void finalValues;
      // Consensus API wiring will be added in the next backend integration phase.
    },
    []
  );

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required to export data");
      }

      return dataExtractionConductingService.exportExtractedData(extractionProcessId);
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Extraction_Data.xlsx";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      toastError(
        "Export failed",
        getErrorMessage(error, "Unable to export extracted data right now.")
      );
    },
  });

  useEffect(() => {
    if (!dashboardQuery.error) {
      return;
    }

    toastError(
      "Failed to load dashboard",
      getErrorMessage(dashboardQuery.error, "Unable to load extraction dashboard.")
    );
  }, [dashboardQuery.error]);

  useEffect(() => {
    if (!projectMembersQuery.error) {
      return;
    }

    toastError(
      "Failed to load project members",
      getErrorMessage(projectMembersQuery.error, "Unable to load project members.")
    );
  }, [projectMembersQuery.error]);

  useEffect(() => {
    if (!workloadSummaryQuery.error) {
      return;
    }

    toastError(
      "Failed to load workload summary",
      getErrorMessage(workloadSummaryQuery.error, "Unable to load workload summary.")
    );
  }, [workloadSummaryQuery.error]);

  useEffect(() => {
    if (!templatesQuery.error) {
      return;
    }

    toastError(
      "Failed to load extraction templates",
      getErrorMessage(templatesQuery.error, "Unable to load extraction templates.")
    );
  }, [templatesQuery.error]);

  useEffect(() => {
    if (!uniquePaperDetailsQuery.error) {
      return;
    }

    toastError(
      "Failed to load paper details",
      getErrorMessage(uniquePaperDetailsQuery.error, "Unable to load paper details.")
    );
  }, [uniquePaperDetailsQuery.error]);

  const fetchExtractionPreview = useCallback(
    async (): Promise<ExtractionPreviewDto | null> => {
      const result = await extractionPreviewQuery.refetch();

      if (result.error) {
        throw result.error;
      }

      return result.data ?? null;
    },
    [extractionPreviewQuery]
  );

  const fetchConsensusWorkspace = useCallback(
    async (paperId: string): Promise<ConsensusWorkspaceDto | null> => {
      if (!extractionProcessId || !paperId) {
        return null;
      }

      const data = await queryClient.fetchQuery({
        queryKey: ["data-extraction-conducting", "consensus", extractionProcessId, paperId],
        queryFn: async () => {
          const response = await dataExtractionConductingService.getConsensusWorkspace(
            extractionProcessId,
            paperId
          );

          if (!response.isSuccess || !response.data) {
            throw new Error(response.message || "Failed to load consensus workspace");
          }

          return normalizeConsensusWorkspace(response.data);
        },
        staleTime: 0,
      });

      return data;
    },
    [extractionProcessId, queryClient]
  );

  const fetchReviewerWorkspace = useCallback(
    async (paperId: string): Promise<ReviewerWorkspaceDto | null> => {
      if (!extractionProcessId || !paperId) {
        return null;
      }

      const data = await queryClient.fetchQuery({
        queryKey: [...REVIEWER_WORKSPACE_QUERY_KEY, extractionProcessId, paperId],
        queryFn: async () => {
          const response = await dataExtractionConductingService.getReviewerWorkspace(
            extractionProcessId,
            paperId
          );

          if (!response.isSuccess || !response.data) {
            throw new Error(response.message || "Failed to load reviewer workspace");
          }

          return normalizeReviewerWorkspace(response.data);
        },
        staleTime: 0,
      });

      return data;
    },
    [extractionProcessId, queryClient]
  );

  const summary = dashboardQuery.data?.summary ?? EMPTY_SUMMARY;

  const awaitingConsensus = useMemo(
    () => studies.filter((study) => getPaperStatus(study.paperId) === "awaiting-consensus"),
    [studies, getPaperStatus]
  );

  const completedStudies = useMemo(
    () => studies.filter((study) => getPaperStatus(study.paperId) === "completed"),
    [studies, getPaperStatus]
  );

  const isLoading =
    reviewProcessLoading ||
    dashboardQuery.isLoading ||
    projectMembersQuery.isLoading ||
    templatesQuery.isLoading ||
    workloadSummaryQuery.isLoading;

  const error =
    reviewProcessError ||
    (dashboardQuery.error
      ? getErrorMessage(dashboardQuery.error, "Failed to load extraction dashboard")
      : null) ||
    (projectMembersQuery.error
      ? getErrorMessage(projectMembersQuery.error, "Failed to load project members")
      : null) ||
    (templatesQuery.error
      ? getErrorMessage(templatesQuery.error, "Failed to load extraction templates")
      : null) ||
    (workloadSummaryQuery.error
      ? getErrorMessage(workloadSummaryQuery.error, "Failed to load workload summary")
      : null);

  return {
    projectId,
    processId,
    currentUserId,
    isCurrentUserLeader,
    extractionProcessStatus: reviewProcess?.dataExtractionProcess?.statusText ?? "NotStarted",

    isLoading,
    error,
    isMockMode: false,

    activeTab,
    setActiveTab,

    extractionMode,
    setExtractionMode,

    reviewerOptions,
    activeReviewerId: effectiveActiveReviewerId,
    setActiveReviewerId: setActiveReviewerIdState,

    templates,
    selectedTemplateId: effectiveSelectedTemplateId,
    setSelectedTemplateId: setSelectedTemplateIdState,
    selectedTemplate,
    refreshTemplates: async () => {
      await templatesQuery.refetch();
    },

    studies,
    selectedPaperId: effectiveSelectedPaperId,
    setSelectedPaperId: setSelectedPaperIdState,
    selectedStudy,
    selectedRecord,

    allFields,
    answerFields,

    summary,
    workloadSummary: workloadSummaryQuery.data ?? null,
    isWorkloadLoading: workloadSummaryQuery.isLoading,
    dashboardTasks,
    dashboardTotalCount,
    dashboardTotalPages,
    isDashboardLoading: dashboardQuery.isFetching,

    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,

    getPaperStatus,
    getRecord,
    canCurrentUserExtractPaper,

    assignPaper,
    isAssigningReviewers: assignReviewersMutation.isPending,
    completePhase: async () => {
      await completePhaseMutation.mutateAsync();
    },
    isCompleting: completePhaseMutation.isPending,
    reopenExtraction: (paperId: string, target: TargetReviewer) => {
      reopenExtractionMutation.mutate({
        paperId,
        payload: { target },
      });
    },
    isReopeningExtraction: reopenExtractionMutation.isPending,
    hasCurrentUserSubmitted,

    setDraftValue,
    saveDraft,
    submitExtraction,
    isSubmittingExtraction:
      submitExtractionMutation.isPending || directExtractMutation.isPending,
    isDirectMode,
    handleOpenDirectWorkspace,
    autoExtractWithAI: (paperId: string, templateId: string) =>
      autoExtractMutation.mutateAsync({ paperId, templateId }),
    isAutoExtracting: autoExtractMutation.isPending,
    activeHighlights,
    setActiveHighlights,
    handleAskAiForField,
    isAskingAi: askAiSingleFieldMutation.isPending,
    resolveConsensus,

    consensusWorkspace: consensusWorkspaceQuery.data ?? null,
    isConsensusLoading: consensusWorkspaceQuery.isLoading,
    fetchConsensusWorkspace,
    submitConsensus: (paperId: string, payload: SubmitConsensusRequestDto) => {
      submitConsensusMutation.mutate({ paperId, payload });
    },
    isSubmittingConsensus: submitConsensusMutation.isPending,
    reviewerWorkspace: reviewerWorkspaceQuery.data ?? null,
    isReviewerWorkspaceLoading: reviewerWorkspaceQuery.isLoading,
    fetchReviewerWorkspace,
    addFieldComment: async (
      paperId: string,
      fieldId: string,
      payload: AddCommentRequestDto
    ) => {
      await addFieldCommentMutation.mutateAsync({
        paperId,
        fieldId,
        payload,
      });
    },
    isAddingFieldComment: addFieldCommentMutation.isPending,

    exportExtractedData: () => {
      exportMutation.mutate();
    },
    isExporting: exportMutation.isPending,

    extractionPreview: extractionPreviewQuery.data ?? null,
    isExtractionPreviewLoading: extractionPreviewQuery.isLoading,
    isExtractionPreviewFetching: extractionPreviewQuery.isFetching,
    fetchExtractionPreview,

    awaitingConsensus,
    completedStudies,

    handleBack,
  };
}