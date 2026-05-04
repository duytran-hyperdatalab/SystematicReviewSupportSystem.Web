// Custom React Hook for Duplicate Pairs — React Query (TanStack Query)
// Fetches from the v4.0 API and adapts responses to the UI's DuplicatePair type.
// Includes resolve support with optimistic updates via useMutation.
// Source: DuplicatePapersAPI.md v4.0
//
// Endpoints:
//   GET  .../duplicate-pairs                       → PaginatedDuplicatePairResponse (nested)
//   PATCH .../duplicate-pairs/{pairId}/resolve     → ResolveDuplicatePairResponse (slim)

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deduplicationService } from "../services/deduplicationService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type {
  DuplicatePairResponse,
  DuplicatePairPaperDto,
  DuplicateResolutionDecision,
  DuplicatePair,
  DuplicateResolution,
  DuplicatePaperInfo,
} from "../types/deduplication";
import { DuplicateResolutionDecision as DecisionEnum } from "../types/deduplication";

import toast from "react-hot-toast";

// ============================================
// Adapter: API types → UI types
// ============================================

/**
 * Convert a DuplicatePairPaperDto to the UI's DuplicatePaperInfo.
 */
function adaptPaperDto(dto: DuplicatePairPaperDto): DuplicatePaperInfo {
  return {
    id: dto.id,
    title: dto.title,
    authors: dto.authors ?? "",
    year: dto.publicationYear ?? "",
    doi: dto.doi ?? undefined,
    source: dto.source ?? "",
    abstract: dto.abstract ?? "",
  };
}

/**
 * Map API reviewStatus to UI status.
 * Pending (0) → "pending", Confirmed (1) / Rejected (2) → "resolved"
 */
function adaptStatus(reviewStatus: number): "pending" | "resolved" {
  return reviewStatus === 0 ? "pending" : "resolved";
}

/**
 * Convert API confidence score (0.0–1.0) to UI percentage (0–100).
 */
function adaptConfidence(score: number | undefined): number {
  if (score === undefined) return 0;
  return Math.round(score * 100);
}

/**
 * Map API resolvedDecision (integer enum) to the UI's string.
 * 0 (KEEP_BOTH) → "keep-both", 1 (CANCEL) → "cancel", null → null
 */
function adaptResolvedDecision(decision: DuplicateResolutionDecision | undefined): string | null {
  if (decision === DecisionEnum.KEEP_BOTH) return "keep-both";
  if (decision === DecisionEnum.CANCEL) return "cancel";
  return null;
}

/**
 * Convert a nested DuplicatePairResponse to the UI's DuplicatePair.
 */
function adaptPairResponse(pair: DuplicatePairResponse): DuplicatePair {
  return {
    id: pair.id,
    originalPaper: adaptPaperDto(pair.originalPaper),
    duplicatePaper: adaptPaperDto(pair.duplicatePaper),
    similarityScore: adaptConfidence(pair.confidenceScore),
    status: adaptStatus(pair.reviewStatus),
    method: pair.method,
    methodText: pair.methodText,
    resolvedDecision: adaptResolvedDecision(pair.resolvedDecision),
    deduplicationNotes: pair.deduplicationNotes ?? null,
    detectedAt: pair.detectedAt,
  };
}

/**
 * Map UI decision string to API integer decision.
 * "keep-both" → 0 (KEEP_BOTH), "cancel" → 1 (CANCEL)
 */
function mapDecisionToApi(decision: DuplicateResolution): DuplicateResolutionDecision {
  return decision === "keep-both" ? DecisionEnum.KEEP_BOTH : DecisionEnum.CANCEL;
}

// ============================================
// Hook
// ============================================

interface UseDuplicatePairsOptions {
  projectId: string | undefined;
  pageSize?: number;
  autoFetch?: boolean;
}

export const useDuplicatePairs = ({
  projectId,
  pageSize = 100,
  autoFetch = true,
}: UseDuplicatePairsOptions) => {
  const queryClient = useQueryClient();

  // Filter / pagination state (local — drives the query key)
  const [search, setSearchState] = useState("");
  const [pageNumber, setPageNumberState] = useState(1);

  // Build stable filter object for the query key
  const filters = useMemo(
    () => ({
      search: search || undefined,
      sortBy: "confidenceDesc" as const,
      pageNumber,
      pageSize,
    }),
    [search, pageNumber, pageSize],
  );

  // ---------- Query: paginated duplicate pairs ----------
  const query = useQuery({
    queryKey: QUERY_KEYS.paperPool.duplicatePairs(projectId || "", filters),
    queryFn: () =>
      projectId
        ? deduplicationService.getDuplicatePairs({
            projectId,
            search: filters.search,
            sortBy: filters.sortBy,
            pageNumber: filters.pageNumber,
            pageSize: filters.pageSize,
          })
        : Promise.reject("No project ID"),
    enabled: !!projectId && autoFetch,
    staleTime: 60 * 1000,
  });

  // Unwrap + adapt response
  const rawData = query.data?.data;
  const pairs: DuplicatePair[] = useMemo(
    () => (rawData?.items ?? []).map(adaptPairResponse),
    [rawData],
  );
  const totalCount = rawData?.totalCount ?? 0;
  const currentPage = rawData?.pageNumber ?? pageNumber;
  const totalPages = rawData?.totalPages ?? 0;
  const hasNextPage = rawData?.hasNextPage ?? false;
  const hasPreviousPage = rawData?.hasPreviousPage ?? false;

  // Derived state
  const pendingPairs = useMemo(() => pairs.filter((p) => p.status === "pending"), [pairs]);

  // ---------- Mutation: resolve a duplicate pair ----------
  const resolveMutation = useMutation({
    mutationFn: (vars: { pairId: string; decision: DuplicateResolution }) => {
      if (!projectId) return Promise.reject("No project ID");
      return deduplicationService.resolveDuplicatePair(projectId, vars.pairId, {
        decision: mapDecisionToApi(vars.decision),
      });
    },
    onSuccess: () => {
      // Invalidate duplicates + statistics so counters stay current
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.paperPool.duplicatePairs(projectId, {}),
          exact: false,
        });
        // Also invalidate paper pool results as resolving might delete a paper
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.paperPool.papers(projectId, {}),
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.paperPool.metadata(projectId),
        });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to resolve duplicate"));
    },
  });

  /**
   * Resolve a duplicate pair. Returns true on success, false on failure.
   */
  const resolvePair = useCallback(
    async (pairId: string, decision: DuplicateResolution): Promise<boolean> => {
      try {
        const response = await resolveMutation.mutateAsync({ pairId, decision });
        return response.isSuccess;
      } catch {
        return false;
      }
    },
    [resolveMutation],
  );

  // ---------- Filter / pagination helpers ----------

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageNumberState(1);
  }, []);

  const setPageNumber = useCallback((page: number) => {
    setPageNumberState(page);
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPageNumberState((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPageNumberState((prev) => Math.max(1, prev - 1));
    }
  }, [hasPreviousPage]);

  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    // Data (already adapted to UI DuplicatePair type)
    pairs,
    pendingPairs,
    totalCount,
    pageNumber: currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,

    // Loading / error
    loading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch duplicate pairs") : null,
    resolving: resolveMutation.isPending,

    // Filters
    search,
    setSearch,

    // Pagination
    setPageNumber,
    nextPage,
    previousPage,

    // Actions
    resolvePair,
    refetch,
  };
};

