// Custom hook for Review Process Workspace logic
// Uses React Query hooks — data fetching is declarative

import { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useProjectMember } from "./useProjectMember";
import { useReviewProcess, useReviewProcessMutations } from "./useReviewProcesses";
import {
  useIdentificationProcessMutations,
  useStudySelectionProcessMutations,
  useQualityAssessmentProcessMutations,
  useDataExtractionProcessMutations,
  useSynthesisProcessMutations,
} from "./usePhaseProcessMutations";
import { dataExtractionConductingService } from "../services/dataExtractionConductingService";
import synthesisExecutionService from "../services/synthesisExecutionService";
import { QUERY_KEYS } from "../constants/queryKeys";
import type { ReviewProcess } from "../types/reviewProcess";
import type { PhaseStats, Activity } from "../types/reviewProcessWorkspace";
import type {
  WorkflowPhase,
  PhaseStatusType,
  PhaseStatItem,
  ProcessPaperStats,
} from "../components/reviewProcess/workflow/types";
import { WORKFLOW_PHASES } from "../components/reviewProcess/workflow/constants";
import {
  getMockPhaseStats,
  getMockActivities,
  getMockTeamMembers,
  getMockAlerts,
  getMockProgressStats,
} from "../mocks/reviewProcessMockData";
import { toastWarning } from "../utils/toast";

interface UseReviewProcessWorkspaceParams {
  projectId: string | undefined;
  processId: string | undefined;
}

interface UseReviewProcessWorkspaceReturn {
  // Membership management
  member: ReturnType<typeof useProjectMember>["member"];
  isMemberLoading: boolean;

  // Process data
  process: ReviewProcess | undefined;
  isLoading: boolean;
  error: string | null;

  // Workflow phases (derived from API response)
  workflowPhases: WorkflowPhase[];
  paperStats: ProcessPaperStats;

  // Legacy data kept for backward-compatible panels
  phaseStats: PhaseStats;
  activities: Activity[];
  teamMembers: ReturnType<typeof getMockTeamMembers>;
  alerts: ReturnType<typeof getMockAlerts>;
  progressStats: ReturnType<typeof getMockProgressStats>;

  // Actions
  handleBack: () => void;
  handleStartProcess: () => Promise<void>;
  handleCompleteProcess: () => Promise<void>;
  handleOpenPhase: (phaseName: string) => void;
  handleStartPhase: (phaseKey: string) => void;
  handleCompletePhase: (phaseKey: string) => void;
  handleReopenPhase: (phaseKey: string) => void;

  // Loading states
  startLoading: boolean;
  completeLoading: boolean;
  phaseStartLoadingMap: Record<string, boolean>;
  phaseCompleteLoadingMap: Record<string, boolean>;
  phaseReopenLoadingMap: Record<string, boolean>;

  // Modal states
  isCriteriaModalOpen: boolean;
  setIsCriteriaModalOpen: (open: boolean) => void;
  isQualityCriteriaModalOpen: boolean;
  setIsQualityCriteriaModalOpen: (open: boolean) => void;
  isSynthesisStrategyModalOpen: boolean;
  setIsSynthesisStrategyModalOpen: (open: boolean) => void;

  // Computed
  completedPhases: number[];
}

// ---------------------------------------------------------------------------
// Helpers: derive phase status from the API response
// ---------------------------------------------------------------------------

function getSubprocessStatus(process: ReviewProcess, phaseKey: string): PhaseStatusType | null {
  // Map phase keys to the subprocess fields on ReviewProcess
  // if (phaseKey === "identification") {
  //   return mapApiStatus(process.identificationProcess?.statusText);
  // }
  if (phaseKey === "screening") {
    return mapApiStatus(process.studySelectionProcess?.statusText);
  }
  if (phaseKey === "quality") {
    return mapApiStatus(process.qualityAssessmentProcess?.statusText);
  }
  if (phaseKey === "extraction") {
    return mapApiStatus(process.dataExtractionProcess?.statusText);
  }
  if (phaseKey === "synthesis") {
    return mapApiStatus(process.synthesisProcess?.statusText);
  }
  // Other phases don't have dedicated subprocess objects in the API yet
  return null;
}

function isSubprocessClosed(
  statusText:
    | "Pending"
    | "NotStarted"
    | "InProgress"
    | "Reopened"
    | "Completed"
    | "Cancelled"
    | undefined,
): boolean {
  return statusText === "Completed" || statusText === "Cancelled";
}

function canStartExtractionOrQuality(process: ReviewProcess): boolean {
  // const identificationClosed =
  //   !process.identificationProcess || isSubprocessClosed(process.identificationProcess?.statusText);
  const screeningClosed = isSubprocessClosed(process.studySelectionProcess?.statusText);
  return screeningClosed;
}

function canStartSynthesis(process: ReviewProcess): boolean {
  const isExtractionClosed =
    !process.dataExtractionProcess || process.dataExtractionProcess?.statusText === "Completed";
  const isQualityClosed =
    !process.qualityAssessmentProcess || process.qualityAssessmentProcess?.statusText === "Completed";
  return isExtractionClosed && isQualityClosed;
}

function mapApiStatus(
  status:
    | number
    | "Pending"
    | "NotStarted"
    | "InProgress"
    | "Reopened"
    | "Completed"
    | "Cancelled"
    | string
    | undefined,
): PhaseStatusType | null {
  if (status === undefined || status === null) return null;

  // Synthesis backend returns numeric enum values.
  if (typeof status === "number") {
    switch (status) {
      case 1:
        return "InProgress";
      case 2:
      case 3:
        return "Completed";
      case 0:
      default:
        return "NotStarted";
    }
  }

  switch (status) {
    case "InProgress":
    case "Reopened":
      return "InProgress";
    case "Completed":
      return "Completed";
    case "Pending":
    case "NotStarted":
      return "NotStarted";
    case "Cancelled":
      return "Completed"; // treat cancelled as "done" for sequential logic
    default:
      return null;
  }
}

function derivePhaseStatus(
  process: ReviewProcess,
  phaseIndex: number,
  phaseKey: string,
  previousCompleted: boolean,
): PhaseStatusType {
  // PRISMA (phase 5) is always accessible as a read-only aggregate view
  if (phaseKey === "prisma") return "NotStarted";

  // If the subprocess exists in the API, use its real status
  const subStatus = getSubprocessStatus(process, phaseKey);

  // Data Extraction and Quality Assessment are locked until both Identification and Study Selection are closed.
  if (phaseKey === "extraction" || phaseKey === "quality") {
    const isAllowed = canStartExtractionOrQuality(process);
    if (!isAllowed) {
      if (subStatus === "InProgress" || subStatus === "Completed") return subStatus;
      return "Locked";
    }
    // If allowed, use real status if available
    if (subStatus) return subStatus;

    // Fallback: derive from currentPhase
    const currentPhase = process.currentPhase ?? -1;
    if (phaseIndex < currentPhase) return "Completed";
    if (phaseIndex === currentPhase) return "InProgress";

    // Otherwise it's ready to start
    return "NotStarted";
  }

  // Synthesis is locked until Data Extraction is completed.
  // Keep InProgress/Completed synthesis visible if it already started previously.
  if (phaseKey === "synthesis" && !canStartSynthesis(process)) {
    if (subStatus === "InProgress" || subStatus === "Completed") return subStatus;
    return "Locked";
  }

  if (subStatus) return subStatus;

  // Fallback: derive from currentPhase
  const currentPhase = process.currentPhase ?? -1;
  if (phaseIndex < currentPhase) return "Completed";
  if (phaseIndex === currentPhase) return "InProgress";

  // Future phase: locked unless previous is completed
  return previousCompleted ? "NotStarted" : "Locked";
}

function buildPhaseStats(phaseKey: string, phaseStats: PhaseStats): PhaseStatItem[] {
  switch (phaseKey) {
    case "identification":
      return [
        { label: "Total Imported", value: phaseStats.identification.recordsImported },
        {
          label: "Duplicates",
          value: phaseStats.identification.duplicatesRemoved,
          variant: "warning",
        },
        { label: "Import Batches", value: phaseStats.identification.databasesSearched },
        {
          label: "Unique Records",
          value: phaseStats.identification.uniqueRecords,
          variant: "success",
        },
      ];
    case "screening":
      return [
        { label: "Total Papers", value: phaseStats.screening.totalPapers },
        { label: "Included", value: phaseStats.screening.included, variant: "success" },
        { label: "Excluded", value: phaseStats.screening.excluded },
        { label: "Pending", value: phaseStats.screening.pendingCount, variant: "warning" },
      ];
    case "quality":
      return [
        // { label: "Total Papers", value: phaseStats.quality.totalPapers },
        { label: "Total Included", value: phaseStats.quality.totalPapers },
        { label: "Passed", value: phaseStats.quality.highQualityPapers, variant: "success" },
        { label: "Failed", value: phaseStats.quality.lowQualityPapers, variant: "danger" },
        { label: "Not Started", value: phaseStats.quality.notStartedPapers + phaseStats.quality.inProgressPapers, variant: "warning" },
      ];
    case "extraction":
      return [
        { label: "Total Included", value: phaseStats.extraction.studiesExtracted },
        { label: "In Progress", value: phaseStats.extraction.pending, variant: "warning" },
        { label: "Consensus", value: phaseStats.extraction.awaitingConsensus, variant: "danger" },
        { label: "Completed", value: phaseStats.extraction.completed, variant: "success" },
      ];
    case "synthesis":
      return [
        { label: "Studies", value: phaseStats.synthesis.studiesSynthesized },
        { label: "Themes", value: phaseStats.synthesis.themes },
        { label: "Findings", value: phaseStats.synthesis.findings },
        { label: "Status", value: phaseStats.synthesis.status },
      ];
    case "prisma":
      return [
        { label: "Last Generated", value: phaseStats.prisma.lastGenerated },
        { label: "Version", value: phaseStats.prisma.version },
        { label: "Completeness", value: phaseStats.prisma.completeness },
        { label: "Status", value: phaseStats.prisma.status, variant: "warning" },
      ];
    default:
      return [];
  }
}

function getLockReason(phaseIndex: number, phaseKey: string): string {
  if (phaseKey === "extraction" || phaseKey === "quality") {
    return "Complete Identification and Study Selection first";
  }
  if (phaseKey === "synthesis") {
    return "Complete all other phases first";
  }
  if (phaseIndex <= 0) return "";
  const prev = WORKFLOW_PHASES[phaseIndex - 1];
  return prev ? `Complete ${prev.name} first` : "";
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useReviewProcessWorkspace = ({
  projectId,
  processId,
}: UseReviewProcessWorkspaceParams): UseReviewProcessWorkspaceReturn => {
  const navigate = useNavigate();

  // Use the new membership hook which will sync and refresh on reload/reconnect
  const { member: currentProjectMember, isLoading: isMemberLoading } = useProjectMember(projectId);

  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isQualityCriteriaModalOpen, setIsQualityCriteriaModalOpen] = useState(false);
  const [isSynthesisStrategyModalOpen, setIsSynthesisStrategyModalOpen] = useState(false);

  // React Query: declarative data fetch — no useEffect needed
  const { process, isLoading, error } = useReviewProcess(processId);

  const {
    startReviewProcess,
    isStarting: startLoading,
    completeReviewProcess,
    isCompleting: completeLoading,
    reopenPhase,
    isReopening: reopenLoading,
  } = useReviewProcessMutations();

  // Phase-level mutations
  const {
    startIdentification,
    isStartingIdentification,
    completeIdentification,
    isCompletingIdentification,
  } = useIdentificationProcessMutations(processId);

  const {
    startStudySelection,
    isStartingStudySelection,
    completeStudySelection,
    isCompletingStudySelection,
  } = useStudySelectionProcessMutations(processId);

  const {
    startQualityAssessment,
    isStartingQualityAssessment,
    completeQualityAssessment,
    isCompletingQualityAssessment,
  } = useQualityAssessmentProcessMutations(processId);

  const {
    startDataExtraction,
    isStartingDataExtraction,
    completeDataExtraction,
    isCompletingDataExtraction,
  } = useDataExtractionProcessMutations(processId);

  const { startSynthesis, isStartingSynthesis, completeSynthesis, isCompletingSynthesis } =
    useSynthesisProcessMutations(processId);

  const synthesisProcessId = process?.synthesisProcess?.id;

  const synthesisStrategiesQuery = useQuery({
    queryKey: QUERY_KEYS.synthesisExecution.strategies(synthesisProcessId ?? ""),
    queryFn: async () => {
      if (!synthesisProcessId) {
        throw new Error("Synthesis process ID is required");
      }

      return synthesisExecutionService.getSynthesisStrategiesByProcessId(synthesisProcessId);
    },
    enabled: !!synthesisProcessId,
    staleTime: 60_000,
  });

  const hasSynthesisStrategy = (synthesisStrategiesQuery.data?.length ?? 0) > 0;

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(`/projects/${projectId}`);
  }, [navigate, projectId]);

  const handleOpenPhase = useCallback(
    (phaseName: string) => {
      if (!process || process.statusText === "NotStarted") return;

      if (phaseName === "identification" && process.identificationProcess?.id) {
        navigate(
          `/projects/${projectId}/processes/${processId}/identification/${process.identificationProcess.id}`,
        );
      } else if (phaseName === "screening") {
        const screeningId = process.studySelectionProcess?.id;
        if (!screeningId) return;
        if (currentProjectMember?.isLeader) {
          navigate(
            `/projects/${projectId}/processes/${processId}/screening/${screeningId}/dashboard`,
          );
        } else {
          navigate(`/projects/${projectId}/processes/${processId}/screening/${screeningId}`);
        }
      } else if (phaseName === "quality") {
        const qualityId = process.qualityAssessmentProcess?.id;
        if (!qualityId) return;
        navigate(`/projects/${projectId}/processes/${processId}/quality-assessment/${qualityId}`);
      } else if (phaseName === "synthesis") {
        navigate(`/projects/${projectId}/processes/${processId}/synthesis`);
      } else if (phaseName === "prisma") {
        navigate(`/projects/${projectId}/processes/${processId}/prisma-report`);
      } else if (phaseName === "extraction") {
        navigate(`/projects/${projectId}/processes/${processId}/extraction`);
      }
    },
    [navigate, process, projectId, processId, currentProjectMember],
  );

  // Process-level action handlers
  const handleStartProcess = useCallback(async () => {
    if (!processId) return;
    try {
      await startReviewProcess(processId);
    } catch {
      // Error already handled by mutation
    }
  }, [processId, startReviewProcess]);

  const handleCompleteProcess = useCallback(async () => {
    if (!processId || !process) return;
    if (window.confirm("Are you sure you want to complete this review process?")) {
      try {
        await completeReviewProcess(processId);
      } catch {
        // Error already handled by mutation
      }
    }
  }, [processId, process, completeReviewProcess]);

  // Phase-level action handlers
  const handleStartPhase = useCallback(
    async (phaseKey: string) => {
      if (!process || process.statusText === "NotStarted") return;
      try {
        if (phaseKey === "identification") {
          const identId = process.identificationProcess?.id;
          if (identId) {
            await startIdentification(identId);
          }
          return;
        }
        if (phaseKey === "screening") {
          const selectionId = process.studySelectionProcess?.id;
          if (selectionId) {
            const result = await startStudySelection(selectionId);
            if (result.data && !result.data.isHaveCriteria) {
              toastWarning(
                "Criteria Required",
                "Failed, Setup Study Selection Criteria first to start phase",
              );
              setIsCriteriaModalOpen(true);
            }
          }
          return;
        }
        if (phaseKey === "quality") {
          const qualityId = process.qualityAssessmentProcess?.id;
          const stats = process.qualityAssessmentProcess?.qualityStatistics;
          if (qualityId) {
            if (!stats || !stats.hasSetupCriteria) {
              setIsQualityCriteriaModalOpen(true);
              return;
            }
            await startQualityAssessment(qualityId);
          }
          return;
        }
        if (phaseKey === "extraction") {
          const extractionId = process.dataExtractionProcess?.id;
          if (extractionId) {
            await startDataExtraction(extractionId);
          }
          return;
        }
        if (phaseKey === "synthesis") {
          if (processId) {
            if (!hasSynthesisStrategy) {
              setIsSynthesisStrategyModalOpen(true);
              return;
            }
            await startSynthesis(processId);
          }
          return;
        }
      } catch {
        // Errors handled by mutation hook
      }
    },
    [
      process,
      processId,
      hasSynthesisStrategy,
      startIdentification,
      startStudySelection,
      startQualityAssessment,
      startDataExtraction,
      startSynthesis,
    ],
  );

  const handleCompletePhase = useCallback(
    async (phaseKey: string) => {
      if (!process || process.statusText === "NotStarted") return;
      try {
        if (phaseKey === "identification") {
          const identId = process.identificationProcess?.id;
          if (identId) {
            await completeIdentification(identId);
          }
          return;
        }
        if (phaseKey === "screening") {
          const selectionId = process.studySelectionProcess?.id;
          if (selectionId) {
            await completeStudySelection(selectionId);
          }
          return;
        }
        if (phaseKey === "quality") {
          const qualityId = process.qualityAssessmentProcess?.id;
          if (qualityId) {
            await completeQualityAssessment(qualityId);
          }
          return;
        }
        if (phaseKey === "extraction") {
          const extractionId = process.dataExtractionProcess?.id;
          if (extractionId) {
            await completeDataExtraction(extractionId);
          }
          return;
        }
        if (phaseKey === "synthesis") {
          if (processId) {
            await completeSynthesis(processId);
          }
          return;
        }
      } catch {
        // Errors handled by mutation hook
      }
    },
    [
      process,
      processId,
      completeIdentification,
      completeStudySelection,
      completeQualityAssessment,
      completeDataExtraction,
      completeSynthesis,
    ],
  );
  const handleReopenPhase = useCallback(
    async (phaseKey: string) => {
      if (!processId || !process) return;

      // Find the phase definition to get the numeric ID
      const def = WORKFLOW_PHASES.find((p) => p.key === phaseKey);
      if (!def) return;

      if (
        window.confirm(
          `Are you sure you want to reopen the ${def.name} phase? This will set its status back to In Progress.`,
        )
      ) {
        try {
          await reopenPhase({ id: processId, phase: def.id });
        } catch {
          // Error handled by mutation
        }
      }
    },
    [processId, process, reopenPhase],
  );

  // Build phaseStats: use real API data where available
  const mockStats = getMockPhaseStats();
  const prismaStats = process?.identificationProcess?.prismaStatistics;
  const selectionStats = process?.studySelectionProcess?.selectionStatistics;
  const qualityStats = process?.qualityAssessmentProcess?.qualityStatistics;
  const extractionProcessId = process?.dataExtractionProcess?.id;

  // Fetch extraction dashboard data for real-time statistics
  const extractionDashboardQuery = useQuery({
    queryKey: ["data-extraction-conducting", "dashboard", extractionProcessId],
    queryFn: async () => {
      if (!extractionProcessId) {
        throw new Error("Data extraction process ID is required");
      }

      const response = await dataExtractionConductingService.getDashboard(extractionProcessId, {
        pageNumber: 1,
        pageSize: 1,
      });

      if (!response.isSuccess || !response.data) {
        throw new Error(response.message || "Failed to load extraction dashboard");
      }

      return response.data;
    },
    enabled: !!extractionProcessId,
    staleTime: 30_000,
  });

  const phaseStats: PhaseStats = useMemo(
    () => ({
      ...mockStats,
      identification: prismaStats
        ? {
            recordsImported: prismaStats.totalRecordsImported,
            duplicatesRemoved: prismaStats.duplicateRecords,
            databasesSearched: prismaStats.importBatchCount,
            uniqueRecords: prismaStats.uniqueRecords,
          }
        : mockStats.identification,
      screening: selectionStats
        ? {
            totalPapers: selectionStats.totalPapers,
            included: selectionStats.includedCount,
            excluded: selectionStats.excludedCount,
            conflictCount: selectionStats.conflictCount,
            pendingCount: selectionStats.pendingCount,
          }
        : mockStats.screening,
      quality: qualityStats
        ? {
            totalPapers: qualityStats.totalPapers,
            highQualityPapers: qualityStats.highQualityPapers,
            lowQualityPapers: qualityStats.lowQualityPapers,
            inProgressPapers: qualityStats.inProgressPapers,
            notStartedPapers: qualityStats.notStartedPapers,
          }
        : mockStats.quality,
      extraction: extractionDashboardQuery.data
        ? {
            studiesExtracted: extractionDashboardQuery.data.summary.totalIncluded,
            fieldsExtracted: mockStats.extraction.fieldsExtracted, // Keep mock for now as not provided by API
            pending: extractionDashboardQuery.data.summary.inProgress,
            completed: extractionDashboardQuery.data.summary.completed,
            awaitingConsensus: extractionDashboardQuery.data.summary.awaitingConsensus,
          }
        : mockStats.extraction,
    }),
    [mockStats, prismaStats, selectionStats, qualityStats, extractionDashboardQuery.data],
  );

  // Derive workflow phases from process + stats
  const workflowPhases: WorkflowPhase[] = useMemo(() => {
    if (!process) return [];

    let previousCompleted = true; // first phase has no prerequisite
    return WORKFLOW_PHASES.map((def) => {
      // Skip identification if it's still in the list for some reason
      if (def.key === "identification") return null;

      const status = derivePhaseStatus(process, def.id, def.key, previousCompleted);
      const stats = buildPhaseStats(def.key, phaseStats);

      // Determine subprocess id
      let subprocessId: string | undefined;
      if (def.key === "screening") subprocessId = process.studySelectionProcess?.id;
      if (def.key === "extraction") subprocessId = process.dataExtractionProcess?.id;
      if (def.key === "quality") subprocessId = process.qualityAssessmentProcess?.id;
      if (def.key === "synthesis") subprocessId = process.synthesisProcess?.id;

      const phase: WorkflowPhase = {
        id: def.id,
        name: def.name,
        key: def.key,
        status,
        stats,
        subprocessId,
        lockReason: status === "Locked" ? getLockReason(def.id, def.key) : undefined,
      };

      // Update previousCompleted for the next iteration
      previousCompleted = status === "Completed";

      return phase;
    }).filter((p): p is WorkflowPhase => p !== null);
  }, [process, phaseStats]);

  // Derive paper pool stats for the whole process
  const paperStats: ProcessPaperStats = useMemo(() => {
    const stats = process?.studySelectionProcess?.selectionStatistics;

    // Fallback/Mock logic if stats aren't directly available or for specific fields
    // In a real app, these should come from the review_process_papers relation
    const total = stats?.totalPapers ?? process?.totalPapersImported ?? 0;
    const included = stats?.includedCount ?? process?.totalIncludedPapers ?? 0;
    const excluded = stats?.excludedCount ?? process?.totalExcludedPapers ?? 0;
    const pending = stats?.pendingCount ?? 0;

    // For "Screening" vs "Not Screened", we might need more granular data.
    // Here we'll use a heuristic or just put everything in Not Screened if not sure.
    // If we have startedAt but not completedAt, some are likely in screening.
    const inScreening =
      process?.studySelectionProcess?.statusText === "InProgress"
        ? Math.floor(pending * 0.3) // Mock split for demonstration
        : 0;
    const notScreened = pending - inScreening;

    return {
      total,
      notScreened,
      screening: inScreening,
      included,
      excluded,
    };
  }, [process]);

  const activities = getMockActivities();
  const teamMembers = getMockTeamMembers();
  const alerts = getMockAlerts();
  const progressStats = getMockProgressStats();

  // Computed values
  const completedPhases = useMemo(
    () => workflowPhases.filter((p) => p.status === "Completed").map((p) => p.id),
    [workflowPhases],
  );

  // Loading maps for per-phase loading indicators
  const phaseStartLoadingMap: Record<string, boolean> = useMemo(
    () => ({
      identification: isStartingIdentification,
      screening: isStartingStudySelection,
      quality: isStartingQualityAssessment,
      extraction: isStartingDataExtraction,
      synthesis: isStartingSynthesis,
    }),
    [
      isStartingIdentification,
      isStartingStudySelection,
      isStartingQualityAssessment,
      isStartingDataExtraction,
      isStartingSynthesis,
    ],
  );
  const phaseCompleteLoadingMap: Record<string, boolean> = useMemo(
    () => ({
      identification: isCompletingIdentification,
      screening: isCompletingStudySelection,
      quality: isCompletingQualityAssessment,
      extraction: isCompletingDataExtraction,
      synthesis: isCompletingSynthesis,
    }),
    [
      isCompletingIdentification,
      isCompletingStudySelection,
      isCompletingQualityAssessment,
      isCompletingDataExtraction,
      isCompletingSynthesis,
    ],
  );

  const phaseReopenLoadingMap: Record<string, boolean> = useMemo(
    () => ({
      identification: reopenLoading,
      screening: reopenLoading,
      quality: reopenLoading,
      extraction: reopenLoading,
    }),
    [reopenLoading],
  );

  return {
    member: currentProjectMember,
    isMemberLoading,

    process,
    isLoading,
    error,

    workflowPhases,
    paperStats,

    phaseStats,
    activities,
    teamMembers,
    alerts,
    progressStats,

    handleBack,
    handleStartProcess,
    handleCompleteProcess,
    handleOpenPhase,
    handleStartPhase,
    handleCompletePhase,
    handleReopenPhase,

    startLoading,
    completeLoading,
    phaseStartLoadingMap,
    phaseCompleteLoadingMap,
    phaseReopenLoadingMap,

    isCriteriaModalOpen,
    setIsCriteriaModalOpen,
    isQualityCriteriaModalOpen,
    setIsQualityCriteriaModalOpen,
    isSynthesisStrategyModalOpen,
    setIsSynthesisStrategyModalOpen,

    completedPhases,
  };
};
