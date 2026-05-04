import React, { memo, useMemo, useCallback } from "react";
import { FiCopy, FiExternalLink, FiTag, FiDatabase, FiCalendar, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

import PaperAbstractSection from "../../../../components/papers/PaperAbstractSection";
import PaperMetadataGrid from "../../../../components/papers/PaperMetadataGrid";
import type { WorkspaceQAPaper } from "../QualityAssessmentWorkspace";

// ============================================
// Props
// ============================================

interface QAPaperDetailsProps {
  paper: WorkspaceQAPaper;
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

const PaperHeader = memo(({ paper }: { paper: WorkspaceQAPaper }) => {
  const handleCopyDoi = useCallback(() => {
    if (paper.doi) {
      navigator.clipboard.writeText(paper.doi).then(
        () => toast.success("DOI copied to clipboard"),
        () => toast.error("Failed to copy DOI")
      );
    }
  }, [paper.doi]);

  return (
    <header className="mb-6 pb-6 border-b border-gray-100">
      {/* Title */}
      <h2 className="text-lg font-bold text-gray-900 leading-snug mb-3 wrap-break-word">
        {paper.title}
      </h2>

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
      </div>
    </header>
  );
});
PaperHeader.displayName = "PaperHeader";

// ============================================
// Main Content
// ============================================

const QAPaperDetails: React.FC<QAPaperDetailsProps> = ({ paper }) => {
  return (
    <div className="bg-white">
      <PaperHeader paper={paper} />
      <PaperAbstractSection abstract={paper.abstract} />
      {/* Fallback type to any since PaperResponse differs slightly from WorkspaceQAPaper but contains the matched fields */}
      <PaperMetadataGrid paper={paper as any} />
      <PaperKeywords keywords={paper.keywords} />
    </div>
  );
};

export default memo(QAPaperDetails);