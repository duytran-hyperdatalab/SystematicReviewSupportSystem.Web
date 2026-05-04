import React from "react";
import {
  X,
  ExternalLink,
  FileText,
  Quote,
  Loader2,
  AlertCircle,
  BookmarkCheck,
  ShieldCheck,
  ShieldAlert,
  Plus,
  XCircle,
} from "lucide-react";
import type { CandidatePaperDto } from "../../../types/paper";
import { cn } from "../../../utils/cn";

interface CandidateDetailPanelProps {
  candidate: CandidatePaperDto | null;
  onClose: () => void;
  onAction: (id: string, action: "select" | "reject") => Promise<void>;
  isProcessing: boolean;
  isModal?: boolean;
}

const CandidateDetailPanel: React.FC<CandidateDetailPanelProps> = ({
  candidate,
  onClose,
  onAction,
  isProcessing,
  isModal = false,
}) => {
  if (!candidate) return null;

  const {
    candidateId,
    title,
    authors,
    publicationYear,
    statusText,
    doi,
    rawReference,
    originPaperTitle,
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
      className={cn(
        "flex flex-col bg-white overflow-hidden",
        !isModal &&
          "h-full border-l border-slate-200 shadow-2xl animate-in slide-in-from-right duration-300 w-full lg:w-[450px]",
      )}
    >
      {!isModal && (
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">
              Candidate Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className={cn("flex-1 overflow-y-auto", isModal && "max-h-[70vh]")}>
        <div className="p-8 space-y-8">
          {/* Main Title Section */}
          <section>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              Paper Title
            </label>
            <h2 className="text-lg font-bold text-blue-700 mt-2 leading-tight">{title}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {isSelectedInProjectRepository && (
                <>
                  <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                    Duplicate
                  </span>
                  <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                    Already in repository
                  </span>
                </>
              )}
              {!isSelectedInProjectRepository && statusText === "Matched" && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                  Matched
                </span>
              )}
              {doi && (
                <a
                  href={`https://doi.org/${doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all"
                >
                  DOI: {doi}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {validationNote && (
              <div
                className={cn(
                  "mt-4 p-3 rounded-lg flex items-start gap-2 text-xs",
                  isLowQuality
                    ? "bg-amber-50 text-amber-700 italic border border-amber-100"
                    : "bg-slate-50 text-slate-600 border border-slate-100",
                )}
              >
                {isLowQuality && <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                <span>{validationNote}</span>
              </div>
            )}
          </section>

          {/* Authors & Year */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Authors
              </label>
              <p className="text-sm mt-2 text-slate-900 font-bold leading-relaxed line-clamp-3">
                {authors || "Unknown Authors"}
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Year
              </label>
              <p className="text-xl mt-1 text-slate-900 font-black">{publicationYear || "N/A"}</p>
            </div>
          </section>

          {/* Double Progress Bars */}
          <section className="space-y-6">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5">
              {/* Extraction Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className={cn(
                        "w-4 h-4",
                        extractionQualityScore > 0.7 ? "text-emerald-500" : "text-amber-500",
                      )}
                    />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Data Quality
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {Math.round(extractionQualityScore * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      getQualityColor(extractionQualityScore),
                    )}
                    style={{ width: `${extractionQualityScore * 100}%` }}
                  />
                </div>
              </div>

              {/* Identity Match */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert
                      className={cn(
                        "w-4 h-4",
                        matchConfidenceScore > 0.6 ? "text-purple-500" : "text-blue-500",
                      )}
                    />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Identity Match
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {matchConfidenceScore === 0
                      ? "New Entry"
                      : `${Math.round(matchConfidenceScore * 100)}%`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      getMatchColor(matchConfidenceScore),
                    )}
                    style={{
                      width: matchConfidenceScore === 0 ? "100%" : `${matchConfidenceScore * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Origin Paper Context */}
          <section>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              Extracted From (Origin)
            </label>
            <div className="mt-4 p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">{originPaperTitle}</h4>
              <div className="mt-3 inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-blue-100 text-[10px] font-bold text-blue-600 uppercase">
                <FileText className="w-3 h-3" />
                Origin Paper
              </div>
            </div>
          </section>

          {/* Raw Reference */}
          <section>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Raw Extracted Text
              </label>
              <Quote className="w-4 h-4 text-slate-200" />
            </div>
            <div className="mt-4 p-5 bg-amber-50/30 border border-amber-100 rounded-2xl text-[13px] text-amber-900 italic leading-relaxed font-serif shadow-inner">
              {rawReference || "No raw reference text available."}
            </div>
          </section>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {isSelectedInProjectRepository ? (
          <button
            disabled
            className="w-full px-6 py-4 bg-slate-100 text-slate-400 font-bold text-sm uppercase tracking-widest rounded-2xl border border-slate-200 flex justify-center items-center gap-2 cursor-not-allowed"
          >
            <BookmarkCheck className="w-4 h-4" />
            Already in repository
          </button>
        ) : statusText === "Rejected" ? (
          <button
            disabled
            className="w-full px-6 py-4 bg-slate-100 text-slate-400 font-bold text-sm uppercase tracking-widest rounded-2xl border border-slate-200 flex justify-center items-center gap-2 cursor-not-allowed"
          >
            <XCircle className="w-4 h-4" />
            Rejected Candidate
          </button>
        ) : (
          <>
            <button
              onClick={() => onAction(candidateId, "select")}
              disabled={isProcessing}
              className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:shadow-none"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              {!isProcessing && <Plus className="w-4 h-4" />}
              Add to repository
            </button>
            <button
              onClick={() => onAction(candidateId, "reject")}
              disabled={isProcessing}
              className="w-full px-6 py-3.5 bg-white border-2 border-slate-200 text-rose-600 font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-rose-50 hover:border-rose-200 transition flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              Reject Candidate
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateDetailPanel;
