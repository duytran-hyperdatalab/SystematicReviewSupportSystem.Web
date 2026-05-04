import React from "react";
import { FiTag } from "react-icons/fi";
import { Sparkles } from "lucide-react";
import type { PaperDetailsResponse } from "../../../../../types/paper";


interface ContentSectionProps {
  paper: PaperDetailsResponse;
  isFieldUpdated: (f: string) => boolean;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  paper,
  isFieldUpdated,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6 md:p-8 space-y-8">
        {/* Abstract */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Abstract
            </h2>
            {isFieldUpdated("Abstract") && (
              <div className="group/spark relative flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-lg opacity-0 group-hover/spark:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 backdrop-blur-md">
                  Suggested fields applied
                </div>
              </div>
            )}
          </div>
          {paper.abstract ? (
            <div className="text-[16px] text-slate-800 leading-[1.8] font-medium selection:bg-blue-100">
              {paper.abstract}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 italic font-medium border-2 border-dashed border-slate-100 rounded-2xl">
              Abstract unavailable for this record.
            </div>
          )}
        </div>

        {/* Keywords */}
        {paper.keywords && (
          <div className="pt-8 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Keywords
              </h2>
              {isFieldUpdated("Keywords") && (
                <div className="group/spark relative flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-lg opacity-0 group-hover/spark:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 backdrop-blur-md">
                    Suggested fields applied
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {paper.keywords.split(/[;,]/).map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors hover:bg-white hover:border-blue-400 hover:text-blue-600 cursor-default"
                >
                  <FiTag className="w-3 h-3 text-slate-400" />
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Conference Info */}
        {paper.conferenceName && (
          <div className="pt-8 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                Conference Information
              </h2>
              {isFieldUpdated("ConferenceName") && (
                <div className="group/spark relative flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.1em] rounded-lg opacity-0 group-hover/spark:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl border border-white/10 backdrop-blur-md">
                    Suggested fields applied
                  </div>
                </div>
              )}
            </div>
            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  Conference Name
                </span>
                <p className="text-sm font-bold text-slate-800">{paper.conferenceName}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {paper.conferenceLocation && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Location
                    </span>
                    <p className="text-sm font-bold text-slate-700">{paper.conferenceLocation}</p>
                  </div>
                )}
                {paper.conferenceCountry && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Country
                    </span>
                    <p className="text-sm font-bold text-slate-700">{paper.conferenceCountry}</p>
                  </div>
                )}
                {paper.conferenceYear && (
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      Year
                    </span>
                    <p className="text-sm font-bold text-slate-700">{paper.conferenceYear}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
