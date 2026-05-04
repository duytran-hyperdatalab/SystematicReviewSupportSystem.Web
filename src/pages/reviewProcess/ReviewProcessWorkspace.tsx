import { useParams } from "react-router";
import { useReviewProcessWorkspace } from "../../hooks/useReviewProcessWorkspace";
import ProcessHeader from "../../components/reviewProcess/ProcessHeader";
import WorkflowTimeline from "../../components/reviewProcess/workflow/WorkflowTimeline";
import ActivityTimeline from "../../components/reviewProcess/ActivityTimeline";
import ContextPanel from "../../components/reviewProcess/ContextPanel";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PrismaReportCard from "../../components/reviewProcess/PrismaReportCard";
import { useState } from "react";
import PaperPoolSelectorModal from "../../components/reviewProcess/modals/PaperPoolSelectorModal";
import StudySelectionCriteriaModal from "../../components/reviewProcess/leader/StudySelectionCriteriaModal";
import QualityAssessmentCriteriaModal from "../../components/reviewProcess/leader/QualityAssessmentCriteriaModal";
import SynthesisStrategyModal from "./synthesisExecution/components/SynthesisStrategyModal";

export default function ReviewProcessWorkspace() {
  const { projectId, processId } = useParams<{ projectId: string; processId: string }>();

  const {
    member,
    process,
    isLoading: processLoading,
    isMemberLoading,
    error,
    workflowPhases,
    activities,
    teamMembers,
    alerts,
    progressStats,
    handleBack,
    handleStartProcess,
    handleCompleteProcess,
    handleOpenPhase,
    handleStartPhase,
    handleCompletePhase,
    handleReopenPhase,
    startLoading,
    completeLoading,
    phaseStartLoadingMap,
    phaseCompleteLoadingMap,
    phaseReopenLoadingMap,
    paperStats,
    isCriteriaModalOpen,
    setIsCriteriaModalOpen,
    isQualityCriteriaModalOpen,
    setIsQualityCriteriaModalOpen,
    isSynthesisStrategyModalOpen,
    setIsSynthesisStrategyModalOpen,
  } = useReviewProcessWorkspace({ projectId, processId });

  const [isAddPapersModalOpen, setIsAddPapersModalOpen] = useState(false);

  const canManagePhaseActions = member?.isLeader === true;

  const isLoading = processLoading || isMemberLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (error || !process) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Process</h2>
          <p className="text-red-600">{error || "Process not found"}</p>
          <Button onClick={handleBack} variant="secondary" className="mt-4">
            Back to Project
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Top Header */}
      <ProcessHeader
        process={process}
        onBack={handleBack}
        onStartProcess={handleStartProcess}
        onCompleteProcess={handleCompleteProcess}
        startLoading={startLoading}
        completeLoading={completeLoading}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 print:px-4">


        {/* PRISMA Report Access */}
        <PrismaReportCard projectId={projectId || ""} processId={processId || ""} />

        {/* Workflow Timeline */}
        <WorkflowTimeline
          phases={workflowPhases}
          paperStats={paperStats}
          onStartPhase={handleStartPhase}
          onCompletePhase={handleCompletePhase}
          onOpenPhase={handleOpenPhase}
          onReopenPhase={handleReopenPhase}
          onAddPapers={() => setIsAddPapersModalOpen(true)}
          canManageActions={canManagePhaseActions}
          startLoadingMap={phaseStartLoadingMap}
          completeLoadingMap={phaseCompleteLoadingMap}
          reopenLoadingMap={phaseReopenLoadingMap}
          disabled={process.statusText === "NotStarted"}
        />

        {/* Paper Pool Selector Modal */}
        {projectId && processId && (
          <PaperPoolSelectorModal
            isOpen={isAddPapersModalOpen}
            onClose={() => setIsAddPapersModalOpen(false)}
            projectId={projectId}
            processId={processId}
            processName={process.name || process.processName || "Review Process"}
          />
        )}

        {/* Bottom Grid: Activity Timeline + Context Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          {/* Activity Timeline - Takes 2/3 of space */}
          <div className="lg:col-span-2">
            <ActivityTimeline activities={activities} />
          </div>

          {/* Right Context Panel - Takes 1/3 of space */}
          <ContextPanel teamMembers={teamMembers} progressStats={progressStats} alerts={alerts} />
        </div>

        {/* Modals */}
        <StudySelectionCriteriaModal
          isOpen={isCriteriaModalOpen}
          onClose={() => setIsCriteriaModalOpen(false)}
          studySelectionProcessId={process.studySelectionProcess?.id || ""}
        />

        <QualityAssessmentCriteriaModal
          isOpen={isQualityCriteriaModalOpen}
          onClose={() => setIsQualityCriteriaModalOpen(false)}
          qualityAssessmentProcessId={process.qualityAssessmentProcess?.id || ""}
          reviewProcessId={processId || ""}
          onApply={() => handleStartPhase("quality")}
        />

        {projectId && process.synthesisProcess?.id ? (
          <SynthesisStrategyModal
            isOpen={isSynthesisStrategyModalOpen}
            projectId={projectId}
            synthesisProcessId={process.synthesisProcess.id}
            onClose={() => setIsSynthesisStrategyModalOpen(false)}
            startAfterSave={false}
          />
        ) : null}
      </div>
    </div>
  );
}
