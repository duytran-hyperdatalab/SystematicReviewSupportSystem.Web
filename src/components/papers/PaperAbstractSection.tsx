import React, { useState, memo } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

interface PaperAbstractSectionProps {
  abstract?: string | null;
  /** Max lines before collapse. Default 6 */
  collapsedLines?: number;
}

/**
 * Collapsible abstract section for Paper Details.
 * Handles null/empty abstracts with a muted empty state.
 */
const PaperAbstractSection: React.FC<PaperAbstractSectionProps> = ({
  abstract,
  collapsedLines = 6,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasAbstract = abstract && abstract.trim().length > 0;

  return (
    <section className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Abstract
      </h3>

      {hasAbstract ? (
        <div>
          <p
            className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word ${
              !isExpanded ? `line-clamp-${collapsedLines}` : ""
            }`}
            style={
              !isExpanded
                ? {
                    WebkitLineClamp: collapsedLines,
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                : undefined
            }
          >
            {abstract}
          </p>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <FiChevronUp className="w-3.5 h-3.5" />
                Show less
              </>
            ) : (
              <>
                <FiChevronDown className="w-3.5 h-3.5" />
                Read full abstract
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center">
          <p className="text-sm text-gray-400 italic">No abstract available</p>
        </div>
      )}
    </section>
  );
};

export default memo(PaperAbstractSection);
