import { FiArrowLeft, FiFilter } from "react-icons/fi";
import ScreeningPipelineHeader from "../../components/ScreeningPipelineHeader";
import type { ScreeningStats } from "../types";

interface ScreeningHeaderProps {
  processName: string;
  stats: ScreeningStats;
  fullTextStats: ScreeningStats;
  onBack: () => void;
  onNavigateToFullText: () => void;
  onNavigateToTitleAbstract: () => void;
}

export default function ScreeningHeader({
  processName,
  stats,
  fullTextStats,
  onBack,
  onNavigateToFullText,
  onNavigateToTitleAbstract,
}: ScreeningHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-full mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Back + Process Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Back to Review Process"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100/50">
                <FiFilter className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-bold text-gray-900 leading-tight">Study Selection</h1>
                <p className="text-[10px] text-gray-500 font-medium truncate max-w-[150px]">
                  {processName}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Pipeline Header */}
          <div className="flex-1 max-w-2xl px-8">
            <ScreeningPipelineHeader
              activePhase="title-abstract"
              titleAbstractStats={stats}
              fullTextStats={fullTextStats}
              onNavigateToTitleAbstract={onNavigateToTitleAbstract}
              onNavigateToFullText={onNavigateToFullText}
            />
          </div>

          {/* Right: Panel Toggle + Shortcuts */}
          <div className="flex items-center gap-6">

            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 shadow-sm">1</kbd>
                <span className="text-[10px]">Incl</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 shadow-sm">2</kbd>
                <span className="text-[10px]">Excl</span>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <kbd className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-200 shadow-sm">↑↓</kbd>
                <span className="text-[10px]">Nav</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
