import type { ReactNode } from "react";
import { FiArrowRight, FiCheck, FiLock } from "react-icons/fi";
import Button from "../ui/Button";

interface PhaseStat {
  label: string;
  value: number | string;
  variant?: "default" | "success" | "warning" | "danger";
}

interface PhaseSummaryCardProps {
  phaseName: string;
  phaseIcon: ReactNode;
  stats: PhaseStat[];
  status: "completed" | "current" | "locked" | "available";
  actionLabel: string;
  onActionClick: () => void;
  lastUpdated?: string;
}

export default function PhaseSummaryCard({
  phaseName,
  phaseIcon,
  stats,
  status,
  actionLabel,
  onActionClick,
  lastUpdated,
}: PhaseSummaryCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <FiCheck className="w-3 h-3" />
            Completed
          </span>
        );
      case "current":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            Active
          </span>
        );
      case "locked":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            <FiLock className="w-3 h-3" />
            Locked
          </span>
        );
      default:
        return null;
    }
  };

  const getStatColorClass = (variant?: string) => {
    switch (variant) {
      case "success":
        return "text-green-700";
      case "warning":
        return "text-yellow-700";
      case "danger":
        return "text-red-700";
      default:
        return "text-gray-900";
    }
  };

  const getBorderClass = () => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50/30";
      case "current":
        return "border-blue-300 bg-blue-50/30 shadow-md";
      case "locked":
        return "border-gray-200 bg-gray-50 opacity-60";
      default:
        return "border-gray-200 bg-white";
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-5 transition-all duration-200 hover:shadow-lg ${getBorderClass()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl text-blue-600">{phaseIcon}</div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{phaseName}</h3>
            {lastUpdated && <p className="text-xs text-gray-500 mt-0.5">Updated {lastUpdated}</p>}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-md p-3 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${getStatColorClass(stat.variant)}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Action Button */}
      <Button
        onClick={onActionClick}
        disabled={status === "locked"}
        size="sm"
        variant={status === "current" ? "primary" : "secondary"}
        className="w-full flex items-center justify-center gap-2"
      >
        {actionLabel}
        <FiArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
