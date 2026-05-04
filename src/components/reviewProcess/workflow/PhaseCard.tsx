import type { IconType } from "react-icons";
import { FiLock } from "react-icons/fi";
import PhaseStatusBadge from "./PhaseStatusBadge";
import PhaseStatistics from "./PhaseStatistics";
import PhaseActions from "./PhaseActions";
import type { WorkflowPhase } from "./types";

interface PhaseCardProps {
  phase: WorkflowPhase;
  icon: IconType;
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

const CARD_STYLES: Record<string, string> = {
  Completed: "border-green-200 bg-green-50/40",
  InProgress: "border-blue-300 bg-blue-50/30 shadow-md ring-1 ring-blue-100",
  NotStarted: "border-gray-200 bg-white",
  Locked: "border-gray-200 bg-gray-50/80 opacity-70",
};

const ICON_BG: Record<string, string> = {
  Completed: "bg-green-100 text-green-600",
  InProgress: "bg-blue-100 text-blue-600",
  NotStarted: "bg-gray-100 text-gray-500",
  Locked: "bg-gray-100 text-gray-400",
};

export default function PhaseCard({
  phase,
  icon: Icon,
  onStart,
  onComplete,
  onOpen,
  onReopen,
  canManageActions = true,
  startLoading,
  completeLoading,
  reopenLoading,
  disabled = false,
}: PhaseCardProps) {
  return (
    <div
      className={`relative border-2 rounded-xl p-5 transition-all duration-200 min-w-[200px] max-w-60 w-full print:break-inside-avoid ${CARD_STYLES[phase.status]}`}
    >
      {/* Header: Icon + Name + Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${ICON_BG[phase.status]}`}
          >
            {phase.status === "Locked" ? (
              <FiLock className="w-4 h-4" />
            ) : (
              <Icon className="w-4.5 h-4.5" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">{phase.name}</h3>
        </div>
      </div>

      {/* Status Badge */}
      <PhaseStatusBadge status={phase.status} />

      {/* Lock Reason */}
      {phase.status === "Locked" && phase.lockReason && (
        <p className="mt-2 text-xs text-gray-400 italic">{phase.lockReason}</p>
      )}

      {/* Statistics */}
      <PhaseStatistics stats={phase.stats} status={phase.status} />

      {/* Actions */}
      <PhaseActions
        status={phase.status}
        phaseKey={phase.key}
        onStart={onStart}
        onComplete={onComplete}
        onOpen={onOpen}
        onReopen={onReopen}
        canManageActions={canManageActions}
        startLoading={startLoading}
        completeLoading={completeLoading}
        reopenLoading={reopenLoading}
        disabled={disabled}
      />
    </div>
  );
}
