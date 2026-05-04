import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studySelectionChecklistTemplateService } from "../services/studySelectionChecklistTemplateService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type { CreateStudySelectionChecklistTemplateRequest } from "../types/studySelectionChecklistTemplate";

export const useStudySelectionChecklistTemplate = (projectId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.studySelection.checklistTemplate(projectId || ""),
    queryFn: async () => {
      if (!projectId) throw new Error("No Project ID");
      try {
        return await studySelectionChecklistTemplateService.getTemplate(projectId);
      } catch (error: any) {
        // If it's a 404 or the backend specifically says 'not found' in the message
        const message = getErrorMessage(error, "");
        if (error?.response?.status === 404 || message.toLowerCase().includes("not found")) {
          return { isSuccess: true, data: null, message: "Not found", errors: null };
        }
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (request: CreateStudySelectionChecklistTemplateRequest) =>
      projectId
        ? studySelectionChecklistTemplateService.createTemplate(projectId, request)
        : Promise.reject("No Project ID"),
    onSuccess: (response) => {
      if (response.isSuccess && projectId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.studySelection.checklistTemplate(projectId),
        });
      }
    },
  });

  const activateMutation = useMutation({
    mutationFn: (templateId: string) =>
      studySelectionChecklistTemplateService.activateTemplate(templateId),
    onSuccess: (response) => {
      if (response.isSuccess && projectId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.studySelection.checklistTemplate(projectId),
        });
      }
    },
  });

 
  return {
    templates: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError && !query.data?.isSuccess,
    error: query.isError ? getErrorMessage(query.error, "Failed to get checklist templates") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    status: query.status,

    // Mutation
    createTemplate: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error
      ? getErrorMessage(createMutation.error, "Failed to create template")
      : null,

    // Activate
    activateTemplate: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
  };
};
export const useStudySelectionTemplateDetail = (projectId: string | undefined, templateId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.studySelection.templateDetail(projectId || "", templateId || ""),
    queryFn: () => {
      if (!projectId || !templateId) throw new Error("Missing ID");
      return studySelectionChecklistTemplateService.getTemplateDetail(projectId, templateId);
    },
    enabled: !!projectId && !!templateId,
    staleTime: 5 * 60 * 1000,
  });
};
