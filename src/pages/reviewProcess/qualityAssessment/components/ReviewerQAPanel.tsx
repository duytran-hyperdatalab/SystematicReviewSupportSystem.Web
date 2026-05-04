import { useState, useEffect } from "react";
import { FiCheck, FiX, FiHelpCircle, FiZap, FiMessageSquare } from "react-icons/fi";
import type { 
  QAPaperResponse, 
  QualityAssessmentStrategy,
  AiDecisionResponseItem
} from "../../../../types/qualityAssessment";

export interface ReviewerDecisionPayload {
  /** this is protocol.qualityCriterionId */
  criterionId: string;
  /** 
   * this is the decision.decisionItem.Id
   * */
  itemId?: string;
  value: number;
  comment?: string;
  pdfHighlightCoordinates?: string;
}

interface ReviewerQAPanelProps {
  paper: QAPaperResponse;
  strategies: QualityAssessmentStrategy[];
  onSave: (notes: string | null, decisions: ReviewerDecisionPayload[]) => void;
  onAiAnalyze?: (paperId: string) => Promise<AiDecisionResponseItem[]>;
  isSaving?: boolean;
  activeCriterionId?: string | null;
  onSelectCriterion?: (id: string | null) => void;
  highlightsByCriterion?: Record<string, any[]>;
  canEdit?: boolean;
}

export default function ReviewerQAPanel({ paper, strategies, onSave, onAiAnalyze, isSaving, activeCriterionId, onSelectCriterion, highlightsByCriterion, canEdit = true }: ReviewerQAPanelProps) {
  
  const [answers, setAnswers] = useState<Record<string, { value: number, comment?: string, id?: string, pdfHighlightCoordinates?: string }>>({});
  const [notes, setNotes] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Pre-fill existing decisions
  useEffect(() => {
    if (!paper) return;
    const initialAnswers: Record<string, { value: number, comment?: string, id?: string, pdfHighlightCoordinates?: string }> = {};
    
    // We assume the reviewer sees their own decision (probably the first/only one in the array for their view)
    const myDecision = paper.decisions?.[0];
    myDecision?.decisionItems?.forEach(item => {
      if (item.qualityCriterionId && item.value !== null) {
        initialAnswers[item.qualityCriterionId] = {
          value: Number(item.value),
          comment: item.comment || "",
          id: item.id || undefined,
          pdfHighlightCoordinates: item.pdfHighlightCoordinates || undefined
        };
      }
    });

    setAnswers(initialAnswers);
    setNotes(""); // Reset notes since they are missing from QAPaper response currently
  }, [paper]);

  const handleAiAnalyze = async () => {
    if (!onAiAnalyze || !paper) return;
    try {
      setIsAiLoading(true);
      const aiResults = await onAiAnalyze(paper.paperId);
      
      if (aiResults && aiResults.length > 0) {
        setAnswers(prev => {
          const newAnswers = { ...prev };
          aiResults.forEach(item => {
            newAnswers[item.qualityCriterionId] = {
              ...newAnswers[item.qualityCriterionId],
              value: item.value,
              comment: item.comment,
              pdfHighlightCoordinates: item.pdfHighlightCoordinates
            };
          });
          return newAnswers;
        });
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSelect = (criterionId: string, val: number) => {
    setAnswers(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], value: val }
    }));
  };

  const handleCommentChange = (criterionId: string, txt: string) => {
    setAnswers(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], comment: txt }
    }));
  };

  const handleSave = () => {
    const payload: ReviewerDecisionPayload[] = Object.keys(answers).map(critId => {
      let highlightStr = answers[critId].pdfHighlightCoordinates;
      if (highlightsByCriterion?.[critId]) {
        // Flatten the areas and map to format: page,x,y,height,width
        highlightStr = highlightsByCriterion[critId]
          .flatMap(r => r.areas)
          .map(a => `${a.pageIndex},${a.left},${a.top},${a.height},${a.width}`)
          .join(';');
      }
      return {
        criterionId: critId,
        itemId: answers[critId].id,
        value: answers[critId].value,
        comment: answers[critId].comment,
        pdfHighlightCoordinates: highlightStr,
      };
    });
    onSave(notes || null, payload);
  };

  // Extract all criteria from strategies
  const criteriaList = strategies.flatMap(s => 
    s.checklists.flatMap(cl => 
      cl.criteria.map(c => ({...c, checklistName: cl.name, strategyName: s.description}))
    )
  );

  const hasResolution = !!paper.resolution;

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* AI Advertisement Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg p-4 flex items-start gap-4">
          <div className="bg-purple-100 rounded-full p-2 mt-1">
            <FiZap className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-purple-900 mb-1">Stuck on a tricky paper?</h3>
            <p className="text-xs text-purple-700 mb-3">
              Use our AI Assistant to evaluate this paper against established criteria automatically.
            </p>
            <button 
              onClick={handleAiAnalyze}
              disabled={isAiLoading || hasResolution}
              className="text-xs bg-white text-purple-700 border border-purple-200 px-3 py-1.5 rounded-md font-medium hover:bg-purple-50 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isAiLoading ? "Analyzing..." : "Analyze with AI Helper"}
            </button>
          </div>
        </div>

        {/* Criteria List */}
        <div className="space-y-6 pb-20">
          {criteriaList.map((crit, idx) => {
            const currentAns = answers[crit.criterionId];
            const isYes = currentAns?.value === 0;
            const isNo = currentAns?.value === 1;
            const isUnclear = currentAns?.value === 2;
            const isActive = activeCriterionId === crit.criterionId;

            return (
              <div 
                key={crit.criterionId} 
                onClick={() => onSelectCriterion?.(crit.criterionId)}
                className={`space-y-3 p-4 rounded-lg border transition-colors cursor-pointer ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100 hover:border-indigo-100'}`}
              >
                <div className="flex gap-2">
                  <span className="text-sm font-semibold text-gray-500">{idx + 1}.</span>
                  <p className="text-sm font-medium text-gray-800">{crit.question}</p>
                </div>
                
                <div className="flex gap-2 pl-5">
                  <button 
                    onClick={() => handleSelect(crit.criterionId, 0)}
                    disabled={hasResolution}
                    className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs font-medium border rounded-md transition ${isYes ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"} ${hasResolution ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FiCheck /> Yes
                  </button>
                  <button 
                    onClick={() => handleSelect(crit.criterionId, 1)}
                    disabled={hasResolution}
                    className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs font-medium border rounded-md transition ${isNo ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"} ${hasResolution ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FiX /> No
                  </button>
                  <button 
                    onClick={() => handleSelect(crit.criterionId, 2)}
                    disabled={hasResolution}
                    className={`flex-1 flex justify-center items-center gap-1.5 py-1.5 text-xs font-medium border rounded-md transition ${isUnclear ? "bg-amber-50 border-amber-500 text-amber-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"} ${hasResolution ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FiHelpCircle /> Unclear
                  </button>
                </div>

                <div className="pl-5 pt-1">
                  <div className="relative">
                    <FiMessageSquare className="absolute top-2.5 left-2.5 text-gray-400 w-3.5 h-3.5" />
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      value={currentAns?.comment || ""}
                      onChange={(e) => handleCommentChange(crit.criterionId, e.target.value)}
                      disabled={hasResolution}
                      className={`w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${hasResolution ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={handleSave}
          disabled={isSaving || !canEdit}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
        >
          {isSaving ? "Saving..." : "Save Assessment"}
        </button>
      </div>
    </div>
  );
}
