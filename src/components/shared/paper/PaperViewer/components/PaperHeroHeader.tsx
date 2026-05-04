import React from "react";
import { FiDatabase, FiCalendar, FiBook, FiExternalLink } from "react-icons/fi";
import { Sparkles } from "lucide-react";

import { StatusBadge } from "./StatusBadge";
import type { ScreeningPaper } from "../../../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";

interface PaperHeroHeaderProps {
  paper: ScreeningPaper;
  isLeaderView: boolean;
  isFieldUpdated: (f: string) => boolean;
}

export const PaperHeroHeader: React.FC<PaperHeroHeaderProps> = ({
  paper,
  isLeaderView,
  isFieldUpdated,
}) => {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm relative overflow-hidden group">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {!isLeaderView && <StatusBadge paper={paper} />}
          {paper.source && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
              <FiDatabase className="w-3 h-3" />
              {paper.source}
            </span>
          )}
          {paper.publicationYear && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <FiCalendar className="w-3.5 h-3.5" />
              {paper.publicationYear}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight tracking-tight mb-4 group-hover:text-blue-600 transition-colors">
          {paper.title}
        </h1>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <p className="text-base font-bold text-slate-600 leading-relaxed">
              {paper.authors ?? "Unknown authors"}
            </p>
            {isFieldUpdated("Authors") && (
              <div className="group/spark relative flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-lg opacity-0 group-hover/spark:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 backdrop-blur-md">
                  Suggested fields applied
                </div>
              </div>
            )}
          </div>

          {(paper.journal || paper.conferenceName) && (
            <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
              <FiBook className="w-4 h-4 shrink-0 text-slate-400" />
              <span className="italic">{paper.journal || paper.conferenceName}</span>
            </div>
          )}

          {paper.doi && (
            <a
              href={`https://doi.org/${encodeURIComponent(paper.doi)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100 w-fit"
            >
              DOI: {paper.doi}
              <FiExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
