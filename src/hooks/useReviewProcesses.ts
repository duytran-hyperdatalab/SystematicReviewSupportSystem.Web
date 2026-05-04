// Custom hooks for Review Process operations — React Query (TanStack Query)
// Pattern: useQuery for GET, useMutation for POST/PUT/DELETE
// Follows the same conventions as useProjects.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import reviewProcessService from "../services/reviewProcessService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type {
  ReviewProcess,
  CreateReviewProcessRequest,
  UpdateReviewProcessRequest,
  ReviewProcessSnapshotResponse,
  AddSelectedPapersRequest,
  AddPapersToReviewProcessResponse,
  AddFromFilterSettingRequest,
  AddPapersFromFilterResponse,
} from "../types/reviewProcess";
import toast from "react-hot-toast";

/**
 * Fetch a single review process by ID
 * GET /api/review-processes/{id}
 */
export const useReviewProcess = (id: string | undefined, options: { enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.reviewProcesses.detail(id || ""),
    queryFn: () => (id ? reviewProcessService.getReviewProcessById(id) : Promise.reject("No ID")),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 2 * 60 * 1000,
  });

  return {
    process: query.data?.data ?? undefined,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get review process") : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/**
 * Fetch all review processes for a project
 * GET /api/projects/{projectId}/review-processes
 */
export const useReviewProcessesByProject = (projectId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.reviewProcesses.byProject(projectId || ""),
    queryFn: () =>
      projectId
        ? reviewProcessService.getReviewProcessesByProject(projectId)
        : Promise.reject("No project ID"),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    processes: (query.data?.data || []) as ReviewProcess[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get review processes") : null,
    refetch: query.refetch,
  };
};

/**
 * Mutations for review process CRUD and status transitions
 */
export const useReviewProcessMutations = () => {
  const queryClient = useQueryClient();

  const invalidateAll = (processId?: string, projectId?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewProcesses.all });
    if (processId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviewProcesses.detail(processId),
      });
    }
    if (projectId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviewProcesses.byProject(projectId),
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateReviewProcessRequest }) =>
      reviewProcessService.createReviewProcess(projectId, data),
    onSuccess: (_, variables) => invalidateAll(undefined, variables.projectId),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create review process"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReviewProcessRequest }) =>
      reviewProcessService.updateReviewProcess(id, data),
    onSuccess: (_, variables) => invalidateAll(variables.id),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update review process"));
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => reviewProcessService.startReviewProcess(id),
    onSuccess: (_, id) => invalidateAll(id),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to start review process"));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => reviewProcessService.completeReviewProcess(id),
    onSuccess: (_, id) => invalidateAll(id),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to complete review process"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => reviewProcessService.cancelReviewProcess(id),
    onSuccess: (_, id) => invalidateAll(id),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to cancel review process"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reviewProcessService.deleteReviewProcess(id),
    onSuccess: () => invalidateAll(),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete review process"));
    },
  });

  const reopenPhaseMutation = useMutation({
    mutationFn: ({ id, phase }: { id: string; phase: number }) =>
      reviewProcessService.reopenPhase(id, phase),
    onSuccess: (_, variables) => invalidateAll(variables.id),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to reopen phase"));
    },
  });

  return {
    // Create
    createReviewProcess: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error
      ? getErrorMessage(createMutation.error, "Failed to create review process")
      : null,

    // Update
    updateReviewProcess: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
      ? getErrorMessage(updateMutation.error, "Failed to update review process")
      : null,

    // Start
    startReviewProcess: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    startError: startMutation.error
      ? getErrorMessage(startMutation.error, "Failed to start review process")
      : null,

    // Complete
    completeReviewProcess: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    completeError: completeMutation.error
      ? getErrorMessage(completeMutation.error, "Failed to complete review process")
      : null,

    // Cancel
    cancelReviewProcess: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error
      ? getErrorMessage(cancelMutation.error, "Failed to cancel review process")
      : null,

    // Delete
    deleteReviewProcess: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error
      ? getErrorMessage(deleteMutation.error, "Failed to delete review process")
      : null,

    // Reopen Phase
    reopenPhase: reopenPhaseMutation.mutateAsync,
    isReopening: reopenPhaseMutation.isPending,
    reopenError: reopenPhaseMutation.error
      ? getErrorMessage(reopenPhaseMutation.error, "Failed to reopen phase")
      : null,
  };
};

/**
 * Fetch review process snapshots for a project (selection API)
 * GET /api/projects/{projectId}/review-processes
 */
export const useReviewProcessSnapshots = (projectId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.reviewProcesses.byProject(projectId || ""),
    queryFn: () =>
      projectId
        ? reviewProcessService.getReviewProcessSnapshots(projectId)
        : Promise.reject("No project ID"),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    snapshots: (query.data?.data ?? []) as ReviewProcessSnapshotResponse[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get review process snapshots") : null,
    refetch: query.refetch,
  };
};

/**
 * Add selected papers to a review process
 * POST /api/review-processes/{reviewProcessId}/papers
 */
export const useAddSelectedPapers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      reviewProcessId,
      data,
    }: {
      reviewProcessId: string;
      data: AddSelectedPapersRequest;
    }) =>
      reviewProcessService.addSelectedPapers(reviewProcessId, data).then(
        (response) => {
          if (!response.isSuccess) {
            throw new Error(response.message || "Failed to add papers");
          }
          return response.data;
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewProcesses.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add papers to review process"));
    },
  });

  return {
    addSelectedPapers: mutation.mutateAsync,
    isAdding: mutation.isPending,
    result: mutation.data as AddPapersToReviewProcessResponse | undefined,
    error: mutation.error
      ? getErrorMessage(mutation.error, "Failed to add papers to review process")
      : null,
    reset: mutation.reset,
  };
};

/**
 * Add papers from a filter setting to a review process
 * POST /api/review-processes/{processId}/papers/add-from-filter-setting
 */
export const useAddPapersFromFilterSetting = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      processId,
      data,
    }: {
      processId: string;
      data: AddFromFilterSettingRequest;
    }) =>
      reviewProcessService.addPapersFromFilterSetting(processId, data).then(
        (response) => {
          if (!response.isSuccess) {
            throw new Error(response.message || "Failed to add papers from filter");
          }
          return response.data;
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reviewProcesses.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to add papers from filter"));
    },
  });

  return {
    addPapersFromFilterSetting: mutation.mutateAsync,
    isAdding: mutation.isPending,
    result: mutation.data as AddPapersFromFilterResponse | undefined,
    error: mutation.error
      ? getErrorMessage(mutation.error, "Failed to add papers from filter")
      : null,
    reset: mutation.reset,
  };
};


