import { FiPlay, FiCheckCircle, FiExternalLink, FiEye, FiRotateCcw } from "react-icons/fi";
import type { PhaseStatusType } from "./types";

interface PhaseActionsProps {
  status: PhaseStatusType;
  phaseKey: string;
  onStart?: () => void;
  onComplete?: () => void;
  onOpen?: () => void;
  onReopen?: () => void;
  canManageActions?: boolean;
  startLoading?: boolean;
  completeLoading?: boolean;
  reopenLoading?: boolean;
  disabled?: boolean;
}

export default function PhaseActions({
  status,
  phaseKey,
  onStart,
  onComplete,
  onOpen,
  onReopen,
  canManageActions = true,
  startLoading = false,
  completeLoading = false,
  reopenLoading = false,
  disabled = false,
}: PhaseActionsProps) {
  if (status === "Locked") return null;

  const showReopen =
    canManageActions && status === "Completed" && phaseKey !== "synthesis" && onReopen;

  return (
    <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
      {canManageActions && status === "NotStarted" && onStart && (
        <button
          onClick={onStart}
          disabled={startLoading || disabled}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiPlay className="w-3.5 h-3.5" />
          {startLoading ? "Starting..." : "Start Phase"}
        </button>
      )}

      {status === "InProgress" && (
        <>
          {onOpen && (
            <button
              onClick={onOpen}
              disabled={disabled}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiExternalLink className="w-3.5 h-3.5" />
              Open Workspace
            </button>
          )}
          {canManageActions && onComplete && (
            <button
              onClick={onComplete}
              disabled={completeLoading || disabled}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiCheckCircle className="w-3.5 h-3.5" />
              {completeLoading ? "Completing..." : "Complete Phase"}
            </button>
          )}
        </>
      )}

      {status === "Completed" && (
        <>
          {onOpen && (
            <button
              onClick={onOpen}
              disabled={disabled}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiEye className="w-3.5 h-3.5" />
              View Results
            </button>
          )}

          {showReopen && (
            <button
              onClick={onReopen}
              disabled={reopenLoading || disabled}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiRotateCcw className="w-3.5 h-3.5" />
              {reopenLoading ? "Reopening..." : "Reopen Phase"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
