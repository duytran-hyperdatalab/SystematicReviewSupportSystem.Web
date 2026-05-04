import LoadingSpinner from "../ui/LoadingSpinner";
import Button from "../ui/Button";
import PaperRow from "./PaperRow";
import type { PaperPoolItem } from "./types";

interface PaperTableProps {
  papers: PaperPoolItem[];
  isLoading: boolean;
  isFetching: boolean;
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  selectedPaperIds: string[];
  allPageSelected: boolean;
  onToggleAllPage: (checked: boolean) => void;
  onTogglePaper: (paperId: string, selected: boolean) => void;
  onViewDetails: (paper: PaperPoolItem) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // PDF Actions
  onUploadPdf?: any;
  isUploadingPdf?: boolean;
  onApplyMetadataSuggestion?: any;
  isApplyingMetadataSuggestion?: boolean;
  onMarkAsNotRetrieved?: any;
  isMarkingAsNotRetrieved?: boolean;
}

export default function PaperTable({
  papers,
  isLoading,
  isFetching,
  totalCount,
  pageNumber,
  totalPages,
  pageSize,
  selectedPaperIds,
  allPageSelected,
  onToggleAllPage,
  onTogglePaper,
  onViewDetails,
  onPageChange,
  onPageSizeChange,
  onUploadPdf,
  isUploadingPdf,
  onApplyMetadataSuggestion,
  isApplyingMetadataSuggestion,
  onMarkAsNotRetrieved,
  isMarkingAsNotRetrieved,
}: PaperTableProps) {
  if (isLoading && papers.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-white rounded-xl border border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-gray-500 animate-pulse">Loading paper library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
      {/* Table Header / Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900">
            {totalCount.toLocaleString()} <span className="font-normal text-gray-500">Results</span>
          </span>
          {isFetching && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-wider border border-blue-100">
              <div className="w-1 h-1 rounded-full bg-blue-600 animate-ping" />
              Refreshing
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Rows per page:
          </label>
          <select
            className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div
        className="overflow-auto custom-scrollbar"
        style={{ maxHeight: "calc(100vh - 400px)", minHeight: "400px" }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
            <tr className="text-left">
              <th className="px-6 py-4 w-12">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={(e) => onToggleAllPage(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                    aria-label="Select all papers in current page"
                  />
                </div>
              </th>
              <th className="px-3 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Paper ID
              </th>
              <th className="px-3 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Title & Authors
              </th>
              <th className="px-3 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Year
              </th>
              <th className="px-3 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                DOI
              </th>
              <th className="px-3 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Source
              </th>
              <th className="px-3 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Full Text
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {papers.map((paper) => (
              <PaperRow
                key={paper.id}
                paper={paper}
                isSelected={selectedPaperIds.includes(paper.id)}
                onToggleSelect={onTogglePaper}
                onViewDetails={onViewDetails}
                onUploadPdf={onUploadPdf}
                isUploadingPdf={isUploadingPdf}
                onApplyMetadataSuggestion={onApplyMetadataSuggestion}
                isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
                onMarkAsNotRetrieved={onMarkAsNotRetrieved}
                isMarkingAsNotRetrieved={isMarkingAsNotRetrieved}
              />
            ))}
            {papers.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">No papers found</h3>
                    <p className="mt-1 text-sm text-gray-500 max-w-xs">
                      We couldn't find any papers matching your current filter criteria. Try
                      adjusting your search or filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/30">
        <div className="text-xs font-medium text-gray-500">
          Showing page <span className="text-gray-900 font-bold">{pageNumber}</span> of{" "}
          <span className="text-gray-900 font-bold">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs font-bold uppercase tracking-wider"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={pageNumber <= 1 || isFetching}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {/* Simple page numbers could go here if needed */}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-xs font-bold uppercase tracking-wider"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={pageNumber >= totalPages || isFetching}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
