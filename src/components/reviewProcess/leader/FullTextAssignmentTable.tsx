import React, { useState, useMemo } from "react";
import PaperFilters from "./PaperFilters";
import PapersTable from "./PapersTable";
import BulkAssignmentPanel from "./BulkAssignmentPanel";
import QuickDecisionPanel from "./QuickDecisionPanel";
import { useFullTextAssignmentPapers } from "../../../hooks/useStudySelection";
import { usePaperActions } from "../../../hooks/usePaperActions";
import {
  PaperPhase,
  AssignmentFilterStatus,
  ResolutionFilterStatus,
} from "../../../types/studySelection";
import { Loader2, AlertCircle } from "lucide-react";
import type { PaperResponse } from "../../../types/paper";

interface FullTextAssignmentTableProps {
  studySelectionProcessId: string;
  selectionMode?: "quick" | "assignment";
}

const FullTextAssignmentTable: React.FC<FullTextAssignmentTableProps> = ({
  studySelectionProcessId,
  selectionMode = "assignment",
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [searchSourceId, setSearchSourceId] = useState("");
  const [assignmentStatus, setAssignmentStatus] = useState<number>(AssignmentFilterStatus.All);
  const [decisionStatus, setDecisionStatus] = useState<number>(ResolutionFilterStatus.All);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);

  const { data: assignmentData, isLoading } = useFullTextAssignmentPapers(studySelectionProcessId, {
    search,
    year,
    searchSourceId: searchSourceId || undefined,
    assignmentStatus,
    decisionStatus,
    pageNumber,
    pageSize,
  });
  const paperActions = usePaperActions(studySelectionProcessId, PaperPhase.FullText);
  const rawPapers = assignmentData?.items || [];
  const papers = useMemo(
    () =>
      rawPapers.map((p) => {
        const members = p.assignedReviewers || (p as any).assignedMembers || [];
        return {
          ...p,
          authors: p.author,
          publicationYear: p.year,
          createdAt: (p as any).createdAt || new Date().toISOString(),
          modifiedAt: (p as any).modifiedAt || new Date().toISOString(),
          assignedReviewers: members.map((r: any) => ({
            id: r.reviewerId || r.id || r.userId || "",
            name: r.reviewerName || r.name || r.fullName || r.reviewerFullName || "Unknown",
          })),
        };
      }) as PaperResponse[],
    [rawPapers],
  );

  const totalCount = assignmentData?.totalCount || 0;
  const totalPages = assignmentData?.totalPages || 0;

  // ---- Handlers ----
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPageNumber(1);
  };

  const handleAssignmentStatusChange = (value: number) => {
    setAssignmentStatus(value);
    setPageNumber(1);
  };

  const handleYearChange = (value: number | undefined) => {
    setYear(value);
    setPageNumber(1);
  };

  const handleSearchSourceChange = (value: string) => {
    setSearchSourceId(value);
    setPageNumber(1);
  };

  const handleDecisionStatusChange = (value: number) => {
    setDecisionStatus(value);
    setPageNumber(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = papers
        .filter((p) => {
          const isUnresolved = p.decidedStatus === "None" || !p.decidedStatus;
          const isUnassigned = p.assignmentStatusText !== "Assigned";
          if (selectionMode === "quick") {
            return isUnresolved && isUnassigned;
          }
          const isPdfOk = !!p.pdfUrl;
          return isUnassigned && isUnresolved && isPdfOk;
        })
        .map((p) => p.id);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectableIds.forEach((id) => next.add(id));
        return next;
      });
    } else {
      const currentPageIds = papers.map((p) => p.id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        currentPageIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleAssignmentComplete = () => setSelectedIds(new Set());

  return (
    <>
      {/* Filters */}
      <PaperFilters
        onSearchChange={handleSearchChange}
        onYearChange={handleYearChange}
        onSearchSourceChange={handleSearchSourceChange}
        onAssignmentStatusChange={handleAssignmentStatusChange}
        onDecisionStatusChange={handleDecisionStatusChange}
        showStageFilter={false}
      />

      {/* Info Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center gap-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-800">
            <span className="font-bold">PDF Required for Assignment</span>: In the Full-Text phase,
            project policy requires all papers to have an attached PDF before they can be assigned
            to reviewers.
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Papers missing a PDF will have their selection checkbox disabled. Use the{" "}
            <span className="inline-flex items-center gap-1 mx-1 px-1 py-0.5 bg-white border border-amber-200 rounded text-[10px] text-amber-800 font-bold">
              Attach PDF
            </span>{" "}
            action to upload missing files.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto bg-gray-50/30 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : papers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <p className="font-medium text-lg">No papers found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="">
            <PapersTable
              papers={papers}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectRow={handleSelectRow}
              onUploadPdf={paperActions.uploadPaperPdf}
              isUploadingPdf={paperActions.isUploadingPdf}
              onApplyMetadataSuggestion={paperActions.applyMetadataSuggestion}
              isApplyingMetadataSuggestion={paperActions.isApplyingMetadataSuggestion}
              onMarkAsNotRetrieved={paperActions.markPaperAsNotRetrieved}
              isMarkingAsNotRetrieved={paperActions.isMarkingAsNotRetrieved}
              onRetryExtraction={paperActions.retryMetadataExtraction}
              isRetryingExtraction={paperActions.isRetryingExtraction}
              onResolveConflict={paperActions.resolveConflict}
              isResolving={paperActions.isResolving}
              studySelectionProcessId={studySelectionProcessId}
              showPdfActions={true}
              pdfRequired={true}
              selectionMode={selectionMode}
              phase={PaperPhase.FullText}
            />
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          Showing{" "}
          <span className="font-medium text-gray-900">
            {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-900">
            {Math.min(pageNumber * pageSize, totalCount)}
          </span>{" "}
          of <span className="font-medium text-gray-900">{totalCount}</span> papers
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={pageNumber === 1 || isLoading}
            onClick={() => handlePageChange(pageNumber - 1)}
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded ${pageNumber === page
                    ? "bg-blue-50 text-blue-600 border-blue-100"
                    : "hover:bg-gray-50"
                    }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <button
            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            disabled={pageNumber === totalPages || isLoading || totalPages === 0}
            onClick={() => handlePageChange(pageNumber + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Panel */}
      {selectionMode === "assignment" ? (
        <BulkAssignmentPanel
          selectedPaperIds={Array.from(selectedIds)}
          onAssignmentComplete={handleAssignmentComplete}
          currentPhase={assignmentData?.currentPhase}
        />
      ) : (
        <QuickDecisionPanel
          selectedPaperIds={Array.from(selectedIds)}
          onDecisionComplete={handleAssignmentComplete}
          processId={studySelectionProcessId}
          phase={PaperPhase.FullText}
        />
      )}
    </>
  );
};

export default FullTextAssignmentTable;
