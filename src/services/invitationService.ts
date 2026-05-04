import api from "../config/axios";
import type { ApiResponse, ProjectInvitation } from "../types/project";

/**
 * Invitation Service - Direct API calls for project invitations
 */
class InvitationService {
  private readonly endpoint = "/invitations";

  /**
   * Get invitations sent from a project
   * GET /api/invitations/{projectId}/from
   */
  getInvitationsFrom = async (projectId: string, status?: number): Promise<ApiResponse<ProjectInvitation[]>> => {
    const response = await api.get<ApiResponse<ProjectInvitation[]>>(`${this.endpoint}/${projectId}/from`, {
      params: { status }
    });
    return response.data;
  };

  /**
   * Get an invitation by ID
   * GET /api/invitations/{id}
   */
  getInvitationById = async (id: string): Promise<ApiResponse<ProjectInvitation>> => {
    const response = await api.get<ApiResponse<ProjectInvitation>>(`${this.endpoint}/${id}`);
    return response.data;
  };

  /**
   * Cancel an invitation
   * DELETE /api/invitations/{id}
   */
  cancelInvitation = async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`${this.endpoint}/${id}`);
    return response.data;
  };

  /**
   * Reject an invitation
   * POST /api/invitations/{invitationId}/reject
   */
  rejectInvitation = async (invitationId: string, responseMessage?: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(`${this.endpoint}/${invitationId}/reject`, {
      responseMessage
    });
    return response.data;
  };

  /**
   * Accept an invitation
   * POST /api/invitations/{invitationId}/accept
   */
  acceptInvitation = async (invitationId: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>(`${this.endpoint}/${invitationId}/accept`);
    return response.data;
  };
}

export const invitationService = new InvitationService();
