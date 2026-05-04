export type AuditLogStatus = "Success" | "Failed";

export type AuditLogActionType =
  | "create"
  | "update"
  | "delete"
  | "export"
  | "access"
  | "review"
  | "system";

export type AuditLogSortField =
  | "timestamp"
  | "user"
  | "action"
  | "resourceType"
  | "resourceId"
  | "status";

export type AuditLogExportFormat = "csv" | "json" | "xlsx";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  actionType: AuditLogActionType;
  resourceType: string;
  resourceId: string;
  status: AuditLogStatus;
  ipAddress: string;
  userAgent: string;
  importance: "normal" | "high";
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
}

export interface AuditLogFiltersState {
  searchTerm: string;
  user: string;
  actionType: string;
  status: string;
  startDate: string;
  endDate: string;
}
