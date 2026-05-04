// Custom hooks for Import Batch operations — React Query (TanStack Query)
// Pattern: useQuery for GET, useMutation for POST/PUT/DELETE
// Follows the same conventions as useProjects.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { importBatchService } from "../services/importBatchService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type {
  CreateImportBatchRequest,
  UpdateImportBatchRequest,
  ImportBatch,
} from "../types/identification";
import type { PaperResponse } from "../types/paper";
import toast from "react-hot-toast";

/**
 * Fetch all import batches for an identification process
 * GET /api/identification-processes/{id}/import-batches
 * ⚠️ WARNING: No pagination - fetches ALL results
 */
export const useImportBatchesByProcess = (processId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.identification.importBatches(processId || ""),
    queryFn: () =>
      processId
        ? importBatchService.getImportBatchesByIdentificationProcess(processId)
        : Promise.reject("No process ID"),
    enabled: !!processId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    importBatches: (query.data?.data || []) as ImportBatch[],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch import batches") : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/**
 * Fetch all import batches for a search execution
 * GET /api/search-executions/{searchExecutionId}/import-batches
 */
export const useImportBatchesBySearchExecution = (
  searchExecutionId: string | undefined,
  options: { enabled?: boolean } = {},
) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.searchExecutions.importBatches(searchExecutionId || ""),
    queryFn: () =>
      searchExecutionId
        ? importBatchService.getImportBatchesBySearchExecution(searchExecutionId)
        : Promise.reject("No search execution ID"),
    enabled: !!searchExecutionId && (options.enabled ?? true),
    staleTime: 2 * 60 * 1000,
  });

  return {
    importBatches: (query.data?.data || []) as ImportBatch[],
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch import batches") : null,
    refetch: query.refetch,
  };
};

/**
 * Fetch a single import batch by ID
 * GET /api/import-batches/{id}
 */
export const useImportBatch = (id: string | undefined, options: { enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.importBatches.detail(id || ""),
    queryFn: () => (id ? importBatchService.getImportBatchById(id) : Promise.reject("No ID")),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 2 * 60 * 1000,
  });

  return {
    importBatch: (query.data?.data ?? null) as ImportBatch | null,
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch import batch") : null,
    refetch: query.refetch,
  };
};

/**
 * Fetch all papers for a specific import batch
 * GET /api/import-batches/{id}/papers
 * Enabled only when batchId is truthy (on-demand pattern)
 */
export const useImportBatchPapers = (batchId: string | null | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.importBatches.papers(batchId || ""),
    queryFn: () =>
      batchId ? importBatchService.getPapersByImportBatch(batchId) : Promise.reject("No batch ID"),
    enabled: !!batchId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    papers: (query.data?.data || []) as PaperResponse[],
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch papers") : null,
    refetch: query.refetch,
  };
};

/**
 * Mutations for import batch create / update / delete
 */
export const useImportBatchMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = (processId?: string, searchExecutionId?: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.importBatches.all });
    if (processId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.identification.importBatches(processId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.identification.statistics(processId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.identification.searchExecutions(processId),
      });
    }
    if (searchExecutionId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.searchExecutions.importBatches(searchExecutionId),
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: ({
      searchExecutionId,
      data,
    }: {
      searchExecutionId: string;
      data: CreateImportBatchRequest;
      processId?: string;
    }) => importBatchService.createImportBatch(searchExecutionId, data),
    onSuccess: (_, variables) => {
      toast.success("Import batch created successfully");
      invalidate(variables.processId, variables.searchExecutionId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create import batch"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImportBatchRequest }) =>
      importBatchService.updateImportBatch(id, data),
    onSuccess: (_, variables) => {
      toast.success("Import batch updated successfully");
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.importBatches.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.importBatches.all });
      queryClient.invalidateQueries({ queryKey: ["identification-processes"] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update import batch"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; processId?: string; searchExecutionId?: string }) =>
      importBatchService.deleteImportBatch(id),
    onSuccess: (_, variables) => {
      toast.success("Import batch deleted successfully");
      invalidate(variables.processId, variables.searchExecutionId);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete import batch"));
    },
  });

  return {
    createImportBatch: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error
      ? getErrorMessage(createMutation.error, "Failed to create import batch")
      : null,

    updateImportBatch: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error
      ? getErrorMessage(updateMutation.error, "Failed to update import batch")
      : null,

    deleteImportBatch: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error
      ? getErrorMessage(deleteMutation.error, "Failed to delete import batch")
      : null,
  };
};
