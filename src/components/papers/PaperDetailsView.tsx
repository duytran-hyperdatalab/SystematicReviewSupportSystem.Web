import React, { memo, useMemo, useCallback, useState } from "react";
import { FiCopy, FiExternalLink, FiTag, FiDatabase, FiCalendar, FiUser } from "react-icons/fi";
import type { PaperResponse } from "../../types/paper";
import PaperAbstractSection from "./PaperAbstractSection";
import PaperMetadataGrid from "./PaperMetadataGrid";
import PaperAccessPanel from "./PaperAccessPanel";
import PaperReferencesSection from "./PaperReferencesSection";
import Drawer from "../ui/Drawer";
import Modal from "../ui/Modal";
import toast from "react-hot-toast";

// ============================================
// Props
// ============================================

interface PaperDetailsViewProps {
  paper: PaperResponse | null;
  /** Loading state — shows skeleton when true */
  loading?: boolean;
  /** Display mode: Drawer (default) or inline content */
  mode?: "drawer" | "inline";
  /** Drawer open state (only used when mode="drawer") */
  isOpen?: boolean;
  /** Drawer close handler (only used when mode="drawer") */
  onClose?: () => void;
  /** Optional callback when a PDF is uploaded */
  onUploadPdf?: (paperId: string, file: File, options: Record<string, unknown>) => Promise<void>;
  /** Optional loading state for PDF upload */
  isUploadingPdf?: boolean;
}

// ============================================
// Skeleton Loader
// ============================================

function PaperDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title skeleton */}
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-6 bg-gray-200 rounded w-1/2" />
      </div>
      {/* Authors */}
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      {/* Badges */}
      <div className="flex gap-2">
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
      </div>
      {/* Abstract */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
      {/* Metadata */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-32" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
      {/* Provenance */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-28" />
        <div className="h-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// ============================================
// Keywords Component
// ============================================

const PaperKeywords = memo(({ keywords }: { keywords?: string | null }) => {
  const tags = useMemo(() => {
    if (!keywords) return [];
    return keywords
      .split(/[;,]/)
      .map((k) => k.trim())
      .filter(Boolean);
  }, [keywords]);

  if (tags.length === 0) return null;

  return (
    <section className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <FiTag className="w-3.5 h-3.5" />
        Keywords
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
          >
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
});
PaperKeywords.displayName = "PaperKeywords";

// ============================================
// Header Section
// ============================================

const PaperHeader = memo(({ paper }: { paper: PaperResponse }) => {
  const handleCopyDoi = useCallback(() => {
    if (paper.doi) {
      navigator.clipboard.writeText(paper.doi).then(
        () => toast.success("DOI copied to clipboard"),
        () => toast.error("Failed to copy DOI"),
      );
    }
  }, [paper.doi]);

  return (
    <header className="mb-6 pb-6 border-b border-gray-100">
      {/* Title */}
      <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3 wrap-break-word">
        {paper.title}
      </h2>
      <span className="text-xs text-slate-400 font-bold">ID: {paper.id}</span>
      {/* Authors */}
      {paper.authors && (
        <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
          <FiUser className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <span className="wrap-break-word">{paper.authors}</span>
        </p>
      )}

      {/* Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {paper.publicationYear && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            <FiCalendar className="w-3 h-3" />
            {paper.publicationYear}
          </span>
        )}
        {paper.publicationType && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            {paper.publicationType}
          </span>
        )}
        {paper.source && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            <FiDatabase className="w-3 h-3" />
            {paper.source}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {paper.doi && (
          <button
            onClick={handleCopyDoi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title={`Copy DOI: ${paper.doi}`}
          >
            <FiCopy className="w-3.5 h-3.5" />
            Copy DOI
          </button>
        )}
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <FiExternalLink className="w-3.5 h-3.5" />
            Open DOI
          </a>
        )}
        {paper.url && !paper.doi && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <FiExternalLink className="w-3.5 h-3.5" />
            Open URL
          </a>
        )}
        {paper.url && paper.doi && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiExternalLink className="w-3.5 h-3.5" />
            Source URL
          </a>
        )}
      </div>
    </header>
  );
});
PaperHeader.displayName = "PaperHeader";

// ============================================
// Main Content (shared between drawer and inline)
// ============================================

const PaperDetailsContent = memo(
  ({
    paper,
    loading,
    onUploadPdf,
    isUploadingPdf,
  }: {
    paper: PaperResponse | null;
    loading?: boolean;
    onUploadPdf?: (paperId: string, file: File, options: Record<string, unknown>) => Promise<void>;
    isUploadingPdf?: boolean;
  }) => {
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

    if (loading) {
      return <PaperDetailsSkeleton />;
    }

    if (!paper) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <FiDatabase className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No paper selected</p>
        </div>
      );
    }

    const handlePreviewPdf = (url: string) => {
      setPreviewPdfUrl(url);
    };

    return (
      <div>
        <PaperHeader paper={paper} />
        <PaperAbstractSection abstract={paper.abstract} />
        <PaperReferencesSection paper={paper} />
        <PaperMetadataGrid paper={paper} />
        <PaperKeywords keywords={paper.keywords} />
        <PaperAccessPanel
          paper={paper}
          onUploadPdf={onUploadPdf}
          isUploadingPdf={isUploadingPdf}
          onPreviewPdf={handlePreviewPdf}
        />

        {previewPdfUrl && (
          <Modal
            isOpen={!!previewPdfUrl}
            onClose={() => setPreviewPdfUrl(null)}
            title="PDF Preview"
            description={`Viewing full text for: ${paper.title}`}
            size="xl"
          >
            <div className="h-[75vh] w-[calc(100%+4rem)] -mx-8 -mb-8 mt-4 bg-gray-100/50 rounded-b-[2.5rem] overflow-hidden">
              <iframe
                src={`${previewPdfUrl}#toolbar=0&navpanes=0`}
                title="PDF Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups"
              />
            </div>
          </Modal>
        )}
      </div>
    );
  },
);
PaperDetailsContent.displayName = "PaperDetailsContent";

// ============================================
// Main Export: PaperDetailsView
// ============================================

/**
 * Paper Details View — read-only inspection of a single paper.
 *
 * Supports two modes:
 *   - **drawer** (default): Renders inside a right-side Drawer component
 *   - **inline**: Renders content directly (for embedding in a page layout)
 *
 * @example
 * // Drawer mode
 * <PaperDetailsView
 *   paper={selectedPaper}
 *   loading={loading}
 *   mode="drawer"
 *   isOpen={isDrawerOpen}
 *   onClose={() => setIsDrawerOpen(false)}
 * />
 *
 * @example
 * // Inline mode
 * <PaperDetailsView paper={selectedPaper} mode="inline" />
 */
const PaperDetailsView: React.FC<PaperDetailsViewProps> = ({
  paper,
  loading = false,
  mode = "drawer",
  isOpen = false,
  onClose,
  onUploadPdf,
  isUploadingPdf,
}) => {
  if (mode === "inline") {
    return (
      <PaperDetailsContent
        paper={paper}
        loading={loading}
        onUploadPdf={onUploadPdf}
        isUploadingPdf={isUploadingPdf}
      />
    );
  }

  // Drawer mode
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose || (() => { })}
      title={
        <div className="flex items-center gap-2">
          <FiDatabase className="w-5 h-5 text-blue-600" />
          <span className="truncate max-w-md">
            {loading ? "Loading..." : paper?.title || "Paper Details"}
          </span>
        </div>
      }
      maxWidth="max-w-2xl"
      side="right"
    >
      <PaperDetailsContent
        paper={paper}
        loading={loading}
        onUploadPdf={onUploadPdf}
        isUploadingPdf={isUploadingPdf}
      />
    </Drawer>
  );
};

export default memo(PaperDetailsView);
