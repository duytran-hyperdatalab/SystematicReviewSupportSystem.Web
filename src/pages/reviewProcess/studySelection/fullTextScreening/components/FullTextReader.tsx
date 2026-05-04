import { useState, useRef, useCallback } from "react";
import {
  FiCpu,
  FiFileText,
  FiSearch,
  FiChevronDown,
  FiExternalLink,
  FiAlertTriangle,
  FiRefreshCw,
  FiMaximize2,
  FiMinimize2,
  FiZoomIn,
  FiZoomOut,
  FiBookOpen,
} from "react-icons/fi";
import type { FullTextPaper, AiHighlight } from "../types";
import { PAPER_SECTIONS } from "../constants";
import { cn } from "../../../../../utils/cn";
import UploadFullTextPdfModal from "../../components/UploadFullTextPdfModal";
import MetadataSuggestionModal from "../../components/MetadataSuggestionModal";
import type { UploadPdfOptions } from "../../uploadTypes";
import type { PaperWithDecisionsResponse } from "../../../../../types/studySelection";

interface FullTextReaderProps {
  paper: FullTextPaper | null;
  aiHighlights: AiHighlight[];
  onUploadPdf?: (
    paperId: string,
    file: File,
    options?: UploadPdfOptions,
  ) => Promise<PaperWithDecisionsResponse>;
  onApplyMetadataSuggestion?: (
    paperId: string,
    sourceMetadataId: string,
    fields: string[],
  ) => Promise<void>;
  onRetryExtraction?: (paperId: string) => Promise<void>;
  isUploading?: boolean;
  isApplyingMetadataSuggestion?: boolean;
  isRetryingExtraction?: boolean;
}

export default function FullTextReader({
  paper,
  aiHighlights,
  onUploadPdf,
  onApplyMetadataSuggestion,
  onRetryExtraction,
  isUploading = false,
  isApplyingMetadataSuggestion = false,
  isRetryingExtraction = false,
}: FullTextReaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSectionNav, setShowSectionNav] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<NonNullable<
    FullTextPaper["extractionSuggestion"]
  > | null>(null);
  const [appliedMetadataFields, setAppliedMetadataFields] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasPdf = !!(paper?.pdfUrl || paper?.url);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const handleUploadSubmit = async (file: File, options: UploadPdfOptions) => {
    if (!paper || !onUploadPdf) {
      return;
    }

    const uploadedPaper = await onUploadPdf(paper.id, file, options);
    setIsUploadModalOpen(false);

    if (options.extractWithGrobid && uploadedPaper.extractionSuggestion) {
      setActiveSuggestion(uploadedPaper.extractionSuggestion);
    }
  };

  const handleApplySuggestion = async (selectedFields: string[]) => {
    if (!paper || !activeSuggestion || !onApplyMetadataSuggestion) {
      return;
    }

    await onApplyMetadataSuggestion(paper.id, activeSuggestion.sourceMetadataId, selectedFields);
    setAppliedMetadataFields(selectedFields);
    setActiveSuggestion(null);
  };

  const updatedFields = new Set(
    [...appliedMetadataFields, ...(paper?.extractionResult?.updatedFields ?? [])].map((value) =>
      value.toLowerCase(),
    ),
  );

  // Empty state
  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 text-center px-8">
        <FiBookOpen className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-500">No Paper Selected</h3>
        <p className="text-sm text-gray-400 mt-2">
          Select a paper from the queue to read the full text
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-[10px]">
            ↑
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200 font-mono text-[10px]">
            ↓
          </kbd>
          <span>to navigate papers</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-full bg-white">
      {isUploadModalOpen && (
        <UploadFullTextPdfModal
          isOpen={isUploadModalOpen}
          isUploading={isUploading}
          paper={{
            title: paper.title,
            authors: paper.authors,
            doi: paper.doi,
            abstract: paper.abstract,
            journal: paper.journal,
          }}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleUploadSubmit}
        />
      )}

      {paper && activeSuggestion && (
        <MetadataSuggestionModal
          key={activeSuggestion.sourceMetadataId}
          isOpen={!!activeSuggestion}
          isApplying={isApplyingMetadataSuggestion}
          currentMetadata={{
            title: paper.title,
            authors: paper.authors,
            abstract: paper.abstract,
            doi: paper.doi,
            journal: paper.journal,
            volume: paper.volume,
            issue: paper.issue,
            pages: paper.pages,
            
          }}
          suggestion={activeSuggestion}
          onApply={handleApplySuggestion}
          onClose={() => setActiveSuggestion(null)}
        />
      )}

      {/* Reader Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FiFileText className="w-4 h-4 text-indigo-600 shrink-0" />
          <h2 className="text-sm font-medium text-gray-900 truncate">{paper.title}</h2>
          {paper.pdfFileName && (
            <span className="text-[10px] text-gray-500 bg-white border border-gray-200 rounded px-2 py-0.5 truncate max-w-48">
              {paper.pdfFileName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Search toggle */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showSearch
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            )}
            title="Search within paper"
          >
            <FiSearch className="w-4 h-4" />
          </button>

          {/* Section nav toggle */}
          <button
            onClick={() => setShowSectionNav(!showSectionNav)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              showSectionNav
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
            )}
            title="Toggle section navigation"
          >
            <FiBookOpen className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="Zoom out"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center font-medium">{zoomLevel}%</span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="Zoom in"
          >
            <FiZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <FiMinimize2 className="w-4 h-4" />
            ) : (
              <FiMaximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Open in new tab */}
          {hasPdf && (
            <a
              href={paper.pdfUrl || paper.url || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Open in new tab"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-gray-200 bg-white">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search within paper..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {/* Section Navigation Sidebar */}
        {showSectionNav && (
          <div className="w-48 shrink-0 border-r border-gray-100 overflow-y-auto bg-gray-50">
            <div className="py-3">
              <p className="px-4 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Sections
              </p>
              {PAPER_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {section.label}
                </button>
              ))}
            </div>

            {/* AI Highlights */}
            {aiHighlights.length > 0 && (
              <div className="border-t border-gray-200 py-3">
                <p className="px-4 text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-2">
                  AI Highlights
                </p>
                {aiHighlights.map((hl, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                    title={hl.text}
                  >
                    <span className="font-medium">{hl.section}</span>
                    <span className="text-gray-400 ml-1">p.{hl.page}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDF / Full Text Content */}
        <div className="flex-1 min-w-0 overflow-auto bg-gray-100">
          {paper.extraction?.status === "failed" && paper.extraction.requested && (
            <div className="border-b border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-900">
                PDF uploaded successfully, but metadata extraction failed.
              </p>
              {paper.extraction.message && (
                <p className="mt-1 text-xs text-amber-800">{paper.extraction.message}</p>
              )}
              {onRetryExtraction && (
                <button
                  onClick={() => onRetryExtraction(paper.id)}
                  disabled={isRetryingExtraction}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiRefreshCw
                    className={cn("h-3.5 w-3.5", isRetryingExtraction && "animate-spin")}
                  />
                  {isRetryingExtraction ? "Retrying..." : "Retry Extraction"}
                </button>
              )}
            </div>
          )}

          {paper.extractionResult && (
            <div className="border-b border-indigo-100 bg-indigo-50/80 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FiCpu className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                    AI Extraction Result
                  </p>
                  <p className="text-sm font-semibold text-slate-900">AI Extracted Metadata</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Metadata Sources
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <SourceBadge
                      label={paper.metadataSources?.title ?? paper.source ?? "Current Record"}
                      tone="neutral"
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-white px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Updated Fields
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {paper.extractionResult.updatedFields.length > 0 ? (
                      paper.extractionResult.updatedFields.map((field) => (
                        <span
                          key={field}
                          className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-700"
                        >
                          {field}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">No fields changed</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-white px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Metadata Source Transparency
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {paper.metadataSources?.title && (
                    <SourceBadge
                      label={`Title [${paper.metadataSources.title}]`}
                      tone={paper.metadataSources.title === "GROBID" ? "ai" : "neutral"}
                    />
                  )}
                  {paper.metadataSources?.authors && (
                    <SourceBadge
                      label={`Authors [${paper.metadataSources.authors}]`}
                      tone={paper.metadataSources.authors === "GROBID" ? "ai" : "neutral"}
                    />
                  )}
                  {paper.metadataSources?.abstract && (
                    <SourceBadge
                      label={`Abstract [${paper.metadataSources.abstract}]`}
                      tone={paper.metadataSources.abstract === "GROBID" ? "ai" : "neutral"}
                    />
                  )}
                  {paper.metadataSources?.doi && (
                    <SourceBadge
                      label={`DOI [${paper.metadataSources.doi}]`}
                      tone={paper.metadataSources.doi === "GROBID" ? "ai" : "neutral"}
                    />
                  )}
                  {paper.metadataSources?.journal && (
                    <SourceBadge
                      label={`Journal [${paper.metadataSources.journal}]`}
                      tone={paper.metadataSources.journal === "GROBID" ? "ai" : "neutral"}
                    />
                  )}
                </div>
                {updatedFields.size > 0 && (
                  <p className="mt-3 text-xs font-medium text-indigo-700">
                    Updated via AI extraction: {Array.from(updatedFields).join(", ")}
                  </p>
                )}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {paper.extractionResult.title && (
                  <ExtractedFieldCard
                    label="Extracted Title"
                    value={paper.extractionResult.title}
                  />
                )}
                {paper.extractionResult.authors && (
                  <ExtractedFieldCard
                    label="Extracted Authors"
                    value={paper.extractionResult.authors}
                  />
                )}
                {paper.extractionResult.journal && (
                  <ExtractedFieldCard
                    label="Extracted Journal"
                    value={paper.extractionResult.journal}
                  />
                )}
                {paper.extractionResult.doi && (
                  <ExtractedFieldCard label="Extracted DOI" value={paper.extractionResult.doi} />
                )}
              </div>
            </div>
          )}
          {hasPdf ? (
            <PdfViewer url={paper.pdfUrl || paper.url || ""} zoomLevel={zoomLevel} />
          ) : (
            <FullTextMissing
              paper={paper}
              onUpload={onUploadPdf ? () => setIsUploadModalOpen(true) : undefined}
              isUploading={isUploading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// PDF Viewer (iframe-based)
// ============================================

function PdfViewer({ url, zoomLevel }: { url: string; zoomLevel: number }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div
        className="bg-white shadow-lg rounded-lg overflow-hidden w-full h-full"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
      >
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          title="PDF Viewer"
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-popups"
        />
      </div>
    </div>
  );
}

// ============================================
// Full Text Missing State
// ============================================

function FullTextMissing({
  paper,
  onUpload,
  isUploading,
}: {
  paper: FullTextPaper;
  onUpload?: () => void;
  isUploading: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
        <FiAlertTriangle className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Full Text Missing</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        No PDF is available for this paper. Upload the full text to proceed with screening.
      </p>

      {/* Paper info */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 max-w-md w-full mb-6">
        <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{paper.title}</h4>
        <p className="text-xs text-gray-500">{paper.authors ?? "Unknown authors"}</p>
        {paper.doi && (
          <a
            href={`https://doi.org/${encodeURIComponent(paper.doi)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-2"
          >
            DOI: {paper.doi}
            <FiExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Upload action */}
      {onUpload && (
        <div className="max-w-md w-full bg-white rounded-xl p-4 border border-gray-200 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Upload full text PDF
          </p>
          <p className="text-sm text-gray-500">
            Select a PDF file up to 20 MB. The file will be uploaded and linked to this paper.
          </p>
          <button
            onClick={onUpload}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiFileText className="w-4 h-4" />
            {isUploading ? "Uploading PDF..." : "Open Upload Modal"}
          </button>
        </div>
      )}

      {/* Abstract fallback */}
      {paper.abstract && (
        <div className="mt-8 max-w-lg w-full">
          <div className="flex items-center gap-2 mb-3">
            <FiChevronDown className="w-3 h-3 text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Abstract (preview)
            </p>
          </div>
          <div className="text-sm text-gray-600 leading-relaxed bg-white rounded-xl p-5 border border-gray-200 text-left">
            {paper.abstract}
          </div>
        </div>
      )}
    </div>
  );
}

function SourceBadge({ label, tone }: { label: string; tone: "neutral" | "ai" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        tone === "ai" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600",
      )}
    >
      {label}
    </span>
  );
}

function ExtractedFieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  );
}
