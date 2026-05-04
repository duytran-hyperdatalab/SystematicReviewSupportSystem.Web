import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { QUERY_KEYS } from "../constants/queryKeys";
import paperPoolService from "../services/paperPoolService";
import { getErrorMessage } from "../utils/errorUtils";
import type { FilterSettingRequest, PaperPoolQueryParams } from "../components/paperPool/types";

export const usePaperPool = (
  projectId: string | undefined,
  params: PaperPoolQueryParams,
  options: { enabled?: boolean } = {},
) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.paperPool.papers(projectId || "", params as Record<string, unknown>),
    queryFn: () =>
      projectId ? paperPoolService.getPapers(projectId, params) : Promise.reject(new Error("No project ID")),
    enabled: !!projectId && (options.enabled ?? true),
    staleTime: 60 * 1000,
  });

  return {
    papersPage: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? getErrorMessage(query.error, "Failed to load paper pool") : null,
    refetch: query.refetch,
  };
};

export const usePaperPoolMetadata = (projectId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.paperPool.metadata(projectId || ""),
    queryFn: () =>
      projectId
        ? paperPoolService.getFilterMetadata(projectId)
        : Promise.reject(new Error("No project ID")),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    metadata: query.data,
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to load filter metadata") : null,
  };
};

export const usePaperPoolFilterSettings = (projectId: string | undefined) => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: QUERY_KEYS.paperPool.filterSettings(projectId || ""),
    queryFn: () =>
      projectId
        ? paperPoolService.getFilterSettings(projectId)
        : Promise.reject(new Error("No project ID")),
    enabled: !!projectId,
    staleTime: 60 * 1000,
  });

  const invalidateSavedFilters = async () => {
    if (!projectId) return;

    await queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.paperPool.filterSettings(projectId),
    });
  };

  const createMutation = useMutation({
    mutationFn: (payload: FilterSettingRequest) =>
      projectId
        ? paperPoolService.createFilterSetting(projectId, payload)
        : Promise.reject(new Error("No project ID")),
    onSuccess: () => invalidateSavedFilters(),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create saved filter"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ filterId, payload }: { filterId: string; payload: FilterSettingRequest }) =>
      projectId
        ? paperPoolService.updateFilterSetting(projectId, filterId, payload)
        : Promise.reject(new Error("No project ID")),
    onSuccess: () => invalidateSavedFilters(),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update saved filter"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (filterId: string) =>
      projectId
        ? paperPoolService.deleteFilterSetting(projectId, filterId)
        : Promise.reject(new Error("No project ID")),
    onSuccess: () => invalidateSavedFilters(),
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete saved filter"));
    },
  });

  return {
    savedFilters: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error ? getErrorMessage(listQuery.error, "Failed to load saved filters") : null,
    refetch: listQuery.refetch,
    createFilterSetting: createMutation.mutateAsync,
    updateFilterSetting: updateMutation.mutateAsync,
    deleteFilterSetting: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const usePaperPoolFilterSettingDetail = (
  projectId: string | undefined,
  filterId: string | null,
) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.paperPool.filterSettingDetail(projectId || "", filterId || ""),
    queryFn: () =>
      projectId && filterId
        ? paperPoolService.getFilterSettingById(projectId, filterId)
        : Promise.reject(new Error("No filter ID")),
    enabled: !!projectId && !!filterId,
    staleTime: 60 * 1000,
  });

  return {
    filterDetail: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to load saved filter detail") : null,
    refetch: query.refetch,
  };
};

export const useSavedFilterPreviewCount = (
  projectId: string | undefined,
  filterId: string | null,
  params: PaperPoolQueryParams | null,
) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.paperPool.savedFilterPreview(
      projectId || "",
      filterId || "",
      (params ?? {}) as Record<string, unknown>,
    ),
    queryFn: async () => {
      if (!projectId || !params) {
        throw new Error("Missing saved filter preview params");
      }

      const page = await paperPoolService.getPapers(projectId, params);
      return page.totalCount;
    },
    enabled: !!projectId && !!filterId && !!params,
    staleTime: 60 * 1000,
  });

  return {
    totalCount: query.data ?? null,
    isLoading: query.isLoading,
  };
};
