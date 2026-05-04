import React from "react";
import { useSelector } from "react-redux";
import { FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import type { RootState } from "../../../../../redux/store";
import { cn } from "../../../../../utils/cn";

interface DecisionStatusProps {
  paper: ScreeningPaper;
}

export const DecisionStatus: React.FC<DecisionStatusProps> = ({ paper }) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDecision = currentUser
    ? paper.decisions.find((d) => d.reviewerId === currentUser.id)
    : null;
  const decisionLabel =
    paper.finalDecisionText ?? (paper.screeningStatus === "included" ? "Included" : "Excluded");

  if (
    myDecision &&
    (paper.screeningStatus === "pending" || paper.screeningStatus === "conflicted")
  ) {
    const isInclude = String(myDecision.decision).toLowerCase() === "included";
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-[11px]",
          isInclude
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-rose-50 text-rose-700 border-rose-100",
        )}
      >
        {isInclude ? <FiCheck className="w-4 h-4" /> : <FiX className="w-4 h-4" />}
        You {isInclude ? "Included" : "Excluded"} this paper
        <span className="ml-auto opacity-50">
          {paper.screeningStatus === "conflicted" ? "(Conflicted)" : "(Pending Others)"}
        </span>
      </div>
    );
  }

  const isIncluded = paper.screeningStatus === "included";
  const isExcluded = paper.screeningStatus === "excluded";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-6 py-3 rounded-2xl border font-black uppercase tracking-widest text-[11px]",
        isIncluded
          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
          : isExcluded
            ? "bg-rose-50 text-rose-700 border-rose-100"
            : "bg-amber-50 text-amber-700 border-amber-100",
      )}
    >
      {isIncluded ? (
        <FiCheck className="w-4 h-4" />
      ) : isExcluded ? (
        <FiX className="w-4 h-4" />
      ) : (
        <FiAlertTriangle className="w-4 h-4" />
      )}
      {decisionLabel}
      {!isIncluded && !isExcluded && (
        <span className="ml-auto opacity-50">Resolution Required</span>
      )}
    </div>
  );
};
