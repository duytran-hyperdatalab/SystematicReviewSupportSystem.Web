import type { ReviewProcess } from "../../types/reviewProcess";
import { FiCheckCircle, FiClock, FiAlertCircle, FiXCircle } from "react-icons/fi";

interface ProcessProgressProps {
  processes: ReviewProcess[];
}

export default function ProcessProgress({ processes }: ProcessProgressProps) {
  const total = processes.length;
  const completed = processes.filter((p) => p.statusText === "Completed").length;
  const inProgress = processes.filter((p) => p.statusText === "InProgress").length;
  const pending = processes.filter((p) => p.statusText === "NotStarted").length;
  const cancelled = processes.filter((p) => p.statusText === "Cancelled").length;

  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const currentPhase = processes.find((p) => p.statusText === "InProgress");
  const nextPhase = processes.find((p) => p.statusText === "NotStarted");

  const getProcessName = (p: ReviewProcess) => {
    return (
      p.name ||
      p.processName ||
      p.currentPhaseText ||
      (p.statusText === "InProgress" ? "In Progress" : "Not Started")
    );
  };

  const getStartedAt = (p: ReviewProcess) => {
    return p.startedAt;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      {/* Current Phase Info */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Current Phase</h3>
        {currentPhase ? (
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              {getProcessName(currentPhase)}
            </span>
            {getStartedAt(currentPhase) && (
              <span className="text-sm text-gray-500">
                (Started {new Date(getStartedAt(currentPhase)!).toLocaleDateString()})
              </span>
            )}
          </div>
        ) : nextPhase ? (
          <div className="flex items-center gap-2">
            <FiClock className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-semibold text-gray-900">
              Ready to start: {getProcessName(nextPhase)}
            </span>
          </div>
        ) : completed === total && total > 0 ? (
          <div className="flex items-center gap-2">
            <FiCheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-lg font-semibold text-green-600">All processes completed!</span>
          </div>
        ) : (
          <span className="text-gray-500">No processes yet</span>
        )}
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiCheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{completed}</span>
          </div>
          <span className="text-xs text-gray-600">Completed</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiAlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{inProgress}</span>
          </div>
          <span className="text-xs text-gray-600">In Progress</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiClock className="w-4 h-4 text-gray-600" />
            <span className="text-2xl font-bold text-gray-900">{pending}</span>
          </div>
          <span className="text-xs text-gray-600">Pending</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <FiXCircle className="w-4 h-4 text-red-600" />
            <span className="text-2xl font-bold text-gray-900">{cancelled}</span>
          </div>
          <span className="text-xs text-gray-600">Cancelled</span>
        </div>
      </div>
    </div>
  );
}
