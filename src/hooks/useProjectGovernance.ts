import { useQuery, useQueries, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { coreAndGovernanceService } from "../services/coreAndGovernanceService";
import { QUERY_KEYS } from "../constants/queryKeys";
import type {
  CreateReviewNeedInput,
  CreateCommissioningDocumentInput,
  CreateReviewObjectiveInput,
  CreateResearchQuestionInput,
  CreatePICOCElementInput,
  PICOCElement,
} from "../types/coreAndGovernance";
import toast from "react-hot-toast";

/**
 * Hook for managing project review needs
 */
export const useReviewNeeds = (projectId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.needs(projectId || ""),
    queryFn: () => coreAndGovernanceService.getReviewNeeds(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });

  const addMutation = useMutation({
    mutationFn: (data: CreateReviewNeedInput) =>
      coreAndGovernanceService.createReviewNeed(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.needs(projectId || "") });
      toast.success("Review need added successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add review need"),
  });

  return {
    needs: query.data || [],
    isLoading: query.isLoading,
    addNeed: addMutation.mutateAsync,
    isSubmitting: addMutation.isPending,
  };
};

/**
 * Hook for managing project commissioning documents
 */
export const useDocuments = (projectId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.documents(projectId || ""),
    queryFn: () => coreAndGovernanceService.getDocuments(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });

  const addMutation = useMutation({
    mutationFn: (data: CreateCommissioningDocumentInput) =>
      coreAndGovernanceService.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.documents(projectId || "") });
      toast.success("Document added successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add document"),
  });

  return {
    documents: query.data || [],
    isLoading: query.isLoading,
    addDocument: addMutation.mutateAsync,
    isSubmitting: addMutation.isPending,
  };
};

/**
 * Hook for managing project review objectives
 */
export const useObjectives = (projectId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.objectives(projectId || ""),
    queryFn: () => coreAndGovernanceService.getObjectives(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });

  const addMutation = useMutation({
    mutationFn: (data: CreateReviewObjectiveInput) =>
      coreAndGovernanceService.createObjective(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects.objectives(projectId || "") });
      toast.success("Objective added successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add objective"),
  });

  return {
    objectives: query.data || [],
    isLoading: query.isLoading,
    addObjective: addMutation.mutateAsync,
    isSubmitting: addMutation.isPending,
  };
};

/**
 * Hook for managing project research questions
 */
export const useResearchQuestions = (projectId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.projects.researchQuestions(projectId || ""),
    queryFn: () => coreAndGovernanceService.getResearchQuestions(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });

  const addMutation = useMutation({
    mutationFn: (data: CreateResearchQuestionInput) =>
      coreAndGovernanceService.createResearchQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.projects.researchQuestions(projectId || ""),
      });
      toast.success("Research question added successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add research question"),
  });

  return {
    questions: query.data || [],
    isLoading: query.isLoading,
    addQuestion: addMutation.mutateAsync,
    isSubmitting: addMutation.isPending,
  };
};

/**
 * Hook for fetching static question types
 */
export const useQuestionTypes = () => {
  const query = useQuery({
    queryKey: QUERY_KEYS.static.questionTypes,
    queryFn: () => coreAndGovernanceService.getQuestionTypes(),
    staleTime: 30 * 60 * 1000,
    select: (res) => res.data,
  });

  return {
    questionTypes: query.data || [],
    isLoading: query.isLoading,
  };
};

/**
 * Standalone hook for managing PICOC elements across multiple research questions.
 * Uses useQueries to fetch elements per question and returns a Record<questionId, PICOCElement[]>.
 * Uses queryOptions because useQueries infer type differently from useQuery, this a workaround
 */
export const usePicoc = (questionIds: string[] = []) => {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: questionIds.map((qid) => queryOptions({
      queryKey: QUERY_KEYS.researchQuestions.picoc(qid),
      queryFn: () => coreAndGovernanceService.getPicocElements(qid),
      enabled: !!qid,
      staleTime: 5 * 60 * 1000,
      select: (res) =>
        res.data,
    })),
  });

  const picocElements: Record<string, PICOCElement[]> = {};
  questionIds.forEach((qid, i) => {
    picocElements[qid] = results[i].data || [];
  });

  const addMutation = useMutation({
    mutationFn: (data: CreatePICOCElementInput) =>
      coreAndGovernanceService.createPicocElement(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.researchQuestions.picoc(variables.research_question_id),
      });
      toast.success("PICOC element added successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to add PICOC element"),
  });

  return {
    picocElements,
    isLoading: results.some((r) => r.isLoading),
    addPicoc: addMutation.mutateAsync,
    isSubmitting: addMutation.isPending,
  };
};

/**
 * Unified hook for project governance overview
 */
export const useProjectGovernance = (projectId?: string) => {
  const { needs, isLoading: needsLoading, addNeed, isSubmitting: needSubmitting } = useReviewNeeds(projectId);
  const { documents, isLoading: docsLoading, addDocument, isSubmitting: docSubmitting } = useDocuments(projectId);
  const { objectives, isLoading: objsLoading, addObjective, isSubmitting: objSubmitting } = useObjectives(projectId);
  const { questions, isLoading: qsLoading, addQuestion, isSubmitting: qSubmitting } = useResearchQuestions(projectId);
  const { questionTypes, isLoading: typesLoading } = useQuestionTypes();
  const { picocElements, isLoading: picocLoading, addPicoc, isSubmitting: picocSubmitting } = usePicoc(
    questions.map((q) => q.research_question_id),
  );

  return {
    reviewNeeds: needs,
    documents,
    objectives,
    questions,
    questionTypes,
    picocElements,
    loading: needsLoading || docsLoading || objsLoading || qsLoading || typesLoading || picocLoading,
    isSubmitting: needSubmitting || docSubmitting || objSubmitting || qSubmitting || picocSubmitting,
    addNeed,
    addDocument,
    addObjective,
    addQuestion,
    addPicoc,
  };
};


