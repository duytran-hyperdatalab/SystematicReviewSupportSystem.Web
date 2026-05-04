import { useNavigate, useParams } from "react-router-dom";
import { PaperPhase } from "../../../../types/studySelection";
import { useStudySelection } from "./hooks/useStudySelection";
import PaperQueue from "./components/PaperQueue";
import PaperViewer from "../../../../components/shared/paper/PaperViewer";
import AiAnalysisPanel from "./components/AiAnalysisPanel";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import ScreeningHeader from "./components/ScreeningHeader";
import SelectionChecklist from "./components/SelectionChecklist";
import Tabs from "../../../../components/ui/Tabs";
import { FiCpu, FiClipboard, FiList } from "react-icons/fi";
import { useState } from "react";
import { CriteriaTab } from "../../../manage-study-selection/components/CriteriaTab";

export default function TitleAbstractScreeningWorkspace() {
  const ws = useStudySelection();
  const navigate = useNavigate();
  const { projectId, processId, screeningProcessId } = useParams();
  const [activeTab, setActiveTab] = useState("ai");

  const navigateToFullText = () => {
    if (projectId && processId && screeningProcessId) {
      navigate(
        `/projects/${projectId}/processes/${processId}/full-text-screening/${screeningProcessId}`,
      );
    }
  };

  const navigateToTitleAbstract = () => {
    // Already here
  };

  if (ws.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (ws.error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600 text-sm">{ws.error}</p>
        <button onClick={ws.handleBack} className="text-sm text-blue-600 hover:underline">
          Back to Review Process
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Integrated Pipeline Header */}
      <ScreeningHeader
        processName={processId || "Screening Process"}
        stats={ws.stats}
        fullTextStats={ws.fullTextStats}
        onBack={ws.handleBack}
        onNavigateToFullText={navigateToFullText}
        onNavigateToTitleAbstract={navigateToTitleAbstract}
      />

      {/* 3-Column Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel — Paper Queue */}
        <div className="w-80 shrink-0">
          <PaperQueue
            papers={ws.papers}
            selectedPaperId={ws.selectedPaper?.id ?? null}
            pagination={ws.pagination}
            filters={ws.filters}
            onSelectPaper={ws.selectPaper}
            onSearchChange={ws.setSearch}
            onSortChange={ws.setSort}
            onStatusFilterChange={ws.setStatusFilter}
            onPageChange={ws.goToPage}
            onPageSizeChange={ws.setPageSize}
          />
        </div>

        {/* Center Panel — Paper Content Viewer */}
        <div className="flex-1 min-w-0">
          <PaperViewer
            paper={ws.selectedPaper}
            onInclude={ws.includePaper}
            onExclude={ws.excludePaper}
            onUploadPdf={ws.uploadPaperPdf}
            onApplyMetadataSuggestion={ws.applyMetadataSuggestion}
            isSubmitting={ws.isSubmitting}
            isUploadingPdf={ws.isUploadingPdf}
            isApplyingMetadataSuggestion={ws.isApplyingMetadataSuggestion}
            onRetryExtraction={ws.retryMetadataExtraction}
            isRetryingExtraction={ws.isRetryingExtraction}
            phase={PaperPhase.TitleAbstract}
          />
        </div>

        {/* Right Panel — AI Analysis & Checklist */}
        <div className="w-96 shrink-0 border-l border-gray-200 bg-white">
          <Tabs
            className="h-full flex flex-col gap-0"
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
              <AiAnalysisPanel
                paper={ws.selectedPaper}
                aiAnalysis={ws.aiAnalysis}
                isAnalyzing={ws.isAnalyzing}
                onRunAnalysis={ws.runAiAnalysis}
              />
            )}
            {activeTab === "checklist" && (
              <SelectionChecklist 
                paper={ws.selectedPaper} 
                processId={screeningProcessId!} 
                onClose={() => setActiveTab("ai")}
              />
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
