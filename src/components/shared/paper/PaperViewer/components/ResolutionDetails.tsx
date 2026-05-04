import React from "react";
import { FiGitBranch } from "react-icons/fi";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import { cn } from "../../../../../utils/cn";


interface ResolutionDetailsProps {
  resolution: ScreeningPaper["resolution"];
}

export const ResolutionDetails: React.FC<ResolutionDetailsProps> = ({ resolution }) => {
  if (!resolution) return null;
  const isIncluded = resolution.finalDecision === "included";
  return (
    <div
      className={cn(
        "rounded-3xl border p-6 space-y-4",
        isIncluded ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100",
      )}
    >
      <div className="flex items-center gap-2">
        <FiGitBranch className={cn("w-4 h-4", isIncluded ? "text-emerald-600" : "text-rose-600")} />
        <h3
          className={cn(
            "text-xs font-black uppercase tracking-widest",
            isIncluded ? "text-emerald-800" : "text-rose-800",
          )}
        >
          Final Resolution
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 text-[11px] font-bold uppercase tracking-widest">
        <div className="space-y-1">
          <span className="text-slate-400">Decision</span>
          <p className={isIncluded ? "text-emerald-600" : "text-rose-600"}>
            {resolution.finalDecision}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-400">Resolved By</span>
          <p className="text-slate-700">{resolution.resolverName}</p>
        </div>
      </div>
      {resolution.resolutionNotes && (
        <div className="pt-3 border-t border-black/5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Notes
          </span>
          <p className="text-xs text-slate-700 mt-1 font-medium italic">
            "{resolution.resolutionNotes}"
          </p>
        </div>
      )}
    </div>
  );
};
