import React from "react";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import { STATUS_CONFIG } from "../../../../../pages/reviewProcess/studySelection/fullTextScreening/constants";
import { cn } from "../../../../../utils/cn";

interface StatusBadgeProps {
  paper: ScreeningPaper;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ paper }) => {
  const cfg = STATUS_CONFIG[paper.screeningStatus];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
        cfg.bg,
        cfg.text,
        cfg.border || "border-transparent",
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </div>
  );
};
