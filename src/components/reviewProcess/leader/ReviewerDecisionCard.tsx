import React from "react";

interface ReviewerDecision {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: "Include" | "Exclude";
  exclusionReason?: string;
}

interface ReviewerDecisionCardProps {
  decision: ReviewerDecision;
  onViewSubmission?: (reviewerId: string) => void;
}

const ReviewerDecisionCard: React.FC<ReviewerDecisionCardProps> = ({ 
  decision,
  onViewSubmission 
}) => {
  return (
    <div
      className={`bg-white p-5 rounded-3xl border transition-all ${decision.decision === "Include" ? "border-emerald-100" : "border-rose-100"
        }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${decision.decision === "Include"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
              }`}
          >
            {decision.reviewerName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-gray-900 uppercase tracking-tight">
                {decision.reviewerName}
              </p>
              {onViewSubmission && (
                <button
                  onClick={() => onViewSubmission(decision.reviewerId)}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  [ View submission ]
                </button>
              )}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Reviewer
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${decision.decision === "Include"
              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
              : "bg-rose-50 text-rose-600 border-rose-100"
            }`}
        >
          {decision.decision}
        </span>
      </div>

      {decision.exclusionReason && (
        <div className="mb-4 bg-rose-50/30 p-3 rounded-xl border border-rose-100/50">
          <span className="text-[10px] font-black text-rose-400 uppercase tracking-tight block mb-1">
            Exclusion Reason
          </span>
          <p className="text-xs font-bold text-rose-700 uppercase tracking-tight">
            {decision.exclusionReason}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewerDecisionCard;
