// Custom hook for PRISMA Report — React Query (TanStack Query)
// Manages latest report, report history, report generation, and historical selection.

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import prismaReportService from "../services/prismaReportService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import toast from "react-hot-toast";
import type {
  PrismaReportResponse,
  PrismaReportListResponse,
  GeneratePrismaReportRequest,
  PrismaSummaryStats,
  PrismaNodeResponse,
} from "../types/prismaReport";
import type { PrismaStage } from "../types/prismaReport";

interface UsePrismaReportParams {
  reviewProcessId: string | undefined;
}

interface UsePrismaReportReturn {
  // Data
  latestReport: PrismaReportResponse | null;
  /** The report currently being viewed (historical selection or latest) */
  activeReport: PrismaReportResponse | null;
  reportHistory: PrismaReportListResponse[];
  summaryStats: PrismaSummaryStats;

  // Loading states
  isLoadingLatest: boolean;
  isLoadingHistory: boolean;
  isGenerating: boolean;
  isLoadingSelected: boolean;

  // Errors
  latestError: string | null;
  historyError: string | null;
  generateError: string | null;
  selectedError: string | null;

  // Computed
  hasReport: boolean;
  nodes: PrismaNodeResponse[];
  includedNode: PrismaNodeResponse | null;
  /** True when the user is viewing a historical report (not the latest) */
  isViewingHistorical: boolean;
  /** ID of the report currently being viewed */
  activeReportId: string | null;

  // Actions
  fetchLatestReport: () => void;
  fetchReportHistory: () => void;
  generateReport: (request?: GeneratePrismaReportRequest) => Promise<PrismaReportResponse | null>;
  /** Load and display a specific historical report by its ID */
  selectReport: (reportId: string) => void;
  /** Return to viewing the latest report */
  clearSelection: () => void;
  refreshAll: () => void;
}

const EMPTY_STATS: PrismaSummaryStats = {
  totalIdentified: 0,
  duplicatesRemoved: 0,
  recordsScreened: 0,
  recordsExcluded: 0,
  reportsAssessed: 0,
  reportsExcluded: 0,
  studiesIncluded: 0,
};

function computeSummaryStats(report: PrismaReportResponse): PrismaSummaryStats {
  const findNode = (stage: PrismaStage) => report.nodes.find((n) => n.stage === stage);

  return {
    totalIdentified: findNode("RecordsIdentified")?.total ?? 0,
    duplicatesRemoved: findNode("DuplicateRecordsRemoved")?.total ?? 0,
    recordsScreened: findNode("RecordsScreened")?.total ?? 0,
    recordsExcluded: findNode("RecordsExcluded")?.total ?? 0,
    reportsAssessed: findNode("ReportsAssessed")?.total ?? 0,
    reportsExcluded: findNode("ReportsExcluded")?.total ?? 0,
    studiesIncluded: report.included.total,
  };
}

export function usePrismaReport({ reviewProcessId }: UsePrismaReportParams): UsePrismaReportReturn {
  const queryClient = useQueryClient();

  // Local UI state — which historical report is selected (null = show latest)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // ---------- Query: latest report ----------
  const latestQuery = useQuery({
    queryKey: QUERY_KEYS.prismaReports.latest(reviewProcessId || ""),
    queryFn: () => prismaReportService.getLatestReport(reviewProcessId!),
    enabled: !!reviewProcessId,
    retry: (failureCount, error) => {
      // 404 = no report generated yet — don't retry
      if (error && typeof error === "object" && "response" in error) {
        const axiosErr = error as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) return false;
      }
      return failureCount < 3;
    },
  });

  const latestReport = latestQuery.data?.data ?? null;

  // ---------- Query: report history ----------
  const historyQuery = useQuery({
    queryKey: QUERY_KEYS.prismaReports.byReviewProcess(reviewProcessId || ""),
    queryFn: () => prismaReportService.getReportsByReviewProcess(reviewProcessId!),
    enabled: !!reviewProcessId,
  });

  const reportHistory = historyQuery.data?.data ?? [];

  // ---------- Query: selected historical report ----------
  const selectedQuery = useQuery({
    queryKey: QUERY_KEYS.prismaReports.detail(selectedReportId || ""),
    queryFn: () => prismaReportService.getReportById(selectedReportId!),
    enabled: !!selectedReportId,
  });

  const selectedReport = selectedQuery.data?.data ?? null;

  useEffect(() => {
    if (!latestQuery.error) return;

    if (
      latestQuery.error &&
      typeof latestQuery.error === "object" &&
      "response" in latestQuery.error
    ) {
      const axiosErr = latestQuery.error as { response?: { status?: number } };
      if (axiosErr.response?.status === 404) return;
    }

    toast.error(getErrorMessage(latestQuery.error, "Failed to load latest PRISMA report."));
  }, [latestQuery.error]);

  useEffect(() => {
    if (!historyQuery.error) return;
    toast.error(getErrorMessage(historyQuery.error, "Failed to load report history."));
  }, [historyQuery.error]);

  useEffect(() => {
    if (!selectedQuery.error) return;
    toast.error(getErrorMessage(selectedQuery.error, "Failed to load the selected report."));
  }, [selectedQuery.error]);

  // ---------- Mutation: generate report ----------
  const generateMutation = useMutation({
    mutationFn: (request: GeneratePrismaReportRequest) => {
      if (!reviewProcessId) return Promise.reject("No review process ID");
      return prismaReportService.generateReport(reviewProcessId, request);
    },
    onSuccess: () => {
      if (reviewProcessId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.prismaReports.latest(reviewProcessId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.prismaReports.byReviewProcess(reviewProcessId),
        });
      }
      // Clear any historical selection so the new report is shown
      setSelectedReportId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to generate PRISMA report."));
    },
  });

  /**
   * Generate a new PRISMA report. Returns the report on success, null on failure.
   */
  const generateReport = useCallback(
    async (request?: GeneratePrismaReportRequest): Promise<PrismaReportResponse | null> => {
      try {
        const response = await generateMutation.mutateAsync(request ?? {});
        return response.data ?? null;
      } catch {
        return null;
      }
    },
    [generateMutation],
  );

  /** Select a historical report to view */
  const selectReport = useCallback((reportId: string) => {
    setSelectedReportId(reportId);
  }, []);

  /** Clear historical selection → return to viewing the latest report */
  const clearSelection = useCallback(() => {
    setSelectedReportId(null);
  }, []);

  /** Re-fetch all queries */
  const refreshAll = useCallback(() => {
    latestQuery.refetch();
    historyQuery.refetch();
  }, [latestQuery, historyQuery]);

  // The actively-viewed report: selected historical report takes priority over latest
  const isViewingHistorical = selectedReport !== null && selectedReport.id !== latestReport?.id;
  const activeReport = selectedReport ?? latestReport;
  const nodes = useMemo(() => activeReport?.nodes ?? [], [activeReport]);
  const includedNode = useMemo(() => activeReport?.included ?? null, [activeReport]);

  const summaryStats = useMemo(
    () => (activeReport ? computeSummaryStats(activeReport) : EMPTY_STATS),
    [activeReport],
  );

  return {
    latestReport,
    activeReport,
    reportHistory,
    summaryStats,

    isLoadingLatest: latestQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    isGenerating: generateMutation.isPending,
    isLoadingSelected: selectedQuery.isLoading,

    latestError: latestQuery.error
      ? getErrorMessage(latestQuery.error, "Failed to load latest PRISMA report.")
      : null,
    historyError: historyQuery.error
      ? getErrorMessage(historyQuery.error, "Failed to load report history.")
      : null,
    generateError: generateMutation.error
      ? getErrorMessage(generateMutation.error, "Failed to generate PRISMA report.")
      : null,
    selectedError: selectedQuery.error
      ? getErrorMessage(selectedQuery.error, "Failed to load the selected report.")
      : null,

    hasReport: latestReport !== null,
    nodes,
    includedNode,
    isViewingHistorical,
    activeReportId: activeReport?.id ?? null,

    fetchLatestReport: () => latestQuery.refetch(),
    fetchReportHistory: () => historyQuery.refetch(),
    generateReport,
    selectReport,
    clearSelection,
    refreshAll,
  };
}
