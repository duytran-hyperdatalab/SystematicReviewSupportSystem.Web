import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { qualityAssessmentService } from "../../../../services/qualityAssessmentService";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import { getErrorMessage } from "../../../../utils/errorUtils";
import type { 
  QualityAssessmentAssignmentRequest, 
  QualityAssessmentResolutionRequest, 
  AutoResolveQualityAssessmentRequest,
  CreateQualityAssessmentDecisionRequest,
  UpdateQualityAssessmentDecisionRequest,
  UpdateQualityAssessmentResolutionRequest,
  AiDecisionRequest,
  AiDecisionResponseItem,
  ApiResponse,
  QADashboardParams,
  QualityAssessmentStrategy,
  QualityAssessmentChecklist,
  QualityAssessmentCriterion
} from "../../../../types/qualityAssessment";

export function useQualityAssessment(id?: string, isLeader?: boolean, params?: QADashboardParams) {
  const queryClient = useQueryClient();

  // -- Data Fetching --
  const processQuery = useQuery({
    queryKey: QUERY_KEYS.qualityAssessment.process(id ?? ""),
    queryFn: () => qualityAssessmentService.getProcess(id!),
    enabled: !!id,
  });

  const assignedPapersQuery = useQuery({
    queryKey: [...QUERY_KEYS.qualityAssessment.myAssignedPapers(id ?? ""), params],
    queryFn: () => qualityAssessmentService.getMyAssignedPapers(id ?? "", params),
    enabled: !!id && !isLeader, // Leaders don't have assigned papers
  });

  const allPapersQuery = useQuery({
    queryKey: [...QUERY_KEYS.qualityAssessment.papers(id ?? ""), params],
    queryFn: () => qualityAssessmentService.getPapers(id!, params),
    enabled: !!id && !!isLeader,
  });

  const allPapers = allPapersQuery.data?.data?.papers?.items ?? [];
  const assignedPapers = assignedPapersQuery.data?.data?.papers?.items ?? [];
  const reviewerProgresses = allPapersQuery.data?.data?.reviewerProgresses ?? [];
  
  const totalPagesList = isLeader ? allPapersQuery.data?.data?.papers?.totalPages : assignedPapersQuery.data?.data?.papers?.totalPages;
  const totalItemsList = isLeader ? allPapersQuery.data?.data?.papers?.totalCount : assignedPapersQuery.data?.data?.papers?.totalCount;

  const strategiesQuery = useQuery({
    queryKey: QUERY_KEYS.qualityAssessment.strategies(id ?? ""),
    queryFn: () => qualityAssessmentService.getProcessStrategies(id!),
    enabled: !!id,
  });

  // -- Mutations --
  const assignMutation = useMutation({
    mutationFn: (data: QualityAssessmentAssignmentRequest) => qualityAssessmentService.assignReviewers(data),
    onSuccess: () => {
      toast.success("Members assigned successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.myAssignedPapers(id ?? "") });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.papers(id ?? "") });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to assign members"));
    }
  });

  const autoResolveMutation = useMutation({
    mutationFn: (data: AutoResolveQualityAssessmentRequest) => qualityAssessmentService.autoResolve(data),
    onSuccess: () => {
      toast.success("Auto-resolution completed successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.papers(id ?? "") });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to auto-resolve papers"));
    }
  });

  const submitDecisionsMutation = useMutation({
    mutationFn: (vars: CreateQualityAssessmentDecisionRequest) =>
      qualityAssessmentService.submitDecisions(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.myAssignedPapers(id ?? "") });
      toast.success("Decisions saved successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save decisions"));
    }
  });

  const updateDecisionsMutation = useMutation({
    mutationFn: (vars: UpdateQualityAssessmentDecisionRequest) =>
      qualityAssessmentService.updateDecisions(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.myAssignedPapers(id ?? "") });
      toast.success("Decisions updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update decisions"));
    }
  });

  const submitResolutionMutation = useMutation({
    mutationFn: (data: QualityAssessmentResolutionRequest) =>
      qualityAssessmentService.submitResolution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.myAssignedPapers(id ?? "") });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.papers(id ?? "") });
      toast.success("Resolution submitted successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to submit resolution"));
    }
  });

  const updateResolutionMutation = useMutation({
    mutationFn: (data: UpdateQualityAssessmentResolutionRequest) =>
      qualityAssessmentService.updateResolution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.myAssignedPapers(id ?? "") });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.papers(id ?? "") });
      toast.success("Resolution updated successfully");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update resolution"));
    }
  });

  const aiDecisionMutation = useMutation({
    mutationFn: (data: AiDecisionRequest) => qualityAssessmentService.getAiDecision(data),
    onSuccess: (res: ApiResponse<AiDecisionResponseItem[]>) => {
      toast.success("AI analysis completed successfully");
      return res.data ?? [];
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to get AI decision"));
    }
  });

  const startProcessMutation = useMutation({
    mutationFn: () => qualityAssessmentService.start(id!),
    onSuccess: () => toast.success("Quality Assessment started"),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to start Quality Assessment")),
  });

  const completeProcessMutation = useMutation({
    mutationFn: () => qualityAssessmentService.complete(id!),
    onSuccess: () => toast.success("Quality Assessment completed"),
    onError: (error) => toast.error(getErrorMessage(error, "Failed to complete Quality Assessment")),
  });

  const upsertStrategyMutation = useMutation({
    mutationFn: (data: QualityAssessmentStrategy) => qualityAssessmentService.upsertStrategy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.strategies(id ?? "") });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save Quality Assessment strategy"));
    }
  });

  const bulkChecklistsMutation = useMutation({
    mutationFn: (data: QualityAssessmentChecklist[]) => qualityAssessmentService.bulkChecklists(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.strategies(id ?? "") });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save Quality Assessment checklist"));
    }
  });

  // Strategies upsert end at criteria 
  const bulkCriteriaMutation = useMutation({
    mutationFn: (data: QualityAssessmentCriterion[]) => qualityAssessmentService.bulkCriteria(data),
    onSuccess: () => {
      toast.success("Quality Assessment Strategies saved successfully");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.qualityAssessment.strategies(id ?? "") });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save Quality Assessment strategies"));
    }
  });

  const exportExcel = async () => {
    if (!id) return;
    try {
      const blob = await qualityAssessmentService.exportExcel(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qa_results_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Excel exported successfully");
    } catch (error) {
       toast.error(getErrorMessage(error, "Failed to export Excel"));
    }
  };

  return {
    phaseStatus: processQuery.data?.data?.statusText,
    assignedPapers,
    allPapers,
    totalPagesList,
    totalItemsList,
    leaderStats: allPapersQuery.data?.data,
    memberStats: assignedPapersQuery.data?.data,
    memberProgresses: reviewerProgresses,
    strategies: strategiesQuery.data?.data ?? [],
    isAssigning: assignMutation.isPending,
    isSubmittingDecisions: submitDecisionsMutation.isPending,
    isUpdatingDecisions: updateDecisionsMutation.isPending,
    isSubmittingResolution: submitResolutionMutation.isPending,
    isUpdatingResolution: updateResolutionMutation.isPending,
    isAutoResolving: autoResolveMutation.isPending,
    isAiDeciding: aiDecisionMutation.isPending,
    isStartingProcess: startProcessMutation.isPending,
    isCompletingProcess: completeProcessMutation.isPending,
    isUpsertingStrategy: upsertStrategyMutation.isPending,
    assign: assignMutation.mutateAsync,
    submitDecisions: submitDecisionsMutation.mutateAsync,
    updateDecisions: updateDecisionsMutation.mutateAsync,
    submitResolution: submitResolutionMutation.mutateAsync,
    updateResolution: updateResolutionMutation.mutateAsync,
    autoResolve: autoResolveMutation.mutateAsync,
    aiDecision: aiDecisionMutation.mutateAsync,
    startProcess: startProcessMutation.mutateAsync,
    completeProcess: completeProcessMutation.mutateAsync,
    upsertStrategy: upsertStrategyMutation.mutateAsync,
    bulkChecklists: bulkChecklistsMutation.mutateAsync,
    bulkCriteria: bulkCriteriaMutation.mutateAsync,
    exportExcel,
  };
}