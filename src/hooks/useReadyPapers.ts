// Custom Hook for Ready Papers (papers eligible for snapshot)
// Uses React Query to fetch and manage paginated state with filters.
// Ready papers are NOT duplicates and NOT already in the snapshot.

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { identificationProcessService } from "../services/identificationProcessService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type { PaperResponse } from "../types/paper";

interface UseReadyPapersOptions {
  identificationProcessId: string | undefined;
  pageSize?: number;
  autoFetch?: boolean;
}

export const useReadyPapers = ({
  identificationProcessId,
  pageSize = 20,
  autoFetch = true,
}: UseReadyPapersOptions) => {
  const [search, setSearchState] = useState("");
  const [year, setYearState] = useState<number | undefined>();
  const [searchSourceId, setSearchSourceIdState] = useState<string | undefined>();
  const [pageNumber, setPageNumberState] = useState(1);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      year,
      searchSourceId,
      pageNumber,
      pageSize,
    }),
    [search, year, searchSourceId, pageNumber, pageSize],
  );

  const query = useQuery({
    queryKey: QUERY_KEYS.identification.readyPapers(identificationProcessId || "", filters),
    queryFn: () =>
      identificationProcessId
        ? identificationProcessService.getReadyPapers({
            identificationProcessId,
            search: filters.search,
            year: filters.year,
            searchSourceId: filters.searchSourceId,
            pageNumber: filters.pageNumber,
            pageSize: filters.pageSize,
          })
        : Promise.reject("No identification process ID"),
    enabled: !!identificationProcessId && autoFetch,
    staleTime: 60 * 1000,
  });

  const data = query.data?.data;
  const papers: PaperResponse[] = data?.items || [];
  const totalCount = data?.totalCount ?? 0;
  const currentPage = data?.pageNumber ?? pageNumber;
  const totalPages = data?.totalPages ?? 0;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPreviousPage = data?.hasPreviousPage ?? false;

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageNumberState(1);
  }, []);

  const setYear = useCallback((value: number | undefined) => {
    setYearState(value);
    setPageNumberState(1);
  }, []);

  const setSearchSourceId = useCallback((value: string | undefined) => {
    setSearchSourceIdState(value);
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
    papers,
    totalCount,
    pageNumber: currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    loading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch ready papers") : null,
    search,
    year,
    searchSourceId,
    setSearch,
    setYear,
    setSearchSourceId,
    setPageNumber,
    nextPage,
    previousPage,
    refetch,
  };
};
