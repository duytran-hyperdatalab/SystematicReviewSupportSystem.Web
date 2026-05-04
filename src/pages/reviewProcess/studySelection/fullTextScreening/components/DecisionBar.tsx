import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiCheck, FiX, FiAlertTriangle } from "react-icons/fi";
import { type RootState } from "../../../../../redux/store";
import { cn } from "../../../../../utils/cn";
import { useStudySelectionExclusionReasons } from "../../../../../hooks/useStudySelection";
import ExcludeMenu from "../../components/ExcludeMenu";
import type { FullTextPaper } from "../types";

interface DecisionBarProps {
  paper: FullTextPaper;
  onInclude: (paperId: string) => void;
  onExclude: (
    paperId: string,
    exclusionReasonId: string | null,
    reason: string | null,
  ) => void;
  isSubmitting: boolean;
  canReview: boolean;
}

export default function DecisionBar({
  paper,
  onInclude,
  onExclude,
  isSubmitting,
  canReview,
}: DecisionBarProps) {
  const { screeningProcessId } = useParams<{ screeningProcessId: string }>();
  const decisionLabel =
    paper.finalDecisionText ?? (paper.screeningStatus === "included" ? "Included" : "Excluded");

  const [reasonPageSize, setReasonPageSize] = useState(5);
  const { data: exclusionReasons = [] } = useStudySelectionExclusionReasons(
    screeningProcessId,
    { onlyActive: true, pageSize: reasonPageSize }
  );

  const hasMoreReasons = exclusionReasons.length >= reasonPageSize;

  const currentUser = useSelector((state: RootState) => state.auth.user);
  const myDecision = currentUser
    ? paper.decisions.find((d) => d.reviewerId === currentUser.id)
    : null;

  if (!canReview) {
    if (
      myDecision &&
      (paper.screeningStatus === "pending" || paper.screeningStatus === "conflicted")
    ) {
      const isInclude = String(myDecision.decision).toLowerCase() === "included";
      return (
        <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
          <div
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
              isInclude ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700",
            )}
          >
            {isInclude ? (
              <>
                <FiCheck className="w-4 h-4" /> You Included
              </>
            ) : (
              <>
                <FiX className="w-4 h-4" /> You Excluded
              </>
            )}
            <span className="text-[10px] opacity-60 ml-1">
              {paper.screeningStatus === "conflicted" ? "(Conflicted)" : "(Pending others)"}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
        <div
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
            paper.screeningStatus === "included"
              ? "bg-green-50 text-green-700"
              : paper.screeningStatus === "excluded"
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700",
          )}
        >
          {paper.screeningStatus === "included" ? (
            <>
              <FiCheck className="w-4 h-4" /> {decisionLabel}
            </>
          ) : paper.screeningStatus === "excluded" ? (
            <>
              <FiX className="w-4 h-4" /> {decisionLabel}
            </>
          ) : (
            <>
              <FiAlertTriangle className="w-4 h-4" /> Conflict — Needs Resolution
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
      <div className="flex items-center gap-2">
        {/* Include */}
        <button
          onClick={() => onInclude(paper.id)}
          disabled={isSubmitting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiCheck className="w-4 h-4" />
          Include
          <kbd className="ml-1 px-1 py-0.5 bg-green-500/50 rounded text-[9px] font-mono">1</kbd>
        </button>

        {/* Exclude */}
        <ExcludeMenu
          paperId={paper.id}
          onExclude={onExclude}
          isSubmitting={isSubmitting}
          exclusionReasons={exclusionReasons}
          hasMoreReasons={hasMoreReasons}
          onShowMoreReasons={() => setReasonPageSize((prev) => prev + 5)}
          onResetReasons={() => setReasonPageSize(5)}
        />
      </div>
    </div>
  );
}
