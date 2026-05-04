import React from "react";
import { FileText, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import type { OriginPaperSummary } from "../../../mocks/snowballingMockData";


interface OriginPaperCardProps {
  paper: OriginPaperSummary;
  onClick: (id: string) => void;
}

const OriginPaperCard: React.FC<OriginPaperCardProps> = ({ paper, onClick }) => {
  return (
    <div 
      onClick={() => onClick(paper.id)}
      className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer flex flex-col h-full active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <FileText className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published</span>
          <span className="text-xs font-bold text-slate-900">{paper.year}</span>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-base font-black text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {paper.title}
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-1">
          {paper.authors}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-3 gap-2">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400 mb-1">Refs</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-black text-slate-900">{paper.totalReferences}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-500/70 mb-1">Logic</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span className="text-sm font-black text-emerald-600">{paper.suggestedCount}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-tighter text-amber-500/70 mb-1">Dups</span>
          <div className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-amber-500" />
            <span className="text-sm font-black text-amber-600">{paper.duplicateCount}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
        Open Workspace
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default OriginPaperCard;
