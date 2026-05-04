import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identificationProcessService } from "../services/identificationProcessService";
import { studySelectionService } from "../services/studySelectionService";
import { qualityAssessmentService } from "../services/qualityAssessmentService";
import { dataExtractionProcessService } from "../services/dataExtractionProcessService";
import synthesisExecutionService from "../services/synthesisExecutionService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import { toastError } from "../utils/toast";

/**
 * Mutations for Identification subprocess lifecycle (start / complete)
 */
export const useIdentificationProcessMutations = (reviewProcessId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (reviewProcessId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviewProcesses.detail(reviewProcessId),
      });
    }
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.identification.all });
  };

  const startMutation = useMutation({
    mutationFn: (id: string) => identificationProcessService.start(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Start Failed", getErrorMessage(error, "Failed to start identification"));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => identificationProcessService.complete(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Complete Failed", getErrorMessage(error, "Failed to complete identification"));
    },
  });

  return {
    startIdentification: startMutation.mutateAsync,
    isStartingIdentification: startMutation.isPending,
    startIdentificationError: startMutation.error
      ? getErrorMessage(startMutation.error, "Failed to start identification")
      : null,

    completeIdentification: completeMutation.mutateAsync,
    isCompletingIdentification: completeMutation.isPending,
    completeIdentificationError: completeMutation.error
      ? getErrorMessage(completeMutation.error, "Failed to complete identification")
      : null,
  };
};

/**
 * Mutations for Study Selection subprocess lifecycle (start / complete)
 */
export const useStudySelectionProcessMutations = (reviewProcessId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (reviewProcessId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviewProcesses.detail(reviewProcessId),
      });
    }
    queryClient.invalidateQueries({ queryKey: ["study-selection"] });
  };

  const startMutation = useMutation({
    mutationFn: (id: string) => studySelectionService.start(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Start Failed", getErrorMessage(error, "Failed to start study selection"));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => studySelectionService.complete(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Complete Failed", getErrorMessage(error, "Failed to complete study selection"));
    },
  });

  return {
    startStudySelection: startMutation.mutateAsync,
    isStartingStudySelection: startMutation.isPending,
    startStudySelectionError: startMutation.error
      ? getErrorMessage(startMutation.error, "Failed to start study selection")
      : null,

    completeStudySelection: completeMutation.mutateAsync,
    isCompletingStudySelection: completeMutation.isPending,
    completeStudySelectionError: completeMutation.error
      ? getErrorMessage(completeMutation.error, "Failed to complete study selection")
      : null,
  };
};

/**
 * Mutations for Quality Assessment subprocess lifecycle (start / complete)
 */
export const useQualityAssessmentProcessMutations = (reviewProcessId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (reviewProcessId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviewProcesses.detail(reviewProcessId),
      });
    }
    queryClient.invalidateQueries({ queryKey: ["quality-assessment"] });
  };

  const startMutation = useMutation({
    mutationFn: (id: string) => qualityAssessmentService.start(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Start Failed", getErrorMessage(error, "Failed to start quality assessment"));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => qualityAssessmentService.complete(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Complete Failed", getErrorMessage(error, "Failed to complete quality assessment"));
    },
  });

  return {
    startQualityAssessment: startMutation.mutateAsync,
    isStartingQualityAssessment: startMutation.isPending,
    startQualityAssessmentError: startMutation.error
      ? getErrorMessage(startMutation.error, "Failed to start quality assessment")
      : null,

    completeQualityAssessment: completeMutation.mutateAsync,
    isCompletingQualityAssessment: completeMutation.isPending,
    completeQualityAssessmentError: completeMutation.error
      ? getErrorMessage(completeMutation.error, "Failed to complete quality assessment")
      : null,
  };
};

/**
 * Mutations for Data Extraction subprocess lifecycle (start / complete)
 */
export const useDataExtractionProcessMutations = (reviewProcessId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (reviewProcessId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviewProcesses.detail(reviewProcessId),
      });
      queryClient.invalidateQueries({
        queryKey: ["data-extraction-conducting", "dashboard"],
      });
    }
  };

  const startMutation = useMutation({
    mutationFn: (id: string) => dataExtractionProcessService.start(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Start Failed", getErrorMessage(error, "Failed to start data extraction"));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => dataExtractionProcessService.completeProcess(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Complete Failed", getErrorMessage(error, "Failed to complete data extraction"));
    },
  });

  return {
    startDataExtraction: startMutation.mutateAsync,
    isStartingDataExtraction: startMutation.isPending,
    startDataExtractionError: startMutation.error
      ? getErrorMessage(startMutation.error, "Failed to start data extraction")
      : null,

    completeDataExtraction: completeMutation.mutateAsync,
    isCompletingDataExtraction: completeMutation.isPending,
    completeDataExtractionError: completeMutation.error
      ? getErrorMessage(completeMutation.error, "Failed to complete data extraction")
      : null,
  };
};

/**
 * Mutations for Synthesis Execution subprocess lifecycle (start / complete)
 */
export const useSynthesisProcessMutations = (reviewProcessId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (reviewProcessId) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviewProcesses.detail(reviewProcessId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.synthesisExecution.workspace(reviewProcessId),
      });
    }
  };

  const startMutation = useMutation({
    mutationFn: (id: string) => synthesisExecutionService.start(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Start Failed", getErrorMessage(error, "Failed to start synthesis"));
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => synthesisExecutionService.complete(id),
    onSuccess: () => invalidate(),
    onError: (error) => {
      toastError("Complete Failed", getErrorMessage(error, "Failed to complete synthesis"));
    },
  });

  return {
    startSynthesis: startMutation.mutateAsync,
    isStartingSynthesis: startMutation.isPending,
    startSynthesisError: startMutation.error
      ? getErrorMessage(startMutation.error, "Failed to start synthesis")
      : null,

    completeSynthesis: completeMutation.mutateAsync,
    isCompletingSynthesis: completeMutation.isPending,
    completeSynthesisError: completeMutation.error
      ? getErrorMessage(completeMutation.error, "Failed to complete synthesis")
      : null,
  };
};
