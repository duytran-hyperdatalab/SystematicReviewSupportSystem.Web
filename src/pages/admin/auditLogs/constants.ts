import type { AuditLogExportFormat } from "../../../types/auditLog";

export const AUDIT_LOG_PAGE_SIZE = 8;

export const AUDIT_LOG_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "Success", label: "Success only" },
  { value: "Failed", label: "Failed only" },
];

export const AUDIT_LOG_ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "export", label: "Export" },
  { value: "access", label: "Access" },
  { value: "review", label: "Review" },
  { value: "system", label: "System" },
];

export const EXPORT_FORMAT_OPTIONS: Array<{
  value: AuditLogExportFormat;
  label: string;
  description: string;
}> = [
  { value: "csv", label: "CSV", description: "Best for analysis tools and spreadsheets." },
  { value: "json", label: "JSON", description: "Best for integrations and archived payloads." },
  { value: "xlsx", label: "Excel", description: "Best for reporting and manual review." },
];
