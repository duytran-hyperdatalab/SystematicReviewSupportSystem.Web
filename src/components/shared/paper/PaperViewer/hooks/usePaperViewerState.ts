import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { fieldAliases } from "../constants";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import type { PaperViewerTab } from "../types";
import { useStudySelection } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/hooks/useStudySelection";
import { useStudySelectionExclusionReasons } from "../../../../../hooks/useStudySelection";
import type { RootState } from "../../../../../redux/store";
import { PaperPhase } from "../../../../../types/studySelection";

export const usePaperViewerState = (paper: ScreeningPaper | null) => {
  const { screeningProcessId } = useParams<{ screeningProcessId: string }>();
  const [activeTab, setActiveTab] = useState<PaperViewerTab>("abstract");
  const [openGraph, setOpenGraph] = useState(false);
  const [reasonPageSize, setReasonPageSize] = useState(5);

  const {
    includePaper,
    excludePaper,
    isSubmitting: isSubmittingDecision,
    references,
    citations,
    citationGraph,
    isDiscoveryLoading,
    graphDepth,
    setGraphDepth,
    minConfidence,
    setMinConfidence,
  } = useStudySelection(PaperPhase.TitleAbstract, paper?.id ?? null);

  const { data: exclusionReasons = [], isLoading: isLoadingReasons } =
    useStudySelectionExclusionReasons(screeningProcessId, {
      onlyActive: true,
      pageSize: reasonPageSize,
    });

  const hasMoreReasons = exclusionReasons.length >= reasonPageSize;
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const hasMyDecision = useMemo(() => {
    if (!currentUser || !paper) return false;
    return paper.decisions.some((d) => d.reviewerId === currentUser.id);
  }, [paper, currentUser]);

  const canReview = useMemo(() => {
    if (!paper || hasMyDecision) return false;
    return paper.screeningStatus === "pending" || paper.screeningStatus === "conflicted";
  }, [paper, hasMyDecision]);

  const normalizeUpdatedFieldName = (fieldName: string) =>
    fieldName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  const updatedFieldSet = useMemo(
    () =>
      new Set(
        [...(paper?.extractionSuggestion?.updatedFields ?? [])].map(normalizeUpdatedFieldName),
      ),
    [paper?.extractionSuggestion?.updatedFields],
  );

  const isFieldUpdated = (...fieldNames: string[]) =>
    fieldNames.some((fieldName) => {
      const normalizedField = normalizeUpdatedFieldName(fieldName);
      const aliases = fieldAliases[normalizedField] ?? [normalizedField];
      return aliases.some((alias) => updatedFieldSet.has(alias));
    });

  return {
    screeningProcessId,
    activeTab,
    setActiveTab,
    openGraph,
    setOpenGraph,
    reasonPageSize,
    setReasonPageSize,
    includePaper,
    excludePaper,
    isSubmittingDecision,
    references,
    citations,
    citationGraph,
    isDiscoveryLoading,
    graphDepth,
    setGraphDepth,
    minConfidence,
    setMinConfidence,
    exclusionReasons,
    isLoadingReasons,
    hasMoreReasons,
    currentUser,
    hasMyDecision,
    canReview,
    isFieldUpdated,
  };
};
