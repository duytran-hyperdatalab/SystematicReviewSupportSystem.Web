// Hook for managing the Build Dataset tab state
// Orchestrates: ready papers query, snapshot query, add-to-snapshot mutation
// Each table has independent search/year/pagination state

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { identificationProcessService } from "../../../../services/identificationProcessService";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import { getErrorMessage } from "../../../../utils/errorUtils";
import { DATASET_PAGE_SIZE } from "../constants";
import type { PaperResponse } from "../../../../types/paper";
import toast from "react-hot-toast";

interface UseSnapshotDatasetOptions {
  identificationProcessId: string | undefined;
  pageSize?: number;
}

export const useSnapshotDataset = ({
  identificationProcessId,
  pageSize = DATASET_PAGE_SIZE,
}: UseSnapshotDatasetOptions) => {
  const queryClient = useQueryClient();

  // ── Ready Papers filter/pagination state ──
  const [readySearch, setReadySearchState] = useState("");
  const [readyYear, setReadyYearState] = useState<number | undefined>();
  const [readySearchSourceId, setReadySearchSourceIdState] = useState<string | undefined>();
  const [readyPage, setReadyPageState] = useState(1);

  // ── Snapshot filter/pagination state ──
  const [snapshotSearch, setSnapshotSearchState] = useState("");
  const [snapshotYear, setSnapshotYearState] = useState<number | undefined>();
  const [snapshotSearchSourceId, setSnapshotSearchSourceIdState] = useState<string | undefined>();
  const [snapshotPage, setSnapshotPageState] = useState(1);

  // ── Stable filter objects ──
  const readyFilters = useMemo(
    () => ({
      search: readySearch || undefined,
      year: readyYear,
      searchSourceId: readySearchSourceId,
      pageNumber: readyPage,
      pageSize,
    }),
    [readySearch, readyYear, readySearchSourceId, readyPage, pageSize],
  );

  const snapshotFilters = useMemo(
    () => ({
      search: snapshotSearch || undefined,
      year: snapshotYear,
      searchSourceId: snapshotSearchSourceId,
      pageNumber: snapshotPage,
      pageSize,
    }),
    [snapshotSearch, snapshotYear, snapshotSearchSourceId, snapshotPage, pageSize],
  );

  // ── Ready Papers Query ──
  const readyQuery = useQuery({
    queryKey: QUERY_KEYS.identification.readyPapers(identificationProcessId || "", readyFilters),
    queryFn: () =>
      identificationProcessService.getReadyPapers({
        identificationProcessId: identificationProcessId!,
        ...readyFilters,
      }),
    enabled: !!identificationProcessId,
    staleTime: 30 * 1000,
  });

  // ── Snapshot Papers Query ──
  const snapshotQuery = useQuery({
    queryKey: QUERY_KEYS.identification.snapshotPapers(
      identificationProcessId || "",
      snapshotFilters,
    ),
    queryFn: () =>
      identificationProcessService.getSnapshotPapers({
        identificationProcessId: identificationProcessId!,
        ...snapshotFilters,
      }),
    enabled: !!identificationProcessId,
    staleTime: 30 * 1000,
  });

  // ── Add to Snapshot Mutation ──
  const addMutation = useMutation({
    mutationFn: (paperIds: string[]) =>
      identificationProcessService.addPapersToSnapshot(identificationProcessId!, { paperIds }),
    onSuccess: () => {
      toast.success("Papers added to screening dataset");
      // Invalidate both queries so they refetch
      if (identificationProcessId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.identification.readyPapers(identificationProcessId, {}),
          exact: false,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.identification.snapshotPapers(identificationProcessId, {}),
          exact: false,
        });
        // Also refresh statistics (snapshot count may be used)
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.identification.statistics(identificationProcessId),
        });
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to add papers");
      toast.error(message);
    },
  });

  // ── Unwrap Ready Papers ──
  const readyData = readyQuery.data?.data;
  const readyPapers: PaperResponse[] = readyData?.items || [];
  const readyTotalCount = readyData?.totalCount ?? 0;
  const readyTotalPages = readyData?.totalPages ?? 0;
  const readyHasNext = readyData?.hasNextPage ?? false;
  const readyHasPrev = readyData?.hasPreviousPage ?? false;

  // ── Unwrap Snapshot Papers ──
  const snapshotData = snapshotQuery.data?.data;
  const snapshotPapers: PaperResponse[] = snapshotData?.items || [];
  const snapshotTotalCount = snapshotData?.totalCount ?? 0;
  const snapshotTotalPages = snapshotData?.totalPages ?? 0;
  const snapshotHasNext = snapshotData?.hasNextPage ?? false;
  const snapshotHasPrev = snapshotData?.hasPreviousPage ?? false;

  // ── Ready Papers filter setters (reset page on filter change) ──
  const setReadySearch = useCallback((v: string) => {
    setReadySearchState(v);
    setReadyPageState(1);
  }, []);

  const setReadyYear = useCallback((v: number | undefined) => {
    setReadyYearState(v);
    setReadyPageState(1);
  }, []);

  const setReadySearchSourceId = useCallback((v: string | undefined) => {
    setReadySearchSourceIdState(v);
    setReadyPageState(1);
  }, []);

  const clearReadyFilters = useCallback(() => {
    setReadySearchState("");
    setReadyYearState(undefined);
    setReadySearchSourceIdState(undefined);
    setReadyPageState(1);
  }, []);

  // ── Snapshot filter setters ──
  const setSnapshotSearch = useCallback((v: string) => {
    setSnapshotSearchState(v);
    setSnapshotPageState(1);
  }, []);

  const setSnapshotYear = useCallback((v: number | undefined) => {
    setSnapshotYearState(v);
    setSnapshotPageState(1);
  }, []);

  const setSnapshotSearchSourceId = useCallback((v: string | undefined) => {
    setSnapshotSearchSourceIdState(v);
    setSnapshotPageState(1);
  }, []);

  const clearSnapshotFilters = useCallback(() => {
    setSnapshotSearchState("");
    setSnapshotYearState(undefined);
    setSnapshotSearchSourceIdState(undefined);
    setSnapshotPageState(1);
  }, []);

  // ── Add to snapshot action ──
  const addToSnapshot = useCallback(
    async (paperIds: string[]) => {
      if (!identificationProcessId || paperIds.length === 0) return;
      await addMutation.mutateAsync(paperIds);
    },
    [identificationProcessId, addMutation],
  );

  return {
    // Ready papers data
    readyPapers,
    readyTotalCount,
    readyPage,
    readyTotalPages,
    readyHasNext,
    readyHasPrev,
    readyLoading: readyQuery.isLoading,
    readyFetching: readyQuery.isFetching,
    readyError: readyQuery.error
      ? getErrorMessage(readyQuery.error, "Failed to load ready papers")
      : null,

    // Ready papers filters
    readySearch,
    readyYear,
    readySearchSourceId,
    setReadySearch,
    setReadyYear,
    setReadySearchSourceId,
    clearReadyFilters,
    readyNextPage: () => readyHasNext && setReadyPageState((p) => p + 1),
    readyPrevPage: () => readyHasPrev && setReadyPageState((p) => Math.max(1, p - 1)),
    refetchReady: () => readyQuery.refetch(),

    // Snapshot data
    snapshotPapers,
    snapshotTotalCount,
    snapshotPage,
    snapshotTotalPages,
    snapshotHasNext,
    snapshotHasPrev,
    snapshotLoading: snapshotQuery.isLoading,
    snapshotFetching: snapshotQuery.isFetching,
    snapshotError: snapshotQuery.error
      ? getErrorMessage(snapshotQuery.error, "Failed to load snapshot papers")
      : null,

    // Snapshot filters
    snapshotSearch,
    snapshotYear,
    snapshotSearchSourceId,
    setSnapshotSearch,
    setSnapshotYear,
    setSnapshotSearchSourceId,
    clearSnapshotFilters,
    snapshotNextPage: () => snapshotHasNext && setSnapshotPageState((p) => p + 1),
    snapshotPrevPage: () => snapshotHasPrev && setSnapshotPageState((p) => Math.max(1, p - 1)),
    refetchSnapshot: () => snapshotQuery.refetch(),

    // Mutation
    addToSnapshot,
    isAdding: addMutation.isPending,

    // Page size
    pageSize,
  };
};
