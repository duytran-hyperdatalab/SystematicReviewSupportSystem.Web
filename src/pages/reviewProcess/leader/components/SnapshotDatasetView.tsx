import React, { useState, useCallback } from "react";
import { FiDatabase, FiSearch, FiRefreshCw, FiFilter, FiX } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import Button from "../../../../components/ui/Button";
import PaperCard from "./PaperCard";
import PaperDetailsView from "../../../../components/papers/PaperDetailsView";
import type { PaperResponse } from "../../../../types/paper";

interface SnapshotDatasetViewProps {
  papers: PaperResponse[];
  totalCount: number;
  page: number;
  totalPages: number;
  loading: boolean;
  fetching: boolean;
  error: string | null;
  pageSize: number;

  // Filters
  searchInput: string;
  yearInput: string;
  onSearchInputChange: (v: string) => void;
  onYearInputChange: (v: string) => void;
  onSearch: (v: string) => void;
  onYearFilter: (v: number | undefined) => void;
  onClearFilters: () => void;
  onRefetch: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;

  // Actions
  onRemoveFromSnapshot?: (paperId: string) => void;
  canEdit?: boolean;
}

export const SnapshotDatasetView: React.FC<SnapshotDatasetViewProps> = ({
  papers,
  totalCount,
  page,
  totalPages,
  loading,
  fetching,
  error,
  pageSize,
  searchInput,
  yearInput,
  onSearchInputChange,
  onYearInputChange,
  onSearch,
  onYearFilter,
  onClearFilters,
  onRefetch,
  onNextPage,
  onPreviousPage,
  onRemoveFromSnapshot,
  canEdit = true,
}) => {
  const [selectedPaper, setSelectedPaper] = useState<PaperResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleViewDetails = useCallback((paper: PaperResponse) => {
    setSelectedPaper(paper);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedPaper(null), 300);
  }, []);

  const hasFilters = !!(searchInput || yearInput);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiDatabase className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Snapshot Dataset</h3>
            <p className="text-xs text-gray-500">Papers ready for screening</p>
          </div>
          <div className="ml-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100">
            <span className="text-sm font-bold text-blue-700">{totalCount.toLocaleString()}</span>
            <span className="text-xs text-blue-500 ml-1">papers</span>
          </div>
        </div>
        <button
          onClick={onRefetch}
          disabled={fetching}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
            "text-gray-500 hover:text-blue-600 hover:bg-blue-50",
            fetching && "opacity-60 cursor-not-allowed"
          )}
          title="Refresh dataset"
        >
          <FiRefreshCw className={cn("w-4 h-4", fetching && "animate-spin")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search papers by title, authors, keywords..."
              value={searchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch(searchInput);
              }}
              className={cn(
                "w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900",
                "placeholder:text-gray-400",
                "focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
                "hover:border-gray-300",
                "transition-all duration-200 shadow-sm"
              )}
            />
            {searchInput && (
              <button
                onClick={() => {
                  onSearchInputChange("");
                  onSearch("");
                }}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              showFilters || yearInput
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                {([searchInput, yearInput].filter(Boolean).length)}
              </span>
            )}
          </button>
        </div>

        {/* Extended Filters */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            showFilters ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publication Year
              </label>
              <input
                type="number"
                placeholder="e.g. 2024"
                value={yearInput}
                onChange={(e) => {
                  onYearInputChange(e.target.value);
                  const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  if (!e.target.value || (val && val >= 1900 && val < 2100)) {
                    onYearFilter(val);
                  }
                }}
                className={cn(
                  "w-32 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900",
                  "placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
                  "transition-all shadow-sm"
                )}
              />
            </div>
            {hasFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all"
              >
                <FiX className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Filters Pills */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-gray-500">Active filters:</span>
          {searchInput && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
              Search: "{searchInput}"
              <button onClick={() => onSearchInputChange("")} className="ml-1 hover:text-blue-900">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
          {yearInput && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-100">
              Year: {yearInput}
              <button onClick={() => onYearInputChange("")} className="ml-1 hover:text-purple-900">
                <FiX className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && papers.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-5 bg-gray-100 rounded-full w-16" />
                  <div className="h-5 bg-gray-100 rounded-full w-20" />
                </div>
                <div className="h-px bg-gray-50 mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5 shadow-lg">
              <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Failed to load dataset</h4>
            <p className="text-red-600 text-sm font-medium mb-5">{error}</p>
            <Button variant="primary" onClick={onRefetch}>
              <FiRefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : papers.length > 0 ? (
          <>
            {fetching && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-blue-700 font-medium">Updating dataset...</span>
              </div>
            )}

            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}</span> of{" "}
                <span className="font-bold text-blue-600">{totalCount.toLocaleString()}</span> papers
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Page {page} of {totalPages}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {papers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onViewDetails={handleViewDetails}
                  onRemove={canEdit ? onRemoveFromSnapshot : undefined}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 px-4">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-xl">
                <FiDatabase className="w-14 h-14 text-slate-300" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                <FiSearch className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {hasFilters ? "No matches found" : "No papers in snapshot yet"}
            </h3>
            <p className="text-gray-500 text-center max-w-sm mb-6 leading-relaxed">
              {hasFilters
                ? "No papers match your current filters. Try adjusting your search or year criteria."
                : "Start building your research dataset by adding papers from the Ready Papers list."}
            </p>
            {hasFilters ? (
              <Button variant="primary" onClick={onClearFilters}>
                <FiX className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FiDatabase className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  Add papers from Ready Papers panel
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: Pagination */}
      {papers.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">
                  {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}
                </span>{" "}
                of {totalCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1 || fetching}
                onClick={onPreviousPage}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-lg transition-all",
                  "text-gray-600 bg-white border border-gray-200",
                  "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                Previous
              </button>
              <div className="px-3 py-2 text-xs font-semibold text-gray-900 bg-gray-100 rounded-lg mx-1">
                {page} / {totalPages}
              </div>
              <button
                disabled={page >= totalPages || fetching}
                onClick={onNextPage}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded-lg transition-all",
                  "text-gray-600 bg-white border border-gray-200",
                  "hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paper Details Drawer */}
      <PaperDetailsView
        paper={selectedPaper}
        mode="drawer"
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
};

export default SnapshotDatasetView;