import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exclusionReasonLibraryService } from "../services/exclusionReasonLibraryService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type { GetExclusionReasonLibraryParams } from "../types/exclusionReasonLibrary";

const EMPTY_ARRAY: any[] = [];

/**
 * Custom hook for fetching all exclusion reason library items with filtering and pagination
 * @param params Filtering and pagination parameters
 */
export const useExclusionReasonLibrary = (params?: GetExclusionReasonLibraryParams) => {
    const query = useQuery({
        queryKey: QUERY_KEYS.exclusionReasonLibrary.list(params),
        queryFn: () => exclusionReasonLibraryService.getExclusionReasonLibraries(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return {
        data: query.data?.data,
        items: query.data?.data?.items || EMPTY_ARRAY,
        totalCount: query.data?.data?.totalCount || 0,
        pageNumber: query.data?.data?.pageNumber || 1,
        pageSize: query.data?.data?.pageSize || 10,
        totalPages: query.data?.data?.totalPages || 0,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error ? getErrorMessage(query.error, "Failed to get exclusion reasons") : null,
        refetch: query.refetch,
        isSuccess: query.isSuccess,
        isFetching: query.isFetching,
    };
};

/**
 * Custom hook for fetching a single exclusion reason library item by ID
 * @param id The exclusion reason library ID
 */
export const useExclusionReasonLibraryItem = (id: string | undefined) => {
    const query = useQuery({
        queryKey: QUERY_KEYS.exclusionReasonLibrary.detail(id || ""),
        queryFn: () => (id ? exclusionReasonLibraryService.getExclusionReasonLibraryById(id) : Promise.reject("No ID")),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });

    return {
        item: query.data?.data || null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error ? getErrorMessage(query.error, "Failed to get exclusion reason detail") : null,
        refetch: query.refetch,
        isSuccess: query.isSuccess,
    };
};

/**
 * Custom hook for exclusion reason library mutations (bulk create, update, etc.)
 */
export const useExclusionReasonLibraryMutations = () => {
    const queryClient = useQueryClient();

    const bulkCreateMutation = useMutation({
        mutationFn: exclusionReasonLibraryService.createExclusionReasonBulk,
        onSuccess: () => {
            // Invalidate the list query to refresh the data
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exclusionReasonLibrary.all });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: exclusionReasonLibraryService.deleteExclusionReason,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exclusionReasonLibrary.all });
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: exclusionReasonLibraryService.toggleActive,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.exclusionReasonLibrary.all });
        },
    });

    return {
        bulkCreate: bulkCreateMutation.mutateAsync,
        isBulkCreating: bulkCreateMutation.isPending,
        bulkCreateError: bulkCreateMutation.error ? getErrorMessage(bulkCreateMutation.error, "Failed to add exclusion reasons") : null,
        
        deleteReason: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        deleteError: deleteMutation.error ? getErrorMessage(deleteMutation.error, "Failed to delete exclusion reason") : null,
        
        toggleActive: toggleActiveMutation.mutateAsync,
        isToggling: toggleActiveMutation.isPending,
        
        isSuccess: bulkCreateMutation.isSuccess || deleteMutation.isSuccess || toggleActiveMutation.isSuccess,
    };
};
