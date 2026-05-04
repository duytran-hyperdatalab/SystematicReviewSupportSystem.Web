import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal } from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import { FiSearch, FiAlertTriangle, FiInfo, FiArrowRight } from "react-icons/fi";
import { useUniquePapers } from "../../../../hooks/useUniquePapers";
import type { PaperResponse } from "../../../../types/paper";
import PaperComparisonCard from "../../../../components/paperPool/deduplication/PaperComparisonCard";
import { useDebounce } from "../../../../hooks/useDebounce";
import Switch from "../../../../components/ui/Switch";

interface ManualDeduplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePaper: PaperResponse | null;
  identificationProcessId: string;
  onConfirm: (originalPaperId: string, reason?: string) => Promise<void>;
}

export default function ManualDeduplicationModal({
  isOpen,
  onClose,
  sourcePaper,
  identificationProcessId,
  onConfirm,
}: ManualDeduplicationModalProps) {
  const [step, setStep] = useState<"search" | "compare">("search");
  const [selectedOriginal, setSelectedOriginal] = useState<PaperResponse | null>(null);
  const [reason, setReason] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [showDiffs, setShowDiffs] = useState(true);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const {
    papers: searchResults,
    loading: searchLoading,
    pageNumber,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    setSearch,
  } = useUniquePapers({
    identificationProcessId,
    pageSize: 5,
    autoFetch: isOpen && step === "search",
  });

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      setSearch(debouncedSearch);
    }
  }, [debouncedSearch, setSearch]);

  // Sync scroll refs
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  const handleScroll = useCallback(
    (source: React.RefObject<HTMLDivElement | null>, target: React.RefObject<HTMLDivElement | null>) => {
      if (!isSyncingRef.current && source.current && target.current) {
        isSyncingRef.current = true;
        target.current.scrollTop = source.current.scrollTop;
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 10);
      }
    },
    [],
  );

  const handleSelectOriginal = (paper: PaperResponse) => {
    setSelectedOriginal(paper);
    setStep("compare");
  };

  const handleConfirm = async () => {
    if (!selectedOriginal) return;
    setIsConfirming(true);
    try {
      await onConfirm(selectedOriginal.id, reason);
      handleReset();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReset = () => {
    setStep("search");
    setSelectedOriginal(null);
    setSearchInput("");
    setReason("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!sourcePaper) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manual Deduplication"
      size={step === "compare" ? "xl" : "lg"}
      description={
        step === "search"
          ? "Search for the original paper to link this duplicate to."
          : "Compare both papers and confirm the duplication."
      }
    >
      <div className="flex flex-col h-full min-h-[500px]">
        {step === "search" ? (
          <div className="space-y-6">
            {/* Source Paper Preview */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 line-clamp-1">
                    Marking as Duplicate: {sourcePaper.title}
                  </h4>
                  <p className="text-xs text-amber-700 mt-1">
                    This paper will be excluded once linked to an original.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search original paper by title or DOI..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
                autoFocus
              />
            </div>

            {/* Results List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {searchLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Searching project papers...</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults
                  .filter((p) => p.id !== sourcePaper.id)
                  .map((paper) => (
                    <div
                      key={paper.id}
                      className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h5 className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {paper.title}
                        </h5>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-semibold text-slate-400">
                            {paper.publicationYear || "N/A"}
                          </span>
                          <span className="text-xs text-slate-400 truncate max-w-[200px]">
                            {paper.authors || "Unknown Authors"}
                          </span>
                          {paper.doi && (
                            <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">
                              {paper.doi}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelectOriginal(paper)}
                        className="rounded-xl font-bold"
                      >
                        Select <FiArrowRight className="ml-2" />
                      </Button>
                    </div>
                  ))
              ) : searchInput ? (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <FiInfo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 font-medium">No results found for "{searchInput}"</p>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 italic">
                  Start typing to find the original paper...
                </div>
              )}
            </div>

            {/* Pagination for results */}
            {searchResults.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500">
                  Page {pageNumber} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousPage}
                    disabled={!hasPreviousPage || searchLoading}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all"
                  >
                    <FiArrowRight className="rotate-180" />
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={!hasNextPage || searchLoading}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all"
                  >
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col grow gap-6 overflow-hidden">
            {/* Warning Banner & Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-red-50 border border-red-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs font-medium text-red-700">
                  Warning: Marking this paper as a duplicate will exclude it from the final screening snapshot.
                </p>
              </div>
              <Switch
                checked={showDiffs}
                onChange={setShowDiffs}
                label="Highlight differences"
                className="scale-90"
              />
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-6 min-h-0 grow">
              {/* Original Paper (Keep) */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Original Paper (Keep)
                  </h4>
                </div>
                <div 
                  ref={leftScrollRef}
                  onScroll={() => handleScroll(leftScrollRef, rightScrollRef)}
                  className="grow overflow-y-auto pr-2 custom-scrollbar"
                >
                  <PaperComparisonCard
                    label="SELECTED ORIGINAL"
                    labelColor="text-green-600"
                    paper={{
                       id: selectedOriginal!.id,
                       title: selectedOriginal!.title,
                       authors: selectedOriginal!.authors || "N/A",
                       year: selectedOriginal!.publicationYear?.toString() || "N/A",
                       doi: selectedOriginal!.doi || undefined,
                       source: selectedOriginal!.source || "N/A",
                       abstract: selectedOriginal!.abstract || "No abstract available"
                    }}
                    otherPaper={{
                        id: sourcePaper.id,
                        title: sourcePaper.title,
                        authors: sourcePaper.authors || "N/A",
                        year: sourcePaper.publicationYear?.toString() || "N/A",
                        doi: sourcePaper.doi || undefined,
                        source: sourcePaper.source || "N/A",
                        abstract: sourcePaper.abstract || "No abstract available"
                    }}
                    isResolved={false}
                    side="original"
                    showDiffs={showDiffs}
                  />
                </div>
              </div>

              {/* Potential Duplicate (Remove) */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Potential Duplicate (Remove)
                  </h4>
                </div>
                <div 
                  ref={rightScrollRef}
                  onScroll={() => handleScroll(rightScrollRef, leftScrollRef)}
                  className="grow overflow-y-auto pr-2 custom-scrollbar"
                >
                  <PaperComparisonCard
                    label="PAPER TO REMOVE"
                    labelColor="text-red-600"
                    paper={{
                        id: sourcePaper.id,
                        title: sourcePaper.title,
                        authors: sourcePaper.authors || "N/A",
                        year: sourcePaper.publicationYear?.toString() || "N/A",
                        doi: sourcePaper.doi || undefined,
                        source: sourcePaper.source || "N/A",
                        abstract: sourcePaper.abstract || "No abstract available"
                    }}
                    otherPaper={{
                        id: selectedOriginal!.id,
                        title: selectedOriginal!.title,
                        authors: selectedOriginal!.authors || "N/A",
                        year: selectedOriginal!.publicationYear?.toString() || "N/A",
                        doi: selectedOriginal!.doi || undefined,
                        source: selectedOriginal!.source || "N/A",
                        abstract: selectedOriginal!.abstract || "No abstract available"
                    }}
                    isResolved={false}
                    side="duplicate"
                    showDiffs={showDiffs}
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
                  Reason for Manual Deduplication
                </label>
                <textarea
                  placeholder="E.g., Same study, different title translation or corrected authors list."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-sm font-medium resize-none min-h-[80px]"
                />
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setStep("search")}
                  disabled={isConfirming}
                  className="px-8 rounded-2xl font-bold"
                >
                  Back to Search
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirm}
                  isLoading={isConfirming}
                  className="px-10 rounded-2xl font-black shadow-xl shadow-red-500/20"
                >
                  Confirm Duplicate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
