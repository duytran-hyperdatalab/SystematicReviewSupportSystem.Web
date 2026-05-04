export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  errors: ApiError[] | null;
  data: T;
}

export interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const NotificationType = {
  System: 1,
  Project: 2,
  Invitation: 3,
  Review: 4,
  Comment: 5,
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationEntityType = {
  ProjectInvitation: 1,
  Project: 2,
} as const;

export type NotificationEntityType = (typeof NotificationEntityType)[keyof typeof NotificationEntityType];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: number;
  relatedEntityId: string | null;
  entityType: NotificationEntityType | null;
  isRead: boolean;
  createdAt: string;
}


export interface GetNotificationsParams {
  pageNumber?: number;
  pageSize?: number;
}
