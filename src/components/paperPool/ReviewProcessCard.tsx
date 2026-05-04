import { FiCheckCircle, FiClock, FiLoader, FiXCircle, FiExternalLink, FiUsers } from "react-icons/fi";
import type { ProcessSnapshot } from "./types";

interface ReviewProcessCardProps {
  process: ProcessSnapshot;
  isSelected: boolean;
  onSelect: (processId: string) => void;
  onNavigate?: (processId: string) => void;
  actionLabel?: string;
  className?: string;
}

export function ProcessStatusIcon({ statusText }: { statusText: ProcessSnapshot["statusText"] }) {
  if (statusText === "Completed") return <FiCheckCircle className="h-4 w-4 text-emerald-600" />;
  if (statusText === "InProgress") return <FiLoader className="h-4 w-4 text-blue-600 animate-spin" />;
  if (statusText === "Cancelled") return <FiXCircle className="h-4 w-4 text-red-600" />;
  return <FiClock className="h-4 w-4 text-gray-500" />;
}

export default function ReviewProcessCard({
  process,
  isSelected,
  onSelect,
  onNavigate,
  actionLabel,
  className = "",
}: ReviewProcessCardProps) {
  return (
    <div
      className={`group relative rounded-2xl border-2 p-4 transition-all duration-200 ${
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-sm"
          : "border-gray-50 bg-white hover:border-gray-200 hover:shadow-sm"
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
          }`}>
            <FiUsers className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-900 line-clamp-1">
              {process.processName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ProcessStatusIcon statusText={process.statusText} />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{process.statusText}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-blue-100">
            Independent
          </span>
          {onNavigate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(process.processId);
              }}
              className="relative z-30 p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-all shadow-sm border border-blue-100"
              title="Go to review process workspace"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-gray-400">Completion</span>
          <span className="text-blue-600">{process.progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${process.progressPercent}%` }}
          />
        </div>
        <p className="text-[8px] font-bold text-blue-400 uppercase tracking-tight mt-2 italic text-center">
          Uses its own inclusion criteria
        </p>
      </div>

      {actionLabel && (
        <button
          onClick={() => onSelect(process.processId)}
          className={`w-full mt-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            isSelected 
            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          {actionLabel}
        </button>
      )}
      
      {!actionLabel && !isSelected && (
        <button
          onClick={() => onSelect(process.processId)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
          aria-label="Select process"
        />
      )}
    </div>
  );
}
