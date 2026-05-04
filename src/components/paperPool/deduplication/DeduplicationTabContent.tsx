// Deduplication Tab Content — Main orchestrator
// Composes: ProgressBanner, QueuePanel, ComparisonCards, keyboard navigation, undo, safety UX

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  FiCheck,
  FiLayers,
  FiAlertTriangle,
  FiCornerUpLeft,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";
import Button from "../../ui/Button";
import EmptyState from "../../ui/EmptyState";
import Switch from "../../ui/Switch";
import DeduplicationProgressBanner from "./DeduplicationProgressBanner";
import DuplicateQueuePanel from "./DuplicateQueuePanel";
import PaperComparisonCard from "./PaperComparisonCard";
import type {
  DuplicatePair,
  DuplicateResolution,
  UndoableResolution,
} from "../../../types/deduplication";
import {
  MAX_UNDO_STACK,
  SIMILARITY_THRESHOLDS,
} from "../../../pages/reviewProcess/identification/constants";
import { useDeduplicationKeyboard } from "../../../pages/reviewProcess/identification/hooks/useDeduplicationKeyboard";
import { getConfidenceLevel } from "../../../pages/reviewProcess/identification/utils";

interface DeduplicationTabContentProps {
  duplicatePairs: DuplicatePair[];
  pendingDuplicates: DuplicatePair[];
  selectedDuplicate?: DuplicatePair | null;
  onSelectDuplicate?: (pair: DuplicatePair | null) => void;
  onResolveDuplicate: (pairId: string, decision: DuplicateResolution) => void;
  /** Whether duplicate pairs are currently loading from the API */
  isLoading?: boolean;
  /** API error message, if any */
  error?: string | null;
  /** Whether a resolve action is in progress */
  isResolving?: boolean;
  /** Refetch duplicate pairs from the API */
  onRefetch?: () => void;
  canEdit?: boolean;
}

export default function DeduplicationTabContent({
  duplicatePairs,
  pendingDuplicates,
  selectedDuplicate: externalSelectedDuplicate,
  onSelectDuplicate: externalOnSelectDuplicate,
  onResolveDuplicate,
  isLoading = false,
  error = null,
  isResolving = false,
  onRefetch,
  canEdit = true,
}: DeduplicationTabContentProps) {
  const [internalSelectedDuplicate, setInternalSelectedDuplicate] = useState<DuplicatePair | null>(
    null,
  );

  // Robust derivation: only use external if it's strictly provided (not undefined)
  const selectedDuplicate =
    externalSelectedDuplicate !== undefined ? externalSelectedDuplicate : internalSelectedDuplicate;

  const onSelectDuplicate = useCallback(
    (pair: DuplicatePair | null) => {
      if (externalOnSelectDuplicate !== undefined) {
        externalOnSelectDuplicate(pair);
      } else {
        setInternalSelectedDuplicate(pair);
      }
    },
    [externalOnSelectDuplicate],
  );

  // --- Auto-select first pair ---
  useEffect(() => {
    if (!selectedDuplicate && pendingDuplicates.length > 0 && !isLoading) {
      onSelectDuplicate(pendingDuplicates[0]);
    }
  }, [selectedDuplicate, pendingDuplicates, isLoading, onSelectDuplicate]);
  // --- Internal state (does NOT affect parent props contract) ---
  const [undoStack, setUndoStack] = useState<UndoableResolution[]>([]);
  const [showDiffs, setShowDiffs] = useState(true);
  const [confirmingDecision, setConfirmingDecision] = useState<DuplicateResolution | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionResolvedCount, setSessionResolvedCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolvedCount = duplicatePairs.filter((d) => d.status === "resolved").length;
  const unresolvedCount = pendingDuplicates.length;
  const totalCount = duplicatePairs.length;

  // --- Safety check: low-confidence cancel needs confirmation ---
  const needsConfirmation = useCallback(
    (decision: DuplicateResolution): boolean => {
      if (!selectedDuplicate) return false;
      if (decision === "keep-both") return false; // Keeping both is always safe
      return selectedDuplicate.similarityScore < SIMILARITY_THRESHOLDS.LOW_WARNING;
    },
    [selectedDuplicate],
  );

  // --- Core resolve handler with undo, auto-advance, session tracking ---
  const handleResolve = useCallback(
    (decision: DuplicateResolution) => {
      if (!selectedDuplicate) return;

      // Check if confirmation is needed for low-similarity removals
      if (needsConfirmation(decision) && confirmingDecision !== decision) {
        setConfirmingDecision(decision);
        return;
      }

      // Track session timing
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
      setSessionResolvedCount((prev) => prev + 1);

      // Push to undo stack
      setUndoStack((prev) => {
        const next = [...prev, { pairId: selectedDuplicate.id, decision, timestamp: Date.now() }];
        return next.length > MAX_UNDO_STACK ? next.slice(-MAX_UNDO_STACK) : next;
      });

      // Clear confirmation state
      setConfirmingDecision(null);

      // Execute the resolution
      onResolveDuplicate(selectedDuplicate.id, decision);

      // Auto-advance logic
      const remainingUnresolved = pendingDuplicates.filter((p) => p.id !== selectedDuplicate.id);
      if (remainingUnresolved.length > 0) {
        // Try to find the next one in the current list
        const currentIndex = pendingDuplicates.findIndex((p) => p.id === selectedDuplicate.id);
        const nextIndex = (currentIndex + 1) % pendingDuplicates.length;
        const nextPair = pendingDuplicates[nextIndex] || pendingDuplicates[0];

        // If the next one is the same as current (last one), it will be removed soon anyway,
        // so we pick another one or null.
        if (nextPair.id === selectedDuplicate.id && remainingUnresolved.length > 0) {
          onSelectDuplicate(remainingUnresolved[0]);
        } else {
          onSelectDuplicate(nextPair);
        }
      } else {
        onSelectDuplicate(null);
      }
    },
    [
      selectedDuplicate,
      needsConfirmation,
      confirmingDecision,
      sessionStartTime,
      onResolveDuplicate,
      pendingDuplicates,
      onSelectDuplicate,
    ],
  );

  // --- Undo last resolution ---
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));

    // Find the pair and re-select it
    const pair = duplicatePairs.find((p) => p.id === lastAction.pairId);
    if (pair) {
      onSelectDuplicate(pair);
    }
  }, [undoStack, duplicatePairs, onSelectDuplicate]);

  // --- Cancel confirmation dialog ---
  const handleCancelConfirm = useCallback(() => {
    setConfirmingDecision(null);
  }, []);

  // --- Keyboard navigation ---
  const isComparisonFocused = selectedDuplicate !== null;
  useDeduplicationKeyboard({
    visiblePairs: duplicatePairs,
    selectedPair: selectedDuplicate,
    onSelectPair: onSelectDuplicate,
    onResolve: handleResolve,
    enabled: isComparisonFocused && confirmingDecision === null && canEdit,
  });

  // --- Confidence info for selected pair ---
  const selectedConfidence = useMemo(() => {
    if (!selectedDuplicate) return null;
    return getConfidenceLevel(selectedDuplicate.similarityScore);
  }, [selectedDuplicate]);

  // --- Render ---
  return (
    <div ref={containerRef} className="space-y-4">
      {/* Loading state */}
      {isLoading && duplicatePairs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <FiRefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-gray-600 font-medium">Loading duplicate pairs...</p>
          <p className="text-sm text-gray-500 mt-1">Analyzing imported papers for duplicates</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <FiAlertTriangle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-gray-900 font-medium">Failed to load duplicate pairs</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          {onRefetch && (
            <button
              onClick={onRefetch}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* Main content (only when not loading initial and no error) */}
      {!isLoading && !error && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Deduplication Workspace</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Review flagged pairs, compare metadata side by side, and resolve confidently.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                  Total: {totalCount}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                  Pending: {unresolvedCount}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700">
                  Resolved: {resolvedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Banner (always visible when pairs exist) */}
          {duplicatePairs.length > 0 && (
            <DeduplicationProgressBanner
              duplicatePairs={duplicatePairs}
              pendingCount={pendingDuplicates.length}
              resolvedCount={resolvedCount}
              sessionStartTime={sessionStartTime}
              sessionResolvedCount={sessionResolvedCount}
            />
          )}

          {duplicatePairs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel: Queue */}
              <DuplicateQueuePanel
                duplicatePairs={duplicatePairs}
                selectedPair={selectedDuplicate}
                onSelectPair={onSelectDuplicate}
              />

              {/* Right Panel: Comparison */}
              {selectedDuplicate ? (
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    {/* Header with undo */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Compare & Resolve</h3>
                        {selectedConfidence && (
                          <div className="mt-1.5">
                            <p className="text-xs text-gray-500">
                              Similarity: {selectedDuplicate.similarityScore}% -{" "}
                              <span
                                className={
                                  selectedConfidence === "high"
                                    ? "text-red-600"
                                    : selectedConfidence === "medium"
                                      ? "text-orange-600"
                                      : "text-yellow-600"
                                }
                              >
                                {selectedConfidence === "high"
                                  ? "Very Likely Duplicate"
                                  : selectedConfidence === "medium"
                                    ? "Probable Duplicate"
                                    : "Possible Duplicate"}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Method: {selectedDuplicate.methodText || "Not available"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Notes: {selectedDuplicate.deduplicationNotes || "No notes"}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-6">
                        <Switch
                          checked={showDiffs}
                          onChange={setShowDiffs}
                          label="Highlight differences"
                        />
                        {undoStack.length > 0 && (
                          <button
                            onClick={handleUndo}
                            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                            title="Undo last resolution"
                          >
                            <FiCornerUpLeft className="w-4 h-4" />
                            Undo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Low-similarity warning */}
                    {selectedDuplicate.similarityScore < SIMILARITY_THRESHOLDS.LOW_WARNING && (
                      <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <FiAlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">
                          Low similarity score ({selectedDuplicate.similarityScore}%). These papers
                          may not be true duplicates. Review carefully before confirming.
                        </p>
                      </div>
                    )}

                    {/* Confirmation overlay */}
                    {confirmingDecision && (
                      <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <FiAlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">
                              Confirm duplicate removal for low-similarity pair
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              This pair has a similarity score below{" "}
                              {SIMILARITY_THRESHOLDS.LOW_WARNING}%. Are you sure these papers are
                              duplicates? The flagged paper will be removed from the identification
                              process.
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleResolve(confirmingDecision)}
                              >
                                Yes, remove duplicate
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleCancelConfirm}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Side-by-side comparison cards */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                      <PaperComparisonCard
                        label="PAPER A"
                        labelColor="text-blue-600"
                        paper={selectedDuplicate.originalPaper}
                        otherPaper={selectedDuplicate.duplicatePaper}
                        isResolved={selectedDuplicate.status === "resolved"}
                        side="original"
                        resolvedDecision={selectedDuplicate.resolvedDecision}
                        showDiffs={showDiffs}
                      />
                      <PaperComparisonCard
                        label="PAPER B (Flagged)"
                        labelColor="text-purple-600"
                        paper={selectedDuplicate.duplicatePaper}
                        otherPaper={selectedDuplicate.originalPaper}
                        isResolved={selectedDuplicate.status === "resolved"}
                        side="duplicate"
                        resolvedDecision={selectedDuplicate.resolvedDecision}
                        showDiffs={showDiffs}
                      />
                    </div>

                    {/* Decision Controls */}
                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-sm text-gray-600 text-center mb-4">
                        Do these papers represent the same study?
                      </p>
                      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
                        <Button
                          variant="danger"
                          className="flex-1"
                          onClick={() => handleResolve("cancel")}
                          disabled={
                            selectedDuplicate.status === "resolved" || isResolving || !canEdit
                          }
                        >
                          <FiX className="w-4 h-4 mr-2" />
                          Keep only original record
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleResolve("keep-both")}
                          disabled={
                            selectedDuplicate.status === "resolved" || isResolving || !canEdit
                          }
                        >
                          <FiCheck className="w-4 h-4 mr-2" />
                          Keep Both (Not Duplicates)
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                        <span>Shortcuts:</span>
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-mono">
                          1
                        </kbd>
                        <span>Keep Both</span>
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-mono">
                          2
                        </kbd>
                        <span>Cancel</span>
                        <span className="mx-1 text-gray-300">|</span>
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-mono">
                          ↑↓
                        </kbd>
                        <span>Navigate</span>
                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-mono">
                          N
                        </kbd>
                        <span>Next unresolved</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // No pair selected placeholder
                <div className="lg:col-span-2 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12">
                  <div className="text-center">
                    <FiLayers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Select a duplicate pair to compare</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Use ↑↓ keys or click a pair in the queue to begin
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Empty state: no duplicates at all
            <EmptyState
              icon={
                <div className="relative">
                  <FiCheck className="w-16 h-16 text-green-400" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
              }
              title="No Duplicates Detected"
              description="All imported records appear to be unique. If you've added new batches, run the deduplication algorithm to check for matches."
              actionLabel="Run Deduplication"
              onAction={() => onRefetch?.()}
            />
          )}
        </>
      )}
    </div>
  );
}
