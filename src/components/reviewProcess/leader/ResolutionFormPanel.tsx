import React, { useState } from "react";
import { CheckCircle2, XCircle, StickyNote, ChevronUp, ChevronDown, Gavel } from "lucide-react";
import Button from "../../ui/Button";
import Select from "../../ui/Select";
import { useStudySelectionExclusionReasons } from "../../../hooks/useStudySelection";

interface ResolutionFormPanelProps {
  resolution: "Include" | "Exclude" | null;
  setResolution: (res: "Include" | "Exclude" | null) => void;
  exclusionReason: string;
  setExclusionReason: (reason: string) => void;
  resolutionNotes: string;
  setResolutionNotes: (notes: string) => void;
  onResolve: () => void;
  isFinishReview: boolean;
  onAssignThirdReviewer: () => void;
  processId: string | undefined;
}

const ResolutionFormPanel: React.FC<ResolutionFormPanelProps> = ({
  resolution,
  setResolution,
  exclusionReason,
  setExclusionReason,
  resolutionNotes,
  setResolutionNotes,
  onResolve,
  isFinishReview,
  onAssignThirdReviewer,
  processId,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [reasonPageSize, setReasonPageSize] = useState(5);

  const { data: exclusionReasons = [] } = useStudySelectionExclusionReasons(
    processId,
    { onlyActive: true, pageSize: reasonPageSize }
  );

  const hasMoreReasons = exclusionReasons.length >= reasonPageSize;

  return (
    <div
      className={`absolute bottom-0 right-0 w-full bg-white border-t border-gray-100 shadow-[0_-20px_50px_-20px_rgba(30,58,138,0.15)] z-20 transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${isExpanded ? "translate-y-0" : "translate-y-[calc(100%-64px)]"
        }`}
    >
      {/* Dynamic Handle/Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-16 flex items-center justify-between px-6 cursor-pointer hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all duration-500 ${isExpanded ? "bg-blue-600 text-white rotate-0" : "bg-blue-50 text-blue-600 -rotate-12"}`}>
            <Gavel className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-900">
              Final Resolution
            </h4>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {resolution ? `Ready to resolve as ${resolution}` : "Pending leader decision"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {resolution && !isExpanded && (
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-in fade-in zoom-in duration-300 ${resolution === 'Include' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
              {resolution}
            </div>
          )}
          <div className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600 transition-all">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>
      </div>

      <div className={`px-6 pb-8 space-y-5 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="flex gap-3">
          <button
            onClick={() => isFinishReview && setResolution("Include")}
            disabled={!isFinishReview}
            className={`flex-1 flex flex-col items-center py-4 rounded-2xl border-2 transition-all duration-300 ${resolution === "Include"
              ? "bg-emerald-50 border-emerald-500 scale-[1.02] shadow-lg shadow-emerald-100"
              : "bg-white border-slate-100 hover:border-slate-200"
              } ${!isFinishReview ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <CheckCircle2
              className={`w-5 h-5 mb-1.5 transition-transform duration-500 ${resolution === "Include" ? "text-emerald-500 scale-110" : "text-slate-300"
                }`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-[0.1em] ${resolution === "Include" ? "text-emerald-700" : "text-slate-500"
                }`}
            >
              Include
            </span>
          </button>
          <button
            onClick={() => isFinishReview && setResolution("Exclude")}
            disabled={!isFinishReview}
            className={`flex-1 flex flex-col items-center py-4 rounded-2xl border-2 transition-all duration-300 ${resolution === "Exclude"
              ? "bg-rose-50 border-rose-500 scale-[1.02] shadow-lg shadow-rose-100"
              : "bg-white border-slate-100 hover:border-slate-200"
              } ${!isFinishReview ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            <XCircle
              className={`w-5 h-5 mb-1.5 transition-transform duration-500 ${resolution === "Exclude" ? "text-rose-500 scale-110" : "text-slate-300"
                }`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-[0.1em] ${resolution === "Exclude" ? "text-rose-700" : "text-slate-500"
                }`}
            >
              Exclude
            </span>
          </button>
        </div>

        {resolution === "Exclude" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-1">
                Exclusion Reason
              </label>
              <div className="relative group">
                <Select
                  value={exclusionReason}
                  onChange={(e) => setExclusionReason(e.target.value)}
                  options={exclusionReasons.map((r) => ({
                    value: r.id,
                    label: r.name,
                  }))}
                  placeholder="Select a reason..."
                  className="!py-3.5 !text-xs !font-bold !bg-slate-50 border-none !rounded-xl transition-all hover:!bg-slate-100 focus:!ring-4 focus:!ring-blue-500/5"
                />

                {/* Show More / Reset Reasons Button */}
                {(hasMoreReasons || exclusionReasons.length > 5) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasMoreReasons) {
                        setReasonPageSize((prev) => prev + 5);
                      } else {
                        setReasonPageSize(5);
                      }
                    }}
                    className="mt-2 text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 px-1 py-0.5"
                  >
                    {hasMoreReasons ? (
                      <><span>Show more reasons</span> <ChevronDown className="w-3 h-3" /></>
                    ) : (
                      <><span>Reset list</span> <ChevronUp className="w-3 h-3" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative group">
          <StickyNote className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <textarea
            placeholder="Resolution notes (optional)..."
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            className="w-full bg-slate-50 border-transparent border-2 rounded-2xl text-[11px] font-medium pl-12 pr-4 py-4 min-h-[90px] focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-100 transition-all outline-none resize-none"
          />
        </div>

        <div className="space-y-3 pt-2">
          {!isFinishReview && (
            <div className="flex items-center gap-2 px-4 py-3 bg-amber-50/50 rounded-2xl border border-amber-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider leading-none">
                Decision locked until all reviewers finish their task assignment
              </p>
            </div>
          )}
          <Button
            onClick={onResolve}
            disabled={!resolution || (resolution === "Exclude" && !exclusionReason) || !isFinishReview}
            className="w-full py-4 bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.25em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
          >
            {isFinishReview ? "Resolve Conflict" : "Review in Progress"}
          </Button>

          <button
            onClick={onAssignThirdReviewer}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group flex items-center justify-center gap-2"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
              Assign more Reviewers
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolutionFormPanel;
