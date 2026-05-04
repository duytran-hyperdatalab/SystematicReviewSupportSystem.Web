// Main orchestration hook for the Identification Phase Workspace
// Combines all state management, API calls, and handlers
// Uses React Query hooks — data fetches are declarative (no manual useEffect loading)

import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
  useSearchExecutionsByProcess,
  usePrismaStatistics,
  useSearchExecutionMutations,
} from "../../../../hooks/useSearchExecutions";
import {
  useImportBatchesByProcess,
  useImportBatchPapers,
  useImportBatchMutations,
} from "../../../../hooks/useImportBatches";
import { useReadyPapers } from "../../../../hooks/useReadyPapers";

import { useFileImport } from "./useFileImport";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import type { CreateSearchExecutionRequest } from "../../../../types/identification";
import type { PaperResponse } from "../../../../types/paper";
import type { TabType, PhaseStatus } from "../types";
import { DEFAULT_PRISMA_STATS, LIBRARY_PAGE_SIZE } from "../constants";
import { identificationProcessService } from "../../../../services/identificationProcessService";
import { deduplicationService } from "../../../../services/deduplicationService";
import toast from "react-hot-toast";

export const useIdentificationWorkspace = () => {
  const queryClient = useQueryClient();

  // Route params
  const { projectId, processId, identificationPhaseId } = useParams<{
    projectId: string;
    processId: string;
    identificationPhaseId: string;
  }>();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("strategies");

  // Identification Process Detail (Lifecycle status)
  const {
    data: identificationProcessData,
    isLoading: identificationProcessLoading,
    refetch: refetchIdentificationProcess,
  } = useQuery({
    queryKey: QUERY_KEYS.identification.detail(identificationPhaseId || ""),
    queryFn: () =>
      identificationPhaseId
        ? identificationProcessService.getById(identificationPhaseId)
        : Promise.reject("No ID"),
    enabled: !!identificationPhaseId,
  });

  const identificationProcess = identificationProcessData?.data;

  // Phase status derived from backend
  const phaseStatus = ((): PhaseStatus => {
    if (!identificationProcess) return "in-progress";
    switch (identificationProcess.statusText) {
      case "NotStarted":
        return "not-started";
      case "Completed":
        return "completed";
      case "InProgress":
        return "in-progress";
      default:
        return "in-progress";
    }
  })();

  const canEdit = phaseStatus === "in-progress";

  // Drag state (for import tab)
  const [isDragging, setIsDragging] = useState(false);

  // Modal state
  const [isCreateStrategyModalOpen, setIsCreateStrategyModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalMode, setImportModalMode] = useState<"from-strategy" | "quick-import">(
    "quick-import",
  );
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | undefined>();

  // Papers drawer state
  const [isPapersDrawerOpen, setIsPapersDrawerOpen] = useState(false);
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Library tab search input
  const [librarySearchInput, setLibrarySearchInput] = useState("");
  const [yearFilterInput, setYearFilterInput] = useState("");
  const [searchSourceFilterInput, setSearchSourceFilterInput] = useState("");

  // Paper details drawer state
  const [selectedPaper, setSelectedPaper] = useState<PaperResponse | null>(null);
  const [isPaperDetailsOpen, setIsPaperDetailsOpen] = useState(false);

  // Manual deduplication modal state
  const [isManualDedupeModalOpen, setIsManualDedupeModalOpen] = useState(false);
  const [manualDedupeSourcePaper, setManualDedupeSourcePaper] = useState<PaperResponse | null>(
    null,
  );

  // ---- React Query Hooks (declarative data fetching) ----

  const {
    searchExecutions,
    isLoading: listLoading,
    error: listError,
    refetch: refetchSearchExecutions,
  } = useSearchExecutionsByProcess(identificationPhaseId);

  const {
    statistics,
    isLoading: statsLoading,
    refetch: refetchStatistics,
  } = usePrismaStatistics(identificationPhaseId);

  const { createSearchExecution, deleteSearchExecution } = useSearchExecutionMutations();

  const {
    importBatches,
    isLoading: importBatchesLoading,
    error: importBatchesError,
    refetch: refetchImportBatches,
  } = useImportBatchesByProcess(identificationPhaseId);

  // On-demand paper loading: enabled when viewingBatchId is set
  const {
    papers: importBatchPapers,
    isLoading: importBatchPapersLoading,
    error: importBatchPapersError,
    refetch: refetchImportBatchPapers,
  } = useImportBatchPapers(viewingBatchId);

  const { deleteImportBatch } = useImportBatchMutations();

  const {
    papers: readyPapers,
    totalCount: readyPapersTotalCount,
    pageNumber: readyPapersPage,
    totalPages: readyPapersTotalPages,
    hasNextPage: readyPapersHasNext,
    hasPreviousPage: readyPapersHasPrev,
    loading: readyPapersLoading,
    error: readyPapersError,
    setSearch: setReadyPapersSearch,
    setYear: setReadyPapersYear,
    setSearchSourceId: setReadyPapersSearchSourceId,
    nextPage: readyPapersNextPage,
    previousPage: readyPapersPrevPage,
    refetch: refetchReadyPapers,
  } = useReadyPapers({
    identificationProcessId: identificationPhaseId,
    pageSize: LIBRARY_PAGE_SIZE,
    autoFetch: true,
  });

  // File import hook (shared import logic)
  // On success → invalidate import batches & statistics so React Query re-fetches
  const {
    isUploading,
    uploadProgress,
    handleQuickImport,
    handleImportSubmit: importSubmit,
  } = useFileImport({
    identificationPhaseId,
    onImportSuccess: () => {
      if (identificationPhaseId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.identification.importBatches(identificationPhaseId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.identification.statistics(identificationPhaseId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.identification.searchExecutions(identificationPhaseId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.identification.readyPapers(identificationPhaseId, {}),
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.paperPool.duplicatePairs(projectId || "", {}),
          exact: false,
        });
      }
    },
  });

  // Derived state
  const prismaStats = statistics || DEFAULT_PRISMA_STATS;

  // ---- Handlers ----

  const handleCreateStrategy = useCallback(
    async (data: CreateSearchExecutionRequest) => {
      if (!identificationPhaseId) {
        toast.error("Identification phase ID is required");
        return;
      }

      try {
        const response = await createSearchExecution({
          processId: identificationPhaseId,
          data: {
            identificationProcessId: identificationPhaseId,
            searchSourceId: data.searchSourceId,
            searchQuery: data.searchQuery,
            type: data.type,
            notes: data.notes || null,
          },
        });

        if (response?.isSuccess && response.data) {
          setIsCreateStrategyModalOpen(false);
        }
      } catch (error) {
        console.error("Failed to create search strategy:", error);
      }
    },
    [identificationPhaseId, createSearchExecution],
  );

  const handleImportToStrategy = useCallback((strategyId: string) => {
    setSelectedStrategyId(strategyId);
    setImportModalMode("from-strategy");
    setIsImportModalOpen(true);
  }, []);

  const handleImportSubmit = useCallback(
    async (file: File, source?: string, strategyId?: string) => {
      const success = await importSubmit(file, source, strategyId);
      if (success) {
        setIsImportModalOpen(false);
      }
    },
    [importSubmit],
  );

  const handleDeleteStrategy = useCallback(
    async (strategyId: string) => {
      if (!identificationPhaseId) return;

      const strategy = searchExecutions.find((s) => s.id === strategyId);
      const batchCount = strategy?.importBatchCount || 0;

      if (batchCount > 0) {
        toast.error(
          `Cannot delete: ${batchCount} import batch${batchCount > 1 ? "es" : ""} exist. Delete them first.`,
        );
        return;
      }

      if (!window.confirm("Are you sure you want to delete this search strategy?")) {
        return;
      }

      try {
        const response = await deleteSearchExecution({
          id: strategyId,
          processId: identificationPhaseId,
        });
        if (response?.isSuccess) {
          console.log("Strategy deleted successfully");
        }
      } catch (error) {
        console.error("Failed to delete search strategy:", error);
      }
    },
    [identificationPhaseId, searchExecutions, deleteSearchExecution],
  );

  const handleViewImportPapers = useCallback((importBatchId: string) => {
    // Just set the batch ID — useImportBatchPapers(viewingBatchId) fetches automatically
    setViewingBatchId(importBatchId);
    setIsPapersDrawerOpen(true);
  }, []);

  const handleDeleteImportBatch = useCallback(
    async (importBatchId: string) => {
      if (!identificationPhaseId) return;

      if (
        !window.confirm(
          "Are you sure you want to delete this import batch? This may remove all associated papers.",
        )
      ) {
        return;
      }

      try {
        const response = await deleteImportBatch({
          id: importBatchId,
          processId: identificationPhaseId,
        });
        if (response?.isSuccess) {
          console.log("Import batch deleted successfully");
          // Statistics invalidation is handled automatically by the mutation's onSuccess
        }
      } catch (error) {
        console.error("Failed to delete import batch:", error);
      }
    },
    [identificationPhaseId, deleteImportBatch],
  );

  const handleBack = useCallback(() => {
    navigate(`/projects/${projectId}/processes/${processId}`);
  }, [navigate, projectId, processId]);

  const handleRefreshData = useCallback(() => {
    refetchSearchExecutions();
    refetchStatistics();
    refetchReadyPapers();
    refetchIdentificationProcess();
  }, [
    refetchSearchExecutions,
    refetchStatistics,
    refetchReadyPapers,
    refetchIdentificationProcess,
  ]);

  const handleStartPhase = useCallback(async () => {
    if (!identificationPhaseId) return;
    try {
      const response = await identificationProcessService.start(identificationPhaseId);
      if (response.isSuccess) {
        toast.success("Identification phase started!");
        refetchIdentificationProcess();
        handleRefreshData();
      }
    } catch (error) {
      console.error("Failed to start phase:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start phase");
    }
  }, [identificationPhaseId, refetchIdentificationProcess, handleRefreshData]);

  const handleReopenPhase = useCallback(async () => {
    if (!identificationPhaseId) return;
    try {
      const response = await identificationProcessService.reopen(identificationPhaseId);
      if (response.isSuccess) {
        toast.success("Identification phase reopened!");
        refetchIdentificationProcess();
        handleRefreshData();
      }
    } catch (error) {
      console.error("Failed to reopen phase:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reopen phase");
    }
  }, [identificationPhaseId, refetchIdentificationProcess, handleRefreshData]);

  const handleOpenCompleteModal = useCallback(() => {
    setIsCompleteModalOpen(true);
  }, []);

  const handleCloseCompleteModal = useCallback(() => {
    setIsCompleteModalOpen(false);
  }, []);

  const handleOpenManualDedupe = useCallback((paper: PaperResponse) => {
    setManualDedupeSourcePaper(paper);
    setIsManualDedupeModalOpen(true);
  }, []);

  const handleCloseManualDedupe = useCallback(() => {
    setIsManualDedupeModalOpen(false);
    setManualDedupeSourcePaper(null);
  }, []);

  const handleConfirmManualDedupe = useCallback(
    async (originalPaperId: string, reason?: string) => {
      if (!identificationPhaseId || !manualDedupeSourcePaper) return;

      try {
        const response = await deduplicationService.markAsDuplicate(
          projectId || "",
          manualDedupeSourcePaper.id,
          {
            duplicateOfPaperId: originalPaperId,
            reason,
          },
        );

        if (response.isSuccess) {
          toast.success("Paper marked as duplicate successfully!");
          handleCloseManualDedupe();

          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.identification.statistics(identificationPhaseId),
          });
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.identification.readyPapers(identificationPhaseId, {}),
            exact: false,
          });
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.paperPool.duplicatePairs(projectId || "", {}),
            exact: false,
          });
        }
      } catch (error) {
        console.error("Failed to mark as duplicate:", error);
        toast.error(error instanceof Error ? error.message : "Failed to mark as duplicate");
      }
    },
    [identificationPhaseId, manualDedupeSourcePaper, queryClient, handleCloseManualDedupe],
  );

  const handleConfirmComplete = useCallback(async () => {
    if (!identificationPhaseId) return;

    setIsCompleting(true);
    try {
      const response = await identificationProcessService.complete(identificationPhaseId);
      if (response.isSuccess) {
        toast.success("Identification phase completed successfully!");
        setIsCompleteModalOpen(false);
        // Invalidate queries to refresh status
        refetchIdentificationProcess();
        handleRefreshData();
      }
    } catch (error) {
      console.error("Failed to complete identification phase:", error);
      toast.error(error instanceof Error ? error.message : "Failed to complete phase");
    } finally {
      setIsCompleting(false);
    }
  }, [identificationPhaseId, handleRefreshData, queryClient]);

  const handleNavigateToProject = useCallback(() => {
    navigate(`/projects/${projectId}`);
  }, [navigate, projectId]);

  const handleClosePapersDrawer = useCallback(() => {
    setIsPapersDrawerOpen(false);
    setViewingBatchId(null);
  }, []);

  const handleClosePaperDetails = useCallback(() => {
    setIsPaperDetailsOpen(false);
    setSelectedPaper(null);
  }, []);

  const handleOpenPaperDetails = useCallback((paper: PaperResponse) => {
    setSelectedPaper(paper);
    setIsPaperDetailsOpen(true);
  }, []);

  const handleRetryLoadStrategies = useCallback(() => {
    refetchSearchExecutions();
  }, [refetchSearchExecutions]);

  const handleRetryLoadImportBatches = useCallback(() => {
    refetchImportBatches();
  }, [refetchImportBatches]);

  const handleClearLibraryFilters = useCallback(() => {
    setLibrarySearchInput("");
    setYearFilterInput("");
    setSearchSourceFilterInput("");
    setReadyPapersSearch("");
    setReadyPapersYear(undefined);
    setReadyPapersSearchSourceId(undefined);
  }, [setReadyPapersSearch, setReadyPapersYear, setReadyPapersSearchSourceId]);

  return {
    // Route params
    projectId,
    processId,
    identificationPhaseId,

    // Tab state
    activeTab,
    setActiveTab,

    // Phase status
    phaseStatus,
    canEdit,

    // Drag state
    isDragging,
    setIsDragging,

    // Modal state
    isCreateStrategyModalOpen,
    setIsCreateStrategyModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    importModalMode,
    selectedStrategyId,

    // Papers drawer
    isPapersDrawerOpen,
    viewingBatchId,

    // Library search
    librarySearchInput,
    setLibrarySearchInput,
    yearFilterInput,
    setYearFilterInput,
    searchSourceFilterInput,
    setSearchSourceFilterInput,

    // Paper details drawer
    selectedPaper,
    isPaperDetailsOpen,

    // Completion modal
    isCompleteModalOpen,
    setIsCompleteModalOpen,
    isCompleting,

    // Upload state
    isUploading,
    uploadProgress,

    // Search executions data
    searchExecutions,
    listLoading,
    listError,
    prismaStats,
    statsLoading: statsLoading || identificationProcessLoading,
    identificationProcess,

    // Import batches data
    importBatches,
    importBatchesLoading,
    importBatchesError,
    importBatchPapers,
    importBatchPapersLoading,
    importBatchPapersError,
    refetchImportBatchPapers,

    // Unique papers data
    readyPapers,
    readyPapersTotalCount,
    readyPapersPage,
    readyPapersTotalPages,
    readyPapersHasNext,
    readyPapersHasPrev,
    readyPapersLoading,
    readyPapersError,
    setReadyPapersSearch,
    setReadyPapersYear,
    setReadyPapersSearchSourceId,
    readyPapersNextPage,
    readyPapersPrevPage,
    refetchReadyPapers,

    // Handlers
    handleCreateStrategy,
    handleImportToStrategy,
    handleQuickImport,
    handleImportSubmit,
    handleDeleteStrategy,
    handleViewImportPapers,
    handleDeleteImportBatch,
    handleBack,
    handleRefreshData,
    handleNavigateToProject,
    handleClosePapersDrawer,
    handleClosePaperDetails,
    handleOpenPaperDetails,
    handleRetryLoadStrategies,
    handleRetryLoadImportBatches,
    handleClearLibraryFilters,
    handleOpenCompleteModal,
    handleCloseCompleteModal,
    handleConfirmComplete,
    handleStartPhase,
    handleReopenPhase,

    // Manual deduplication
    isManualDedupeModalOpen,
    manualDedupeSourcePaper,
    handleOpenManualDedupe,
    handleCloseManualDedupe,
    handleConfirmManualDedupe,
  };
};
