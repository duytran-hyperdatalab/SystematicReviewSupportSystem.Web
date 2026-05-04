import { FiChevronRight, FiLock, FiFileText } from "react-icons/fi";
import PhaseCard from "./PhaseCard";
import { WORKFLOW_PHASES } from "./constants";
import type { WorkflowPhase, ProcessPaperStats } from "./types";
import Button from "../../ui/Button";

interface WorkflowTimelineProps {
  phases: WorkflowPhase[];
  paperStats?: ProcessPaperStats;
  onStartPhase?: (phaseKey: string) => void;
  onCompletePhase?: (phaseKey: string) => void;
  onOpenPhase?: (phaseKey: string) => void;
  onReopenPhase?: (phaseKey: string) => void;
  onAddPapers?: () => void;
  canManageActions?: boolean;
  /** Map of phaseKey → loading state for start action */
  startLoadingMap?: Record<string, boolean>;
  /** Map of phaseKey → loading state for complete action */
  completeLoadingMap?: Record<string, boolean>;
  /** Map of phaseKey → loading state for reopen action */
  reopenLoadingMap?: Record<string, boolean>;
  disabled?: boolean;
}

const CONNECTOR_COLORS: Record<string, string> = {
  completed: "text-green-400",
  active: "text-blue-400",
  default: "text-gray-300",
};

function getConnectorColor(currentStatus: string, nextStatus: string): string {
  if (currentStatus === "Completed" && nextStatus !== "Locked") {
    return CONNECTOR_COLORS.completed;
  }
  if (currentStatus === "InProgress" || nextStatus === "InProgress") {
    return CONNECTOR_COLORS.active;
  }
  return CONNECTOR_COLORS.default;
}

export default function WorkflowTimeline({
  phases,
  paperStats,
  onStartPhase,
  onCompletePhase,
  onOpenPhase,
  onReopenPhase,
  onAddPapers,
  canManageActions = true,
  startLoadingMap = {},
  completeLoadingMap = {},
  reopenLoadingMap = {},
  disabled = false,
}: WorkflowTimelineProps) {
  // Filter out identification if it accidentally comes through
  const activePhases = phases.filter((p) => p.key !== "identification");
  const completedCount = activePhases.filter((p) => p.status === "Completed").length;
  const totalActivePhases = activePhases.length || 1;

  const hasPapers = (paperStats?.total ?? 0) > 0;

  return (
    <div
      className={`relative bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-sm transition-all duration-300 ${disabled ? "opacity-60 grayscale-[0.3]" : ""}`}
    >
      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 z-20 bg-white/10 backdrop-blur-[1px] flex items-center justify-center rounded-3xl transition-all duration-500">
          <div className="bg-white/90 shadow-xl border border-gray-100 rounded-2xl px-6 py-4 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
              <FiLock className="w-6 h-6 text-amber-500" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-gray-900 tracking-tight">Workflow Locked</h4>
              <p className="text-xs text-gray-500 max-w-[200px]">
                Start the review process to begin tracking your work across phases.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Area: Title & Overall Progress */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              Review Workflow
            </h2>
            <div className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-indigo-100 shadow-xs">
              PRISMA 2020
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Track and manage your systematic review progress across all core phases.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2.5 min-w-[320px]">
          <div className="flex justify-between w-full text-xs font-black text-gray-700 px-0.5 uppercase tracking-widest">
            <span className="opacity-50">Overall Progress</span>
            <span className="text-indigo-600">
              {Math.round((completedCount / totalActivePhases) * 100)}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
            <div
              className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)]"
              style={{
                width: `${(completedCount / totalActivePhases) * 100}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            {completedCount} of {totalActivePhases} phases completed
          </span>
        </div>
      </div>

      {/* Stats Summary - Now on Top */}
      <div className="mb-12">
        <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group transition-all hover:shadow-xl hover:shadow-slate-200/50">
          {/* Background Decorative Element */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] opacity-40 group-hover:opacity-70 transition-opacity" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-50 rounded-full blur-[80px] opacity-40 group-hover:opacity-70 transition-opacity" />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Column: Total Papers */}
              <div className="flex items-center gap-8 border-r border-slate-200 pr-12 hidden lg:flex">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                  <FiFileText className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <div className="text-5xl font-black text-slate-900 tracking-tighter mb-0.5">
                    {paperStats?.total}
                  </div>
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Papers in Review
                  </div>
                </div>
              </div>

              {/* Mobile Total Papers */}
              <div className="lg:hidden flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    Papers in Review
                  </span>
                </div>
                <span className="text-3xl font-black text-slate-900">{paperStats?.total}</span>
              </div>

              {!hasPapers ? (
                <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      No papers have been added yet
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      Start your review process by adding papers from the project pool.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={onAddPapers}
                    className="rounded-2xl px-10 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all font-black uppercase tracking-widest text-xs"
                  >
                    Add Papers
                  </Button>
                </div>
              ) : (
                <>
                  {/* Stats Breakdown Row */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12">
                    <HorizontalStat
                      label="Not Screened"
                      value={paperStats?.notScreened}
                      color="bg-slate-400"
                    />
                    <HorizontalStat
                      label="In Screening"
                      value={paperStats?.screening}
                      color="bg-amber-400"
                    />
                    <HorizontalStat
                      label="Included"
                      value={paperStats?.included}
                      color="bg-emerald-500"
                    />
                    <HorizontalStat
                      label="Excluded"
                      value={paperStats?.excluded}
                      color="bg-rose-400"
                    />
                  </div>

                  {/* Add Button */}
                  <div className="lg:pl-8 lg:border-l border-slate-200">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={onAddPapers}
                      className="w-full lg:w-auto rounded-2xl border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm hover:shadow-lg font-black text-[10px] uppercase tracking-widest px-6"
                    >
                      Add Papers
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          Phase Progression
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      {/* Workflow Phases - Bottom Section */}
      <div className="min-w-0">
        <div className="flex items-start gap-0 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {activePhases.map((phase, index) => {
            const definition = WORKFLOW_PHASES.find((d) => d.key === phase.key);
            if (!definition) return null;

            const isLast = index === activePhases.length - 1;
            const nextPhase = !isLast ? activePhases[index + 1] : null;

            return (
              <div key={phase.key} className="flex items-start shrink-0">
                <PhaseCard
                  phase={phase}
                  icon={definition.icon}
                  onStart={
                    onStartPhase && phase.status === "NotStarted"
                      ? () => onStartPhase(phase.key)
                      : undefined
                  }
                  onComplete={
                    onCompletePhase && phase.status === "InProgress"
                      ? () => onCompletePhase(phase.key)
                      : undefined
                  }
                  onOpen={
                    onOpenPhase && (phase.status === "InProgress" || phase.status === "Completed")
                      ? () => onOpenPhase(phase.key)
                      : undefined
                  }
                  onReopen={
                    onReopenPhase && phase.status === "Completed" && phase.key !== "synthesis"
                      ? () => onReopenPhase(phase.key)
                      : undefined
                  }
                  canManageActions={canManageActions}
                  startLoading={startLoadingMap[phase.key]}
                  completeLoading={completeLoadingMap[phase.key]}
                  reopenLoading={reopenLoadingMap[phase.key]}
                  disabled={disabled}
                />

                {/* Connector arrow */}
                {!isLast && nextPhase && (
                  <div className="flex items-center self-center px-2 shrink-0">
                    <div
                      className={`p-2 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center transition-all duration-500 hover:scale-110 ${getConnectorColor(phase.status, nextPhase.status).replace("text-", "bg-").replace("400", "50").replace("300", "50")}`}
                    >
                      <FiChevronRight
                        className={`w-4 h-4 ${getConnectorColor(phase.status, nextPhase.status)} transition-colors duration-500`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HorizontalStat({ label, value, color }: { label: string; value?: number; color: string }) {
  return (
    <div className="flex flex-col gap-2 group/stat">
      <div className="flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${color} shadow-[0_0_8px_rgba(0,0,0,0.1)] group-hover/stat:scale-125 transition-transform duration-300`}
        />
        <span className="text-[10px] font-black text-slate-400 group-hover/stat:text-slate-600 transition-colors uppercase tracking-widest whitespace-nowrap">
          {label}
        </span>
      </div>
      <span className="text-2xl font-black text-slate-800 tabular-nums group-hover/stat:text-indigo-600 transition-colors">
        {value ?? 0}
      </span>
    </div>
  );
}
