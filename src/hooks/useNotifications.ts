import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type { RootState } from "../redux/store";
import type { GetNotificationsParams } from "../types/notification";

/**
 * Custom hook for fetching paginated notifications
 */
export const useNotifications = (params: GetNotificationsParams = { pageNumber: 1, pageSize: 10 }) => {
  const userId = useSelector((state: RootState) => state.auth.user?.id || "anonymous");
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const query = useQuery({
    queryKey: QUERY_KEYS.user.notifications.list(userId, params),
    queryFn: () => notificationService.getNotifications(params),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    notifications: query.data?.data?.items || [],
    pagination: query.data?.data ? {
      totalCount: query.data.data.totalCount,
      pageNumber: query.data.data.pageNumber,
      pageSize: query.data.data.pageSize,
      totalPages: query.data.data.totalPages,
      hasNextPage: query.data.data.hasNextPage,
      hasPreviousPage: query.data.data.hasPreviousPage,
    } : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error ? getErrorMessage(query.error, "Failed to get notifications") : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
};

/**
 * Custom hook for fetching unread notification count
 */
export const useUnreadCount = () => {
  const userId = useSelector((state: RootState) => state.auth.user?.id || "anonymous");
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const query = useQuery({
    queryKey: QUERY_KEYS.user.notifications.unreadCount(userId),
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Poll every 1 minute
  });

  return {
    unreadCount: query.data?.data || 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

/**
 * Custom hook for notification mutations
 */
export const useNotificationMutations = () => {
  const queryClient = useQueryClient();
  const userId = useSelector((state: RootState) => state.auth.user?.id || "anonymous");

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.user.notifications.all(userId),
      });

      // Snapshot the previous values
      const previousNotifications = queryClient.getQueryData(
        QUERY_KEYS.user.notifications.list(userId, {
          pageNumber: 1,
          pageSize: 10,
        })
      );
      const previousCount = queryClient.getQueryData(
        QUERY_KEYS.user.notifications.unreadCount(userId)
      );

      // Optimistically update the list
      queryClient.setQueryData(
        QUERY_KEYS.user.notifications.list(userId, {
          pageNumber: 1,
          pageSize: 10,
        }),
        (old: any) => {
          if (!old?.data?.items) return old;
          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.map((item: any) =>
                item.id === id ? { ...item, isRead: true } : item
              ),
            },
          };
        }
      );

      // Optimistically update the count
      queryClient.setQueryData(
        QUERY_KEYS.user.notifications.unreadCount(userId),
        (old: any) => {
          if (!old?.data || old.data <= 0) return old;
          return { ...old, data: Math.max(0, old.data - 1) };
        }
      );

      return { previousNotifications, previousCount };
    },
    onError: (_err, _id, context: any) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(
          QUERY_KEYS.user.notifications.list(userId, {
            pageNumber: 1,
            pageSize: 10,
          }),
          context.previousNotifications
        );
        queryClient.setQueryData(
          QUERY_KEYS.user.notifications.unreadCount(userId),
          context.previousCount
        );
      }
    },
    onSettled: () => {
      // Invalidate both list and count to sync with server
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.user.notifications.all(userId),
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.user.notifications.all(userId),
      });

      const previousNotifications = queryClient.getQueryData(
        QUERY_KEYS.user.notifications.list(userId, {
          pageNumber: 1,
          pageSize: 10,
        })
      );
      const previousCount = queryClient.getQueryData(
        QUERY_KEYS.user.notifications.unreadCount(userId)
      );

      // Optimistically mark all in current list as read
      queryClient.setQueryData(
        QUERY_KEYS.user.notifications.list(userId, {
          pageNumber: 1,
          pageSize: 10,
        }),
        (old: any) => {
          if (!old?.data?.items) return old;
          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.map((item: any) => ({
                ...item,
                isRead: true,
              })),
            },
          };
        }
      );

      // Optimistically set count to 0
      queryClient.setQueryData(
        QUERY_KEYS.user.notifications.unreadCount(userId),
        (old: any) => (old ? { ...old, data: 0 } : old)
      );

      return { previousNotifications, previousCount };
    },
    onError: (_err, _variables, context: any) => {
      if (context) {
        queryClient.setQueryData(
          QUERY_KEYS.user.notifications.list(userId, {
            pageNumber: 1,
            pageSize: 10,
          }),
          context.previousNotifications
        );
        queryClient.setQueryData(
          QUERY_KEYS.user.notifications.unreadCount(userId),
          context.previousCount
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.user.notifications.all(userId),
      });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
