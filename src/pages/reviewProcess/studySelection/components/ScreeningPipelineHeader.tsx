import { FiArrowRight, FiCheckCircle, FiCircle, FiActivity } from "react-icons/fi";import { cn } from "../../../../utils/cn";
import type { ScreeningStats } from "../titleAbstractScreening/types";

interface PhaseStatsProps {
  label: string;
  stats: ScreeningStats;
  isActive: boolean;
  onClick: () => void;
  color: "blue" | "indigo";
}

function PhaseCard({ label, stats, isActive, onClick, color }: PhaseStatsProps) {
  const isBlue = color === "blue";
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 p-3 rounded-xl border transition-all duration-200 text-left min-w-[240px]",
        isActive 
          ? isBlue 
            ? "border-blue-200 bg-blue-50/50 ring-1 ring-blue-100 shadow-sm"
            : "border-indigo-200 bg-indigo-50/50 ring-1 ring-indigo-100 shadow-sm"
          : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          "text-xs font-bold uppercase tracking-wider",
          isActive 
            ? isBlue ? "text-blue-700" : "text-indigo-700"
            : "text-gray-500"
        )}>
          {label}
        </span>
        {isActive ? (
          <FiActivity className={cn("w-3.5 h-3.5 animate-pulse", isBlue ? "text-blue-500" : "text-indigo-500")} />
        ) : stats.completionPercentage === 100 ? (
          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <FiCircle className="w-3.5 h-3.5 text-gray-300" />
        )}
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatItem label="Total" value={stats.total} />
        <StatItem label="Incl." value={stats.included} color="emerald" />
        <StatItem label="Excl." value={stats.excluded} color="rose" />
        <StatItem label="Pend." value={stats.pending} color="amber" />
      </div>

      <div className="mt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400 font-medium">Progress</span>
          <span className="text-[10px] text-gray-500 font-bold">{Math.round(stats.completionPercentage)}%</span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-500",
              isBlue ? "bg-blue-500" : "bg-indigo-500"
            )}
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function StatItem({ label, value, color = "gray" }: { label: string; value: number; color?: "emerald" | "rose" | "amber" | "gray" }) {
  const colorClasses = {
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
    gray: "text-gray-600"
  };

  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-gray-400 leading-none mb-0.5">{label}</span>
      <span className={cn("text-xs font-bold", colorClasses[color])}>{value}</span>
    </div>
  );
}

interface ScreeningPipelineHeaderProps {
  activePhase: "title-abstract" | "full-text";
  titleAbstractStats: ScreeningStats;
  fullTextStats: ScreeningStats;
  onNavigateToTitleAbstract: () => void;
  onNavigateToFullText: () => void;
}

export default function ScreeningPipelineHeader({
  activePhase,
  titleAbstractStats,
  fullTextStats,
  onNavigateToTitleAbstract,
  onNavigateToFullText,
}: ScreeningPipelineHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <PhaseCard
        label="Title / Abstract"
        stats={titleAbstractStats}
        isActive={activePhase === "title-abstract"}
        onClick={onNavigateToTitleAbstract}
        color="blue"
      />

      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-px bg-gray-200" />
          <div className="bg-white border border-gray-100 rounded-full p-1 shadow-sm">
            <FiArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="w-8 h-px bg-gray-200" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">
            {titleAbstractStats.included} Papers
          </span>
          <span className="text-[9px] text-gray-400 font-medium">Flow to Full-Text</span>
        </div>
      </div>

      <PhaseCard
        label="Full-Text Review"
        stats={fullTextStats}
        isActive={activePhase === "full-text"}
        onClick={onNavigateToFullText}
        color="indigo"
      />
    </div>
  );
}
