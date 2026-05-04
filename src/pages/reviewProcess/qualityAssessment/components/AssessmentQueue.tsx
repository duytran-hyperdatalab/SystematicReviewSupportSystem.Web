import { FiSearch, FiFile, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { cn } from "../../../../utils/cn";
import Pagination from "../../../../components/ui/Pagination";

export interface PaperItem {
  paperId: string;
  title: string;
  authors: string | null;
  completionPercentage?: number;
  resolution?: any; // QualityAssessmentResolutionResponse or equivalent
}

interface AssessmentQueueProps {
  papers: PaperItem[];
  selectedPaperId: string | null;
  searchQuery: string;
  // allow null because parent may pass setSelectedPaperId
  onSelectPaper: (id: string | null) => void;
  onSearchChange: (query: string) => void;
  isLeader?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function AssessmentQueue({
  papers,
  selectedPaperId,
  searchQuery,
  onSelectPaper,
  onSearchChange,
  isLeader = false,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: AssessmentQueueProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiFile className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-900">{isLeader ? "Resolution Queue" : "Assessment Queue"}</h2>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            {totalItems}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search title, author..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 outline-none transition-colors"
          />
        </div>
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {papers.map((paper) => {
          const isSelected = selectedPaperId === paper.paperId;
          
          let resolutionLabel: string | undefined;
          if (paper.resolution && typeof paper.resolution.finalDecision === "number") {
             resolutionLabel = paper.resolution.finalDecision === 1 ? "HighQuality" : "LowQuality";
          }
          const percentage = paper.completionPercentage ?? 0;
          
          let StatusIcon = FiClock;
          let iconColor = "text-gray-400";
          let barColor = "bg-gray-300";

          if (resolutionLabel === "HighQuality") {
            StatusIcon = FiCheckCircle;
            iconColor = "text-emerald-600";
            barColor = "bg-emerald-500";
          } else if (resolutionLabel === "LowQuality") {
            StatusIcon = FiAlertCircle;
            iconColor = "text-rose-500";
            barColor = "bg-rose-400";
          } else if (percentage === 100 && !isLeader) { // only show as completed if resolution is done for leaders, for non-leaders show as completed if assessment is done (100% completion)
            StatusIcon = FiCheckCircle;
            iconColor = "text-green-500";
            barColor = "bg-green-500";
          } else if (percentage > 0) {
            StatusIcon = FiClock;
            iconColor = "text-blue-500";
            barColor = "bg-blue-500";
          }

          return (
            <div
              key={paper.paperId}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPaper(paper.paperId)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSelectPaper(paper.paperId);
              }}
              className={cn(
                "px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors",
                isSelected
                  ? "bg-indigo-50 border-l-2 border-l-indigo-500"
                  : "hover:bg-gray-50 border-l-2 border-l-transparent",
              )}
            >
              <div className="flex items-start gap-2">
                <StatusIcon className={cn("w-4 h-4 mt-0.5 shrink-0", iconColor)} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {paper.authors ?? "Unknown authors"}
                  </p>
                  
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", barColor)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {resolutionLabel === "HighQuality" ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-100 rounded-full font-semibold">High Quality</span>
                    ) : resolutionLabel === "LowQuality" ? (
                      <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 border border-rose-100 rounded-full font-semibold">Low Quality</span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap min-w-[32px] text-right">
                        {`${percentage}%`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {papers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 px-4 text-center">
            <p className="text-sm text-gray-500">No papers found</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex flex-col items-center gap-2">
           <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

