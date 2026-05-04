import { Check, AlertCircle, BookmarkCheck, MoreHorizontal, UserPlus, XCircle } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { CandidatePaperDto } from "../../../types/paper";

interface CandidateRowProps {
  candidate: CandidatePaperDto;
  isSelected: boolean;
  isBulkSelected: boolean;
  onToggleBulkSelect: (id: string) => void;
  onSelect: (candidate: CandidatePaperDto) => void;
  onAction?: (id: string, action: "select" | "reject") => void;
  isProcessing?: boolean;
}

const CandidateRow: React.FC<CandidateRowProps> = ({
  candidate,
  isSelected,
  isBulkSelected,
  onToggleBulkSelect,
  onSelect,
  onAction,
  isProcessing = false,
}) => {
  const {
    candidateId,
    title,
    authors,
    publicationYear,
    statusText,
    extractionQualityScore,
    matchConfidenceScore,
    isSelectedInProjectRepository,
    validationNote,
  } = candidate;

  const isLowQuality = validationNote?.toLowerCase().includes("low extraction quality");

  const getQualityColor = (score: number) => {
    if (score < 0.4) return "bg-red-500";
    if (score <= 0.7) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getMatchColor = (score: number) => {
    if (score === 0) return "bg-slate-300";
    if (score < 0.6) return "bg-blue-400";
    return "bg-purple-500";
  };

  return (
    <div
      onClick={() => onSelect(candidate)}
      className={cn(
        "group relative flex flex-col md:flex-row items-start md:items-center p-5 mb-3 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer hover:shadow-md hover:border-blue-200",
        isSelected && "border-blue-400 ring-1 ring-blue-400 bg-blue-50/10",
        isSelectedInProjectRepository && "opacity-60 bg-slate-50/50",
      )}
    >
      {/* Left: Metadata */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!isSelectedInProjectRepository && statusText !== "Rejected") onToggleBulkSelect(candidateId);
          }}
          className={cn(
            "mt-1 shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
            (isSelectedInProjectRepository || statusText === "Rejected")
              ? "bg-slate-50 border-slate-200 cursor-not-allowed opacity-50"
              : isBulkSelected
                ? "bg-blue-600 border-blue-600"
                : "border-slate-300 hover:border-blue-400 bg-white",
          )}
        >
          {isBulkSelected && <Check className="w-3.5 h-3.5 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-blue-700 leading-snug line-clamp-2 mb-1 group-hover:text-blue-800 transition-colors">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 mb-2">
            <span className="font-medium">{authors || "Unknown Authors"}</span>
            {publicationYear && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{publicationYear}</span>
              </>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {isSelectedInProjectRepository && (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                  Duplicate
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Already in repository
                </span>
              </>
            )}
            {!isSelectedInProjectRepository && statusText === "Suggested" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                Suggested
              </span>
            )}
            {!isSelectedInProjectRepository && statusText === "Matched" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                Matched
              </span>
            )}
            {!isSelectedInProjectRepository && statusText === "Rejected" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                Rejected
              </span>
            )}
          </div>

          {/* Validation Note */}
          {validationNote && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs",
                isLowQuality ? "text-amber-600 italic font-medium" : "text-slate-500",
              )}
            >
              {isLowQuality && <AlertCircle className="w-3.5 h-3.5" />}
              <span>{validationNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Scores & Actions */}
      <div className="mt-4 md:mt-0 md:ml-6 flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
        <div className="flex flex-col gap-3 w-full sm:w-44">
          {/* Data Quality Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Data Quality</span>
              <span className="text-slate-900">{Math.round(extractionQualityScore * 100)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  getQualityColor(extractionQualityScore),
                )}
                style={{ width: `${extractionQualityScore * 100}%` }}
              />
            </div>
          </div>

          {/* Identity Match Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Identity Match</span>
              <span className="text-slate-900">
                {matchConfidenceScore === 0
                  ? "New Entry"
                  : `${Math.round(matchConfidenceScore * 100)}%`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  getMatchColor(matchConfidenceScore),
                )}
                style={{
                  width: matchConfidenceScore === 0 ? "100%" : `${matchConfidenceScore * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="shrink-0 flex items-center justify-end">
          {isSelectedInProjectRepository ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200">
              <BookmarkCheck className="w-3.5 h-3.5" />
              In Dataset
            </div>
          ) : statusText === "Rejected" ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-rose-100">
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </div>
          ) : (
            <div className="relative group/actions p-1">
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Action Dropdown on Hover/Press */}
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover/actions:opacity-100 group-hover/actions:visible group-focus-within/actions:opacity-100 group-focus-within/actions:visible transition-all duration-300 z-50 overflow-hidden pointer-events-none group-hover/actions:pointer-events-auto">
                <div className="p-2 space-y-1 bg-white">
                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                      Decision
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(candidateId, "select");
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-blue-50 text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">
                      Add to repository
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(candidateId, "reject");
                    }}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-rose-50 text-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Reject</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateRow;
