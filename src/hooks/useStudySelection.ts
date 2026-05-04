import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { studySelectionService } from "../services/studySelectionService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { adaptPaperWithDecisions } from "../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import type {
  StudySelectionPhaseStatus,
  AssignmentPaginatedResponse,
  SimplifiedPaperItem,
  GetAssignmentPapersParams,
  StudySelectionProcessResponse,
  GetPaperDetailsResponse,
  ConflictsByPhaseParams,
  PaginatedResponse,
  ConflictPaperItem,
  ResolveScreeningConflictRequest,
  AddExclusionReasonsRequest,
  GetExclusionReasonsParams,
  StudySelectionExclusionReason,
  BulkResolvePapersRequest,
  ReviewerDecisionDetail,
  GetIncludedFullTextPapersParams,
  IncludedFullTextPaperItem,
  GetIncludedPapersParams,
  IncludedPaperItem,
  BulkAddToDatasetRequest,
  ReviewerAssignmentTableItemResponse,
  PaperConflictStatus,
} from "../types/studySelection";

export const useStudySelectionPhaseStatus = (studySelectionProcessId: string | undefined) => {
  return useQuery<StudySelectionPhaseStatus>({
    queryKey: ["study-selection-phase-status", studySelectionProcessId],
    queryFn: async () => {
      const response = await studySelectionService.getPhaseStatus(studySelectionProcessId!);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch phase status");
      }
      return response.data;
    },
    enabled: !!studySelectionProcessId,
    // Poll every 10 seconds if in progress, or just use normal caching
    refetchOnWindowFocus: true,
  });
};

export const useTitleAbstractAssignmentPapers = (
  studySelectionProcessId: string | undefined,
  params: GetAssignmentPapersParams,
) => {
  return useQuery<AssignmentPaginatedResponse<SimplifiedPaperItem>>({
    queryKey: QUERY_KEYS.studySelection.titleAbstractAssignmentPapers(
      studySelectionProcessId ?? "",
      params,
    ),
    queryFn: async () => {
      const response = await studySelectionService.getTitleAbstractAssignmentPapers(
        studySelectionProcessId!,
        params,
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch title/abstract papers");
      }
      return response.data;
    },
    enabled: !!studySelectionProcessId,
  });
};

export const useFullTextAssignmentPapers = (
  studySelectionProcessId: string | undefined,
  params: GetAssignmentPapersParams,
) => {
  return useQuery<AssignmentPaginatedResponse<SimplifiedPaperItem>>({
    queryKey: QUERY_KEYS.studySelection.fullTextAssignmentPapers(
      studySelectionProcessId ?? "",
      params,
    ),
    queryFn: async () => {
      const response = await studySelectionService.getFullTextAssignmentPapers(
        studySelectionProcessId!,
        params,
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch full-text papers");
      }
      return response.data;
    },
    enabled: !!studySelectionProcessId,
  });
};

export const useInfiniteTitleAbstractAssignmentPapers = (
  studySelectionProcessId: string | undefined,
  params: GetAssignmentPapersParams,
) => {
  return useInfiniteQuery({
    queryKey: ["infinite-title-abstract-assignment-papers", studySelectionProcessId, params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await studySelectionService.getTitleAbstractAssignmentPapers(
        studySelectionProcessId!,
        { ...params, pageNumber: pageParam as number },
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch title/abstract papers");
      }
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber < lastPage.totalPages ? lastPage.pageNumber + 1 : undefined,
    enabled: !!studySelectionProcessId,
  });
};

export const useInfiniteFullTextAssignmentPapers = (
  studySelectionProcessId: string | undefined,
  params: GetAssignmentPapersParams,
) => {
  return useInfiniteQuery({
    queryKey: ["infinite-full-text-assignment-papers", studySelectionProcessId, params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await studySelectionService.getFullTextAssignmentPapers(
        studySelectionProcessId!,
        { ...params, pageNumber: pageParam as number },
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch full-text papers");
      }
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber < lastPage.totalPages ? lastPage.pageNumber + 1 : undefined,
    enabled: !!studySelectionProcessId,
  });
};
export const useStudySelectionDetails = (id: string | undefined) => {
  return useQuery<StudySelectionProcessResponse>({
    queryKey: ["study-selection-details", id],
    queryFn: async () => {
      const response = await studySelectionService.getById(id!);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch study selection details");
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const usePaperDetails = (
  studySelectionProcessId: string | undefined,
  paperId: string | undefined,
) => {
  const query = useQuery<GetPaperDetailsResponse>({
    queryKey: QUERY_KEYS.studySelection.paperDetails(studySelectionProcessId ?? "", paperId ?? ""),
    queryFn: () => studySelectionService.getPaperDetails(studySelectionProcessId!, paperId!),
    enabled: !!studySelectionProcessId && !!paperId,
    staleTime: 30_000,
  });

  const paper = query.data?.data ? adaptPaperWithDecisions(query.data.data) : null;

  return {
    ...query,
    paper,
  };
};

export const useConflictsByPhase = (
  studySelectionProcessId: string | undefined,
  params: ConflictsByPhaseParams,
) => {
  return useQuery<PaginatedResponse<ConflictPaperItem>>({
    queryKey: ["conflicts-by-phase", studySelectionProcessId, params],
    queryFn: async () => {
      const response = await studySelectionService.getConflictsByPhase(
        studySelectionProcessId!,
        params,
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch conflict papers");
      }
      return response.data;
    },
    enabled: !!studySelectionProcessId && params.phase !== undefined,
  });
};

export const useConflictDetail = (
  processId: string | undefined,
  paperId: string | undefined,
  phase: number,
) => {
  return useQuery({
    queryKey: ["conflict-detail", processId, paperId, phase],
    queryFn: async () => {
      const response = await studySelectionService.getConflictDetail(processId!, paperId!, phase);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch conflict details");
      }
      return response.data;
    },
    enabled: !!processId && !!paperId,
  });
};

export const useResolveConflict = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processId,
      paperId,
      request,
    }: {
      processId: string;
      paperId: string;
      request: ResolveScreeningConflictRequest;
    }) => {
      const response = await studySelectionService.resolveConflict(processId, paperId, request);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to resolve conflict");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studySelection.paperDetails(variables.processId, variables.paperId),
      });
      queryClient.invalidateQueries({
        queryKey: ["conflict-detail", variables.processId, variables.paperId],
      });
      queryClient.invalidateQueries({ queryKey: ["conflicts-by-phase", variables.processId] });
      queryClient.invalidateQueries({
        queryKey: ["study-selection-phase-status", variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-title-abstract-assignment-papers", variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["infinite-full-text-assignment-papers", variables.processId],
      });
    },
  });
};

export const useAddExclusionReasons = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processId,
      request,
    }: {
      processId: string;
      request: AddExclusionReasonsRequest;
    }) => {
      const response = await studySelectionService.addExclusionReasons(processId, request);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to add exclusion reasons");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate exclusion codes query
      queryClient.invalidateQueries({
        queryKey: ["study-selection", variables.processId, "exclusion-codes"],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studySelection.process(variables.processId),
      });
    },
  });
};

export const useStudySelectionExclusionReasons = (
  processId: string | undefined,
  params: GetExclusionReasonsParams,
) => {
  return useQuery<StudySelectionExclusionReason[]>({
    queryKey: QUERY_KEYS.studySelection.exclusionCodes(processId ?? "", params as any),
    queryFn: async () => {
      const response = await studySelectionService.getExclusionReasons(processId!, params);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch exclusion reasons");
      }
      return response.data;
    },
    enabled: !!processId,
  });
};

export const useToggleExclusionReasonActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await studySelectionService.toggleExclusionReasonActive(id);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to toggle exclusion reason status");
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate exclusion codes query for this process
      queryClient.invalidateQueries({
        queryKey: ["study-selection", data.studySelectionProcessId, "exclusion-codes"],
      });
      // Also potentially invalidate general process data if it depends on these codes
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studySelection.process(data.studySelectionProcessId),
      });
    },
  });
};

export const useDeleteExclusionReason = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, processId }: { id: string; processId: string }) => {
      const response = await studySelectionService.deleteExclusionReason(id);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to delete exclusion reason");
      }
      return { id, processId };
    },
    onSuccess: (data) => {
      // Invalidate exclusion codes query for this process
      queryClient.invalidateQueries({
        queryKey: ["study-selection", data.processId, "exclusion-codes"],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studySelection.process(data.processId),
      });
    },
  });
};

export const useBulkResolvePapers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      processId,
      request,
    }: {
      processId: string;
      request: BulkResolvePapersRequest;
    }) => {
      const response = await studySelectionService.bulkResolvePapers(processId, request);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to bulk resolve papers");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["title-abstract-assignment-papers", variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["full-text-assignment-papers", variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["study-selection-phase-status", variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studySelection.process(variables.processId),
      });
    },
  });
};
export const useReviewerDecisions = (
  id: string | undefined,
  paperId: string | undefined,
  phase: number,
) => {
  return useQuery<ReviewerDecisionDetail[]>({
    queryKey: ["reviewer-decisions", id, paperId, phase],
    queryFn: async () => {
      const response = await studySelectionService.getReviewerDecisions(id!, paperId!, phase);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch reviewer decisions");
      }
      return response.data;
    },
    enabled: !!id && !!paperId,
  });
};

export const useIncludedFullTextPapers = (
  studySelectionProcessId: string | undefined,
  params: GetIncludedFullTextPapersParams,
) => {
  return useQuery<PaginatedResponse<IncludedFullTextPaperItem>>({
    queryKey: ["included-full-text-papers", studySelectionProcessId, params],
    queryFn: async () => {
      const response = await studySelectionService.getIncludedFullTextPapers(
        studySelectionProcessId!,
        params,
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch included papers");
      }
      return response.data;
    },
    enabled: !!studySelectionProcessId,
  });
};

export const useIncludedPapers = (
  studySelectionProcessId: string | undefined,
  params: GetIncludedPapersParams,
) => {
  return useQuery<PaginatedResponse<IncludedPaperItem>>({
    queryKey: ["included-papers", studySelectionProcessId, params],
    queryFn: async () => {
      const response = await studySelectionService.getIncludedPapers(
        studySelectionProcessId!,
        params,
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch included papers");
      }
      return response.data;
    },
    enabled: !!studySelectionProcessId,
  });
};
 
export const useBulkAddToDataset = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async ({
      processId,
      request,
    }: {
      processId: string;
      request: BulkAddToDatasetRequest;
    }) => {
      const response = await studySelectionService.bulkAddToDataset(processId, request);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to add papers to dataset");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["included-full-text-papers", variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["included-papers", variables.processId],
      });
      queryClient.invalidateQueries({
        queryKey: ["study-selection-phase-status", variables.processId],
      });
    },
  });
};

export const useReviewerAssignmentTable = (
  processId: string | undefined,
  reviewerId: string | undefined,
) => {
  return useQuery<ReviewerAssignmentTableItemResponse[]>({
    queryKey: QUERY_KEYS.studySelection.reviewerAssignmentTable(processId ?? "", reviewerId ?? ""),
    queryFn: async () => {
      const response = await studySelectionService.getReviewerAssignmentTable(
        processId!,
        reviewerId!,
      );
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch reviewer assignment table");
      }
      return response.data;
    },
    enabled: !!processId && !!reviewerId,
  });
};

export const useConflictStatus = (
  processId: string | undefined,
  phase: number,
  options?: { enabled?: boolean; refetchInterval?: number },
) => {
  return useQuery<PaperConflictStatus[]>({
    queryKey: QUERY_KEYS.studySelection.conflictStatus(processId ?? "", phase),
    queryFn: async () => {
      const response = await studySelectionService.getConflictStatus(processId!, phase);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch conflict status");
      }
      return response.data;
    },
    enabled: !!processId && options?.enabled,
    refetchInterval: options?.refetchInterval,
  });
};
