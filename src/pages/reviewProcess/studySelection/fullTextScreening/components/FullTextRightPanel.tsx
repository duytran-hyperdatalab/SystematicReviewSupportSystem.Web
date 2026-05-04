import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiCpu, FiClipboard, FiList } from "react-icons/fi";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../../redux/store";
import type { AiAnalysisResult, FullTextPaper, ScreeningDecision } from "../types";
import { cn } from "../../../../../utils/cn";
import { PaperPhase } from "../../../../../types/studySelection";
import Tabs from "../../../../../components/ui/Tabs";
import SelectionChecklist from "../../titleAbstractScreening/components/SelectionChecklist";
import AiAnalysisPanel from "./AiAnalysisPanel";
import ConflictDetails from "./ConflictDetails";
import DecisionBar from "./DecisionBar";
import { CriteriaTab } from "../../../../manage-study-selection/components/CriteriaTab";

interface FullTextRightPanelProps {
  paper: FullTextPaper | null;
  aiAnalysis: AiAnalysisResult | null;
  isAnalyzing: boolean;
  onInclude: (paperId: string) => void;
  onExclude: (
    paperId: string,
    exclusionReasonId: string | null,
    reason: string | null,
  ) => void;
  runAiAnalysis: (paperId: string) => void;
  isSubmitting: boolean;
  onResolveConflict?: (paperId: string, decision: ScreeningDecision, notes?: string) => void;
  isResolving?: boolean;
}

export default function FullTextRightPanel({
  paper,
  aiAnalysis,
  isAnalyzing,
  runAiAnalysis,
  onInclude,
  onExclude,
  isSubmitting: isSubmittingDecision,
}: FullTextRightPanelProps) {
  const { projectId, screeningProcessId } = useParams<{ projectId: string; screeningProcessId: string }>();
  const [activeTab, setActiveTab] = useState("ai");

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const hasMyDecision = useMemo(() => {
    if (!currentUser || !paper) return false;
    return paper.decisions.some((d) => d.reviewerId === currentUser.id);
  }, [paper, currentUser]);

  const canReview = useMemo(() => {
    if (!paper || hasMyDecision) return false;
    return paper.screeningStatus === "pending" || paper.screeningStatus === "conflicted";
  }, [paper, hasMyDecision]);

  if (!paper) {
    return (
      <div className="flex flex-col h-full bg-white border-l border-gray-200">
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <FiCpu className="w-8 h-8 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Select a paper to view analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 min-w-0">
      <Tabs
        className="flex-1 min-h-0 flex flex-col gap-0 min-w-0"
        contentClassName="flex-1 overflow-hidden"
        listClassName="w-[calc(100%-1rem)] mx-2 mt-2 gap-0.5 p-1 bg-slate-100/80"
        itemClassName="flex-1 px-2 py-2 gap-1.5 text-[11px] justify-center"
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        items={[
          { id: "criteria", label: "Criteria", icon: FiList },
          { id: "ai", label: "AI Analysis", icon: FiCpu },
          { id: "checklist", label: "Checklist", icon: FiClipboard },
        ]}
      >
        {activeTab === "criteria" && (
          <div className="h-full overflow-y-auto p-4 custom-scrollbar">
            <CriteriaTab projectId={projectId} screeningProcessId={screeningProcessId} />
          </div>
        )}
        {activeTab === "ai" && (
          <div className="w-full h-full min-h-0 overflow-y-auto">
            <AiAnalysisPanel
              paper={paper}
              aiAnalysis={aiAnalysis}
              isAnalyzing={isAnalyzing}
              runAiAnalysis={runAiAnalysis}
            />

            {/* Conflict Details */}
            {paper.screeningStatus === "conflicted" && paper.decisions.length > 0 && (
              <ConflictDetails paper={paper} />
            )}

            {/* Resolution Details */}
            {paper.resolution && (
              <div className="px-4 py-4 border-b border-gray-100 bg-blue-50/30">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
                    Resolution
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Final Decision:</span>
                      <span
                        className={cn(
                          "font-medium",
                          paper.resolution.finalDecision === "included"
                            ? "text-green-700"
                            : "text-red-700",
                        )}
                      >
                        {paper.resolution.finalDecision === "included" ? "Included" : "Excluded"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Resolved by:</span>
                      <span className="text-gray-700">{paper.resolution.resolverName}</span>
                    </div>
                    {paper.resolution.resolutionNotes && (
                      <div>
                        <span className="text-gray-500">Notes:</span>
                        <p className="text-gray-700 mt-1">{paper.resolution.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === "checklist" && (
          <SelectionChecklist
            paper={paper as any}
            processId={screeningProcessId!}
            onClose={() => setActiveTab("ai")}
            phase={PaperPhase.FullText}
          />
        )}
      </Tabs>

      {/* Decision Actions — Sticky Bottom */}
      <DecisionBar
        paper={paper}
        onInclude={onInclude}
        onExclude={onExclude}
        isSubmitting={isSubmittingDecision}
        canReview={canReview}
      />
    </div>
  );
}
