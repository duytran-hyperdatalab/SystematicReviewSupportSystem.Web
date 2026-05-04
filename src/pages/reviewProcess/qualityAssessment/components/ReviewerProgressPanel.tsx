import type { QAReviewerProgressResponse } from "../../../../types/qualityAssessment";
import Card from "../../../../components/ui/Card";
import { CheckCircle2, Clock } from "lucide-react";

interface ReviewerProgressPanelProps {
  reviewerProgresses: QAReviewerProgressResponse[];
}

export function ReviewerProgressPanel({ reviewerProgresses: memberProgresses }: ReviewerProgressPanelProps) {
  if (!memberProgresses || memberProgresses.length === 0) return null;

  return (
    <Card className="rounded-2xl border border-slate-200 outline-none shadow-sm overflow-hidden bg-white">
      <div className="p-6 border-b border-slate-200 bg-white rounded-t-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Reviewer Progress</h2>
        <p className="text-sm text-slate-500 mt-1">Track individual completion rates</p>
      </div>
      <div className="p-6 space-y-6">
        {memberProgresses.map((progress) => (
          <div key={progress.reviewerId} className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-900 truncate mr-2" title={progress.reviewerName || "Unknown Reviewer"}>
                {progress.reviewerName || "Unknown Reviewer"}
              </span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md whitespace-nowrap border border-blue-100">
                {progress.completionPercentage.toFixed(0)}%
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.completionPercentage}%` }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="font-medium">{progress.completedPapers} done</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-blue-50 text-blue-700 rounded-lg">
                <Clock size={14} className="text-blue-500" />
                <span className="font-medium">{progress.inProgressPapers + progress.notStartedPapers} max</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
