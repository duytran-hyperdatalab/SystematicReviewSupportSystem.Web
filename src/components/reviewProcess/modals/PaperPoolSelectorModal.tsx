import { useState, useMemo } from "react";
import { Modal } from "../../ui/Modal";
import { usePaperPool } from "../../../hooks/usePaperPool";
import { useAddSelectedPapers } from "../../../hooks/useReviewProcesses";
import PaperTable from "../../paperPool/PaperTable";
import Button from "../../ui/Button";
import { FiSearch, FiLayers, FiCheckCircle } from "react-icons/fi";
import { useDebounce } from "../../../hooks/useDebounce";
import type { PaperPoolItem, PaperPoolApiResponse } from "../../paperPool/types";
import toast from "react-hot-toast";

interface PaperPoolSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  processId: string;
  processName: string;
}

function parseKeywords(keywords?: string) {
  if (!keywords) return [];
  return keywords
    .split(/[;,|]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function mapPaperFromApi(paper: PaperPoolApiResponse): PaperPoolItem {
  const parsedYear =
    paper.publicationYearInt ??
    (paper.publicationYear ? Number.parseInt(paper.publicationYear, 10) : null);

  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors?.trim() || "Unknown authors",
    year: Number.isNaN(parsedYear) ? null : parsedYear,
    doi: paper.doi || null,
    source: paper.source?.trim() || "Unknown source",
    searchSourceId: paper.searchSourceId || "all",
    importBatchId: "N/A",
    hasFullText: Boolean(paper.fullTextAvailable),
    abstract: paper.abstract?.trim() || "No abstract available.",
    keywords: parseKeywords(paper.keywords),
    pdfUrl: paper.pdfUrl || null,
    fullTextRetrievalStatus: paper.fullTextRetrievalStatus ?? null,
    fullTextRetrievalStatusText: paper.fullTextRetrievalStatusText || null,
  };
}

export default function PaperPoolSelectorModal({
  isOpen,
  onClose,
  projectId,
  processId,
  processName,
}: PaperPoolSelectorModalProps) {
  const [searchText, setSearchText] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchText, 300);

  const { papersPage, isLoading, isFetching } = usePaperPool(projectId, {
    searchText: debouncedSearch || undefined,
    pageNumber,
    pageSize,
  });

  const { addSelectedPapers, isAdding, result } = useAddSelectedPapers();

  const papers = useMemo(() => (papersPage?.items ?? []).map(mapPaperFromApi), [papersPage?.items]);

  const handleTogglePaper = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedPaperIds((prev) => [...prev, id]);
    } else {
      setSelectedPaperIds((prev) => prev.filter((pid) => pid !== id));
    }
  };

  const handleToggleAllPage = (checked: boolean) => {
    const pageIds = papers.map((p) => p.id);
    if (checked) {
      setSelectedPaperIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      setSelectedPaperIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleConfirmAdd = async () => {
    if (selectedPaperIds.length === 0) return;
    try {
      const res = await addSelectedPapers({
        reviewProcessId: processId,
        data: { paperIds: selectedPaperIds },
      });
      toast.success(`Successfully added ${res.inserted} papers to ${processName}`);
      setSelectedPaperIds([]);
      // We don't close immediately if the user wants to see the result or add more?
      // Actually, the requirements imply a CTA that opens it, usually closing on success is fine.
      // But let's show a success state if the hook provides one.
    } catch (err) {
      // Error handled by hook
    }
  };

  const allPageSelected = papers.length > 0 && papers.every((p) => selectedPaperIds.includes(p.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Papers to Review"
      description={`Select papers from the project pool to include in ${processName}`}
      size="xl"
    >
      <div className="flex flex-col gap-6 -mt-2">
        {/* Search and Selection Status */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by title, authors, or DOI..."
              className="w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-gray-900 transition-all outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
              <FiLayers className="text-blue-600 w-4 h-4" />
              <span className="text-xs font-black text-blue-700 uppercase tracking-wider">
                {selectedPaperIds.length} Selected
              </span>
            </div>

            <Button
              variant="primary"
              size="md"
              disabled={selectedPaperIds.length === 0 || isAdding}
              isLoading={isAdding}
              onClick={handleConfirmAdd}
              className="rounded-2xl px-6 shadow-lg shadow-blue-500/20"
            >
              Add to Review
            </Button>
          </div>
        </div>

        {/* Results Container */}
        <div className="min-h-[500px] flex flex-col">
          {result && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-emerald-700">
                <FiCheckCircle className="w-5 h-5" />
                <div className="text-sm font-bold">
                  Successfully added {result.inserted} papers.{" "}
                  {result.skippedAsDuplicate > 0 &&
                    `(${result.skippedAsDuplicate} duplicates skipped)`}
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-emerald-700 hover:bg-emerald-100"
              >
                Done
              </Button>
            </div>
          )}

          <PaperTable
            papers={papers}
            isLoading={isLoading}
            isFetching={isFetching}
            totalCount={papersPage?.totalCount ?? 0}
            pageNumber={pageNumber}
            totalPages={papersPage?.totalPages ?? 1}
            pageSize={pageSize}
            selectedPaperIds={selectedPaperIds}
            allPageSelected={allPageSelected}
            onToggleAllPage={handleToggleAllPage}
            onTogglePaper={handleTogglePaper}
            onViewDetails={() => {}} // Could open another modal but let's keep it simple
            onPageChange={setPageNumber}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>
    </Modal>
  );
}
