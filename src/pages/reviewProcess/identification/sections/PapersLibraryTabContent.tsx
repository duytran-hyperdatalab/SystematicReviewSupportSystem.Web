// Papers Library Tab Content (now specifically showing Ready Papers)

import {
  FiRefreshCw,
  FiAlertCircle,
  FiDownload,
  FiDatabase,
  FiEye,
  FiMoreVertical,
  FiFileText,
} from "react-icons/fi";
import Button from "../../../../components/ui/Button";
import EmptyState from "../../../../components/ui/EmptyState";
import IdentificationFilterBar from "./IdentificationFilterBar";
import type { PaperResponse } from "../../../../types/paper";
import type { TabType } from "../types";
import { Ban } from "lucide-react";

interface PapersLibraryTabContentProps {
  readyPapers: PaperResponse[];
  readyPapersTotalCount: number;
  readyPapersPage: number;
  readyPapersTotalPages: number;
  readyPapersHasNext: boolean;
  readyPapersHasPrev: boolean;
  readyPapersLoading: boolean;
  readyPapersError: string | null;
  protocolId?: string;
  librarySearchInput: string;
  yearFilterInput: string;
  searchSourceFilterInput: string;
  onSearchInputChange: (value: string) => void;
  onYearInputChange: (value: string) => void;
  onSearchSourceInputChange: (value: string) => void;
  onSearch: (value: string) => void;
  onYearFilter: (year: number | undefined) => void;
  onSearchSourceFilter: (searchSourceId: string | undefined) => void;
  onClearFilters: () => void;
  onRefetch: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onViewPaper: (paper: PaperResponse) => void;
  onMarkAsDuplicate: (paper: PaperResponse) => void;
  onChangeTab: (tab: TabType) => void;
  canEdit?: boolean;
}

export default function PapersLibraryTabContent({
  readyPapers,
  readyPapersTotalCount,
  readyPapersPage,
  readyPapersTotalPages,
  readyPapersHasNext,
  readyPapersHasPrev,
  readyPapersLoading,
  readyPapersError,
  protocolId,
  librarySearchInput,
  yearFilterInput,
  searchSourceFilterInput,
  onSearchInputChange,
  onYearInputChange,
  onSearchSourceInputChange,
  onSearch,
  onYearFilter,
  onSearchSourceFilter,
  onClearFilters,
  onRefetch,
  onNextPage,
  onPreviousPage,
  onViewPaper,
  onMarkAsDuplicate,
  onChangeTab,
  canEdit = true,
}: PapersLibraryTabContentProps) {
  const hasFilters = !!(librarySearchInput || yearFilterInput || searchSourceFilterInput);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IdentificationFilterBar
            protocolId={protocolId}
            searchInput={librarySearchInput}
            yearInput={yearFilterInput}
            searchSourceInput={searchSourceFilterInput}
            onSearchInputChange={onSearchInputChange}
            onYearInputChange={onYearInputChange}
            onSearchSourceInputChange={onSearchSourceInputChange}
            onSearch={onSearch}
            onYearFilter={onYearFilter}
            onSearchSourceFilter={onSearchSourceFilter}
            onClearFilters={onClearFilters}
            tone="blue"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {readyPapersTotalCount.toLocaleString()} ready paper
            {readyPapersTotalCount !== 1 ? "s" : ""}
          </span>
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={onRefetch}
            disabled={readyPapersLoading}
          >
            <FiRefreshCw className={`w-4 h-4 ${readyPapersLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <FiDownload className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {readyPapersLoading && readyPapers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-600">Loading papers...</p>
        </div>
      ) : readyPapersError ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center py-16">
          <FiAlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-red-600 text-sm mb-4">{readyPapersError}</p>
          <Button variant="secondary" onClick={onRefetch}>
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : readyPapers.length > 0 ? (
        <div className="overflow-x-auto">
          {/* Loading overlay for subsequent fetches */}
          {readyPapersLoading && (
            <div className="flex items-center gap-2 mb-3 text-sm text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
              Updating...
            </div>
          )}
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 w-8">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Authors</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Year</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Source</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Journal</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {readyPapers.map((paper) => (
                <tr
                  key={paper.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-slate-400 font-bold">{paper.id}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="max-w-md">
                      <p className="font-medium text-gray-900 line-clamp-2">{paper.title}</p>
                      {paper.doi && (
                        <a
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
                        >
                          DOI: {paper.doi}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{paper.authors || "N/A"}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {paper.publicationYear || "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FiDatabase className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{paper.source || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{paper.journal || "N/A"}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewPaper(paper)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="View paper details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* Manual Deduplication Action */}
                      <button
                        onClick={() => onMarkAsDuplicate(paper)}
                        className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Mark as duplicate"
                        disabled={!canEdit}
                      >
                        <Ban className="w-4 h-4" />
                      </button>

                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(readyPapersPage - 1) * 20 + 1}-
              {Math.min(readyPapersPage * 20, readyPapersTotalCount)} of{" "}
              {readyPapersTotalCount.toLocaleString()} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!readyPapersHasPrev || readyPapersLoading}
                onClick={onPreviousPage}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 px-2">
                Page {readyPapersPage} of {readyPapersTotalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={!readyPapersHasNext || readyPapersLoading}
                onClick={onNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<FiFileText className="w-16 h-16 text-gray-300" />}
          title="No Ready Papers Found"
          description={
            hasFilters
              ? "No papers match your current filters. Try adjusting your search criteria."
              : "No ready papers are currently available. This may be because they are pending deduplication or have already been added to the snapshot."
          }
          actionLabel={hasFilters ? "Clear Filters" : "Go to Dataset"}
          onAction={() => {
            if (hasFilters) {
              onClearFilters();
            } else {
              onChangeTab("dataset");
            }
          }}
        />
      )}
    </div>
  );
}
