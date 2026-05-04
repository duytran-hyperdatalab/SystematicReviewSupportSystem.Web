import React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface ConflictResolutionHeaderProps {
  paperId: string;
  onBack: () => void;
}

const ConflictResolutionHeader: React.FC<ConflictResolutionHeaderProps> = ({
  paperId,
  onBack,
}) => {
  return (
    <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
        </button>
        <div className="h-8 w-px bg-gray-100 mx-2" />
        <div>
          <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">
            Conflict Resolution
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
            Paper ID: {paperId}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Paper
          </span>
          <span className="text-xs font-black text-gray-900">2 of 10</span>
          <div className="flex gap-1 ml-2">
            <button className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-white hover:shadow-sm rounded-lg transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ConflictResolutionHeader;
