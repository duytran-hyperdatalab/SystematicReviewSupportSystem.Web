import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../services/projectService";
import { invitationService } from "../services/invitationService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type { RootState } from "../redux/store";
import type { 
  GetProjectsParams, 
  GetProjectMembersParams,
  UpdateProjectRequest,
  UpdateProjectDatesRequest,
  SendInvitationsRequest
} from "../types/project";

const EMPTY_ARRAY: any[] = [];

/**
 * Custom hook for fetching all projects with filtering and pagination
 * @param params Filtering and pagination parameters
 */
export const useProjects = (params?: GetProjectsParams) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id || "anonymous");

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.list(userId, params),
    queryFn: () => projectService.getProjects(params),
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: query.data?.data,
    projects: query.data?.data?.items || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get projects") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

/**
 * Custom hook for fetching the current user's projects
 * @param params Filtering and pagination parameters
 */
export const useMyProjects = (params?: GetProjectsParams) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id || "anonymous");

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.myList(userId, params),
    queryFn: () => projectService.getMyProjects(params),
    staleTime: 2 * 60 * 1000,
  });

  return {
    data: query.data?.data,
    projects: query.data?.data?.items || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get your projects") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

/**
 * Custom hook for fetching a single project by ID
 * @param id The project ID
 * @param options Optional configuration
 */
export const useProject = (id: string | undefined, options: { enabled?: boolean } = {}) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id || "anonymous");

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.detail(id || "", userId),
    queryFn: () => (id ? projectService.getProjectById(id) : Promise.reject("No ID")),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });

  return {
    project: query.data?.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get project") : null,
    refetch: query.refetch,
    // Status flags for UI
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
    status: query.status,
  };
};

/**
 * Custom hook for project mutations (create, update, status transitions)
 */
export const useProjectMutations = () => {
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.auth.user?.id || "anonymous");

  // Local helper for common invalidation
  const invalidateProjects = (projectId?: string) => {
    // Invalidate list queries
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
    // Invalidate specific detail if provided
    if (projectId) {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.projects.detail(projectId, userId) 
      });
    }
  };

  const createMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => invalidateProjects(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectRequest }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, variables) => invalidateProjects(variables.id),
  });

  const updateDatesMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDatesRequest }) =>
      projectService.updateProjectDates(id, data),
    onSuccess: (_, variables) => invalidateProjects(variables.id),
  });

  const activateMutation = useMutation({
    mutationFn: projectService.activateProject,
    onSuccess: (_, id) => invalidateProjects(id),
  });

  const completeMutation = useMutation({
    mutationFn: projectService.completeProject,
    onSuccess: (_, id) => invalidateProjects(id),
  });

  const archiveMutation = useMutation({
    mutationFn: projectService.archiveProject,
    onSuccess: (_, id) => invalidateProjects(id),
  });

  const deleteMutation = useMutation({
    mutationFn: projectService.deleteProject,
    onSuccess: () => invalidateProjects(),
  });

  return {
    // Create
    createProject: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: createMutation.error ? getErrorMessage(createMutation.error, "Failed to create project") : null,

    // Update
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: updateMutation.error ? getErrorMessage(updateMutation.error, "Failed to update project") : null,

    // Update Dates
    updateProjectDates: updateDatesMutation.mutateAsync,
    isUpdatingDates: updateDatesMutation.isPending,
    updateDatesError: updateDatesMutation.error
      ? getErrorMessage(updateDatesMutation.error, "Failed to update project dates")
      : null,

    // Status Actions
    activateProject: activateMutation.mutateAsync,
    isActivating: activateMutation.isPending,
    
    completeProject: completeMutation.mutateAsync,
    isCompleting: completeMutation.isPending,
    
    archiveProject: archiveMutation.mutateAsync,
    isArchiving: archiveMutation.isPending,

    // Delete
    deleteProject: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
/**
 * Custom hook for fetching project members
 * @param projectId The project ID
 * @param params Filtering and pagination parameters
 */
export const useProjectMembers = (projectId: string | undefined, params?: GetProjectMembersParams) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.projects.members(projectId || "", params),
    queryFn: () => (projectId ? projectService.getProjectMembers(projectId, params) : Promise.reject("No ID")),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    data: query.data?.data,
    members: query.data?.data?.items || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get members") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

/**
 * Custom hook for fetching project invitations
 * @param projectId The project ID
 * @param status Optional status filter
 */
export const useProjectInvitations = (
  projectId: string | undefined, 
  status?: number,
  options: { enabled?: boolean } = {}
) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.projects.invitations(projectId || "", status),
    queryFn: () => (projectId ? invitationService.getInvitationsFrom(projectId, status) : Promise.reject("No ID")),
    enabled: !!projectId && (options.enabled ?? true),
    staleTime: 2 * 60 * 1000,
  });

  return {
    invitations: query.data?.data || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get invitations") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

/**
 * Placeholder hook for replacing a project leader.
 * To be integrated with backend API when ready.
 */
export const useReplaceLeaderMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ projectId, newLeaderUserId }: { projectId: string; newLeaderUserId: string }) => {
      // TODO: Replace with actual API call
      // return projectService.replaceLeader(projectId, newLeaderUserId);
      console.log(`Replacing leader for project ${projectId} with user ${newLeaderUserId}`);
      return { success: true };
    },
    onSuccess: (_, variables) => {
      // Invalidate members and invitations to recompute leader state
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.members(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.invitations(variables.projectId) });
    },
  });

  return {
    replaceLeader: mutation.mutateAsync,
    isReplacing: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error, "Failed to replace leader") : null,
  };
};

/**
 * Custom hook for sending project invitations
 */
export const useSendInvitations = (projectId: string | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: SendInvitationsRequest) => 
      projectId ? projectService.sendInvitations(projectId, data) : Promise.reject("No Project ID"),
    onSuccess: () => {
      if (projectId) {
        // Invalidate both members and invitations as both are affected
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.invitations(projectId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.members(projectId) });
      }
    },
  });

  return {
    sendInvitations: mutation.mutateAsync,
    isSending: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error, "Failed to send invitations") : null,
    isSuccess: mutation.isSuccess,
  };
};
/**
 * Custom hook for cancelling project invitations
 */
export const useCancelInvitation = (projectId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (invitationId: string) => invitationService.cancelInvitation(invitationId),
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.invitations(projectId) });
      }
    },
  });

  return {
    cancelInvitation: mutation.mutateAsync,
    isCancelling: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error, "Failed to cancel invitation") : null,
  };
};
/**
 * Custom hook for fetching a single invitation by ID
 * @param id The invitation ID
 */
export const useInvitation = (id: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.invitations.detail(id || ""),
    queryFn: () => (id ? invitationService.getInvitationById(id) : Promise.reject("No ID")),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    invitation: query.data?.data || null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get invitation") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

/**
 * Custom hook for rejecting a project invitation
 */
export const useRejectInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ invitationId, message }: { invitationId: string; message?: string }) => 
      invitationService.rejectInvitation(invitationId, message),
    onSuccess: (_, variables) => {
      // Invalidate the invitation detail query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.detail(variables.invitationId) });
    },
  });

  return {
    rejectInvitation: mutation.mutateAsync,
    isRejecting: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error, "Failed to reject invitation") : null,
  };
};

/**
 * Custom hook for accepting a project invitation
 */
export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (invitationId: string) => 
      invitationService.acceptInvitation(invitationId),
    onSuccess: (_, invitationId) => {
      // Invalidate the invitation detail query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invitations.detail(invitationId) });
      // Also invalidate projects list as user now belongs to a new project
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.all });
    },
  });

  return {
    acceptInvitation: mutation.mutateAsync,
    isAccepting: mutation.isPending,
    error: mutation.error ? getErrorMessage(mutation.error, "Failed to accept invitation") : null,
  };
};


/**
 * Custom hook for fetching project PICOCs
 */
export const useProjectPicocs = (projectId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.projects.picocs(projectId || ""),
    queryFn: () => (projectId ? projectService.getProjectPicocs(projectId) : Promise.reject("No ID")),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    picocs: query.data?.data || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get PICOCs") : null,
    refetch: query.refetch,
  };
};

/**
 * Custom hook for fetching project research questions
 */
export const useProjectResearchQuestions = (projectId: string | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.projects.researchQuestions(projectId || ""),
    queryFn: () => (projectId ? projectService.getProjectResearchQuestions(projectId) : Promise.reject("No ID")),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    researchQuestions: query.data?.data || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get research questions") : null,
    refetch: query.refetch,
  };
};
