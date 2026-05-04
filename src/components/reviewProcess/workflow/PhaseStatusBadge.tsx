import { FiCheck, FiLock, FiClock } from "react-icons/fi";
import type { PhaseStatusType } from "./types";

interface PhaseStatusBadgeProps {
  status: PhaseStatusType;
}

const STATUS_CONFIG: Record<
  PhaseStatusType,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  Completed: {
    label: "Completed",
    classes: "bg-green-100 text-green-700 border-green-200",
    icon: <FiCheck className="w-3 h-3" />,
  },
  InProgress: {
    label: "In Progress",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
    icon: <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />,
  },
  NotStarted: {
    label: "Not Started",
    classes: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <FiClock className="w-3 h-3" />,
  },
  Locked: {
    label: "Locked",
    classes: "bg-gray-100 text-gray-400 border-gray-200",
    icon: <FiLock className="w-3 h-3" />,
  },
};

export default function PhaseStatusBadge({ status }: PhaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.classes}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
