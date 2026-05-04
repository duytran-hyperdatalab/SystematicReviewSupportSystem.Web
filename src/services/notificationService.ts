import api from "../config/axios";
import type {
  ApiResponse,
  PaginatedData,
  NotificationItem,
  GetNotificationsParams,
} from "../types/notification";

class NotificationService {
  private readonly endpoint = "/notifications";

  /**
   * Get paginated notifications
   * GET /api/notifications
   */
  getNotifications = async (
    params: GetNotificationsParams = { pageNumber: 1, pageSize: 10 }
  ): Promise<ApiResponse<PaginatedData<NotificationItem>>> => {
    const response = await api.get<ApiResponse<PaginatedData<NotificationItem>>>(
      this.endpoint,
      { params }
    );
    return response.data;
  };

  /**
   * Get unread notifications count
   * GET /api/notifications/unread-count
   */
  getUnreadCount = async (): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>(
      `${this.endpoint}/unread-count`
    );
    return response.data;
  };

  /**
   * Mark a notification as read
   * PUT /api/notifications/{id}/read
   */
  markAsRead = async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(
      `${this.endpoint}/${id}/read`
    );
    return response.data;
  };

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  markAllAsRead = async (): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(
      `${this.endpoint}/read-all`
    );
    return response.data;
  };
}

export const notificationService = new NotificationService();
