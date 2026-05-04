// Custom hooks for Search Execution operations — React Query (TanStack Query)
// Pattern: useQuery for GET, useMutation for POST/PUT/DELETE
// Follows the same conventions as useProjects.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchExecutionService } from "../services/searchExecutionService";

import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type {
  CreateSearchExecutionRequest,
  UpdateSearchExecutionRequest,
  SearchExecutionResponse,
  PrismaStatisticsResponse,
} from "../types/searchExecution";
import toast from "react-hot-toast";

/**
 * Fetch all search executions for an identification process
 * GET /api/identification-processes/{id}/search-executions
 * ⚠️ WARNING: No pagination - returns ALL results
 */
export const useSearchExecutionsByProcess = (processId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.identification.searchExecutions(processId || ""),
    queryFn: () =>
      processId
        ? searchExecutionService.getSearchExecutionsByProcess(processId)
        : Promise.reject("No process ID"),
    enabled: !!processId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    searchExecutions: (query.data?.data || []) as SearchExecutionResponse[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch search executions") : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/**
 * Fetch a single search execution by ID
 * GET /api/search-executions/{id}
 */
export const useSearchExecution = (id: string | undefined, options: { enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.searchExecutions.detail(id || ""),
    queryFn: () =>
      id ? searchExecutionService.getSearchExecutionById(id) : Promise.reject("No ID"),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 2 * 60 * 1000,
  });

  return {
    searchExecution: (query.data?.data ?? null) as SearchExecutionResponse | null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch search execution") : null,
    refetch: query.refetch,
  };
};

/**
 * Fetch PRISMA statistics for an identification process
 * GET /api/identification-processes/{id}/statistics
 */
export const usePrismaStatistics = (processId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.identification.statistics(processId || ""),
    queryFn: () =>
      processId
        ? searchExecutionService.getPrismaStatistics(processId)
        : Promise.reject("No process ID"),
    enabled: !!processId,
    staleTime: 60 * 1000, // Refresh more often — stats change after imports/dedup
  });

  return {
    statistics: (query.data?.data ?? null) as PrismaStatisticsResponse | null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch PRISMA statistics") : null,
    refetch: query.refetch,
  };
};

/**
 * Mutations for search execution create / update / delete
 */
export const useSearchExecutionMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = (processId?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchExecutions.all });
    if (processId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.identification.searchExecutions(processId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.identification.statistics(processId),
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: ({ processId, data }: { processId: string; data: CreateSearchExecutionRequest }) =>
      searchExecutionService.createSearchExecution(processId, data),
    onSuccess: (_, variables) => {
      toast.success("Search execution created successfully");
      invalidate(variables.processId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create search execution"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSearchExecutionRequest }) =>
      searchExecutionService.updateSearchExecution(id, data),
    onSuccess: () => {
      toast.success("Search execution updated successfully");
      // We don't always know the processId from the mutation args,
      // so invalidate broadly
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.searchExecutions.all });
      queryClient.invalidateQueries({ queryKey: ["identification-processes"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update search execution"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; processId?: string }) =>
      searchExecutionService.deleteSearchExecution(id),
    onSuccess: (_, variables) => {
      toast.success("Search execution deleted successfully");
      invalidate(variables.processId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete search execution"));
    },
  });

  return {
    createSearchExecution: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error
      ? getErrorMessage(createMutation.error, "Failed to create search execution")
      : null,

    updateSearchExecution: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
      ? getErrorMessage(updateMutation.error, "Failed to update search execution")
      : null,

    deleteSearchExecution: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error
      ? getErrorMessage(deleteMutation.error, "Failed to delete search execution")
      : null,
  };
};


