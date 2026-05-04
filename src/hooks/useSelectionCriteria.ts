import { useMutation, useQuery } from "@tanstack/react-query";
import { selectionCriteriaService } from "../services/selectionCriteriaService";
import type { AICriteriaResponse, SaveAiResultRequest, StudySelectionCriteriaDto } from "../types/selectionCriteria";

export const useGenerateAiCriteria = () => {
  return useMutation<AICriteriaResponse, Error, string>({
    mutationFn: async (studySelectionProcessId: string) => {
      const response = await selectionCriteriaService.generateAi(studySelectionProcessId);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to generate AI criteria");
      }
      return response.data;
    },
  });
};

export const useSaveAiCriteria = () => {
  return useMutation<void, Error, SaveAiResultRequest>({
    mutationFn: async (data: SaveAiResultRequest) => {
      const response = await selectionCriteriaService.saveAiResult(data);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to save selection criteria");
      }
    },
  });
};

export const useSelectionCriteria = (studySelectionProcessId: string | undefined) => {
  return useQuery<StudySelectionCriteriaDto[]>({
    queryKey: ["selection-criteria", studySelectionProcessId],
    queryFn: async () => {
      const response = await selectionCriteriaService.getByProcessId(studySelectionProcessId!);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch selection criteria");
      }
      return response.data;
    },
    enabled: !!studySelectionProcessId,
  });
};
