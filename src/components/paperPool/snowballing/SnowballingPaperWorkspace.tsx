import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";

import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Quote,
  RefreshCw,
  ExternalLink,
  Minus,
} from "lucide-react";
import FiltersBar from "./FiltersBar";
import CandidateRow from "./CandidateRow";
import {
  usePaperSpecificCandidates,
  useRejectCandidates,
  useSelectCandidates,
} from "../../../hooks/useSnowballCandidates";
import type { PaperWithCandidateDto } from "../../../types/paper";
import { type MockCandidate } from "../../../mocks/snowballingMockData";
import Pagination from "../../ui/Pagination";
import CandidateDetailPanel from "./CandidateDetailPanel";
import Modal from "../../ui/Modal";
import { cn } from "../../../utils/cn";
import { Check, X, UserPlus, XCircle } from "lucide-react";
import toast from "react-hot-toast";

interface SnowballingPaperWorkspaceProps {
  projectId: string;
  paper: PaperWithCandidateDto;
  onBack: () => void;
  onSelectCandidate: (candidate: MockCandidate) => void;
  selectedCandidateId?: string;
  selectedCandidate: MockCandidate | null;
  onCloseDetail: () => void;
  onAction: (id: string, action: "select" | "reject") => Promise<void>;
  isProcessing: boolean;
}

const SnowballingPaperWorkspace: React.FC<SnowballingPaperWorkspaceProps> = ({
  projectId,
  paper,
  onBack,
  onSelectCandidate,
  selectedCandidateId,
  selectedCandidate,
  onCloseDetail,
  onAction,
  isProcessing,
}) => {
  // Pagination & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [year, setYear] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Use real API hook with server-side filters
  const {
    data: response,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = usePaperSpecificCandidates(paper.id, {
    searchTerm: searchTerm || undefined,
    status: status === "all" ? undefined : parseInt(status),
    year: year === "all" ? undefined : year,
    pageNumber,
    pageSize,
  });

  const [candidates, setCandidates] = useState<MockCandidate[]>([]);

  // Sync candidates state when data arrives
  React.useEffect(() => {
    if (response?.items) {
      setCandidates(response.items);
    }
  }, [response]);

  // Sync candidates state when data arrives

  // Filter state already defined above for hook

  // Selection State
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());

  // Derive available years
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    candidates.forEach((c) => {
      if (c.publicationYear) years.add(c.publicationYear);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [candidates]);

  // Server-side filtering is now used
  const filteredCandidates = candidates;

  // Mutations
  const selectMutation = useSelectCandidates(projectId);
  const rejectMutation = useRejectCandidates();

  const handleBulkAction = async (action: "select" | "reject") => {
    if (bulkSelectedIds.size === 0) return;

    try {
      const selectedIdsArray = Array.from(bulkSelectedIds);
      if (action === "select") {
        await selectMutation.mutateAsync({ candidateIds: selectedIdsArray });
      } else {
        await rejectMutation.mutateAsync({ candidateIds: selectedIdsArray });
      }

      setBulkSelectedIds(new Set());
      refetch(); // Refresh the list to reflect new statuses
      toast.success(`Successfully updated ${selectedIdsArray.length} candidates.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update candidates.");
    }
  };

  const isMutationPending = selectMutation.isPending || rejectMutation.isPending;

  // New Selection Helpers
  const currentLevelCandidates = response?.items || [];
  const selectableCandidates = currentLevelCandidates.filter(
    (c) => !c.isSelectedInProjectRepository,
  );

  const isAllPageSelected =
    selectableCandidates.length > 0 &&
    selectableCandidates.every((c) => bulkSelectedIds.has(c.candidateId));

  const isSomePageSelected =
    selectableCandidates.some((c) => bulkSelectedIds.has(c.candidateId)) && !isAllPageSelected;

  const handleToggleAllOnPage = () => {
    const next = new Set(bulkSelectedIds);
    if (isAllPageSelected) {
      // Unselect all on current page
      selectableCandidates.forEach((c) => next.delete(c.candidateId));
    } else {
      // Select all on current page
      selectableCandidates.forEach((c) => next.add(c.candidateId));
    }
    setBulkSelectedIds(next);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40 mb-4" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">
          Loading Candidates...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-black text-slate-900">Failed to load candidates</h3>
        <p className="text-sm text-slate-500 mt-2 mb-8">
          We couldn't retrieve the references for this origin paper.
        </p>
        <button
          onClick={() => refetch()}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Workspace Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 pr-4 border border-transparent hover:border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Back to Papers</span>
          </button>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900 truncate max-w-md">{paper.title}</h3>
          </div>
        </div>
      </div>

      {/* Split Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Paper Metadata (40%) */}
        <div className="w-[40%] border-r border-slate-200 bg-white overflow-y-auto p-10 select-text">
          <div className="max-w-xl mx-auto space-y-10">
            <section>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Origin Paper
              </label>
              <h2 className="text-2xl font-black text-slate-900 mt-2 leading-tight">
                {paper.title}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                {paper.doi && (
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all"
                  >
                    DOI: {paper.doi}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <span className="text-xs text-slate-400 font-bold">ID: {paper.id}</span>
              <div className="flex items-center gap-3 mt-4">
                <p className="text-sm text-slate-600 font-bold">{paper.authors}</p>
                <span className="w-1 h-1 rounded-full bg-slate-200" />
                <p className="text-sm text-slate-400 font-bold">{paper.publicationYear}</p>
              </div>
            </section>

            <section>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                <Quote className="w-3 h-3" /> Abstract
              </label>
              <div className="mt-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm text-slate-600 italic leading-relaxed">
                {paper.abstract}
              </div>
            </section>

            <section>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Metadata Summary
              </label>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-slate-50 p-6 rounded-4xl border border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                    Total Extracted
                  </span>
                  <p className="text-2xl font-black text-slate-900 mt-1">{paper.candidateCount}</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-4xl border border-emerald-100">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-500">
                    Suggested
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <p className="text-2xl font-black text-emerald-600">{paper.suggestedCount}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Right Panel: Candidates List (60%) */}
        <div className="w-[60%] flex flex-col relative bg-white">
          <FiltersBar
            searchTerm={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPageNumber(1);
            }}
            status={status}
            onStatusChange={(val) => {
              setStatus(val);
              setPageNumber(1);
            }}
            year={year}
            onYearChange={(val) => {
              setYear(val);
              setPageNumber(1);
            }}
            years={availableYears}
          />

          <div className="flex-1 overflow-y-auto">
            {filteredCandidates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No references match your filters
                </h3>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      onClick={handleToggleAllOnPage}
                      className={cn(
                        "shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center cursor-pointer",
                        isAllPageSelected
                          ? "bg-blue-600 border-blue-600"
                          : isSomePageSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-slate-300 hover:border-blue-400 bg-white",
                      )}
                    >
                      {isAllPageSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      {isSomePageSelected && <Minus className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {bulkSelectedIds.size > 0
                        ? `${bulkSelectedIds.size} Selected`
                        : `${filteredCandidates.length} References Found`}
                    </span>
                  </div>
                  {response?.totalCount && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Total: {response.totalCount}
                    </span>
                  )}
                </div>
                {filteredCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.candidateId}
                    candidate={candidate}
                    isSelected={selectedCandidateId === candidate.candidateId}
                    isBulkSelected={bulkSelectedIds.has(candidate.candidateId)}
                    onToggleBulkSelect={(id) => {
                      const next = new Set(bulkSelectedIds);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      setBulkSelectedIds(next);
                    }}
                    onSelect={onSelectCandidate}
                    onAction={onAction}
                    isProcessing={isProcessing}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination Bar */}
          <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between sticky bottom-0 z-20">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Page Size
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageNumber(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {response?.totalCount
                  ? `Showing ${(pageNumber - 1) * pageSize + 1} - ${Math.min(pageNumber * pageSize, response.totalCount)} of ${response.totalCount}`
                  : "No results"}
              </span>
            </div>

            <Pagination
              currentPage={pageNumber}
              totalPages={response?.totalPages || 1}
              onPageChange={setPageNumber}
              disabled={isFetching}
            />
          </div>

          {/* Bulk Actions Toolbar - Sticky via Portal */}
          {bulkSelectedIds.size > 0 &&
            createPortal(
              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-300">
                <div className="bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-2 p-2 pl-6 border border-white/10 backdrop-blur-md">
                  <div className="flex flex-col mr-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">
                      Selected
                    </span>
                    <span className="text-sm font-black text-white">
                      {bulkSelectedIds.size} Items
                    </span>
                  </div>

                  <div className="h-8 w-px bg-white/10 mx-2" />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkAction("select")}
                      disabled={isMutationPending}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">
                        Add to repository
                      </span>
                    </button>

                    <button
                      onClick={() => handleBulkAction("reject")}
                      disabled={isMutationPending}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Reject</span>
                    </button>

                    <div className="h-8 w-px bg-white/10 mx-2" />

                    <button
                      onClick={() => setBulkSelectedIds(new Set())}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      title="Clear Selection"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
          {/* Detail View - Modal */}
          <Modal
            isOpen={!!selectedCandidate}
            onClose={onCloseDetail}
            title="Candidate Details"
            size="lg"
          >
            <CandidateDetailPanel
              candidate={selectedCandidate}
              onClose={onCloseDetail}
              onAction={onAction}
              isProcessing={isProcessing}
              isModal={true}
            />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default SnowballingPaperWorkspace;
