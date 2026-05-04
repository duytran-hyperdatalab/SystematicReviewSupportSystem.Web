import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterSourceService } from "../services/masterSourceService";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { 
  MasterSourceFilters, 
  CreateMasterSearchSourceRequest, 
  UpdateMasterSearchSourceRequest 
} from "../types/masterSource";
import { toastError, toastSuccess } from "../utils/toast";

export const useMasterSources = (filters?: MasterSourceFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.masterSources.list(filters),
    queryFn: async () => {
      const response = await masterSourceService.getAll(filters);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch master sources");
      }
      return response.data;
    },
  });
};

export const useMasterSourceDetail = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.masterSources.detail(id),
    queryFn: async () => {
      const response = await masterSourceService.getById(id);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch master source details");
      }
      return response.data;
    },
    enabled: !!id,
  });
};

export const useMasterSourceActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateMasterSearchSourceRequest) => masterSourceService.create(data),
    onSuccess: (response) => {
      if (response.isSuccess) {
        toastSuccess("Success", "Master source created successfully");
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.masterSources.all });
      } else {
        toastError("Error", response.message || "Failed to create master source");
      }
    },
    onError: (error: any) => {
      toastError("Error", error.message || "An unexpected error occurred");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMasterSearchSourceRequest }) => 
      masterSourceService.update(id, data),
    onSuccess: (response) => {
      if (response.isSuccess) {
        toastSuccess("Success", "Master source updated successfully");
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.masterSources.all });
      } else {
        toastError("Error", response.message || "Failed to update master source");
      }
    },
    onError: (error: any) => {
      toastError("Error", error.message || "An unexpected error occurred");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => masterSourceService.toggleStatus(id),
    onSuccess: (response) => {
      if (response.isSuccess) {
        toastSuccess("Success", `Source ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.masterSources.all });
      } else {
        toastError("Error", response.message || "Failed to toggle status");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Logic requirement: Check usage count before deletion
      const usageResponse = await masterSourceService.getUsageCount(id);
      if (usageResponse.isSuccess && usageResponse.data.usageCount > 0) {
        throw new Error(`Cannot delete: This source is currently used by ${usageResponse.data.usageCount} project(s).`);
      }
      
      return masterSourceService.delete(id);
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        toastSuccess("Success", "Master source deleted successfully");
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.masterSources.all });
      } else {
        toastError("Error", response.message || "Failed to delete master source");
      }
    },
    onError: (error: any) => {
      toastError("Action Blocked", error.message);
    },
  });

  return {
    createSource: createMutation.mutateAsync,
    updateSource: updateMutation.mutateAsync,
    toggleStatus: toggleStatusMutation.mutateAsync,
    deleteSource: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isToggling: toggleStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
