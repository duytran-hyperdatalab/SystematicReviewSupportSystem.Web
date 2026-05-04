import type { ReviewProcess } from "../../types/reviewProcess";
import Button from "../ui/Button";
// ... (icons)
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPlay,
  FiCheck,
  FiX,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
} from "react-icons/fi";

interface ReviewProcessCardProps {
  process: ReviewProcess;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onEdit?: (process: ReviewProcess) => void;
  onDelete?: (id: string) => void;
  onOpen?: (id: string) => void;
  isLoading?: boolean;
}

const getStatusConfig = (statusText: string) => {
  switch (statusText) {
    case "Pending":
      return {
        color: "text-gray-600 bg-gray-100",
        icon: FiClock,
        label: "Pending",
      };
    case "InProgress":
      return {
        color: "text-blue-600 bg-blue-100",
        icon: FiAlertCircle,
        label: "In Progress",
      };
    case "Completed":
      return {
        color: "text-green-600 bg-green-100",
        icon: FiCheckCircle,
        label: "Completed",
      };
    case "Cancelled":
      return {
        color: "text-red-600 bg-red-100",
        icon: FiXCircle,
        label: "Cancelled",
      };
    default:
      return {
        color: "text-gray-600 bg-gray-100",
        icon: FiClock,
        label: statusText,
      };
  }
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ReviewProcessCard({
  process,
  onStart,
  onComplete,
  onCancel,
  onEdit,
  onDelete,
  onOpen,
  isLoading = false,
}: ReviewProcessCardProps) {
  const statusConfig = getStatusConfig(process.statusText);
  const StatusIcon = statusConfig.icon;

  // Unified field access using the combined ReviewProcess interface
  const id = (process.id || process.processId) as string;
  const name = process.name || process.processName || "Unnamed Process";
  const startedAt = process.startedAt;
  const currentPhaseText =
    process.currentPhaseText ||
    (process.statusText === "InProgress" ? "In Progress" : "Not Started");
  const createdAt = process.createdAt;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
              onClick={() => onOpen?.(id)}
            >
              {name}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-3">Phase: {currentPhaseText}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        {createdAt && (
          <div>
            <span className="text-gray-500">Created:</span>
            <p className="text-gray-900 font-medium">{formatDate(createdAt)}</p>
          </div>
        )}
        {startedAt && (
          <div>
            <span className="text-gray-500">Started:</span>
            <p className="text-gray-900 font-medium">{formatDate(startedAt)}</p>
          </div>
        )}
        {process.completedAt && (
          <div>
            <span className="text-gray-500">Completed:</span>
            <p className="text-gray-900 font-medium">{formatDate(process.completedAt)}</p>
          </div>
        )}
      </div>

      {/* Progress & Stats */}
      {(process.progressPercent !== undefined || process.totalPapersImported !== undefined) && (
        <div className="mb-4 space-y-3">
          {process.progressPercent !== undefined && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-500">Progress</span>
                <span className="text-xs font-bold text-blue-600">{process.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${process.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex-1 text-center border-r border-gray-200">
              <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
                Total
              </span>
              <span className="text-sm font-bold text-gray-900">
                {process.totalPapersImported ?? 0}
              </span>
            </div>
            <div className="flex-1 text-center border-r border-gray-200">
              <span className="block text-[10px] uppercase tracking-wider text-green-600 font-bold mb-0.5">
                Included
              </span>
              <span className="text-sm font-bold text-green-600">
                {process.totalIncludedPapers ?? 0}
              </span>
            </div>
            <div className="flex-1 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-red-600 font-bold mb-0.5">
                Excluded
              </span>
              <span className="text-sm font-bold text-red-600">
                {process.totalExcludedPapers ?? 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
        {onOpen && (
          <Button
            size="sm"
            onClick={() => onOpen(id)}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <FiExternalLink className="w-4 h-4" />
            Open Workspace
          </Button>
        )}

        {process.statusText === "NotStarted" && onStart && (
          <Button
            size="sm"
            onClick={() => onStart(id)}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <FiPlay className="w-4 h-4" />
            Start Process
          </Button>
        )}

        {process.statusText === "InProgress" && onComplete && (
          <Button
            size="sm"
            onClick={() => onComplete(id)}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <FiCheck className="w-4 h-4" />
            Complete
          </Button>
        )}

        {(process.statusText === "NotStarted" || process.statusText === "InProgress") &&
          onCancel && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCancel(id)}
              disabled={isLoading}
              className="flex items-center gap-1.5"
            >
              <FiX className="w-4 h-4" />
              Cancel
            </Button>
          )}

        {(process.statusText === "NotStarted" || process.statusText === "InProgress") && onEdit && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(process)}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Notes
          </Button>
        )}

        {process.statusText !== "InProgress" && onDelete && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onDelete(id)}
            disabled={isLoading}
            className="flex items-center gap-1.5 ml-auto text-red-600 hover:bg-red-50"
          >
            <FiTrash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
