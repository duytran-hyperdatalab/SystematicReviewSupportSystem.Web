import { FiArrowLeft, FiPlay, FiCheck, FiPackage } from "react-icons/fi";
import Button from "../ui/Button";
import { formatDate } from "../../utils/dateFormat";
import type { ReviewProcess } from "../../types/reviewProcess";

interface ProcessHeaderProps {
  process: ReviewProcess;
  onBack: () => void;
  onStartProcess: () => void;
  onCompleteProcess: () => void;
  startLoading: boolean;
  completeLoading: boolean;
  disabled?: boolean;
}

export default function ProcessHeader({
  process,
  onBack,
  onStartProcess,
  onCompleteProcess,
  startLoading,
  completeLoading,
  disabled = false,
}: ProcessHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 grid grid-cols-3 items-center flex-shrink-0 z-50">
      {/* Left side: Back + Icon + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
          title="Back to Project"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FiPackage className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none mb-1">
              {process.name || "Systematic Review Process"}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Process Overview • {process.statusText === "InProgress" ? "Active" : process.statusText}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Info/Stats */}
      <div className="flex items-center justify-self-center gap-6 text-xs text-slate-500">
        <div className="flex flex-col items-center">
          <span className="font-bold text-slate-400 uppercase tracking-tighter text-[9px]">Started</span>
          <span className="font-medium">{formatDate(process.startedAt ?? "") || "-"}</span>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="flex flex-col items-center">
          <span className="font-bold text-slate-400 uppercase tracking-tighter text-[9px]">Last Update</span>
          <span className="font-medium">{formatDate(process.modifiedAt ?? "")}</span>
        </div>
        {process.completedAt && (
          <>
            <div className="w-px h-6 bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="font-bold text-slate-400 uppercase tracking-tighter text-[9px]">Completed</span>
              <span className="font-medium">{formatDate(process.completedAt)}</span>
            </div>
          </>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3 justify-self-end">
        {process.statusText === "NotStarted" && (
          <Button
            onClick={onStartProcess}
            disabled={startLoading || disabled}
            className="flex items-center gap-2"
            title={disabled ? "Select a protocol first" : ""}
          >
            <FiPlay className="w-4 h-4" />
            {startLoading ? "Starting..." : "Start Process"}
          </Button>
        )}

        {process.statusText === "InProgress" && (
          <Button
            onClick={onCompleteProcess}
            disabled={completeLoading || disabled}
            variant="success"
            className="flex items-center gap-2"
            title={disabled ? "Select a protocol first" : ""}
          >
            <FiCheck className="w-4 h-4" />
            {completeLoading ? "Completing..." : "Complete Process"}
          </Button>
        )}
      </div>
    </div>
  );
}
