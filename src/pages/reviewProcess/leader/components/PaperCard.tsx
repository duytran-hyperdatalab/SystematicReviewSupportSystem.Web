import React from "react";
import { FiExternalLink } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import type { PaperResponse } from "../../../../types/paper";

interface PaperCardProps {
  paper: PaperResponse;
  onViewDetails: (paper: PaperResponse) => void;
  onRemove?: (paperId: string) => void;
  className?: string;
}

const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  IoT: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Security: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  Review: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  ML: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  AI: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  Cloud: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  Network: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
};

const getTagStyle = (tag: string) => {
  const normalized = tag.charAt(0).toUpperCase() + tag.slice(1);
  return TAG_COLORS[normalized] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
};

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  onViewDetails,
  className,
}) => {
  const mockTags = paper.keywords
    ? paper.keywords.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 3)
    : ["Research"];

  const displayAuthors = paper.authors
    ? paper.authors.split(",").map((a) => a.trim()).filter(Boolean).slice(0, 2).join(", ")
    : "Unknown Authors";

  return (
    <div
      className={cn(
        "group relative bg-white rounded-2xl border border-gray-100 shadow-sm",
        "hover:shadow-xl hover:shadow-slate-200/50 hover:border-gray-200",
        "hover:-translate-y-0.5 transition-all duration-300 ease-out",
        "cursor-pointer",
        className
      )}
      onClick={() => onViewDetails(paper)}
    >
      <div className="p-5">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
          {paper.title}
        </h3>

        {/* Authors & Year */}
        <p className="text-sm text-gray-500 mb-3">
          {displayAuthors}
          {paper.authors && paper.authors.split(",").length > 2 && " et al."}
          {paper.publicationYear && ` • ${paper.publicationYear}`}
        </p>

        {/* Abstract Preview */}
        {paper.abstract && (
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 opacity-80">
            {paper.abstract}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mockTags.map((tag) => {
            const style = getTagStyle(tag);
            return (
              <span
                key={tag}
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                  style.bg,
                  style.text,
                  style.border
                )}
              >
                #{tag}
              </span>
            );
          })}
        </div>

        {/* Footer: DOI & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {paper.doi ? (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline truncate max-w-[140px] flex items-center gap-1"
            >
              <FiExternalLink className="w-3 h-3 shrink-0" />
              {paper.doi}
            </a>
          ) : paper.url ? (
            <a
              href={paper.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline truncate max-w-[140px] flex items-center gap-1"
            >
              <FiExternalLink className="w-3 h-3 shrink-0" />
              View Source
            </a>
          ) : (
            <span className="text-xs text-gray-400">No DOI</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperCard;
