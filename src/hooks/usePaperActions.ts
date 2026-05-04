import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { studySelectionService } from "../services/studySelectionService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type { UploadPdfOptions } from "../pages/reviewProcess/studySelection/uploadTypes";
import type { ScreeningDecision } from "../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { PaperPhase } from "../types/studySelection";

export function usePaperActions(
  studySelectionProcessId?: string,
  phase: PaperPhase = PaperPhase.TitleAbstract,
) {
  const queryClient = useQueryClient();
  const {
    projectId: routeProjectId,
    id: urlProjectId,
    screeningProcessId: urlScreeningId,
  } = useParams<{
    projectId: string;
    id: string;
    screeningProcessId: string;
  }>();

  const finalProjectId = routeProjectId || urlProjectId;

  const finalProcessId = studySelectionProcessId || urlScreeningId;
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // ---- Mutation: Upload Full-Text PDF ----
  const uploadPaperPdfMutation = useMutation({
    mutationFn: async (vars: { paperId: string; file: File; options?: UploadPdfOptions }) => {
      if (!finalProjectId) {
        throw new Error("Cannot upload PDF: missing project.");
      }

      return studySelectionService.uploadPaperFullText({
        file: vars.file,
        projectId: finalProjectId,
        paperId: vars.paperId,
        extractWithGrobid: vars.options?.extractWithGrobid,
      });
    },
    onSuccess: (_response, variables) => {
      if (finalProcessId) {
        queryClient.invalidateQueries({
          queryKey: ["study-selection", finalProcessId, "papers"],
        });
      }

      if (finalProjectId) {
        queryClient.invalidateQueries({
          queryKey: ["paper-pool", finalProjectId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.papers.all,
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.papers.detail(variables.paperId),
      });

      if (variables.options?.extractWithGrobid) {
        toast.success(
          "PDF uploaded successfully. AI metadata extraction is running in the background.",
          { duration: 5000 },
        );
        return;
      }

      toast.success("PDF uploaded successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to upload PDF"));
    },
  });

  const uploadPaperPdf = useCallback(
    async (paperId: string, file: File, options?: UploadPdfOptions) => {
      const response = await uploadPaperPdfMutation.mutateAsync({ paperId, file, options });
      return response.data;
    },
    [uploadPaperPdfMutation],
  );

  // ---- Mutation: Apply Metadata Suggestion ----
  const applyMetadataSuggestionMutation = useMutation({
    mutationFn: async (vars: { paperId: string; sourceMetadataId: string; fields: string[] }) => {
      return studySelectionService.applyMetadata(vars.paperId, {
        sourceMetadataId: vars.sourceMetadataId,
        fields: vars.fields,
      });
    },
    onSuccess: (_response, variables) => {
      if (finalProcessId) {
        queryClient.invalidateQueries({
          queryKey: ["study-selection", finalProcessId, "papers"],
        });
      }

      if (finalProjectId) {
        queryClient.invalidateQueries({
          queryKey: ["paper-pool", finalProjectId],
        });
      }

      if (finalProjectId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.papers.detail(variables.paperId),
        });
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.papers.all,
      });

      toast.success("Selected metadata applied successfully.");
    },
    onError: () => {
      toast.error("Failed to apply metadata. Please try again.");
    },
  });

  const applyMetadataSuggestion = useCallback(
    async (paperId: string, sourceMetadataId: string, fields: string[]) => {
      await applyMetadataSuggestionMutation.mutateAsync({ paperId, sourceMetadataId, fields });
    },
    [applyMetadataSuggestionMutation],
  );

  // ---- Mutation: Retry Metadata Extraction ----
  const retryMetadataExtractionMutation = useMutation({
    mutationFn: async (paperId: string) => {
      return studySelectionService.retryExtraction(paperId, { provider: "GROBID" });
    },
    onSuccess: (response, paperId) => {
      if (finalProcessId) {
        queryClient.invalidateQueries({
          queryKey: ["study-selection", finalProcessId, "papers"],
        });
      }

      if (finalProjectId) {
        queryClient.invalidateQueries({
          queryKey: ["paper-pool", finalProjectId],
        });
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.papers.detail(paperId),
      });

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.papers.all,
      });

      const extraction = response.data.extraction;
      if (extraction?.status === "failed") {
        toast.error(extraction.message ?? "Metadata extraction failed.");
        return;
      }

      if (extraction?.status === "partial") {
        toast("Metadata extraction partially completed.");
        return;
      }

      toast.success("Metadata extraction completed successfully.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to retry metadata extraction"));
    },
  });

  const retryMetadataExtraction = useCallback(
    async (paperId: string) => {
      await retryMetadataExtractionMutation.mutateAsync(paperId);
    },
    [retryMetadataExtractionMutation],
  );

  // ---- Mutation: Resolve Conflict ----
  const conflictMutation = useMutation({
    mutationFn: async (vars: { paperId: string; decision: ScreeningDecision; notes?: string }) => {
      if (!currentUser?.id) {
        throw new Error("Cannot resolve conflict: user is not authenticated.");
      }
      return studySelectionService.resolveConflict(finalProcessId!, vars.paperId, {
        finalDecision: vars.decision === "included" ? 0 : 1,
        phase,
        resolvedBy: currentUser.id,
        resolutionNotes: vars.notes ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["study-selection", finalProcessId, "papers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["study-selection", finalProcessId, "statistics"],
      });
      toast.success("Conflict resolved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to resolve conflict"));
    },
  });

  const resolveConflict = useCallback(
    (paperId: string, decision: ScreeningDecision, notes?: string) => {
      conflictMutation.mutate({ paperId, decision, notes });
    },
    [conflictMutation],
  );

  // ---- Mutation: Mark Paper as Not Retrieved ----
  const markAsNotRetrievedMutation = useMutation({
    mutationFn: async (paperId: string) => {
      if (!finalProcessId) {
        throw new Error("Cannot mark paper as not retrieved: missing process context.");
      }
      return studySelectionService.markPaperAsNotRetrieved(finalProcessId, paperId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["study-selection", finalProcessId, "papers"],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.studySelection.fullTextAssignmentPapers(finalProcessId!),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.papers.all,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to mark paper as not retrieved"));
    },
  });

  const markPaperAsNotRetrieved = useCallback(
    async (paperId: string) => {
      await markAsNotRetrievedMutation.mutateAsync(paperId);
    },
    [markAsNotRetrievedMutation],
  );

  return {
    uploadPaperPdf,
    isUploadingPdf: uploadPaperPdfMutation.isPending,
    applyMetadataSuggestion,
    isApplyingMetadataSuggestion: applyMetadataSuggestionMutation.isPending,
    retryMetadataExtraction,
    isRetryingExtraction: retryMetadataExtractionMutation.isPending,
    resolveConflict,
    isResolving: conflictMutation.isPending,
    markPaperAsNotRetrieved,
    isMarkingAsNotRetrieved: markAsNotRetrievedMutation.isPending,
  };
}
