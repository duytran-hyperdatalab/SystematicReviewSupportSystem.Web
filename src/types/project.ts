// Project API Types - Based on API Documentation

export const InvitationStatus = {
  Pending: 1,
  Accepted: 2,
  Rejected: 3,
  Cancelled: 4,
  Expired: 5
} as const;

export type InvitationStatusType = typeof InvitationStatus[keyof typeof InvitationStatus];

// Project API Types - Based on API Documentation

// Project Status
export type ProjectStatus = "Draft" | "Active" | "Completed";

// Base Project Interface
export interface Project {
  id: string;
  code: string;
  title: string;
  domain: string;
  description?: string;
  status: number; // Status code from backend (e.g., 0, 1, 2, 3)
  statusText: ProjectStatus; // Human-readable status text
  startDate?: string;
  endDate?: string;
  createdAt: string;
  modifiedAt: string;
  totalProcesses?: number;
  completedProcesses?: number;
  role?: number;
  roleText?: string;
  isLeader?: boolean;
  leader?: {
    userId: string;
    fullName: string;
    username: string;
    email: string;
  };
}

// Project Roles
export const ProjectRole = {
  Leader: 1,
  Member: 2
} as const;

export type ProjectRoleType = typeof ProjectRole[keyof typeof ProjectRole];

// Project Member Interface
export interface ProjectMember {
  userId: string;
  projectId: string;
  role: ProjectRoleType;
  joinedAt: string;
  userName: string;
  fullName: string;
  email: string;
}

// User Search results
export interface UserSearchResult {
  id: string;
  email: string;
  username: string;
  fullName: string;
  projectRole?: number;
  isAlreadyMember: boolean;
}

// Project Invitation Interface
export interface ProjectInvitation {
  id: string;
  projectId: string;
  projectTitle: string;
  invitedUserId: string;
  invitedUserFullName: string;
  invitedUserEmail: string;
  invitedByUserId: string;
  invitedByUserFullName: string;
  status: InvitationStatusType;
  role: ProjectRoleType;
  responseMessage?: string;
  expiredAt: string;
  respondedAt?: string;
  createdAt: string;
}

// Review Process Interface
export interface ReviewProcess {
  id: string;
  name: string;
  statusText: string;
  createdAt: string;
}

// Project Detail (includes review processes)
export interface ProjectDetail extends Project {
  reviewProcesses: ReviewProcess[];
}

// Request Types
export interface CreateProjectRequest {
  title: string;
  domain: string;
  description?: string;
}

export interface UpdateProjectRequest {
  id: string;
  title: string;
  domain: string;
  description?: string;
}

export interface UpdateProjectDatesRequest {
  id: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface SendInvitationsRequest {
  userIds: string[];
  role: number;
  expiredAt: string;
}

// Response Types
export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
  errors: ApiError[] | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// Query Parameters
export interface GetProjectsParams {
  status?: ProjectStatus;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}


export interface GetProjectMembersParams {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

// PICOC Interface
export interface ProjectPICOC {
  id: string;
  projectId: string;
  population: string;
  intervention: string;
  comparator: string;
  outcome: string;
  context: string;
  createdAt: string;
}

// Research Question Interface
export interface ProjectResearchQuestion {
  id: string;
  projectId: string;
  questionText: string;
  createdAt: string;
}
