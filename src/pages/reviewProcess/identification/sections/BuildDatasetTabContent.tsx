// Build Dataset Tab Content — Orchestrator
// Two-column layout: ReadyPapersTable (left) + SnapshotTable (right)
// Uses useSnapshotDataset hook for data + useSelection for multi-select

import { useState, useCallback } from "react";
import { useSnapshotDataset } from "../hooks/useSnapshotDataset";
import { useSelection } from "../hooks/useSelection";
import ReadyPapersTable from "./ReadyPapersTable";
import SnapshotTable from "./SnapshotTable";

interface BuildDatasetTabContentProps {
  identificationPhaseId: string;
  protocolId?: string;
  canEdit?: boolean;
}

export default function BuildDatasetTabContent({
  identificationPhaseId,
  protocolId,
  canEdit = true,
}: BuildDatasetTabContentProps) {
  const dataset = useSnapshotDataset({
    identificationProcessId: identificationPhaseId,
  });

  const selection = useSelection();

  // Local input state for ready papers filters
  const [readySearchInput, setReadySearchInput] = useState("");
  const [readyYearInput, setReadyYearInput] = useState("");
  const [readySearchSourceInput, setReadySearchSourceInput] = useState("");

  // Local input state for snapshot filters
  const [snapshotSearchInput, setSnapshotSearchInput] = useState("");
  const [snapshotYearInput, setSnapshotYearInput] = useState("");
  const [snapshotSearchSourceInput, setSnapshotSearchSourceInput] = useState("");

  // Handle add to snapshot
  const handleAddToSnapshot = useCallback(async () => {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;

    await dataset.addToSnapshot(ids);
    selection.clear();
  }, [selection, dataset]);

  // Clear ready filters including local input state
  const handleClearReadyFilters = useCallback(() => {
    setReadySearchInput("");
    setReadyYearInput("");
    setReadySearchSourceInput("");
    dataset.clearReadyFilters();
  }, [dataset]);

  // Clear snapshot filters including local input state
  const handleClearSnapshotFilters = useCallback(() => {
    setSnapshotSearchInput("");
    setSnapshotYearInput("");
    setSnapshotSearchSourceInput("");
    dataset.clearSnapshotFilters();
  }, [dataset]);

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold text-emerald-700">
              {dataset.readyTotalCount.toLocaleString()}
            </span>{" "}
            ready papers
          </span>
        </div>
        <div className="w-px h-5 bg-gray-300" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-700">
            <span className="font-semibold text-blue-700">
              {dataset.snapshotTotalCount.toLocaleString()}
            </span>{" "}
            in dataset
          </span>
        </div>
        {selection.count > 0 && (
          <>
            <div className="w-px h-5 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-emerald-600">
                {selection.count} selected
              </span>
            </div>
          </>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ready Papers */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-[500px] flex flex-col">
          <ReadyPapersTable
            papers={dataset.readyPapers}
            totalCount={dataset.readyTotalCount}
            page={dataset.readyPage}
            totalPages={dataset.readyTotalPages}
            hasNext={dataset.readyHasNext}
            hasPrev={dataset.readyHasPrev}
            loading={dataset.readyLoading}
            fetching={dataset.readyFetching}
            error={dataset.readyError}
            pageSize={dataset.pageSize}
            protocolId={protocolId}
            searchInput={readySearchInput}
            yearInput={readyYearInput}
            searchSourceInput={readySearchSourceInput}
            onSearchInputChange={setReadySearchInput}
            onYearInputChange={setReadyYearInput}
            onSearchSourceInputChange={setReadySearchSourceInput}
            onSearch={dataset.setReadySearch}
            onYearFilter={dataset.setReadyYear}
            onSearchSourceFilter={dataset.setReadySearchSourceId}
            onClearFilters={handleClearReadyFilters}
            onRefetch={dataset.refetchReady}
            onNextPage={dataset.readyNextPage}
            onPreviousPage={dataset.readyPrevPage}
            isSelected={selection.isSelected}
            areAllSelected={selection.areAllSelected}
            areSomeSelected={selection.areSomeSelected}
            onToggle={selection.toggle}
            onToggleAll={selection.toggleAll}
            selectedCount={selection.count}
            onAddToSnapshot={handleAddToSnapshot}
            isAdding={dataset.isAdding}
            canEdit={canEdit}
          />
        </div>

        {/* Right: Snapshot Dataset */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-[500px] flex flex-col">
          <SnapshotTable
            papers={dataset.snapshotPapers}
            totalCount={dataset.snapshotTotalCount}
            page={dataset.snapshotPage}
            totalPages={dataset.snapshotTotalPages}
            hasNext={dataset.snapshotHasNext}
            hasPrev={dataset.snapshotHasPrev}
            loading={dataset.snapshotLoading}
            fetching={dataset.snapshotFetching}
            error={dataset.snapshotError}
            pageSize={dataset.pageSize}
            protocolId={protocolId}
            searchInput={snapshotSearchInput}
            yearInput={snapshotYearInput}
            searchSourceInput={snapshotSearchSourceInput}
            onSearchInputChange={setSnapshotSearchInput}
            onYearInputChange={setSnapshotYearInput}
            onSearchSourceInputChange={setSnapshotSearchSourceInput}
            onSearch={dataset.setSnapshotSearch}
            onYearFilter={dataset.setSnapshotYear}
            onSearchSourceFilter={dataset.setSnapshotSearchSourceId}
            onClearFilters={handleClearSnapshotFilters}
            onRefetch={dataset.refetchSnapshot}
            onNextPage={dataset.snapshotNextPage}
            onPreviousPage={dataset.snapshotPrevPage}
          />
        </div>
      </div>
    </div>
  );
}
