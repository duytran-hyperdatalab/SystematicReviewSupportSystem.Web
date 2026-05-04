import { useState, useMemo } from "react";
import { FiCheckCircle, FiXCircle, FiHelpCircle } from "react-icons/fi";
import type { 
  LeaderQAPaperResponse, 
  QualityAssessmentStrategy,
  QualityAssessmentResolutionRequest 
} from "../../../../types/qualityAssessment";

interface LeaderQAPanelProps {
  paper: LeaderQAPaperResponse;
  strategies: QualityAssessmentStrategy[];
  onResolve: (data: Omit<QualityAssessmentResolutionRequest, "qualityAssessmentProcessId" | "paperId">) => void;
  isResolving?: boolean;
  activeCriterionId?: string | null;
  onSelectCriterion?: (id: string | null) => void;
  canEdit?: boolean;
}

export default function LeaderQAPanel({ paper, strategies, onResolve, isResolving, activeCriterionId, onSelectCriterion, canEdit = true }: LeaderQAPanelProps) {
  const [finalDecision, setFinalDecision] = useState<number | null>(paper.resolution?.finalDecision ?? null);
  const [resolutionNotes, setResolutionNotes] = useState(paper.resolution?.resolutionNotes ?? "");

  const handleResolve = () => {
    if (finalDecision === null) return;
    onResolve({
      finalDecision,
      finalScore: 0,
      resolutionNotes
    });
  };

  // Group reviewers' decisions by criterion ID
  const criteriaDecisions = useMemo(() => {
    const map: Record<string, Record<string, any>> = {};
    if (!paper.decisions) return map;
    
    paper.decisions.forEach(decision => {
      decision.decisionItems?.forEach(item => {
        if (!map[item.qualityCriterionId]) {
          map[item.qualityCriterionId] = {};
        }
        map[item.qualityCriterionId][decision.reviewerId] = item;
      });
    });
    return map;
  }, [paper.decisions]);

  const criteriaList = strategies.flatMap(s => 
    s.checklists.flatMap(cl => 
      cl.criteria.map(c => ({...c, checklistName: cl.name, strategyName: s.description}))
    )
  );

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Reviewer Decisions</h3>
        
        <div className="space-y-4 pb-4">
          {criteriaList.map((crit, idx) => {
            const decisionsForCrit = criteriaDecisions[crit.criterionId] || {};
            
            // Group reviewers by their choice
            const groupedDecisions = {
              yes: [] as Array<{ reviewer: typeof paper.reviewers[0], decision: any }>,
              no: [] as Array<{ reviewer: typeof paper.reviewers[0], decision: any }>,
              unclear: [] as Array<{ reviewer: typeof paper.reviewers[0], decision: any }>,
              unanswered: [] as Array<{ reviewer: typeof paper.reviewers[0], decision: any }>,
            };

            paper.reviewers.forEach(reviewer => {
              const decision = decisionsForCrit[reviewer.id];
              const val = decision?.value !== null && decision?.value !== undefined ? Number(decision.value) : null;
              
              if (val === 0) groupedDecisions.yes.push({ reviewer, decision });
              else if (val === 1) groupedDecisions.no.push({ reviewer, decision });
              else if (val === 2) groupedDecisions.unclear.push({ reviewer, decision });
              else groupedDecisions.unanswered.push({ reviewer, decision });
            });

            const comments = paper.reviewers
              .map(r => ({ reviewer: r, decision: decisionsForCrit[r.id] }))
              .filter(d => d.decision?.comment);

            return (
              <div 
                key={crit.criterionId} 
                onClick={() => onSelectCriterion?.(crit.criterionId)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${activeCriterionId === crit.criterionId ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100 hover:border-indigo-100'}`}
              >
                <p className="text-xs font-medium text-gray-800 mb-3">{idx + 1}. {crit.question}</p>
                
                <div className="flex flex-col gap-3">
                  {/* Grouped Choices */}
                  <div className="flex flex-wrap gap-2">
                    {/* Yes Group */}
                    {groupedDecisions.yes.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-1.5 rounded-md">
                        <FiCheckCircle className="text-emerald-500 w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-emerald-700 mr-1">Yes</span>
                        <div className="flex -space-x-1.5">
                          {groupedDecisions.yes.map(({ reviewer }) => (
                            <div key={reviewer.id} className="relative group shrink-0">
                              <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-1 ring-emerald-200">
                                <span className="text-[9px] font-bold leading-none text-emerald-700">
                                  {(reviewer.fullname || reviewer.username).substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 w-max bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                                {reviewer.fullname || reviewer.username}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* No Group */}
                    {groupedDecisions.no.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-2 py-1.5 rounded-md">
                        <FiXCircle className="text-rose-500 w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-rose-700 mr-1">No</span>
                        <div className="flex -space-x-1.5">
                          {groupedDecisions.no.map(({ reviewer }) => (
                            <div key={reviewer.id} className="relative group shrink-0">
                              <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-1 ring-rose-200">
                                <span className="text-[9px] font-bold leading-none text-rose-700">
                                  {(reviewer.fullname || reviewer.username).substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 w-max bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                                {reviewer.fullname || reviewer.username}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unclear Group */}
                    {groupedDecisions.unclear.length > 0 && (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2 py-1.5 rounded-md">
                        <FiHelpCircle className="text-amber-500 w-3.5 h-3.5" />
                        <span className="text-xs font-medium text-amber-700 mr-1">Unclear</span>
                        <div className="flex -space-x-1.5">
                          {groupedDecisions.unclear.map(({ reviewer }) => (
                            <div key={reviewer.id} className="relative group shrink-0">
                              <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-1 ring-amber-200">
                                <span className="text-[9px] font-bold leading-none text-amber-700">
                                  {(reviewer.fullname || reviewer.username).substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 w-max bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                                {reviewer.fullname || reviewer.username}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments List */}
                  {comments.length > 0 && (
                    <div className="flex flex-col gap-1.5 pl-1 border-l-2 border-gray-200 mt-1">
                      {comments.map(({ reviewer, decision }) => (
                        <div key={reviewer.id} className="flex items-start gap-2 text-xs">
                          <span className="font-medium text-gray-700 whitespace-nowrap mt-0.5">
                            {reviewer.username}:
                          </span>
                          <span className="text-gray-600 italic">
                            "{decision.comment}"
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 pt-2">Final Resolution</h3>
        
        <div className="space-y-4 pb-20">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Final Decision</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFinalDecision(1)}
                className={`p-2 rounded-md text-xs font-medium border text-center transition ${finalDecision === 1 ? "bg-green-50 border-green-500 text-green-700" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                disabled={!canEdit}
              >
                High Quality
              </button>
              <button
                onClick={() => setFinalDecision(0)}
                className={`p-2 rounded-md text-xs font-medium border text-center transition ${finalDecision === 0 ? "bg-red-50 border-red-500 text-red-700" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                disabled={!canEdit}
              >
                Low Quality
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Resolution Notes</label>
            <textarea 
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={3}
              placeholder="Add reasoning for this resolution..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={!canEdit}
            />
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleResolve}
          disabled={isResolving || finalDecision === null || !canEdit}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {isResolving ? "Resolving..." : "Submit Resolution"}
        </button>
      </div>
    </div>
  );
}
