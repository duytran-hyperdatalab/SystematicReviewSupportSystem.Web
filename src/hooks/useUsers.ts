import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { getErrorMessage } from "../utils/errorUtils";
import type { GetUsersParams, UpdateUserProfileRequest, UserProgressOverviewParams } from "../types/user";
import type { RegisterRequest } from "../types/auth";

/**
 * Custom hook for fetching user progress overview for a project
 * @param params UserProgressOverviewParams
 * @param enabled Whether to enable the query
 */
export const useUserProgressOverview = (params: UserProgressOverviewParams, enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ["users", "progress-overview", params],
    queryFn: () => userService.getProgressOverview(params),
    staleTime: 1 * 60 * 1000,
    enabled: !!params.projectId && enabled,
  });

  return {
    data: query.data?.data,
    items: query.data?.data?.items || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get progress overview") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

const EMPTY_ARRAY: any[] = [];

/**
 * Custom hook for searching users with debounced input and project context
 * @param keyword The search keyword
 * @param projectId Optional project ID to filter users
 * @param enabled Whether to enable the query
 */
export const useUserSearch = (keyword: string, projectId?: string, enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ["users", "search", keyword, projectId],
    queryFn: async () => {
      if (!keyword.trim()) return { data: [], isSuccess: true, message: "", errors: null };
      return userService.searchUsers(keyword, projectId);
    },
    enabled: enabled && keyword.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  return {
    users: query.data?.data || EMPTY_ARRAY,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to search users") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isFetching: query.isFetching,
  };
};

/**
 * Custom hook for fetching all users with pagination, search, and status filter
 * @param params GetUsersParams
 * @param enabled Whether to enable the query
 */
export const useUsers = (params?: GetUsersParams, enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ["users", "list", params],
    queryFn: () => userService.getUsers(params),
    staleTime: 2 * 60 * 1000,
    enabled: enabled,
  });

  return {
    data: query.data?.data,
    users: query.data?.data?.items || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get users") : null,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

/**
 * Custom hook for creating a new user (Admin functionality)
 */
export const useRegisterMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      // Invalidate the users list query to refresh data
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return {
    register: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error ? getErrorMessage(mutation.error, "Failed to register new user") : null,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Custom hook for updating user profile
 */
export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: UpdateUserProfileRequest) => userService.updateUserProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    return {
        updateUser: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error ? getErrorMessage(mutation.error, "Failed to update user profile") : null,
        isSuccess: mutation.isSuccess,
    };
};

/**
 * Custom hook for toggling user status
 */
export const useToggleUserStatusMutation = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (userId: string) => userService.toggleUserStatus(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    return {
        toggleStatus: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error ? getErrorMessage(mutation.error, "Failed to toggle user status") : null,
        isSuccess: mutation.isSuccess,
    };
};
