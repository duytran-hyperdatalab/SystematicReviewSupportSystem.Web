import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, ListChecks } from 'lucide-react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import ProjectPICOCElement from '../../../components/reviewProcess/leader/ProjectPICOCElement';
import ProjectResearchQuestions from '../../../components/reviewProcess/leader/ProjectResearchQuestions';
import { useProjectPicocs, useProjectResearchQuestions } from '../../../hooks/useProjects';
import { useSelectionCriteria } from '../../../hooks/useSelectionCriteria';

interface CriteriaTabProps {
  projectId?: string;
  screeningProcessId?: string;
}

export const CriteriaTab: React.FC<CriteriaTabProps> = ({ projectId, screeningProcessId }) => {
  const [showPicoc, setShowPicoc] = useState(true);
  const [showRq, setShowRq] = useState(true);
  const [showCriteria, setShowCriteria] = useState(true);

  const { picocs, isLoading: picocLoading } = useProjectPicocs(projectId);
  const { researchQuestions, isLoading: rqLoading } = useProjectResearchQuestions(projectId);
  const { data: criteria, isLoading: criteriaLoading } = useSelectionCriteria(screeningProcessId);

  const isLoading = picocLoading || rqLoading || criteriaLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 w-full px-1">
      {/* PICOC Section */}
      <div className="space-y-3">
        <button
          onClick={() => setShowPicoc(!showPicoc)}
          className="flex items-center justify-between w-full text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-slate-600 transition-colors group"
        >
          <span>Project Reference</span>
          {showPicoc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showPicoc && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ProjectPICOCElement picocs={picocs} isCompact={true} />
          </div>
        )}
      </div>

      {/* RQ Section */}
      <div className="space-y-3">
        <button
          onClick={() => setShowRq(!showRq)}
          className="flex items-center justify-between w-full text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-slate-600 transition-colors group"
        >
          <span>Scientific Basis</span>
          {showRq ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        {showRq && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <ProjectResearchQuestions researchQuestions={researchQuestions} isCompact={true} />
          </div>
        )}
      </div>

      {/* Criteria Groups Section */}
      <div className="space-y-3 pb-4">
        <button
          onClick={() => setShowCriteria(!showCriteria)}
          className="flex items-center justify-between w-full text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-slate-600 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <span>Selection Criteria</span>
            {criteria && criteria.length > 0 && (
              <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full text-[8px] tracking-normal">{criteria.length}</span>
            )}
          </div>
          {showCriteria ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        
        {showCriteria && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {criteria && criteria.length > 0 ? (
              criteria.map((group) => (
                <div key={group.criteriaId} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <ListChecks className="w-3.5 h-3.5 text-indigo-500" />
                      <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight line-clamp-1">
                        {group.description || "Criteria Group"}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-4">
                    {/* Inclusion */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                        <CheckCircle className="w-3 h-3" />
                        Inclusion
                      </div>
                      <ul className="space-y-1.5">
                        {group.inclusionCriteria.length > 0 ? (
                          group.inclusionCriteria.map((c) => (
                            <li key={c.inclusionId} className="text-[11px] text-slate-600 leading-relaxed flex gap-2">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              {c.rule}
                            </li>
                          ))
                        ) : (
                          <li className="text-[10px] text-slate-400 italic">No inclusion criteria</li>
                        )}
                      </ul>
                    </div>

                    {/* Exclusion */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 uppercase tracking-widest">
                        <XCircle className="w-3 h-3" />
                        Exclusion
                      </div>
                      <ul className="space-y-1.5">
                        {group.exclusionCriteria.length > 0 ? (
                          group.exclusionCriteria.map((c) => (
                            <li key={c.exclusionId} className="text-[11px] text-slate-600 leading-relaxed flex gap-2">
                              <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                              {c.rule}
                            </li>
                          ))
                        ) : (
                          <li className="text-[10px] text-slate-400 italic">No exclusion criteria</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs italic">
                No selection criteria defined.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
