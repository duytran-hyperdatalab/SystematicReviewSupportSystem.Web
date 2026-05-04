import React from "react";
import { AlertCircle, User } from "lucide-react";
import ReviewerDecisionCard from "./ReviewerDecisionCard";

interface ReviewerDecision {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: "Include" | "Exclude";
  exclusionReason?: string;
}

interface ReviewerDecisionsSectionProps {
  decisions: ReviewerDecision[];
  includeCount: number;
  excludeCount: number;
  onViewSubmission?: (reviewerId: string) => void;
}

const ReviewerDecisionsSection: React.FC<ReviewerDecisionsSectionProps> = ({
  decisions,
  includeCount,
  excludeCount,
  onViewSubmission,
}) => {
  return (
    <section className="w-full h-full flex flex-col bg-gray-50/50 relative">
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
        {/* Conflict Summary Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            Conflict Summary
          </h3>

          <div className="flex gap-4">
            <div className="flex-1 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-emerald-600">
                {includeCount}
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Include
              </span>
            </div>
            <div className="flex-1 bg-rose-50/50 border border-rose-100 rounded-2xl p-4 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-rose-600">
                {excludeCount}
              </span>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
                Exclude
              </span>
            </div>
          </div>
        </div>

        {/* Reviewer Decisions List */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2 px-2">
            <User className="w-4 h-4" />
            Reviewer Decisions
          </h3>

          {decisions.map((decision) => (
            <ReviewerDecisionCard 
              key={decision.id} 
              decision={decision} 
              onViewSubmission={onViewSubmission}
            />
          ))}
        </div>

        {/* Resolution Form (Scrollable area padding for sticky bottom) */}
        <div className="h-40" />
      </div>
    </section>
  );
};

export default ReviewerDecisionsSection;
