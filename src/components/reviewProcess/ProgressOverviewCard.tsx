// Progress Overview Card Component

import type { ProgressStats } from "../../types/reviewProcessWorkspace";

interface ProgressOverviewCardProps {
  progressStats: ProgressStats;
}

export default function ProgressOverviewCard({ progressStats }: ProgressOverviewCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Overall Progress</h3>
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Completion</span>
          <span className="font-semibold text-gray-900">{progressStats.completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressStats.completionPercentage}%` }}
          />
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Records Processed</span>
          <span className="font-medium">
            {progressStats.recordsProcessed} / {progressStats.totalRecords}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Completion</span>
          <span className="font-medium">{progressStats.estimatedCompletion}</span>
        </div>
      </div>
    </div>
  );
}
