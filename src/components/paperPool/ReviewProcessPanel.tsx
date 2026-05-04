import {
  FiFolder,
  FiCheckCircle,
  FiLoader,
  FiClock,
  FiXCircle,
  FiExternalLink,
  FiUsers,
  FiPlus,
  FiLayers,
} from "react-icons/fi";
import type { ProcessSnapshot } from "./types";
import Button from "../ui/Button";

interface ReviewProcessPanelProps {
  processes: ProcessSnapshot[];
  selectedPaperIds: string[];
  onAddSelected: (processId: string) => void;
  onAddFromFilter: (processId: string) => void;
  onNavigate: (processId: string) => void;
  onCreateProcess?: () => void;
  isAdding?: boolean;
}

export function ProcessStatusIcon({ statusText }: { statusText: ProcessSnapshot["statusText"] }) {
  if (statusText === "Completed") return <FiCheckCircle className="h-4 w-4 text-emerald-600" />;
  if (statusText === "InProgress")
    return <FiLoader className="h-4 w-4 text-blue-600 animate-spin" />;
  if (statusText === "Cancelled") return <FiXCircle className="h-4 w-4 text-red-600" />;
  return <FiClock className="h-4 w-4 text-gray-500" />;
}

export default function ReviewProcessPanel({
  processes,
  selectedPaperIds,
  onNavigate,
  onCreateProcess,
}: ReviewProcessPanelProps) {
  const hasSelected = selectedPaperIds.length > 0;

  return (
    <div className="mt-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col gap-6">
        {/* Hierarchy Hint - REMOVED since we have the new indicator in the parent */}

        {/* Section Title */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-900">
              <FiFolder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Review Processes{" "}
                <span className="text-blue-500 text-sm normal-case font-medium ml-2">
                  (Each process applies its own criteria)
                </span>
              </h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                Papers from the repository can be added to one or multiple processes for independent
                screening.
              </p>
            </div>
          </div>
          {processes.length > 0 && onCreateProcess && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-gray-200"
              onClick={onCreateProcess}
            >
              <FiPlus className="mr-2" />
              New Process
            </Button>
          )}
        </div>

        {/* Floating Selection Hint */}
        {hasSelected && (
          <div className="flex justify-center -mt-2 mb-2">
            <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 border border-slate-800">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FiLayers className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                You have selected{" "}
                <span className="text-blue-400 text-sm mx-1">{selectedPaperIds.length}</span> papers
                → Choose a process to add them
              </span>
            </div>
          </div>
        )}

        {/* Processes Grid */}
        {processes.length === 0 ? (
          <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white shadow-sm rounded-2xl flex items-center justify-center text-gray-300 mb-4">
              <FiFolder className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">
              No review processes yet
            </h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Create one to start screening papers from the paper repository.
            </p>
            {onCreateProcess && (
              <Button className="mt-6 rounded-xl" onClick={onCreateProcess}>
                Create Review Process
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processes.map((process) => (
              <div
                key={process.processId}
                className={`group relative bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 ${hasSelected ? "ring-2 ring-blue-500/10" : ""}`}
              >
                {/* Process Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <FiUsers className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight line-clamp-1">
                        {process.processName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <ProcessStatusIcon statusText={process.statusText} />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {process.statusText}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-blue-100">
                      Independent Screening
                    </span>
                  </div>
                </div>

                {/* Statistics & Progress */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Progress
                    </span>
                    <span className="text-xs font-black text-blue-600">
                      {process.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                      style={{ width: `${process.progressPercent}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em]">
                        Papers
                      </span>
                      <span className="text-base font-black text-gray-900 leading-none mt-1">
                        {process.totalPapers ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-gray-100 pl-3">
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.1em]">
                        Included
                      </span>
                      <span className="text-base font-black text-emerald-600 leading-none mt-1">
                        {process.totalIncludedPapers ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-gray-100 pl-3">
                      <span className="text-[8px] font-black text-rose-500 uppercase tracking-[0.1em]">
                        Excluded
                      </span>
                      <span className="text-base font-black text-rose-600 leading-none mt-1">
                        {process.totalExcludedPapers ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="col-span-2 rounded-xl text-[10px] font-black uppercase tracking-widest py-3 mb-1"
                    onClick={() => onNavigate(process.processId)}
                  >
                    <FiExternalLink className="mr-2" />
                    View Process
                  </Button>
                </div>

                {/* Highlight Effect for Drop Target */}
                {hasSelected && (
                  <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-3xl pointer-events-none animate-pulse" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
