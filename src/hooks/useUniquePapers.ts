// Custom React Hook for Unique Papers — React Query (TanStack Query)
// Provides paginated state management with search & year filtering
// Source: UniquePapersAPI.md

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { paperService } from "../services/paperService";
import { QUERY_KEYS } from "../constants/queryKeys";
import { getErrorMessage } from "../utils/errorUtils";
import type { PaperResponse } from "../types/paper";

interface UseUniquePapersOptions {
  identificationProcessId: string | undefined;
  pageSize?: number;
  autoFetch?: boolean; // Whether to fetch on mount / param change (default: true)
}

export const useUniquePapers = ({
  identificationProcessId,
  pageSize = 20,
  autoFetch = true,
}: UseUniquePapersOptions) => {
  // Filter state (local — drives the query key)
  const [search, setSearchState] = useState("");
  const [year, setYearState] = useState<number | undefined>();
  const [pageNumber, setPageNumberState] = useState(1);

  // Build stable filter object for the query key
  const filters = useMemo(
    () => ({
      search: search || undefined,
      year,
      pageNumber,
      pageSize,
    }),
    [search, year, pageNumber, pageSize],
  );

  const query = useQuery({
    queryKey: QUERY_KEYS.identification.uniquePapers(identificationProcessId || "", filters),
    queryFn: () =>
      identificationProcessId
        ? paperService.getUniquePapers({
            identificationProcessId,
            search: filters.search,
            year: filters.year,
            pageNumber: filters.pageNumber,
            pageSize: filters.pageSize,
          })
        : Promise.reject("No identification process ID"),
    enabled: !!identificationProcessId && autoFetch,
    staleTime: 60 * 1000,
  });

  // Unwrap response
  const data = query.data?.data;
  const papers: PaperResponse[] = data?.items || [];
  const totalCount = data?.totalCount ?? 0;
  const currentPage = data?.pageNumber ?? pageNumber;
  const totalPages = data?.totalPages ?? 0;
  const hasNextPage = data?.hasNextPage ?? false;
  const hasPreviousPage = data?.hasPreviousPage ?? false;

  /**
   * Update search text and reset to page 1
   */
  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageNumberState(1);
  }, []);

  /**
   * Update year filter and reset to page 1
   */
  const setYear = useCallback((value: number | undefined) => {
    setYearState(value);
    setPageNumberState(1);
  }, []);

  /**
   * Set page number directly
   */
  const setPageNumber = useCallback((page: number) => {
    setPageNumberState(page);
  }, []);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPageNumberState((prev) => prev + 1);
    }
  }, [hasNextPage]);

  /**
   * Go to previous page
   */
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPageNumberState((prev) => Math.max(1, prev - 1));
    }
  }, [hasPreviousPage]);

  /**
   * Refetch current page (e.g. after deduplication)
   */
  const refetch = useCallback(() => {
    query.refetch();
  }, [query]);

  return {
    // Data
    papers,
    totalCount,
    pageNumber: currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,

    // Loading / error
    loading: query.isLoading,
    error: query.error ? getErrorMessage(query.error, "Failed to fetch unique papers") : null,

    // Filters
    search,
    year,
    setSearch,
    setYear,

    // Pagination actions
    setPageNumber,
    nextPage,
    previousPage,

    // Manual fetch
    refetch,
  };
};
