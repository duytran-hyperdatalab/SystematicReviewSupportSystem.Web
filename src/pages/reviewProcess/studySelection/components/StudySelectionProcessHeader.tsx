import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiArrowLeft } from "react-icons/fi";
import { cn } from "../../../../utils/cn";

interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
}

interface StatusConfig {
  pending: StatusStyle;
  included: StatusStyle;
  excluded: StatusStyle;
  conflicted: StatusStyle;
}

interface StudySelectionProcessHeaderProps {
  processName: string;
  phaseLabel: string;
  stats: {
    total: number;
    included: number;
    excluded: number;
    pending: number;
    conflicted: number;
    completionPercentage: number;
  };
  statusConfig: StatusConfig;
  onBack: () => void;
  phaseIcon: IconType;
  phaseIconBgClass: string;
  phaseIconTextClass: string;
  progressBarClass: string;
  rightControls?: ReactNode;
}

function StatBadge({
  label,
  value,
  config,
}: {
  label: string;
  value: number;
  config: StatusStyle;
}) {
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full", config.bg)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      <span className={cn("font-medium text-xs", config.text)}>{value}</span>
      <span className={cn("text-[10px] opacity-70", config.text)}>{label}</span>
    </div>
  );
}

export default function StudySelectionProcessHeader({
  processName,
  phaseLabel,
  stats,
  statusConfig,
  onBack,
  phaseIcon: PhaseIcon,
  phaseIconBgClass,
  phaseIconTextClass,
  progressBarClass,
  rightControls,
}: StudySelectionProcessHeaderProps) {
  const completedPercent = Math.round(stats.completionPercentage);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-full mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Back to Review Process"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  phaseIconBgClass,
                )}
              >
                <PhaseIcon className={cn("w-4 h-4", phaseIconTextClass)} />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">Study Selection Process</h1>
                <p className="text-[10px] text-gray-500">{processName || phaseLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-sm">
              <StatBadge label="Total" value={stats.total} config={statusConfig.pending} />
              <StatBadge label="Included" value={stats.included} config={statusConfig.included} />
              <StatBadge label="Excluded" value={stats.excluded} config={statusConfig.excluded} />
              <StatBadge label="Pending" value={stats.pending} config={statusConfig.pending} />
              {stats.conflicted > 0 && (
                <StatBadge
                  label="Conflict"
                  value={stats.conflicted}
                  config={statusConfig.conflicted}
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progressBarClass,
                  )}
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500">{completedPercent}%</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {rightControls}

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-200">
                1
              </kbd>
              <span>Include</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-200 ml-2">
                2
              </kbd>
              <span>Exclude</span>
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono border border-gray-200 ml-2">
                ↑↓
              </kbd>
              <span>Navigate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
