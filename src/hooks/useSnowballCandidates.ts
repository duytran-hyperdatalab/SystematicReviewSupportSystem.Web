import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  candidatePaperService,
  type GetCandidatePapersParams,
  type GetPapersWithCandidatesOverviewParams,
} from "../services/candidatePaperService";
import type { SelectCandidatePaperRequest, RejectCandidatePaperRequest } from "../types/paper";
import { QUERY_KEYS } from "../constants/queryKeys";

export const useSnowballCandidates = (processId: string, filters: GetCandidatePapersParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.candidates.byReviewProcess(processId, filters),
    queryFn: async () => {
      const data = await candidatePaperService.getCandidatesByReviewProcess(processId, filters);
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to fetch candidate papers");
      }
      return data.data;
    },
    enabled: !!processId,
  });
};

export const usePapersWithCandidates = (projectId: string, filters: GetPapersWithCandidatesOverviewParams) => {
  return useQuery({
    queryKey: ["candidates", "overview", projectId, filters],
    queryFn: async () => {
      const data = await candidatePaperService.getPapersWithCandidatesOverview(projectId, filters);
      if (!data.isSuccess) throw new Error(data.message);
      return data.data;
    },
    enabled: !!projectId,
  });
};

export const usePaperSpecificCandidates = (paperId: string, filters: GetCandidatePapersParams) => {
  return useQuery({
    queryKey: ["candidates", "paper-specific", paperId, filters],
    queryFn: async () => {
      const data = await candidatePaperService.getCandidatesByPaperId(paperId, filters);
      if (!data.isSuccess) throw new Error(data.message);
      return data.data;
    },
    enabled: !!paperId,
  });
};

export const useSelectCandidates = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<SelectCandidatePaperRequest, "projectId">) => {
      const data = await candidatePaperService.selectCandidates({
        ...payload,
        projectId,
      });
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to select candidates");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.candidates.all });
      queryClient.invalidateQueries({ queryKey: ["snowballing", "overview"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.papers.all });
    },
  });
};

export const useRejectCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RejectCandidatePaperRequest) => {
      const data = await candidatePaperService.rejectCandidates(payload);
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to reject candidates");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.candidates.all });
      queryClient.invalidateQueries({ queryKey: ["snowballing", "overview"] });
    },
  });
};

export const useExtractReferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paperId: string) => {
      const data = await candidatePaperService.extractReferences(paperId);
      if (!data.isSuccess) {
        throw new Error(data.message || "Failed to extract references");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.candidates.all });
      queryClient.invalidateQueries({ queryKey: ["snowballing", "overview"] });
    },
  });
};
