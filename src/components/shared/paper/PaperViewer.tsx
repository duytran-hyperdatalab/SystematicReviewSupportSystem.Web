import { useState, useRef, useCallback } from "react";
import {
  FiCheck,
  FiFileText,
  FiAlertTriangle,
  FiRefreshCw,
  FiShare2,
  FiGitBranch,
  FiList,
  FiExternalLink,
  FiLoader,
} from "react-icons/fi";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { highlightPlugin } from "@react-pdf-viewer/highlight";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/highlight/lib/styles/index.css";

import { cn } from "../../../utils/cn";

import { usePaperViewerState } from "./PaperViewer/hooks/usePaperViewerState";
import {
  PaperHeroHeader,
  ContentSection,
  PublicationInfoCard,
  IdentifierSection,
  SystemMetadataCollapse,
  TabButton,
  DecisionStatus,
  ResolutionDetails,
  GraphSection,
  PaperNodeList,
  ImradSidebar,
  type ImradSectionKey,
} from "./PaperViewer/components";
import CitationGraphModal from "../../../pages/reviewProcess/studySelection/titleAbstractScreening/components/graph/CitationGraphModal";
import ExcludeMenu from "../../../pages/reviewProcess/studySelection/components/ExcludeMenu";
import type { PaperViewerProps } from "./PaperViewer/types";
import { PaperPhase } from "../../../types/studySelection";
import { useReviewerDecisions } from "../../../hooks/useStudySelection";
import ConflictResolutionModal from "../../reviewProcess/leader/ConflictResolutionModal";

/**
 * Premium Paper Viewer Component
 * Structured, grouped, and scannable layout for research metadata.
 */
export default function PaperViewer({
  paper,
  onInclude,
  onExclude,
  isSubmitting = false,
  onRetryExtraction,
  isRetryingExtraction = false,
  hideActions = false,
  isLeaderView = false,
  phase = PaperPhase.TitleAbstract,
}: PaperViewerProps) {
  const {
    screeningProcessId,
    activeTab,
    setActiveTab,
    openGraph,
    setOpenGraph,
    setReasonPageSize,
    includePaper,
    excludePaper,
    isSubmittingDecision,
    references,
    citations,
    citationGraph,
    isDiscoveryLoading,
    graphDepth,
    setGraphDepth,
    minConfidence,
    setMinConfidence,
    exclusionReasons,
    isLoadingReasons,
    hasMoreReasons,
    canReview,
    isFieldUpdated,
  } = usePaperViewerState(paper);

  const [activeSection, setActiveSection] = useState<ImradSectionKey | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (sidebarRef.current) {
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const newWidth = moveEvent.clientX - sidebarRect.left;
        if (newWidth >= 160 && newWidth <= 450) {
          setSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
  }, []);

  const handleSectionClick = (sectionKey: ImradSectionKey) => {
    setActiveSection(sectionKey);
    // Future: Scroll to section or highlight in PDF
  };

  const highlightPluginInstance = highlightPlugin();

  const { data: reviewerDecisions, isLoading: isLoadingReviewers } = useReviewerDecisions(
    screeningProcessId,
    paper?.id,
    phase,
  );

  const hasPendingAssignedReviewer = !!reviewerDecisions?.some((rd) => !rd.decision);

  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center px-8">
        <FiFileText className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-500">No Paper Selected</h3>
        <p className="text-sm text-gray-400 mt-2">
          Select a paper from the queue to start reviewing
        </p>
      </div>
    );
  }

  // const hasPendingAssignedReviewer = !!paper.assignedReviewers?.some((r) => !r.decision);

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div
          className={cn(
            "mx-auto px-6 py-8 space-y-6 transition-all duration-300",
            activeTab === "fulltext" ? "max-w-6xl" : "max-w-4xl",
          )}
        >
          {openGraph && citationGraph && (
            <CitationGraphModal
              isOpen={openGraph}
              onClose={() => setOpenGraph(false)}
              data={citationGraph}
              paperTitle={paper.title}
              rootPaperId={paper.id}
              screeningProcessId={screeningProcessId ?? ""}
            />
          )}

          {/* 1. Hero Header */}
          <PaperHeroHeader
            paper={paper}
            isLeaderView={isLeaderView}
            isFieldUpdated={isFieldUpdated}
          />

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <TabButton
              active={activeTab === "abstract"}
              onClick={() => setActiveTab("abstract")}
              icon={<FiFileText className="w-4 h-4" />}
              label="Overview"
            />
            <TabButton
              active={activeTab === "references"}
              onClick={() => setActiveTab("references")}
              icon={<FiList className="w-4 h-4" />}
              label="References"
              count={paper.referenceCount}
            />
            <TabButton
              active={activeTab === "citations"}
              onClick={() => setActiveTab("citations")}
              icon={<FiShare2 className="w-4 h-4" />}
              label="Citations"
              count={paper.citationCount}
            />
            <TabButton
              active={activeTab === "graph"}
              onClick={() => setActiveTab("graph")}
              icon={<FiGitBranch className="w-4 h-4" />}
              label="Network"
            />
            {paper.pdfUrl && (
              <TabButton
                active={activeTab === "fulltext"}
                onClick={() => setActiveTab("fulltext")}
                icon={<FiFileText className="w-4 h-4" />}
                label="Full Text"
              />
            )}
          </div>

          {/* 2. Tab Content */}
          <div className="space-y-6 animate-in fade-in duration-300">
            {activeTab === "abstract" && (
              <>
                <ContentSection paper={paper as any} isFieldUpdated={isFieldUpdated} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PublicationInfoCard paper={paper} isFieldUpdated={isFieldUpdated} />
                  <IdentifierSection paper={paper} isFieldUpdated={isFieldUpdated} />
                </div>

                <SystemMetadataCollapse paper={paper} />

                {paper.extraction?.status === "failed" && paper.extraction.requested && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">Extraction Failed</p>
                        <p className="text-xs text-amber-800 mt-1">
                          PDF uploaded, but AI could not extract metadata automatically.
                        </p>
                        {onRetryExtraction && (
                          <button
                            onClick={() => onRetryExtraction(paper.id)}
                            disabled={isRetryingExtraction}
                            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white border border-amber-200 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <FiRefreshCw
                              className={cn("w-3.5 h-3.5", isRetryingExtraction && "animate-spin")}
                            />
                            {isRetryingExtraction ? "Retrying..." : "Retry Extraction"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "references" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">
                  Cited References
                </h2>
                <PaperNodeList
                  nodes={references}
                  isLoading={isDiscoveryLoading}
                  emptyLabel="No references found."
                />
              </div>
            )}

            {activeTab === "citations" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">
                  Citing Papers
                </h2>
                <PaperNodeList
                  nodes={citations}
                  isLoading={isDiscoveryLoading}
                  emptyLabel="No citations found."
                />
              </div>
            )}

            {activeTab === "graph" && (
              <GraphSection
                citationGraph={citationGraph}
                isDiscoveryLoading={isDiscoveryLoading}
                graphDepth={graphDepth}
                setGraphDepth={setGraphDepth}
                minConfidence={minConfidence}
                setMinConfidence={setMinConfidence}
                setOpenGraph={setOpenGraph}
              />
            )}

            {activeTab === "fulltext" && paper.pdfUrl && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-[800px] flex flex-col">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    PDF Viewer
                  </h2>
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
                  >
                    Open in New Tab
                    <FiExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex-1 flex min-h-0 relative">
                  {/* IMRAD Sidebar Integration */}
                  <div ref={sidebarRef}>
                    <ImradSidebar
                      activeSection={activeSection}
                      onSectionClick={handleSectionClick}
                      width={sidebarWidth}
                    />
                  </div>

                  {/* Resizable Divider */}
                  <div
                    onMouseDown={handleMouseDown}
                    className={cn(
                      "w-1 hover:w-1.5 bg-slate-100 hover:bg-blue-400 cursor-col-resize transition-all duration-200 z-10 relative group",
                      isResizing && "bg-blue-500 w-1.5",
                    )}
                  >
                    <div className="absolute inset-y-0 -left-1 -right-1 cursor-col-resize" />
                  </div>

                  <div
                    className={cn(
                      "flex-1 relative bg-slate-100 transition-opacity",
                      isResizing && "pointer-events-none opacity-80",
                    )}
                  >
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                      <Viewer fileUrl={paper.pdfUrl} plugins={[highlightPluginInstance]} />
                    </Worker>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* {(paper.hasConflict || (paper.screeningStatus === "conflicted" && !isLeaderView)) && (
            <ConflictDetails paper={paper as any} />
          )} */}
          {!isLeaderView && paper.resolution && <ResolutionDetails resolution={paper.resolution} />}
        </div>
      </div>

      {/* Decision Action Bar */}
      {!hideActions && (
        <div className="border-t border-slate-200 bg-white/80 backdrop-blur-md px-8 py-4 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto">
            {(!isLeaderView && canReview) || (isLeaderView && (onInclude || onExclude)) ? (
              <div className="flex flex-col gap-4">
                {exclusionReasons.length === 0 && !isLoadingReasons && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-xs font-bold animate-pulse">
                    <FiAlertTriangle className="w-4 h-4" />
                    Waiting for leader to define exclusion codes...
                  </div>
                )}
                {hasPendingAssignedReviewer && isLeaderView && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
                    <FiAlertTriangle className="w-4 h-4" />
                    Wait for assigned reviewers finished reviews to make decision
                  </div>
                )}
                {isLoadingReviewers && isLeaderView && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 text-xs font-bold animate-pulse">
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Checking assignments...
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {paper.hasConflict && isLeaderView ? (
                    <button
                      onClick={() => setIsResolutionModalOpen(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 h-12 bg-amber-600 text-white font-black uppercase tracking-wider text-xs rounded-2xl hover:bg-amber-700 active:scale-[0.98] transition-all shadow-lg shadow-amber-900/10 animate-in zoom-in-95 duration-200"
                    >
                      <FiAlertTriangle className="w-4 h-4" />
                      Resolve Conflict
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => (onInclude ? onInclude(paper.id) : includePaper(paper.id))}
                        disabled={
                          isSubmittingDecision ||
                          isSubmitting ||
                          (isLeaderView && hasPendingAssignedReviewer) ||
                          isLoadingReviewers
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 h-12 bg-emerald-600 text-white font-black uppercase tracking-wider text-xs rounded-2xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-900/10 disabled:opacity-50"
                      >
                        <FiCheck className="w-4 h-4" />
                        Include{" "}
                        <kbd className="ml-2 px-1.5 py-0.5 bg-emerald-500/50 rounded font-mono">
                          1
                        </kbd>
                      </button>

                      <ExcludeMenu
                        paperId={paper.id}
                        onExclude={onExclude || excludePaper}
                        isSubmitting={
                          isSubmittingDecision ||
                          isSubmitting ||
                          (isLeaderView && hasPendingAssignedReviewer) ||
                          isLoadingReviewers
                        }
                        exclusionReasons={exclusionReasons}
                        hasMoreReasons={hasMoreReasons}
                        onShowMoreReasons={() => setReasonPageSize((prev) => prev + 5)}
                        onResetReasons={() => setReasonPageSize(5)}
                      />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <DecisionStatus paper={paper} />
            )}
          </div>
        </div>
      )}

      {isResolutionModalOpen && (
        <ConflictResolutionModal
          isOpen={isResolutionModalOpen}
          onClose={() => setIsResolutionModalOpen(false)}
          paperId={paper.id}
          processId={screeningProcessId || ""}
          phase={phase}
        />
      )}
    </div>
  );
}
