import React from "react";
import { FiAlertTriangle, FiClock } from "react-icons/fi";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import { cn } from "../../../../../utils/cn";

interface ConflictDetailsProps {
  paper: ScreeningPaper;
}

export const ConflictDetails: React.FC<ConflictDetailsProps> = ({ paper }) => {
  return (
    <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <FiAlertTriangle className="w-4 h-4 text-amber-600" />
        <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest">
          Conflict Detected
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paper.decisions.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-tight truncate max-w-[120px]">
                {d.reviewerName}
              </span>
              <span
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                  d.decision === "included"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100",
                )}
              >
                {d.decision}
              </span>
            </div>
            {d.reason && (
              <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed line-clamp-2">
                "{d.reason}"
              </p>
            )}
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
              <FiClock className="w-2.5 h-2.5" /> {new Date(d.decidedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
