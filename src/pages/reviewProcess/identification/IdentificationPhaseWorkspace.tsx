// Main Identification Phase Workspace - Slim Orchestrator
// All logic lives in useIdentificationWorkspace hook; UI sections are separate components.

import { useIdentificationWorkspace } from "./hooks/useIdentificationWorkspace";
import ImportRISModal from "../../../components/identification/modals/ImportRISModal";
import PaperDetailsView from "../../../components/papers/PaperDetailsView";

import IdentificationHeader from "./sections/IdentificationHeader";
import IdentificationCompleteModal from "./sections/IdentificationCompleteModal";
import PrismaSummaryCards from "./sections/PrismaSummaryCards";
import TabNavigation from "./sections/TabNavigation";
import StrategiesTabContent from "./sections/StrategiesTabContent";
import ImportBatchesTabContent from "./sections/ImportBatchesTabContent";
import SearchesTabContent from "./sections/SearchesTabContent";
import PapersLibraryTabContent from "./sections/PapersLibraryTabContent";
import BuildDatasetTabContent from "./sections/BuildDatasetTabContent";
import ImportBatchPapersDrawer from "./sections/ImportBatchPapersDrawer";
import ManualDeduplicationModal from "./sections/ManualDeduplicationModal";

export default function IdentificationPhaseWorkspace() {
  const ws = useIdentificationWorkspace();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <IdentificationHeader
        phaseStatus={ws.phaseStatus}
        listLoading={ws.listLoading}
        statsLoading={ws.statsLoading}
        onNavigateToProject={ws.handleNavigateToProject}
        onBack={ws.handleBack}
        onRefreshData={ws.handleRefreshData}
        onCompletePhase={ws.handleOpenCompleteModal}
        onStartPhase={ws.handleStartPhase}
        onReopenPhase={ws.handleReopenPhase}
      />

      {/* PRISMA Summary Cards + Tab Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <PrismaSummaryCards
          prismaStats={ws.prismaStats}
          statsLoading={ws.statsLoading}
          onTabChange={ws.setActiveTab}
        />

        {/* Tab Container */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <TabNavigation
            activeTab={ws.activeTab}
            onTabChange={ws.setActiveTab}
            searchExecutionCount={ws.searchExecutions.length}
            uniquePapersCount={ws.readyPapersTotalCount}
            hasUniquePapers={ws.readyPapers.length > 0}
          />

          {/* Tab Content */}
          <div className="p-6">
            {ws.activeTab === "strategies" && (
              <StrategiesTabContent
                identificationPhaseId={ws.identificationPhaseId || ""}
                searchExecutions={ws.searchExecutions}
                importBatches={ws.importBatches}
                listLoading={ws.listLoading}
                listError={ws.listError}
                isUploading={ws.isUploading}
                uploadProgress={ws.uploadProgress}
                onRetry={ws.handleRetryLoadStrategies}
                onCreateStrategy={() => ws.setIsCreateStrategyModalOpen(true)}
                onImportToStrategy={ws.handleImportToStrategy}
                onEditStrategy={(id) => {
                  console.log("Edit strategy:", id);
                  // TODO: implement edit
                }}
                onDeleteStrategy={ws.handleDeleteStrategy}
                onViewImportPapers={ws.handleViewImportPapers}
                onDeleteImportBatch={ws.handleDeleteImportBatch}
                onQuickImport={ws.handleQuickImport}
                canEdit={ws.canEdit}
              />
            )}

            {ws.activeTab === "imports" && (
              <ImportBatchesTabContent
                importBatches={ws.importBatches}
                importBatchesLoading={ws.importBatchesLoading}
                importBatchesError={ws.importBatchesError}
                isDragging={ws.isDragging}
                onRetry={ws.handleRetryLoadImportBatches}
                onDragOver={(e) => {
                  e.preventDefault();
                  ws.setIsDragging(true);
                }}
                onDragLeave={() => ws.setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  ws.setIsDragging(false);
                  console.log("Files dropped:", e.dataTransfer.files);
                }}
              />
            )}

            {ws.activeTab === "searches" && (
              <SearchesTabContent searchExecutions={ws.searchExecutions} />
            )}

            {ws.activeTab === "library" && (
              <PapersLibraryTabContent
                readyPapers={ws.readyPapers}
                readyPapersTotalCount={ws.readyPapersTotalCount}
                readyPapersPage={ws.readyPapersPage}
                readyPapersTotalPages={ws.readyPapersTotalPages}
                readyPapersHasNext={ws.readyPapersHasNext}
                readyPapersHasPrev={ws.readyPapersHasPrev}
                readyPapersLoading={ws.readyPapersLoading}
                readyPapersError={ws.readyPapersError}
                librarySearchInput={ws.librarySearchInput}
                yearFilterInput={ws.yearFilterInput}
                searchSourceFilterInput={ws.searchSourceFilterInput}
                onSearchInputChange={ws.setLibrarySearchInput}
                onYearInputChange={ws.setYearFilterInput}
                onSearchSourceInputChange={ws.setSearchSourceFilterInput}
                onSearch={ws.setReadyPapersSearch}
                onYearFilter={ws.setReadyPapersYear}
                onSearchSourceFilter={ws.setReadyPapersSearchSourceId}
                onClearFilters={ws.handleClearLibraryFilters}
                onRefetch={ws.refetchReadyPapers}
                onNextPage={ws.readyPapersNextPage}
                onPreviousPage={ws.readyPapersPrevPage}
                onViewPaper={ws.handleOpenPaperDetails}
                onMarkAsDuplicate={ws.handleOpenManualDedupe}
                onChangeTab={ws.setActiveTab}
                canEdit={ws.canEdit}
              />
            )}

            {ws.activeTab === "dataset" && (
              <BuildDatasetTabContent
                identificationPhaseId={ws.identificationPhaseId || ""}
                canEdit={ws.canEdit}
              />
            )}
          </div>
        </div>
      </div>

      <ImportRISModal
        identificationProcessId={ws.identificationPhaseId || ""}
        isOpen={ws.isImportModalOpen}
        mode={ws.importModalMode}
        preselectedStrategyId={ws.selectedStrategyId}
        availableStrategies={ws.searchExecutions}
        onClose={() => ws.setIsImportModalOpen(false)}
        onSubmit={ws.handleImportSubmit}
        isUploading={ws.isUploading}
        uploadProgress={ws.uploadProgress}
      />

      <IdentificationCompleteModal
        isOpen={ws.isCompleteModalOpen}
        onClose={ws.handleCloseCompleteModal}
        onConfirm={ws.handleConfirmComplete}
        isCompleting={ws.isCompleting}
        identificationPhaseId={ws.identificationPhaseId}
      />

      <ManualDeduplicationModal
        isOpen={ws.isManualDedupeModalOpen}
        onClose={ws.handleCloseManualDedupe}
        sourcePaper={ws.manualDedupeSourcePaper}
        identificationProcessId={ws.identificationPhaseId || ""}
        onConfirm={ws.handleConfirmManualDedupe}
      />

      {/* Drawers */}
      <ImportBatchPapersDrawer
        isOpen={ws.isPapersDrawerOpen}
        onClose={ws.handleClosePapersDrawer}
        papers={ws.importBatchPapers}
        papersLoading={ws.importBatchPapersLoading}
        papersError={ws.importBatchPapersError}
        onRetry={() => ws.refetchImportBatchPapers()}
      />

      <PaperDetailsView
        paper={ws.selectedPaper}
        mode="drawer"
        isOpen={ws.isPaperDetailsOpen}
        onClose={ws.handleClosePaperDetails}
      />
    </div>
  );
}
