import { useQuery } from "@tanstack/react-query";
import { paperService } from "../services/paperService";
import type { PaperDetailsResponse } from "../types/paper";
import { QUERY_KEYS } from "../constants/queryKeys";

/**
 * Hook to fetch full metadata for a single paper.
 * Uses the project-level Paper Management API.
 */
export const usePaperDetails = (paperId: string | undefined) => {
  return useQuery<PaperDetailsResponse>({
    queryKey: QUERY_KEYS.papers.detail(paperId!),
    queryFn: async () => {
      const response = await paperService.getPaperDetails(paperId!);
      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to fetch paper details");
      }
      return response.data;
    },
    enabled: !!paperId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
