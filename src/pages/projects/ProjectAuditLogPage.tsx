import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";
import { cn } from "../../utils/cn";
import { toastSuccess } from "../../utils/toast";
import type {
  AuditLogEntry,
  AuditLogExportFormat,
  AuditLogFiltersState,
  AuditLogSortField,
} from "../../types/auditLog";
import { auditLogMockData } from "../admin/auditLogs/mockData";
import { AUDIT_LOG_PAGE_SIZE } from "../admin/auditLogs/constants";
import {
  buildAuditLogExportContent,
  buildAuditLogFileName,
  downloadFile,
  filterAuditLogs,
  formatRangeLabel,
  sortAuditLogs,
} from "../admin/auditLogs/utils";
import AuditLogFilters from "../admin/auditLogs/components/AuditLogFilters";
import AuditLogTable from "../admin/auditLogs/components/AuditLogTable";
import AuditLogDetailModal from "../admin/auditLogs/components/AuditLogDetailModal";
import AuditLogExportDialog from "../admin/auditLogs/components/AuditLogExportDialog";
import { useProjectLeaderAuditLogs } from "../../hooks/useAuditLogs";

interface SummaryCardProps {
  label: string;
  value: string;
  helperText: string;
  tone: "indigo" | "emerald" | "rose" | "amber";
  icon: React.ReactNode;
}

const summaryToneClasses: Record<SummaryCardProps["tone"], { container: string; icon: string }> = {
  indigo: {
    container: "border-indigo-100 bg-indigo-50",
    icon: "bg-linear-to-br from-indigo-500 to-blue-600",
  },
  emerald: {
    container: "border-emerald-100 bg-emerald-50",
    icon: "bg-linear-to-br from-emerald-500 to-teal-600",
  },
  rose: {
    container: "border-rose-100 bg-rose-50",
    icon: "bg-linear-to-br from-rose-500 to-pink-600",
  },
  amber: {
    container: "border-amber-100 bg-amber-50",
    icon: "bg-linear-to-br from-amber-500 to-orange-600",
  },
};

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, helperText, tone, icon }) => {
  const classes = summaryToneClasses[tone];
  return (
    <article
      className={cn(
        "rounded-3xl border bg-white p-5 shadow-sm transition-all hover:shadow-lg",
        classes.container,
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-4",
          classes.icon,
        )}
      >
        {icon}
      </div>
      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</div>
      <p className="mt-2 text-sm font-medium text-slate-500">{helperText}</p>
    </article>
  );
};

const initialFilters: AuditLogFiltersState = {
  searchTerm: "",
  user: "all",
  actionType: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

interface ExportHistoryItem {
  id: string;
  format: AuditLogExportFormat;
  rangeLabel: string;
  createdAt: string;
  recordCount: number;
}

const ProjectAuditLogPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AuditLogFiltersState>(initialFilters);
  const [sortField, setSortField] = useState<AuditLogSortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);

  const queryParams = useMemo(() => {
    const params: Record<string, any> = {
      pageNumber: currentPage,
      pageSize: AUDIT_LOG_PAGE_SIZE,
    };
    if (filters.searchTerm) params.search = filters.searchTerm;
    if (filters.actionType !== "all") params.actionType = filters.actionType;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    return params;
  }, [currentPage, filters]);

  const { data: auditLogsResponse, isLoading: isLoadingLogs } = useProjectLeaderAuditLogs(projectId || "", queryParams);

  const isPageLoading = isLoading || isLoadingLogs;

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const logs = useMemo(() => auditLogsResponse?.data?.items || auditLogMockData, [auditLogsResponse]);

  const users = useMemo(() => {
    return Array.from(new Set(logs.map((entry) => entry.user))).sort((left, right) =>
      left.localeCompare(right),
    );
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (auditLogsResponse?.data?.items) return auditLogsResponse.data.items;
    return filterAuditLogs(logs, filters);
  }, [filters, logs, auditLogsResponse]);
  const sortedLogs = useMemo(
    () => {
      if (auditLogsResponse?.data?.items) return auditLogsResponse.data.items;
      return sortAuditLogs(filteredLogs, sortField, sortDirection);
    },
    [filteredLogs, sortDirection, sortField, auditLogsResponse],
  );

  const totalCount = auditLogsResponse?.data?.totalCount ?? sortedLogs.length;
  const totalPages = auditLogsResponse?.data?.totalPages ?? Math.max(1, Math.ceil(totalCount / AUDIT_LOG_PAGE_SIZE));

  const activePage = Math.min(currentPage, totalPages);
  const pageStart = totalCount === 0 ? 0 : (activePage - 1) * AUDIT_LOG_PAGE_SIZE + 1;
  const pageEnd = Math.min(activePage * AUDIT_LOG_PAGE_SIZE, totalCount);

  const pageLogs = useMemo(() => {
    if (auditLogsResponse?.data?.items) return auditLogsResponse.data.items;
    const startIndex = (activePage - 1) * AUDIT_LOG_PAGE_SIZE;
    return sortedLogs.slice(startIndex, startIndex + AUDIT_LOG_PAGE_SIZE);
  }, [activePage, sortedLogs, auditLogsResponse]);

  const highRiskCount = useMemo(
    () => filteredLogs.filter((entry) => entry.importance === "high").length,
    [filteredLogs],
  );
  const failedCount = useMemo(
    () => filteredLogs.filter((entry) => entry.status === "Failed").length,
    [filteredLogs],
  );
  const exportCount = useMemo(
    () => filteredLogs.filter((entry) => entry.actionType === "export").length,
    [filteredLogs],
  );
  const uniqueActors = useMemo(
    () => new Set(filteredLogs.map((entry) => entry.user)).size,
    [filteredLogs],
  );

  const handleFilterUpdate = (key: keyof AuditLogFiltersState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (field: AuditLogSortField) => {
    setCurrentPage(1);
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection(field === "timestamp" ? "desc" : "asc");
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const handleExport = (request: {
    format: AuditLogExportFormat;
    startDate: string;
    endDate: string;
  }) => {
    const exportLogs = filterAuditLogs(logs, {
      ...filters,
      startDate: request.startDate,
      endDate: request.endDate,
    });

    if (exportLogs.length === 0) {
      throw new Error("No audit logs match the selected export range.");
    }

    const { content, mimeType } = buildAuditLogExportContent(exportLogs, request.format);
    const fileName = buildAuditLogFileName(request.format, request.startDate, request.endDate);

    downloadFile(content, fileName, mimeType);

    setExportHistory((current) =>
      [
        {
          id: `${request.format}-${Date.now()}`,
          format: request.format,
          rangeLabel: formatRangeLabel(request.startDate, request.endDate),
          createdAt: new Date().toISOString(),
          recordCount: exportLogs.length,
        },
        ...current,
      ].slice(0, 4),
    );

    toastSuccess(
      "Export completed",
      `${exportLogs.length} audit log records were downloaded as ${request.format.toUpperCase()}.`,
    );
  };

  const activeRangeLabel = formatRangeLabel(filters.startDate, filters.endDate);

  if (isPageLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <FiRefreshCw className="h-8 w-8 animate-spin text-slate-400" />
          <p className="text-sm font-medium text-slate-500">Loading audit history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.22em]">
            <FiFilter className="w-3 h-3" />
            Project Audit Console
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Project Audit Logs</h3>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-2xl">
              Review project activity, inspect event metadata, and export compliance-ready audit
              trails.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Current range
            </div>
            <div className="text-sm font-bold text-slate-700 mt-1">{activeRangeLabel}</div>
          </div>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95"
          >
            <FiDownload className="w-4 h-4" />
            Export Logs
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all"
          >
            <FiRefreshCw className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Visible records"
          value={String(totalCount)}
          tone="indigo"
          helperText="Records after filters and search are applied."
          icon={<FiClock className="w-5 h-5" />}
        />
        <SummaryCard
          label="Unique actors"
          value={String(uniqueActors)}
          tone="emerald"
          helperText="Distinct users represented in the current result set."
          icon={<FiCheckCircle className="w-5 h-5" />}
        />
        <SummaryCard
          label="Failed events"
          value={String(failedCount)}
          tone="rose"
          helperText="Entries that ended in a failed status."
          icon={<FiXCircle className="w-5 h-5" />}
        />
        <SummaryCard
          label="Important actions"
          value={String(highRiskCount)}
          tone="amber"
          helperText="Deletes and exports are highlighted as high risk."
          icon={<FiAlertTriangle className="w-5 h-5" />}
        />
      </div>

      <AuditLogFilters
        searchTerm={filters.searchTerm}
        users={users}
        selectedUser={filters.user}
        selectedActionType={filters.actionType}
        selectedStatus={filters.status}
        startDate={filters.startDate}
        endDate={filters.endDate}
        onSearchTermChange={(value) => handleFilterUpdate("searchTerm", value)}
        onSelectedUserChange={(value) => handleFilterUpdate("user", value)}
        onSelectedActionTypeChange={(value) => handleFilterUpdate("actionType", value)}
        onSelectedStatusChange={(value) => handleFilterUpdate("status", value)}
        onStartDateChange={(value) => handleFilterUpdate("startDate", value)}
        onEndDateChange={(value) => handleFilterUpdate("endDate", value)}
        onReset={handleResetFilters}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-4xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h4 className="text-base font-black text-slate-900">Export history</h4>
              <p className="text-sm text-slate-500 font-medium">
                Recent client-side exports generated from this view.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-400">Mock UI only</div>
          </div>

          {exportHistory.length > 0 ? (
            <div className="space-y-3">
              {exportHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.16em] bg-white border border-slate-200 text-slate-600">
                        {entry.format}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {entry.recordCount} rows
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Range: {entry.rangeLabel}</p>
                  </div>
                  <div className="text-xs font-medium text-slate-400">
                    {new Date(entry.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-5 py-10 text-center">
              <FiClock className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <h5 className="text-sm font-black text-slate-800">No export history yet</h5>
              <p className="text-sm text-slate-500 mt-1">
                Run an export to track what was downloaded from this audit view.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-4xl border border-slate-100 bg-linear-to-br from-slate-950 to-slate-900 text-white p-5 shadow-xl shadow-slate-900/20">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            <FiAlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            High-risk activity
          </div>
          <h4 className="mt-3 text-xl font-black tracking-tight">
            Deletes and export events are highlighted.
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            This screen emphasizes risky actions so administrators can quickly spot destructive
            operations or compliance-sensitive downloads.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <FiDownload className="w-4 h-4 text-cyan-300" />
              Export actions in the filtered set: {exportCount}
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <FiCheckCircle className="w-4 h-4 text-emerald-400" />
              Success entries remain available for export and review.
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
              <FiXCircle className="w-4 h-4 text-rose-400" />
              Failed entries are easy to isolate with the status filter.
            </div>
          </div>
        </div>
      </div>

      <AuditLogTable
        logs={pageLogs}
        isLoading={isLoading}
        totalCount={totalCount}
        currentPage={activePage}
        totalPages={totalPages}
        pageStart={pageStart}
        pageEnd={pageEnd}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onPageChange={setCurrentPage}
        onRowClick={setSelectedEntry}
      />

      <AuditLogDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />

      <AuditLogExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        defaultStartDate={filters.startDate}
        defaultEndDate={filters.endDate}
        onExport={handleExport}
      />
    </div>
  );
};

export default ProjectAuditLogPage;
