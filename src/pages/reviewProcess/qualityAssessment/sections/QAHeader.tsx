import type { ReactNode } from "react";
import { ArrowLeft, Download, FileCheck2 } from "lucide-react";
import { cn } from "../../../../utils/cn";
import Button from "../../../../components/ui/Button";

interface StatusStyle {
  bg: string;
  text: string;
  dot: string;
}

const STATUS_CONFIG = {
  pending: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
  included: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  excluded: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  inProgress: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  notStarted: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
};

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
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border", config.bg, config.bg.replace('bg-', 'border-').replace('50', '200').replace('100', '200'))}>
      <div className="flex items-center gap-1.5">
        <span className={cn("w-1.5 h-1.5 rounded-full shadow-sm", config.dot)} />
        <span className={cn("font-bold text-sm", config.text)}>{value}</span>
      </div>
      <div className="w-px h-3 bg-current opacity-20" />
      <span className={cn("text-xs font-medium opacity-80", config.text)}>{label}</span>
    </div>
  );
}

interface QAHeaderProps {
  onBack: () => void;
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    pending: number;
    completionPercentage: number;
  };
  rightControls?: ReactNode;
  onExport?: () => void;
  isLeader?: boolean;
}

export function QAHeader({ onBack, stats, rightControls, onExport, isLeader }: QAHeaderProps) {
  const completedPercent = Math.round(stats.completionPercentage);

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section: Back button & Title */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="p-2 h-10 w-10 text-slate-500 hover:text-slate-900 border-slate-200 hover:bg-slate-100/50 transition-colors shadow-sm"
              title="Back"
            >
              <ArrowLeft size={18} />
            </Button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
                <FileCheck2 size={20} />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Quality Assessment</h1>
                <p className="text-xs font-medium text-slate-500">Methodological quality and bias risk</p>
              </div>
            </div>
          </div>

          {/* Middle section: Stats & Progress */}
          <div className="flex items-center gap-6 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <StatBadge label="Total" value={stats.total} config={STATUS_CONFIG.pending} />
              {isLeader ? (
                <>
                  <StatBadge label="Completed" value={stats.completed} config={STATUS_CONFIG.completed} />
                  <StatBadge label="In Progress" value={stats.inProgress} config={STATUS_CONFIG.inProgress} />
                  <StatBadge label="Not Started" value={stats.notStarted} config={STATUS_CONFIG.notStarted} />
                </>
              ) : (
                <>
                  <StatBadge label="Completed" value={stats.completed} config={STATUS_CONFIG.completed} />
                  <StatBadge label="Pending" value={stats.pending} config={STATUS_CONFIG.pending} />
                </>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-3 pr-2">
              <div className="w-32 h-2.5 bg-slate-200/60 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-blue-500"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 shadow-sm">{completedPercent}%</span>
            </div>
          </div>

          {/* Right section: Controls */}
          <div className="flex items-center gap-3">
            {onExport && (
              <Button
                variant="outline"
                onClick={onExport}
                className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm hover:text-slate-900 transition-colors bg-white font-medium text-sm"
              >
                <Download size={16} className="text-slate-400" />
                Export Excel
              </Button>
            )}
            {rightControls}
          </div>
        </div>
      </div>
    </div>
  );
}