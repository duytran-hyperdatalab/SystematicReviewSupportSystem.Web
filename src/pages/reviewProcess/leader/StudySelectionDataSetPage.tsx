import React, { useState, useCallback } from "react";
import { FiRefreshCw, FiDatabase, FiArrowRight, FiCheckSquare } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { useIncludedFullTextPapers, useIncludedPapers, useBulkAddToDataset } from "../../../hooks/useStudySelection";
import { cn } from "../../../utils/cn";
import Button from "../../../components/ui/Button";
import SnapshotDatasetView from "./components/SnapshotDatasetView";
import type { PaperResponse } from "../../../types/paper";



const BuildDatasetPage: React.FC = () => {
  const { screeningProcessId } = useParams<{ screeningProcessId: string }>();

  // Ready Papers state - pagination and filters
  const [readyPage, setReadyPage] = useState(1);
  const [readySearchInput, setReadySearchInput] = useState("");
  const [readyPageSize] = useState(10);
  const [readySelected, setReadySelected] = useState<Set<string>>(new Set());

  // Use the new hook for Included Full-Text Papers
  const {
    data: readyData,
    isLoading: readyLoading,
    isFetching: readyFetchingStatus,
    refetch: refetchReady,
  } = useIncludedFullTextPapers(screeningProcessId, {
    search: readySearchInput,
    pageNumber: readyPage,
    pageSize: readyPageSize,
  });

  const readyPapers = (readyData?.items || []).map((p: any) => ({
    ...p,
    id: p.paperId || p.id,
  })) as any as PaperResponse[];
  const totalReadyCount = readyData?.totalCount || 0;
  const readyFetching = readyLoading || readyFetchingStatus;

  // Snapshot state - pagination and filters
  const [snapshotPage, setSnapshotPage] = useState(1);
  const [snapshotSearchInput, setSnapshotSearchInput] = useState("");
  const [snapshotYearInput, setSnapshotYearInput] = useState("");
  const [snapshotPageSize] = useState(9);

  // Use the new hook for Included Papers (Snapshot)
  const {
    data: snapshotData,
    isLoading: snapshotLoading,
    isFetching: snapshotFetchingStatus,
    refetch: refetchSnapshot,
  } = useIncludedPapers(screeningProcessId, {
    search: snapshotSearchInput,
    pageNumber: snapshotPage,
    pageSize: snapshotPageSize,
  });

  const snapshotPapers = (snapshotData?.items || []).map((p: any) => ({
    ...p,
    id: p.paperId || p.id,
  })) as any as PaperResponse[];
  const totalSnapshotCount = snapshotData?.totalCount || 0;
  const snapshotTotalPages = snapshotData?.totalPages || 0;
  const snapshotFetching = snapshotLoading || snapshotFetchingStatus;

  // Add to snapshot mutation
  const { mutate: bulkAdd, isPending: isBulkAdding } = useBulkAddToDataset();

  const paginatedReadyPapers = readyPapers;
  const paginatedSnapshotPapers = snapshotPapers;

  const isSelected = (id: string) => readySelected.has(id);

  const handleToggle = (paperId: string) => {
    if (!paperId) return;
    setReadySelected((prev) => {
      const next = new Set(prev);
      if (next.has(paperId)) next.delete(paperId);
      else next.add(paperId);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = readyPapers.map((p) => p.id).filter(Boolean);
      setReadySelected(new Set(allIds));
    } else {
      setReadySelected(new Set());
    }
  };

  const allSelected = readyPapers.length > 0 && readyPapers.every(p => readySelected.has(p.id));

  const handleAddToSnapshot = useCallback(() => {
    const paperIds = Array.from(readySelected).filter((id) => !!id);
    if (paperIds.length === 0 || !screeningProcessId) return;

    bulkAdd(
      {
        processId: screeningProcessId,
        request: {
          paperIds: paperIds,
        },
      },
      {
        onSuccess: () => {
          setReadySelected(new Set());
        },
      }
    );
  }, [readySelected, screeningProcessId, bulkAdd]);

  const handleRemoveFromSnapshot = useCallback(() => {
    // TODO: Call API to remove from snapshot
    // For now, it won't persist after refetch without API implementation
  }, []);

  const handleClearFilters = () => {
    setReadySearchInput("");
    setReadyPage(1);
  };

  const handleSnapshotClearFilters = () => {
    setSnapshotSearchInput("");
    setSnapshotYearInput("");
    setSnapshotPage(1);
  };

  const handleRefetch = () => {
    refetchReady();
    refetchSnapshot();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <div className="flex flex-1 gap-6 min-h-0">
        {/* Left Panel: Ready Papers */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <h2 className="text-base font-bold text-gray-900">Ready Papers</h2>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
                  {totalReadyCount}
                </span>
              </div>
              <button
                onClick={handleRefetch}
                disabled={readyFetching}
                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                title="Refresh"
              >
                <FiRefreshCw className={cn("w-4 h-4", readyFetching && "animate-spin")} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>
              <div className="relative flex-1">
                <FiCheckSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search title, DOI, authors..."
                  value={readySearchInput}
                  onChange={(e) => {
                    setReadySearchInput(e.target.value);
                    setReadyPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      setReadySearchInput(target.value);
                    }
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                />
              </div>
              {readySearchInput && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4">
            {readyFetching ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-xl animate-pulse">
                    <div className="w-5 h-5 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : readyPapers.length > 0 ? (
              <div className="space-y-2">
                {paginatedReadyPapers.map((paper, idx) => {
                  const safeKey = `ready-${paper.id}-${idx}`;
                  return (
                    <div
                      key={safeKey}
                      onClick={() => handleToggle(paper.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group",
                        isSelected(paper.id)
                          ? "bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/50"
                          : "bg-gray-50/50 border-transparent hover:bg-gray-100/50 hover:border-gray-200"
                      )}
                    >
                      <div className="shrink-0 mt-0.5">
                        <div
                          className={cn(
                            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                            isSelected(paper.id)
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-gray-300 group-hover:border-emerald-400"
                          )}
                        >
                          {isSelected(paper.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1">
                          {paper.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {paper.authors?.split(",").slice(0, 2).join(", ")}
                          {paper.authors && paper.authors.split(",").length > 2 && " et al."}
                          {paper.publicationYear && ` • ${paper.publicationYear}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <FiDatabase className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Papers Available</h3>
                <p className="text-gray-500 text-sm text-center max-w-sm mb-6">
                  {readySearchInput
                    ? "No papers match your filters. Try adjusting your search."
                    : "All eligible papers have been added to the snapshot, or no valid papers exist yet."}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  {readySearchInput ? "Clear Filters" : "Go to Library"}
                </Button>
              </div>
            )}
          </div>

          {/* Left Footer */}
          {readyPapers.length > 0 && (
            <div className="px-6 pb-6 pt-3 border-t border-gray-100 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {(readyPage - 1) * readyPageSize + 1}–
                  {Math.min(readyPage * readyPageSize, totalReadyCount)} of{" "}
                  {totalReadyCount}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={readyPage <= 1}
                    onClick={() => setReadyPage((p) => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1.5 text-xs font-semibold text-gray-900 bg-gray-100 rounded-lg">
                    {readyPage} / {Math.max(1, Math.ceil(totalReadyCount / readyPageSize))}
                  </span>
                  <button
                    disabled={readyPage >= Math.ceil(totalReadyCount / readyPageSize)}
                    onClick={() => setReadyPage((p) => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {readySelected.size > 0 ? (
                    <>
                      <span className="text-emerald-600">{readySelected.size}</span> paper
                      {readySelected.size !== 1 ? "s" : ""} selected
                    </>
                  ) : (
                    <span className="text-gray-400">Select papers to add</span>
                  )}
                </span>
                <Button
                  size="sm"
                  onClick={handleAddToSnapshot}
                  disabled={readySelected.size === 0 || isBulkAdding}
                  isLoading={isBulkAdding}
                  className="!py-2.5 !px-5 !text-sm !bg-emerald-600 hover:!bg-emerald-700 !shadow-emerald-500/20 !rounded-xl"
                >
                  <FiArrowRight className="w-4 h-4 mr-2" />
                  Add Selected
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Snapshot Dataset */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
          <div className="h-full p-6">
            <SnapshotDatasetView
              papers={paginatedSnapshotPapers}
              totalCount={totalSnapshotCount}
              page={snapshotPage}
              totalPages={snapshotTotalPages}
              loading={snapshotLoading}
              fetching={snapshotFetching}
              error={null}
              pageSize={snapshotPageSize}
              searchInput={snapshotSearchInput}
              yearInput={snapshotYearInput}
              onSearchInputChange={(v) => {
                setSnapshotSearchInput(v);
                setSnapshotPage(1);
              }}
              onYearInputChange={(v) => {
                setSnapshotYearInput(v);
                setSnapshotPage(1);
              }}
              onSearch={setSnapshotSearchInput}
              onYearFilter={(v) => setSnapshotYearInput(v?.toString() || "")}
              onClearFilters={handleSnapshotClearFilters}
              onRefetch={handleRefetch}
              onNextPage={() => setSnapshotPage((p) => p + 1)}
              onPreviousPage={() => setSnapshotPage((p) => p - 1)}
              onRemoveFromSnapshot={handleRemoveFromSnapshot}
              canEdit={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildDatasetPage;
