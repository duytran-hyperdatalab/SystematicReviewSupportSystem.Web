import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { FiX, FiFilter, FiCheckCircle } from "react-icons/fi";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";
import type { ProcessSnapshot, PaperPoolFilterSetting, SelectionInsertResult } from "./types";
import ReviewProcessCard from "./ReviewProcessCard";

interface AddToProcessByFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  processSnapshots: ProcessSnapshot[];
  savedFilters: PaperPoolFilterSetting[];
  onAddFromFilter: (processId: string, filterId: string) => Promise<void>;
  onNavigateToProcess?: (processId: string) => void;
  isAdding: boolean;
  insertResult: SelectionInsertResult | null;
  selectedSavedFilterId: string | null;
  selectedSavedFilterMatchedCount: number | null;
  onSelectFilter: (id: string) => void;
}

export default function AddToProcessByFilterModal({
  isOpen,
  onClose,
  processSnapshots,
  savedFilters,
  onAddFromFilter,
  onNavigateToProcess,
  isAdding,
  insertResult,
  selectedSavedFilterId,
  selectedSavedFilterMatchedCount,
  onSelectFilter,
}: AddToProcessByFilterModalProps) {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  const selectedProcess = useMemo(
    () => processSnapshots.find((p) => p.processId === selectedProcessId),
    [processSnapshots, selectedProcessId],
  );

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedProcessId || !selectedSavedFilterId) return;
    await onAddFromFilter(selectedProcessId, selectedSavedFilterId);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Add Filter Results to Process
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Transfer papers matching a filter to a review process
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {insertResult ? (
            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <FiCheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 mb-2">Transfer Successful</h4>
              <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">
                We've processed the paper transfer to{" "}
                <span className="text-blue-600 font-bold">{selectedProcess?.processName}</span>.
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Added
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {insertResult.inserted}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Duplicates
                  </div>
                  <div className="text-2xl font-black text-amber-500">
                    {insertResult.skippedAsDuplicate}
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="px-8 rounded-xl font-bold uppercase tracking-wider text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    if (onNavigateToProcess && selectedProcessId) {
                      onNavigateToProcess(selectedProcessId);
                    }
                    onClose();
                  }}
                  className="px-8 rounded-xl font-bold uppercase tracking-wider text-xs"
                >
                  View Process
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    1. Select Destination Process
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {processSnapshots.map((process) => (
                    <ReviewProcessCard
                      key={process.processId}
                      process={process}
                      isSelected={selectedProcessId === process.processId}
                      onSelect={setSelectedProcessId}
                      onNavigate={onNavigateToProcess}
                      className="cursor-pointer"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  2. Select Saved Filter Collection
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={selectedSavedFilterId || ""}
                    onChange={(e) => onSelectFilter(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Choose a filter collection...
                    </option>
                    {savedFilters.map((filter) => (
                      <option key={filter.id} value={filter.id}>
                        {filter.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSavedFilterId && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-blue-700">
                      <FiFilter className="w-5 h-5" />
                      <span className="text-sm font-bold">Matched Papers</span>
                    </div>
                    <div className="text-xl font-black text-blue-700">
                      {selectedSavedFilterMatchedCount ?? <LoadingSpinner size="sm" />}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!insertResult && (
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isAdding}
              className="px-6 rounded-xl font-bold uppercase tracking-wider text-xs border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              isLoading={isAdding}
              disabled={!selectedProcessId || !selectedSavedFilterId}
              className="px-10 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-blue-500/20"
            >
              Confirm Transfer
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
