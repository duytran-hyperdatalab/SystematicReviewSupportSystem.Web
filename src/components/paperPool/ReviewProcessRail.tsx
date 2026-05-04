import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import Button from "../ui/Button";
import type { ProcessSnapshot, SelectionInsertResult } from "./types";
import ReviewProcessCard from "./ReviewProcessCard";

interface ReviewProcessRailProps {
  isOpen: boolean;
  onClose: () => void;
  processSnapshots: ProcessSnapshot[];
  selectedCount: number;
  filteredCount: number;
  savedFilterOptions: Array<{ id: string; name: string }>;
  selectedSavedFilterId: string | null;
  selectedSavedFilterMatchedCount: number | null;
  selectedProcessId: string | null;
  insertResult: SelectionInsertResult | null;
  onSelectProcess: (processId: string) => void;
  onSelectSavedFilter: (filterId: string) => void;
  onCreateSavedFilterFromCurrent: () => void;
  onAddToSelectedProcess: () => void;
  onAddAllFilteredToSelectedProcess: () => void;
  onNavigateToProcess: (processId: string) => void;
  isAdding: boolean;
}

export default function ReviewProcessRail({
  isOpen,
  onClose,
  processSnapshots,
  selectedCount,
  filteredCount,
  selectedProcessId,
  onSelectProcess,
  onNavigateToProcess,
}: ReviewProcessRailProps) {
  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[80] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-gray-100">
        {/* Header */}
        <div className="px-6 py-8 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              Review Context
            </h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
              Review Processes Status
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          <div className="px-2 pb-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Active Processes
            </h4>
          </div>

          {processSnapshots.map((process) => (
            <ReviewProcessCard
              key={process.processId}
              process={process}
              isSelected={selectedProcessId === process.processId}
              onSelect={onSelectProcess}
              onNavigate={onNavigateToProcess}
              actionLabel={
                selectedProcessId === process.processId ? "Currently Target" : "Set as Target"
              }
            />
          ))}
        </div>

        {/* Footer Summary */}
        <div className="p-8 border-t border-gray-100 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Current Selection
              </span>
              <span className="text-sm font-black text-gray-900">{selectedCount} Items</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Global Library
              </span>
              <span className="text-sm font-black text-gray-900">{filteredCount} Items</span>
            </div>

            <Button
              className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]"
              onClick={onClose}
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );

  return createPortal(content, document.body);
}
