import React from "react";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import { useSnapshotDataset } from "../hooks/useSnapshotDataset";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

interface IdentificationCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCompleting: boolean;
  identificationPhaseId: string | undefined;
}

const IdentificationCompleteModal: React.FC<IdentificationCompleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isCompleting,
  identificationPhaseId,
}) => {
  const ds = useSnapshotDataset({
    identificationProcessId: identificationPhaseId,
    pageSize: 5, // Smaller page size for modal
  });

  const {
    snapshotPapers,
    snapshotTotalCount,
    snapshotPage,
    snapshotTotalPages,
    snapshotLoading,
    snapshotSearch,
    setSnapshotSearch,
    snapshotNextPage,
    snapshotPrevPage,
  } = ds;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complete Identification Phase"
      description="Finalize the identification process and move to the next phase."
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Section */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800">
          <FiAlertCircle size={24} className="shrink-0 text-amber-500" />
          <div className="space-y-1">
            <p className="text-sm font-black">Ready to proceed?</p>
            <p className="text-xs font-medium leading-relaxed opacity-90">
              Completing this phase will finalize the current set of unique papers. These papers
              will be using for the <strong>Study Selection</strong> phase. Ensure all duplicates
              are resolved and all relevant sources are imported.
            </p>
            <p className="text-xs font-medium leading-relaxed opacity-90">
              You can always come back and add more papers later if re-open this phase
            </p>
          </div>
        </div>

        {/* Papers Summary Header */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <FiCheckCircle className="text-blue-600" />
              <span className="font-black text-lg">Snapshot Dataset</span>
            </div>
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
              {snapshotTotalCount} Papers
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in snapshot..."
              value={snapshotSearch}
              onChange={(e) => setSnapshotSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar relative">
            {snapshotLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
                <p className="text-xs font-medium italic">Loading snapshot papers...</p>
              </div>
            ) : snapshotPapers.length > 0 ? (
              snapshotPapers.map((paper, index) => (
                <div
                  key={paper.id || index}
                  className="bg-white border border-slate-100 p-3 rounded-xl shadow-sm hover:border-blue-200 transition-colors"
                >
                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{paper.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-md">
                      {paper.publicationYear || "N/A"}
                    </span>
                    <span className="truncate max-w-[200px]">
                      {paper.authors || "Unknown Author"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FiInfo size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs font-medium italic">
                  {snapshotSearch
                    ? "No papers match your search."
                    : "No papers have been added to calculations yet."}
                </p>
              </div>
            )}
          </div>

          {/* Table Pagination */}
          {snapshotTotalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] font-medium text-slate-400">
                Page {snapshotPage} of {snapshotTotalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={snapshotPrevPage}
                  disabled={snapshotPage === 1 || snapshotLoading}
                  className="p-1 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 text-slate-600 transition-all"
                >
                  <FiChevronLeft />
                </button>
                <button
                  onClick={snapshotNextPage}
                  disabled={snapshotPage === snapshotTotalPages || snapshotLoading}
                  className="p-1 rounded hover:bg-white border border-transparent hover:border-slate-200 disabled:opacity-30 text-slate-600 transition-all"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
            disabled={isCompleting}
          >
            Cancel
          </button>
          <Button
            onClick={onConfirm}
            isLoading={isCompleting}
            variant="primary"
            className="min-w-[160px] bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-transform active:scale-95"
          >
            Complete Phase
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IdentificationCompleteModal;
