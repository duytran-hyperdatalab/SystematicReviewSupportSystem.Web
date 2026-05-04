import type { WorkspaceQAPaper } from "../QualityAssessmentWorkspace";
import AssessmentQueue from "../components/AssessmentQueue";
import AssessmentPaperViewer from "../components/AssessmentPaperViewer";
import ReviewerQAPanel from "../components/ReviewerQAPanel";
import LeaderQAPanel from "../components/LeaderQAPanel";
import { useState, useEffect } from "react";
import type { ReviewerDecisionPayload } from "../components/ReviewerQAPanel";
import type {
  QualityAssessmentStrategy,
  QualityAssessmentResolutionRequest,
  LeaderQAPaperResponse,
  QAPaperResponse,
  AiDecisionResponseItem
} from "../../../../types/qualityAssessment";
import type { HighlightArea } from "@react-pdf-viewer/highlight";

export interface HighlightData {
  areas: HighlightArea[];
  reviewerInitials: string;
  bgColor: string;
}

interface QAPapersTabContentProps {
  papers: WorkspaceQAPaper[];
  strategies: QualityAssessmentStrategy[];
  isLeader: boolean;
  selectedPaper: WorkspaceQAPaper | null | undefined;
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onReviewerSave?: (notes: string | null, decisions: ReviewerDecisionPayload[]) => void;
  onLeaderResolve?: (data: Omit<QualityAssessmentResolutionRequest, "qualityAssessmentProcessId" | "paperId">) => void;
  onAiAnalyze?: (paperId: string) => Promise<AiDecisionResponseItem[]>;
  isSaving?: boolean;
  canEdit?: boolean;
}

export function QAPapersTabContent({
  papers,
  strategies,
  isLeader,
  selectedPaper,
  selectedPaperId,
  setSelectedPaperId,
  searchQuery,
  setSearchQuery,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  onReviewerSave,
  onLeaderResolve,
  onAiAnalyze,
  isSaving,
  canEdit = true
}: QAPapersTabContentProps) {
  const [activeCriterionId, setActiveCriterionId] = useState<string | null>(null);
  const [highlightsByCriterion, setHighlightsByCriterion] = useState<Record<string, HighlightData[]>>({});

  useEffect(() => {
    const firstCriterionId = strategies?.[0]?.checklists?.[0]?.criteria?.[0]?.criterionId || null;
    setActiveCriterionId(firstCriterionId);
    setHighlightsByCriterion({});
    if (selectedPaper) {
      if (!isLeader) {
        const qPaper = selectedPaper as QAPaperResponse;
        const initialHighlights: Record<string, HighlightData[]> = {};
        const myDecision = qPaper.decisions?.[0];
        myDecision?.decisionItems?.forEach(item => {
          if (item.qualityCriterionId && item.pdfHighlightCoordinates) {
            try {
              const pageStrs = item.pdfHighlightCoordinates.split(';');
              const parsedAreas: HighlightArea[][] = pageStrs.filter(Boolean).map(hStr => {
                const [page, x, y, height, width] = hStr.split(',').map(Number);
                return [{ pageIndex: page, top: y, left: x, height, width }];
              });
              initialHighlights[item.qualityCriterionId] = parsedAreas.map((areas: HighlightArea[]) => ({
                areas,
                reviewerInitials: "YOU",
                bgColor: "rgba(245, 158, 11, 0.4)"
              }));
            } catch (e) { }
          }
        });
        setHighlightsByCriterion(initialHighlights);
      } else {
        // Leader loads highlights from all reviewers
        const lPaper = selectedPaper as LeaderQAPaperResponse;
        const initialHighlights: Record<string, HighlightData[]> = {};

        lPaper.decisions?.forEach(decision => {
          const reviewer = lPaper.reviewers?.find(r => r.id === decision.reviewerId);
          const initials = reviewer ? (reviewer.fullname || reviewer.username).substring(0, 2).toUpperCase() : "NA";
          const colorIndex = (decision.reviewerId.charCodeAt(0) % 5);
          const colors = ['rgba(239, 68, 68, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(16, 185, 129, 0.4)', 'rgba(245, 158, 11, 0.4)', 'rgba(139, 92, 246, 0.4)'];
          const bgColor = colors[colorIndex];

          decision.decisionItems?.forEach(item => {
            if (item.qualityCriterionId && item.pdfHighlightCoordinates) {
              try {
                const pageStrs = item.pdfHighlightCoordinates.split(';');
                const areas: HighlightArea[] = pageStrs.filter(Boolean).map(hStr => {
                  const [page, x, y, height, width] = hStr.split(',').map(Number);
                  return { pageIndex: page, top: y, left: x, height, width };
                });

                if (!initialHighlights[item.qualityCriterionId]) {
                  initialHighlights[item.qualityCriterionId] = [];
                }
                // Add each highlight group with reviewer styling
                initialHighlights[item.qualityCriterionId].push({
                  areas,
                  reviewerInitials: initials,
                  bgColor
                });
              } catch (e) { }
            }
          });
        });
        setHighlightsByCriterion(initialHighlights);
      }
    }
  }, [selectedPaperId, selectedPaper, isLeader, strategies]);

  const handleAddHighlight = (areas: HighlightArea[]) => {
    if (!activeCriterionId) {
      return;
    }
    const newHighlightData: HighlightData = {
      areas,
      reviewerInitials: "YOU",
      bgColor: "rgba(255, 255, 0, 0.4)",
    };
    setHighlightsByCriterion(prev => ({
      ...prev,
      [activeCriterionId]: [...(prev[activeCriterionId] || []), newHighlightData]
    }));
  };

  const handleRemoveHighlight = (index: number) => {
    if (!activeCriterionId) return;
    setHighlightsByCriterion(prev => {
      const arr = prev[activeCriterionId] || [];
      return {
        ...prev,
        [activeCriterionId]: arr.filter((_, i) => i !== index)
      };
    });
  };

  const currentHighlights = activeCriterionId ? (highlightsByCriterion[activeCriterionId] || []) : [];

  return (
    <div className="flex flex-1 min-h-0 w-full overflow-hidden bg-white">
      {/* 1. Left Panel: Paper List Queue */}
      <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col bg-gray-50 h-full overflow-hidden">
        <AssessmentQueue
          papers={papers}
          selectedPaperId={selectedPaperId}
          onSelectPaper={setSelectedPaperId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLeader={isLeader}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
        />
      </div>

      {/* 2. Middle Panel: Paper Details Viewer */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-white relative overflow-hidden">
        {selectedPaper ? (
          <div className="h-full overflow-hidden">
            <AssessmentPaperViewer
              paper={selectedPaper}
              highlights={currentHighlights}
              onAddHighlight={handleAddHighlight}
              onRemoveHighlight={handleRemoveHighlight}
              isLeader={isLeader}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500 bg-gray-50 h-full">
            Select a paper from the queue to view its details.
          </div>
        )}
      </div>

      {/* 3. Right Panel: Assessment / Resolution */}
      <div className="w-[380px] shrink-0 border-l border-gray-200 flex flex-col bg-white h-full relative z-10">
        {selectedPaper ? (
          <div className="flex h-full flex-col">
            <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex-1 py-3 text-sm font-medium border-b-2 border-indigo-600 text-indigo-700 text-center">
                {isLeader ? "Conflict Resolution" : "Assessment Criteria"}
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {isLeader ? (
                <LeaderQAPanel
                  paper={selectedPaper as LeaderQAPaperResponse}
                  strategies={strategies}
                  onResolve={onLeaderResolve!}
                  isResolving={isSaving}
                  activeCriterionId={activeCriterionId}
                  onSelectCriterion={setActiveCriterionId}
                  canEdit={canEdit}
                />
              ) : (
                <ReviewerQAPanel
                  paper={selectedPaper as QAPaperResponse}
                  strategies={strategies}
                  onSave={onReviewerSave!}
                  onAiAnalyze={onAiAnalyze}
                  isSaving={isSaving}
                  activeCriterionId={activeCriterionId}
                  onSelectCriterion={setActiveCriterionId}
                  highlightsByCriterion={highlightsByCriterion}
                  canEdit={canEdit}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500 bg-gray-50 p-6 text-center h-full">
            {isLeader ? "Resolution" : "Assessment"} tools will appear here when a paper is selected.
          </div>
        )}
      </div>
    </div>
  );
}