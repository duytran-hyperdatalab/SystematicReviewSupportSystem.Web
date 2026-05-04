import type { ApiResponse, PaginatedResponse } from "./project";

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  isActive: boolean;
  role: string;
}

export interface GetUsersParams {
  search?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export type GetUsersResponse = ApiResponse<PaginatedResponse<User>>;

export interface UserProgress {
  userId: string;
  fullName: string;
  username: string;
  email: string;
  workload: number;
  completed: number;
  progress: number;
  status: number;
  statusText: string;
  lastSynchronizedAt: string;
}

export interface UserProgressOverviewParams {
  projectId: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export type UserProgressOverviewResponse = ApiResponse<PaginatedResponse<UserProgress>>;

export interface UpdateUserProfileRequest {
  id: string; // Required for URL path: /api/users/{id}/profile
  fullName: string;
  email: string;
  username: string;
}

export type UpdateUserProfileResponse = ApiResponse<User>;
