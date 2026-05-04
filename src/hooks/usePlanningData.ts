import { useQuery } from "@tanstack/react-query";
import type { ResearchQuestion, PICOCElement } from "../types/coreAndGovernance";
import { coreAndGovernanceService } from "../services/coreAndGovernanceService";
import { dataExtractionProcessService } from "../services/dataExtractionProcessService";
import reviewProcessService from "../services/reviewProcessService";
import { QUERY_KEYS } from "../constants/queryKeys";

/**
 * Hook to fetch planning data (Research Questions and PICOC elements)
 * from a Data Extraction Process context.
 */
interface UsePlanningDataOptions {
  projectId?: string;
  dataExtractionProcessId?: string;
}

export const usePlanningData = ({ projectId: projectIdOverride, dataExtractionProcessId }: UsePlanningDataOptions) => {
  const projectContextQuery = useQuery({
    queryKey: ["planning-project-context", projectIdOverride || dataExtractionProcessId || ""],
    queryFn: async () => {
      if (projectIdOverride) {
        return { projectId: projectIdOverride };
      }

      if (!dataExtractionProcessId) {
        throw new Error("Project ID or Data Extraction Process ID is required");
      }

      const extractionProcess = await dataExtractionProcessService.getById(dataExtractionProcessId);
      const reviewProcessResponse = await reviewProcessService.getReviewProcessById(
        extractionProcess.reviewProcessId
      );

      if (!reviewProcessResponse.isSuccess || !reviewProcessResponse.data?.projectId) {
        throw new Error("Unable to resolve project from data extraction process");
      }

      return { projectId: reviewProcessResponse.data.projectId };
    },
    enabled: !!projectIdOverride || !!dataExtractionProcessId,
    staleTime: 5 * 60 * 1000,
  });

  const projectId = projectContextQuery.data?.projectId;

  const rqQuery = useQuery({
    queryKey: QUERY_KEYS.projects.researchQuestions(projectId || ""),
    queryFn: () => {
      if (!projectId) throw new Error("Project ID is required");
      return coreAndGovernanceService.getResearchQuestions(projectId);
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (response) => response.data || [],
  });

  const picocQuery = useQuery({
    queryKey: ["planning-picoc", projectId, rqQuery.data?.length],
    queryFn: async () => {
      if (!rqQuery.data || rqQuery.data.length === 0) {
        return {};
      }

      const picocMap: Record<string, PICOCElement[]> = {};

      // Fetch PICOC elements for each RQ
      const picocPromises = rqQuery.data.map(async (rq) => {
        try {
          const response = await coreAndGovernanceService.getPicocElements(rq.research_question_id);
          picocMap[rq.research_question_id] = response.data || [];
        } catch (error) {
          console.warn(`Failed to fetch PICOC for RQ ${rq.research_question_id}:`, error);
          picocMap[rq.research_question_id] = [];
        }
      });

      await Promise.all(picocPromises);
      return picocMap;
    },
    enabled: !!rqQuery.data && rqQuery.data.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = projectContextQuery.isLoading || rqQuery.isLoading || picocQuery.isLoading;
  const error = projectContextQuery.error || rqQuery.error || picocQuery.error;

  return {
    researchQuestions: rqQuery.data || [],
    picocElementsByQuestion: (picocQuery.data || {}) as Record<string, PICOCElement[]>,
    isLoading,
    error: error ? String(error) : null,
    projectId,
  };
};

/**
 * Format RQ text for display in dropdown
 */
export const formatResearchQuestion = (rq: ResearchQuestion): string => {
  const questionText = rq.question_text || "Untitled";
  return questionText.length > 60 ? `${questionText.substring(0, 57)}...` : questionText;
};

/**
 * Get PICOC elements for a specific RQ, organized by element type
 */
export const getPicocByType = (
  picocElements: PICOCElement[],
  elementType: "population" | "intervention" | "comparison" | "outcome" | "context"
): PICOCElement[] => {
  return picocElements.filter((el) => el.element_type === elementType);
};
