import api from "../config/axios";
import type {
  Project,
  ProjectDetail,
  CreateProjectRequest,
  UpdateProjectRequest,
  UpdateProjectDatesRequest,
  ApiResponse,
  PaginatedResponse,
  GetProjectsParams,
  GetProjectMembersParams,
  ProjectMember,
  SendInvitationsRequest,
  ProjectPICOC,
  ProjectResearchQuestion,
} from "../types/project";
import { toISODateTime } from "../utils/dateUtils";

/**
 * Project Service - Direct API calls without hooks
 * Use this in Redux thunks, utilities, or non-component contexts
 */
class ProjectService {
  private readonly endpoint = "/projects";

  private mapProjectResearchQuestion = (item: unknown): ProjectResearchQuestion => {
    const source = (item && typeof item === "object") ? (item as Record<string, unknown>) : {};
    const id = typeof source.id === "string"
      ? source.id
      : typeof source.researchQuestionId === "string"
        ? source.researchQuestionId
        : typeof source.questionId === "string"
          ? source.questionId
          : "";

    const projectId = typeof source.projectId === "string" ? source.projectId : "";
    const questionText = typeof source.questionText === "string"
      ? source.questionText
      : typeof source.question === "string"
        ? source.question
        : "";
    const createdAt = typeof source.createdAt === "string" ? source.createdAt : "";

    return {
      id,
      projectId,
      questionText,
      createdAt,
    };
  };

  /**
   * Create a new project
   * POST /api/projects
   */
  createProject = async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
    const response = await api.post<ApiResponse<Project>>(this.endpoint, data);
    return response.data;
  };

  /**
   * Get project by ID
   * GET /api/projects/{id}
   */
  getProjectById = async (id: string): Promise<ApiResponse<ProjectDetail>> => {
    const response = await api.get<ApiResponse<ProjectDetail>>(`${this.endpoint}/${id}`);
    return response.data;
  };

  /**
   * Get projects with pagination and filtering
   * GET /api/projects
   */
  getProjects = async (params?: GetProjectsParams): Promise<ApiResponse<PaginatedResponse<Project>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(this.endpoint, {
      params,
    });
    return response.data;
  };

  /**
   * Get current user's projects with pagination and filtering
   * GET /api/projects/my
   */
  getMyProjects = async (params?: GetProjectsParams): Promise<ApiResponse<PaginatedResponse<Project>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<Project>>>(`${this.endpoint}/my`, {
      params,
    });
    return response.data;
  };

  /**
   * Update project
   * PUT /api/projects/{id}
   */
  updateProject = async (id: string, data: UpdateProjectRequest): Promise<ApiResponse<Project>> => {
    // Ensure ID in body matches ID in URL
    const payload = { ...data, id };
    const response = await api.put<ApiResponse<Project>>(`${this.endpoint}/${id}`, payload);
    return response.data;
  };

  /**
   * Update project date window (StartDate / EndDate)
   * PUT /api/projects/{id}/dates
   */
  updateProjectDates = async (
    id: string,
    data: UpdateProjectDatesRequest,
  ): Promise<ApiResponse<ProjectDetail>> => {
    const payload = {
      id,
      startDate: toISODateTime(data.startDate),
      endDate: toISODateTime(data.endDate),
    };
    const response = await api.put<ApiResponse<ProjectDetail>>(`${this.endpoint}/${id}/dates`, payload);
    return response.data;
  };

  /**
   * Activate project (Draft -> Active)
   * POST /api/projects/{id}/activate
   */
  activateProject = async (id: string): Promise<ApiResponse<Project>> => {
    const response = await api.post<ApiResponse<Project>>(`${this.endpoint}/${id}/activate`);
    return response.data;
  };

  /**
   * Complete project (Active -> Completed)
   * POST /api/projects/{id}/complete
   */
  completeProject = async (id: string): Promise<ApiResponse<Project>> => {
    const response = await api.post<ApiResponse<Project>>(`${this.endpoint}/${id}/complete`);
    return response.data;
  };

  /**
   * Archive project (Active/Completed -> Archived)
   * POST /api/projects/{id}/archive
   */
  archiveProject = async (id: string): Promise<ApiResponse<Project>> => {
    const response = await api.post<ApiResponse<Project>>(`${this.endpoint}/${id}/archive`);
    return response.data;
  };

  /**
   * Delete project permanently
   * DELETE /api/projects/{id}
   */
  deleteProject = async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
    return response.data;
  };

  /**
   * Get project members
   * GET /api/projects/{projectId}/members
   */
  getProjectMembers = async (projectId: string, params?: GetProjectMembersParams): Promise<ApiResponse<PaginatedResponse<ProjectMember>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<ProjectMember>>>(`${this.endpoint}/${projectId}/members`, {
      params
    });
    return response.data;
  };

  /**
   * Get current user's membership/role in a project
   * GET /api/projects/{projectId}/my-membership
   */
  getMyMembership = async (projectId: string): Promise<ApiResponse<{ role: number; roleText: string }>> => {
    const response = await api.get<ApiResponse<{ role: number; roleText: string }>>(`${this.endpoint}/${projectId}/my-membership`);
    return response.data;
  };

  /**
   * Send invitations to users for a project
   * POST /api/projects/{projectId}/invitations
   */
  sendInvitations = async (projectId: string, data: SendInvitationsRequest): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(`${this.endpoint}/${projectId}/invitations`, data);
    return response.data;
  };

  /**
   * Get project PICOCs
   * GET /api/projects/{projectId}/picocs
   */
  getProjectPicocs = async (projectId: string): Promise<ApiResponse<ProjectPICOC[]>> => {
    const response = await api.get<ApiResponse<ProjectPICOC[]>>(`${this.endpoint}/${projectId}/picocs`);
    return response.data;
  };

  /**
   * Get project research questions
   * GET /api/projects/{projectId}/research-questions
   */
  getProjectResearchQuestions = async (projectId: string): Promise<ApiResponse<ProjectResearchQuestion[]>> => {
    const response = await api.get<ApiResponse<ProjectResearchQuestion[]>>(`${this.endpoint}/${projectId}/research-questions`);
    return {
      ...response.data,
      data: (response.data.data || []).map(this.mapProjectResearchQuestion),
    };
  };
}

// Export singleton instance
export const projectService = new ProjectService();
