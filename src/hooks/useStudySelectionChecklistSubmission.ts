import { useQuery } from "@tanstack/react-query";
import { studySelectionChecklistSubmissionService } from "../services/studySelectionChecklistSubmissionService";
import type { GetReviewerSubmissionResponse } from "../types/studySelectionChecklistSubmission";

interface GetReviewerSubmissionParams {
  processId: string;
  paperId: string;
  reviewerId: string;
  phase: number;
}

export const useReviewerSubmission = (params: GetReviewerSubmissionParams | null) => {
  return useQuery<GetReviewerSubmissionResponse>({
    queryKey: ["reviewer-submission", params],
    queryFn: async () => {
      if (!params) throw new Error("Missing parameters");
      return await studySelectionChecklistSubmissionService.getReviewerSubmission(params);
    },
    enabled: !!params,
  });
};
