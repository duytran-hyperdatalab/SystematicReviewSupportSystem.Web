import api from "../config/axios";

import type { AuditLogEntry } from "../types/auditLog";
import type { ApiResponse, PaginatedResponse } from "../types/project";

export const auditLogService = {
  getAdminAuditLogs: async (params?: any): Promise<ApiResponse<PaginatedResponse<AuditLogEntry>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLogEntry>>>("/auditlog/admin", { params });
    return response.data;
  },

  getProjectLeaderAuditLogs: async (projectId: string, params?: any): Promise<ApiResponse<PaginatedResponse<AuditLogEntry>>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<AuditLogEntry>>>(`/auditlog/project-leader/${projectId}`, { params });
    return response.data;
  },
};
