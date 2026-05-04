import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQualityAssessment } from "./hooks/useQualityAssessment";
import { QAHeader } from "./sections/QAHeader";
import { AssignMembersTabContent } from "./sections/AssignMembersTabContent";
import { QAPapersTabContent } from "./sections/QAPapersTabContent";
import { QAAssignModal } from "./components/QAAssignModal";
import { QAAutoResolveModal } from "./components/QAAutoResolveModal";
import { ReviewerProgressPanel } from "./components/ReviewerProgressPanel";
import { useProject, useProjectMembers } from "../../../hooks/useProjects";
import type { QAPaperResponse, LeaderQAPaperResponse, QualityAssessmentResolutionRequest } from "../../../types/qualityAssessment";
import { ProjectRole } from "../../../types/project";
import type { ReviewerDecisionPayload } from "./components/ReviewerQAPanel";

export type WorkspaceQAPaper = QAPaperResponse | LeaderQAPaperResponse;

const dummyStats = {
  total: 0,
  completed: 0,
  inProgress: 0,
  notStarted: 0,
  pending: 0,
  completionPercentage: 0,
};

export default function QualityAssessmentWorkspace() {
  const navigate = useNavigate();
  const { projectId, processId, qualityAssessmentId } = useParams();

  const [viewMode, setViewMode] = useState<"list" | "edit">("list");
  const [assignPopupPaperId, setAssignPopupPaperId] = useState<string | null>(null);
  const [isAutoResolveOpen, setIsAutoResolveOpen] = useState(false);

  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [qaPage, setQaPage] = useState(1);

  const { project } = useProject(projectId);

  const { members: projectMembers } = useProjectMembers(projectId);
  // TODO: casi role nay co phai isLeader ko wtf :)?
  const members = projectMembers?.filter(m => m.role !== ProjectRole.Leader) || [];

  const {
    assignedPapers,
    allPapers,
    leaderStats,
    memberStats,
    memberProgresses,
    totalPagesList,
    totalItemsList,
    strategies,
    isAssigning,
    isSubmittingDecisions,
    isUpdatingDecisions,
    isSubmittingResolution,
    isUpdatingResolution,
    isAutoResolving,
    phaseStatus,
    assign,
    submitDecisions,
    updateDecisions,
    submitResolution,
    updateResolution,
    autoResolve,
    aiDecision,
    exportExcel
  } = useQualityAssessment(qualityAssessmentId, project?.isLeader, {
    pageNumber: qaPage,
    pageSize: 10,
    search: searchQuery || undefined
  });

  const canEdit = phaseStatus !== "Completed" && phaseStatus !== "Cancelled";

  const totalCriteria = useMemo(() => {
    return strategies.reduce((acc, strategy) => {
      return acc + strategy.checklists.reduce((acc2, checklist) => {
        return acc2 + checklist.criteria.length;
      }, 0);
    }, 0);
  }, [strategies]);

  const activePapers = useMemo(() => {
    const rawPapers = project?.isLeader ? allPapers : assignedPapers;
    // Apply different ordering depending on role
    return [...rawPapers].sort((a, b) => {
      // Helper to compute group priority for a paper
      const getPriority = (paper: typeof a) => {
        const res = paper.resolution;
        const pct = paper.completionPercentage ?? 0;

        // Both leader and reviewer now return the same resolution object
        if (res && typeof res.finalDecision === "number") {
          if (res.finalDecision === 1) return 4; // HighQuality
          if (res.finalDecision === 0) return 5; // LowQuality
        }

        if (project?.isLeader) {
          // Leader: completed on top, then ongoing, pending, highQuality, LowQuality
          if (pct === 100) return 0; // completed
          if (pct > 0 && pct < 100) return 1; // ongoing
          return 2; // pending (pct === 0)
        } else {
          // Reviewer: ongoing, pending, completed, highQuality, LowQuality
          if (pct > 0 && pct < 100) return 0; // ongoing
          if (pct === 0) return 1; // pending
          if (pct === 100) return 2; // completed
          return 3;
        }
      };

      const pa = getPriority(a);
      const pb = getPriority(b);

      if (pa !== pb) return pa - pb;

      // Tie-breaker within same group: prefer higher completion percentage, then title
      const pctDiff = (b.completionPercentage ?? 0) - (a.completionPercentage ?? 0);
      if (pctDiff !== 0) return pctDiff;
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [project?.isLeader, assignedPapers, allPapers]);

  const selectedPaper = useMemo(
    () => activePapers.find((p) => p.paperId === selectedPaperId) ?? null,
    [activePapers, selectedPaperId]
  );

  const stats = useMemo(() => {
    if (project?.isLeader && leaderStats) {
      const completed = leaderStats.completedPapers ?? 0;
      const total = leaderStats.totalPapers ?? 0;
      return {
        ...dummyStats,
        total,
        completed,
        inProgress: leaderStats.inProgressPapers ?? 0,
        notStarted: leaderStats.notStartedPapers ?? 0,
        pending: total - completed,
        completionPercentage: leaderStats.completionPercentage ?? 0,
      };
    } else if (!project?.isLeader && memberStats) {
      const completed = memberStats.completedPapers ?? 0;
      const total = memberStats.totalPapers ?? 0;
      return {
        ...dummyStats,
        total,
        completed,
        inProgress: memberStats.inProgressPapers ?? 0,
        notStarted: memberStats.notStartedPapers ?? 0,
        pending: total - completed,
        completionPercentage: memberStats.completionPercentage ?? 0,
      };
    }

    if (!activePapers.length) return dummyStats;
    const total = activePapers.length;
    const completed = activePapers.filter(p => p.completionPercentage === 100).length;
    const inProgress = activePapers.filter(p => p.completionPercentage > 0 && p.completionPercentage < 100).length;
    const notStarted = activePapers.filter(p => p.completionPercentage === 0).length;

    return {
      ...dummyStats,
      total,
      completed,
      inProgress,
      notStarted,
      pending: total - completed,
      completionPercentage: Math.round((completed / total) * 100) || 0,
    };
  }, [activePapers, leaderStats, memberStats, project?.isLeader]);

  const openEditSpace = (paperId: string) => {
    setSelectedPaperId(paperId);
    setViewMode("edit");
  };

  const closeEditSpace = () => {
    setViewMode("list");
  };

  const handleAssignClick = (e: React.MouseEvent, paperId: string) => {
    e.stopPropagation();
    setAssignPopupPaperId(paperId);
  };

  const handleBack = () => {
    navigate(`/projects/${projectId}/processes/${processId}`);
  };

  const handleSaveAssignments = (selectedUserIds: string[]) => {
    if (assignPopupPaperId && qualityAssessmentId) {
      // Ensure we don't overwrite/remove previously assigned users if the backend fully replaces the array
      const allUserIdsToAssign = Array.from(new Set([...assignedUserIds, ...selectedUserIds]));

      assign({
        qualityAssessmentProcessId: qualityAssessmentId,
        paperIds: [assignPopupPaperId],
        userIds: allUserIdsToAssign,
      });
      setAssignPopupPaperId(null);
    }
  };

  const currentAssignPaper = activePapers.find(p => p.paperId === assignPopupPaperId) as LeaderQAPaperResponse | undefined;
  const assignedUserIds = currentAssignPaper?.reviewers?.map(r => r.id) || [];

  const handleReviewerSave = (notes: string | null, decisionitems: ReviewerDecisionPayload[]) => {
    if (selectedPaperId && qualityAssessmentId) {
      const sp = selectedPaper as QAPaperResponse;
      const myDecision = sp?.decisions?.[0]; // Get current decision record

      if (myDecision?.id) {
        updateDecisions({
          id: myDecision.id,
          notes,
          decisionItems: decisionitems.map(item => ({
            id: item.itemId || null,
            qualityCriterionId: item.criterionId,
            value: item.value,
            comment: item.comment,
            pdfHighlightCoordinates: item.pdfHighlightCoordinates
          }))
        });
      } else {
        submitDecisions({
          paperId: selectedPaperId,
          qualityAssessmentProcessId: qualityAssessmentId,
          notes,
          decisionItems: decisionitems.map(item => ({
            qualityCriterionId: item.criterionId,
            value: item.value,
            comment: item.comment,
            pdfHighlightCoordinates: item.pdfHighlightCoordinates
          }))
        });
      }
    }
  };

  const handleLeaderResolve = (data: Omit<QualityAssessmentResolutionRequest, "qualityAssessmentProcessId" | "paperId">) => {
    if (selectedPaperId && qualityAssessmentId) {
      const sp = selectedPaper as LeaderQAPaperResponse;
      if (sp?.resolution?.id) {
        updateResolution({
          id: sp.resolution.id,
          finalDecision: data.finalDecision,
          finalScore: data.finalScore,
          resolutionNotes: data.resolutionNotes
        });
      } else {
        submitResolution({
          qualityAssessmentProcessId: qualityAssessmentId,
          paperId: selectedPaperId,
          ...data
        });
      }
    }
  };

  const handleAiAnalyze = async (paperId: string) => {
    if (!qualityAssessmentId) return [];
    try {
      const result = await aiDecision({
        paperId: paperId,
      });
      return result.data ?? [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const handleAutoResolve = async (data: { score?: number | null; percentage?: number | null }) => {
    if (!qualityAssessmentId) return;
    try {
      await autoResolve({
        qualityAssessmentProcessId: qualityAssessmentId,
        score: data.score,
        percentage: data.percentage,
      });
      setIsAutoResolveOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50 relative">
      <QAHeader
        onBack={viewMode === "edit" ? closeEditSpace : handleBack}
        stats={stats}
        onExport={project?.isLeader ? exportExcel : undefined}
        isLeader={project?.isLeader}
        rightControls={
          project?.isLeader && canEdit && (
            <button
              onClick={() => setIsAutoResolveOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Auto-Resolve
            </button>
          )
        }
      />

      {viewMode === "list" ? (
        <main className="flex-1 overflow-auto p-6 space-y-6 mx-auto w-full max-w-[1600px]">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Quality Assessment Overview</h1>
            <p className="text-sm text-slate-500">
              Manage quality assessments, assign reviewers, and monitor team progress.
            </p>
          </div>
          
          <div className={project?.isLeader && memberProgresses.length > 0 ? "grid grid-cols-1 lg:grid-cols-4 gap-6" : "block"}>
            <div className={project?.isLeader && memberProgresses.length > 0 ? "col-span-1 lg:col-span-3" : "w-full"}>
              <AssignMembersTabContent
                papers={activePapers}
                isLeader={project?.isLeader}
                onPaperClick={openEditSpace}
                onAssignClick={handleAssignClick}
                searchQuery={searchQuery}
                onSearchChange={(q) => { setSearchQuery(q); setQaPage(1); }}
                currentPage={qaPage}
                totalPages={totalPagesList ?? 1}
                totalItems={totalItemsList ?? 0}
                onPageChange={setQaPage}
              />
            </div>

            {project?.isLeader && memberProgresses.length > 0 && (
              <div className="col-span-1">
                <ReviewerProgressPanel reviewerProgresses={memberProgresses} />
              </div>
            )}
          </div>
        </main>
      ) : (
        <main className="flex-1 min-h-0 flex flex-col pt-0 w-full overflow-hidden bg-white">
          <QAPapersTabContent
            papers={activePapers}
            strategies={strategies}
            isLeader={project?.isLeader ?? false}
            selectedPaper={selectedPaper}
            selectedPaperId={selectedPaperId}
            setSelectedPaperId={setSelectedPaperId}
            searchQuery={searchQuery}
            setSearchQuery={(q) => { setSearchQuery(q); setQaPage(1); }}
            currentPage={qaPage}
            totalPages={totalPagesList ?? 1}
            totalItems={totalItemsList ?? 0}
            onPageChange={setQaPage}
            onReviewerSave={handleReviewerSave}
            onLeaderResolve={handleLeaderResolve}
            onAiAnalyze={handleAiAnalyze}
            isSaving={isSubmittingDecisions || isUpdatingDecisions || isSubmittingResolution || isUpdatingResolution}
          />
        </main>
      )}

      {/* Assignment Popup Modal */}
      <QAAssignModal
        isOpen={!!assignPopupPaperId}
        onClose={() => setAssignPopupPaperId(null)}
        onAssign={(userIds) => handleSaveAssignments(userIds)}
        members={members}
        assignedUserIds={assignedUserIds}
        isAssigning={isAssigning}
      />
      {/* Auto Resolve Modal */}
      {isAutoResolveOpen && (
        <QAAutoResolveModal
          isOpen={isAutoResolveOpen}
          onClose={() => setIsAutoResolveOpen(false)}
          onConfirm={handleAutoResolve}
          isSubmitting={isAutoResolving}
          totalCriteria={totalCriteria}
        />
      )}
    </div>
  );
}
