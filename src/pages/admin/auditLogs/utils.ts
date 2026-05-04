import type {
  AuditLogEntry,
  AuditLogExportFormat,
  AuditLogSortField,
} from "../../../types/auditLog";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateOnlyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const formatAuditDateTime = (timestamp: string): string =>
  dateFormatter.format(new Date(timestamp));

export const formatDateInputValue = (timestamp: string): string =>
  dateOnlyFormatter.format(new Date(timestamp));

export const parseDateInputValue = (dateValue: string): Date => {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
};

export const formatRangeLabel = (startDate: string, endDate: string): string => {
  const start = startDate
    ? new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Any start";
  const end = endDate
    ? new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "Any end";
  return `${start} - ${end}`;
};

export const matchesAuditLogSearch = (entry: AuditLogEntry, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  const normalized = searchTerm.trim().toLowerCase();

  return [entry.user, entry.resourceId, entry.action, entry.resourceType, entry.ipAddress].some(
    (value) => value.toLowerCase().includes(normalized),
  );
};

export const filterAuditLogs = (
  entries: AuditLogEntry[],
  filters: {
    searchTerm: string;
    user: string;
    actionType: string;
    status: string;
    startDate: string;
    endDate: string;
  },
): AuditLogEntry[] => {
  return entries.filter((entry) => {
    const timestamp = new Date(entry.timestamp).getTime();
    const start = filters.startDate
      ? parseDateInputValue(filters.startDate).getTime()
      : Number.NEGATIVE_INFINITY;
    const end = filters.endDate
      ? new Date(parseDateInputValue(filters.endDate).getTime() + 24 * 60 * 60 * 1000 - 1).getTime()
      : Number.POSITIVE_INFINITY;

    const matchesUser = filters.user === "all" || entry.user === filters.user;
    const matchesAction = filters.actionType === "all" || entry.actionType === filters.actionType;
    const matchesStatus = filters.status === "all" || entry.status === filters.status;
    const matchesDate = timestamp >= start && timestamp <= end;
    const matchesSearch = matchesAuditLogSearch(entry, filters.searchTerm);

    return matchesUser && matchesAction && matchesStatus && matchesDate && matchesSearch;
  });
};

export const sortAuditLogs = (
  entries: AuditLogEntry[],
  sortField: AuditLogSortField,
  direction: "asc" | "desc",
): AuditLogEntry[] => {
  const factor = direction === "asc" ? 1 : -1;

  return [...entries].sort((left, right) => {
    let leftValue: string | number = "";
    let rightValue: string | number = "";

    switch (sortField) {
      case "timestamp":
        leftValue = new Date(left.timestamp).getTime();
        rightValue = new Date(right.timestamp).getTime();
        break;
      case "status":
        leftValue = left.status;
        rightValue = right.status;
        break;
      case "resourceId":
        leftValue = left.resourceId;
        rightValue = right.resourceId;
        break;
      case "resourceType":
        leftValue = left.resourceType;
        rightValue = right.resourceType;
        break;
      case "action":
        leftValue = left.action;
        rightValue = right.action;
        break;
      case "user":
        leftValue = left.user;
        rightValue = right.user;
        break;
      default:
        leftValue = left.timestamp;
        rightValue = right.timestamp;
    }

    if (leftValue < rightValue) return -1 * factor;
    if (leftValue > rightValue) return 1 * factor;
    return 0;
  });
};

export const stringifyMetadata = (value: Record<string, unknown> | null): string => {
  if (!value) return "No data";
  return JSON.stringify(value, null, 2);
};

export const buildAuditLogFileName = (
  format: AuditLogExportFormat,
  startDate: string,
  endDate: string,
): string => {
  const range = `${startDate || "any-start"}_to_${endDate || "any-end"}`;
  return `audit-logs_${range}.${format}`;
};

const escapeCsvValue = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export const buildAuditLogExportContent = (
  entries: AuditLogEntry[],
  format: AuditLogExportFormat,
): { content: string; mimeType: string } => {
  if (format === "json") {
    return {
      content: JSON.stringify(entries, null, 2),
      mimeType: "application/json;charset=utf-8",
    };
  }

  const rows = entries.map((entry) => [
    entry.timestamp,
    entry.user,
    entry.action,
    entry.resourceType,
    entry.resourceId,
    entry.status,
    entry.ipAddress,
    entry.userAgent,
    stringifyMetadata(entry.oldValue),
    stringifyMetadata(entry.newValue),
  ]);

  const header = [
    "Timestamp",
    "User",
    "Action",
    "Resource Type",
    "Resource ID",
    "Status",
    "IP Address",
    "User Agent",
    "Old Value",
    "New Value",
  ];

  if (format === "csv") {
    return {
      content: [header, ...rows]
        .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
        .join("\n"),
      mimeType: "text/csv;charset=utf-8",
    };
  }

  return {
    content: [header, ...rows].map((row) => row.join("\t")).join("\n"),
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
};

export const downloadFile = (content: string, fileName: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
