import React from "react";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiUpload,
  FiPlus,
  FiLayers,
  FiArrowDown,
} from "react-icons/fi";
import Button from "../ui/Button";
import PaperTable from "./PaperTable";
import FilterSidebar from "./FilterSidebar";
import SavedFilterDropdown from "./SavedFilterDropdown";
import BulkActionBar from "./BulkActionBar";
import AddToProcessBySelectionModal from "./AddToProcessBySelectionModal";
import AddToProcessByFilterModal from "./AddToProcessByFilterModal";
import ManageFiltersModal from "./ManageFiltersModal";
import PaperViewerModal from "../shared/paper/PaperViewerModal";
import NameFilterModal from "./NameFilterModal";
import ImportRISModal from "../identification/modals/ImportRISModal";
import ReviewProcessRail from "./ReviewProcessRail";
import ReviewProcessPanel from "./ReviewProcessPanel";
import type {
  PaperPoolItem,
  PaperPoolFilters,
  PaperPoolFilterSetting,
  ProcessSnapshot,
  SelectionInsertResult,
  PaperPoolFilterMetadata,
} from "./types";

interface PaperRepositoryPageProps {
  projectId: string;
  // Papers Data
  papers: PaperPoolItem[];
  totalCount: number;
  totalPages: number;
  isLoadingPapers: boolean;
  isFetchingPapers: boolean;

  // Search & Filters
  searchText: string;
  setSearchText: (val: string) => void;
  filters: PaperPoolFilters;
  setFilters: (filters: PaperPoolFilters) => void;
  onResetFilters: () => void;
  isFilterPanelCollapsed: boolean;
  setIsFilterPanelCollapsed: (val: boolean) => void;

  // Selection
  selectedPaperIds: string[];
  setSelectedPaperIds: (ids: string[]) => void;

  // Saved Filters
  savedFilters: PaperPoolFilterSetting[];
  selectedSavedFilterId: string | null;
  onApplySavedFilter: (filter: PaperPoolFilterSetting) => void;
  onSelectSavedFilter: (id: string) => void;
  onDeleteSavedFilter: (id: string) => Promise<void>;
  onSaveCurrentAsFilter: (name: string) => Promise<void>;
  onConfirmSaveFilter: (name: string) => void;
  onOpenSaveModal: () => void;
  onSaveDetailAsNew: (draft: PaperPoolFilterSetting) => Promise<void>;

  // Process Transfer
  processSnapshots: ProcessSnapshot[];
  onAddSelectedToProcess: (processId: string) => Promise<void>;
  onAddFromFilterToProcess: (processId: string, filterId: string) => Promise<void>;
  isAdding: boolean;
  insertResult: SelectionInsertResult | null;
  setInsertResult: (res: SelectionInsertResult | null) => void;
  selectedSavedFilterMatchedCount: number | null;

  // Detail View
  viewerPaper: PaperPoolItem | null;
  setViewerPaper: (paper: PaperPoolItem | null) => void;

  // Modals/UI State
  isManageFiltersOpen: boolean;
  setIsManageFiltersOpen: (val: boolean) => void;
  isNameFilterModalOpen: boolean;
  setIsNameFilterModalOpen: (val: boolean) => void;
  isAddToProcessBySelectionOpen: boolean;
  setIsAddToProcessBySelectionOpen: (val: boolean) => void;
  isAddToProcessByFilterOpen: boolean;
  setIsAddToProcessByFilterOpen: (val: boolean) => void;
  isImportModalOpen: boolean;
  setIsImportModalOpen: (val: boolean) => void;
  isImporting: boolean;
  handleImportSubmit: (file: File, searchSourceId?: string) => Promise<void>;

  // Pagination
  pageNumber: number;
  setPageNumber: (n: number) => void;
  pageSize: number;
  setPageSize: (n: number) => void;

  // Detail Filter State (for management)
  detailFilter: PaperPoolFilterSetting | null;
  isLoadingDetailFilter: boolean;
  onViewFilterDetail: (id: string) => void;
  isCreatingFilter: boolean;
  isDeletingFilter: boolean;
  metadata: PaperPoolFilterMetadata | null;

  // Navigation
  onGoToDeduplication: () => void;
  onNavigateToProcess: (processId: string) => void;
  pendingDuplicatesCount: number;

  // PDF Actions
  onUploadPdf?: any;
  isUploadingPdf?: boolean;
  onApplyMetadataSuggestion?: any;
  isApplyingMetadataSuggestion?: boolean;
  onMarkAsNotRetrieved?: any;
  isMarkingAsNotRetrieved?: boolean;
  onOpenCreateProcessModal: () => void;
}

export default function PaperRepositoryPage({
  projectId,
  papers,
  totalCount,
  totalPages,
  isLoadingPapers,
  isFetchingPapers,
  searchText,
  setSearchText,
  filters,
  setFilters,
  onResetFilters,
  isFilterPanelCollapsed,
  setIsFilterPanelCollapsed,
  selectedPaperIds,
  setSelectedPaperIds,
  savedFilters,
  selectedSavedFilterId,
  onApplySavedFilter,
  onSelectSavedFilter,
  onDeleteSavedFilter,
  onConfirmSaveFilter,
  onOpenSaveModal,
  onSaveDetailAsNew,
  processSnapshots,
  onAddSelectedToProcess,
  onAddFromFilterToProcess,
  isAdding,
  insertResult,
  setInsertResult,
  selectedSavedFilterMatchedCount,
  viewerPaper,
  setViewerPaper,
  isManageFiltersOpen,
  setIsManageFiltersOpen,
  isNameFilterModalOpen,
  setIsNameFilterModalOpen,
  isAddToProcessBySelectionOpen,
  setIsAddToProcessBySelectionOpen,
  isAddToProcessByFilterOpen,
  setIsAddToProcessByFilterOpen,
  isImportModalOpen,
  setIsImportModalOpen,
  isImporting,
  handleImportSubmit,
  pageNumber,
  setPageNumber,
  pageSize,
  setPageSize,
  detailFilter,
  isLoadingDetailFilter,
  onViewFilterDetail,
  isCreatingFilter,
  isDeletingFilter,
  metadata,
  onNavigateToProcess,
  onUploadPdf,
  isUploadingPdf,
  onApplyMetadataSuggestion,
  isApplyingMetadataSuggestion,
  onMarkAsNotRetrieved,
  isMarkingAsNotRetrieved,
  onOpenCreateProcessModal,
}: PaperRepositoryPageProps) {
  const [isReviewRailOpen, setIsReviewRailOpen] = React.useState(false);
  const allPageSelected = papers.length > 0 && papers.every((p) => selectedPaperIds.includes(p.id));

  const handleToggleAllPage = (checked: boolean) => {
    const pageIds = papers.map((p) => p.id);
    if (checked) {
      setSelectedPaperIds(Array.from(new Set([...selectedPaperIds, ...pageIds])));
    } else {
      setSelectedPaperIds(selectedPaperIds.filter((id) => !pageIds.includes(id)));
    }
  };

  const handleTogglePaper = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedPaperIds([...selectedPaperIds, id]);
    } else {
      setSelectedPaperIds(selectedPaperIds.filter((pid) => pid !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-slate-50/30 p-2 rounded-[2.5rem]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
            <FiLayers className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Paper <span className="text-blue-600">Identification</span> Repository
            </h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 max-w-md leading-relaxed">
              Centralized repository of all imported papers. Select and assign papers to review
              processes below.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="h-8 w-px bg-gray-100 mx-1 hidden md:block" />

          {/* Search Box */}
          <div className="relative group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search title, DOI, authors..."
              className="w-64 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-gray-900 transition-all outline-none"
            />
          </div>

          <SavedFilterDropdown
            savedFilters={savedFilters}
            selectedFilterId={selectedSavedFilterId}
            onSelect={onApplySavedFilter}
            onManage={() => setIsManageFiltersOpen(true)}
            onSaveNew={onOpenSaveModal}
            isCreating={isCreatingFilter}
          />

          <Button
            variant="outline"
            className="rounded-xl border-gray-200 hover:border-blue-500 hover:text-blue-600 px-5"
            onClick={() => setIsImportModalOpen(true)}
            isLoading={isImporting}
          >
            <FiUpload className="w-4 h-4 mr-2" />
            Import RIS
          </Button>
        </div>
      </div>

      {/* Main Content: Sidebar + Table */}
      <div className="flex gap-6 items-start">
        <FilterSidebar
          filters={filters}
          availableSources={metadata?.searchSources ?? []}
          availableBatches={metadata?.importBatches ?? []}
          isCollapsed={isFilterPanelCollapsed}
          onToggleCollapse={() => setIsFilterPanelCollapsed(!isFilterPanelCollapsed)}
          onChange={setFilters}
          onReset={onResetFilters}
          onSaveCurrent={onOpenSaveModal}
          onAddToProcess={() => setIsAddToProcessByFilterOpen(true)}
          isSaving={isCreatingFilter}
        />

        <div className="flex-1 min-w-0 space-y-6">
          <PaperTable
            papers={papers}
            isLoading={isLoadingPapers}
            isFetching={isFetchingPapers}
            totalCount={totalCount}
            pageNumber={pageNumber}
            totalPages={totalPages}
            pageSize={pageSize}
            selectedPaperIds={selectedPaperIds}
            allPageSelected={allPageSelected}
            onToggleAllPage={handleToggleAllPage}
            onTogglePaper={handleTogglePaper}
            onViewDetails={setViewerPaper}
            onPageChange={setPageNumber}
            onPageSizeChange={setPageSize}
            onUploadPdf={onUploadPdf}
            isUploadingPdf={isUploadingPdf}
            onApplyMetadataSuggestion={onApplyMetadataSuggestion}
            isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
            onMarkAsNotRetrieved={onMarkAsNotRetrieved}
            isMarkingAsNotRetrieved={isMarkingAsNotRetrieved}
          />
        </div>
      </div>

      {/* Flow Indicator */}
      <div className="flex items-center gap-6 my-4 px-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200" />
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white border border-gray-100 px-6 py-2.5 rounded-full shadow-sm flex items-center gap-3">
            <FiPlus className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Assign papers to review processes
            </span>
            <FiArrowDown className="w-4 h-4 text-blue-500 animate-bounce" />
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200" />
      </div>

      <ReviewProcessPanel
        processes={processSnapshots}
        selectedPaperIds={selectedPaperIds}
        onAddSelected={onAddSelectedToProcess}
        onAddFromFilter={(processId) => {
          if (!selectedSavedFilterId) {
            toast.error("Please select a filter first");
            return;
          }
          onAddFromFilterToProcess(processId, selectedSavedFilterId);
        }}
        onNavigate={onNavigateToProcess}
        onCreateProcess={onOpenCreateProcessModal}
        isAdding={isAdding}
      />

      {/* Overlays / Modals */}
      <BulkActionBar
        selectedCount={selectedPaperIds.length}
        onAddToProcess={() => setIsAddToProcessBySelectionOpen(true)}
        onClear={() => {
          setSelectedPaperIds([]);
          setInsertResult(null);
        }}
        isSubmitting={isAdding}
      />

      <AddToProcessBySelectionModal
        isOpen={isAddToProcessBySelectionOpen}
        onClose={() => {
          setIsAddToProcessBySelectionOpen(false);
          setInsertResult(null);
        }}
        processSnapshots={processSnapshots}
        selectedPaperIds={selectedPaperIds}
        onAddSelected={onAddSelectedToProcess}
        isAdding={isAdding}
        insertResult={insertResult}
        onNavigateToProcess={onNavigateToProcess}
      />

      <AddToProcessByFilterModal
        isOpen={isAddToProcessByFilterOpen}
        onClose={() => {
          setIsAddToProcessByFilterOpen(false);
          setInsertResult(null);
        }}
        processSnapshots={processSnapshots}
        savedFilters={savedFilters}
        onAddFromFilter={onAddFromFilterToProcess}
        isAdding={isAdding}
        insertResult={insertResult}
        selectedSavedFilterId={selectedSavedFilterId}
        selectedSavedFilterMatchedCount={selectedSavedFilterMatchedCount}
        onSelectFilter={onSelectSavedFilter}
        onNavigateToProcess={onNavigateToProcess}
      />

      <ManageFiltersModal
        isOpen={isManageFiltersOpen}
        onClose={() => setIsManageFiltersOpen(false)}
        savedFilters={savedFilters}
        onDelete={onDeleteSavedFilter}
        onSaveAsNew={onSaveDetailAsNew}
        detailFilter={detailFilter}
        isLoadingDetail={isLoadingDetailFilter}
        onViewDetail={onViewFilterDetail}
        isCreating={isCreatingFilter}
        isDeleting={isDeletingFilter}
        metadata={metadata}
      />

      <NameFilterModal
        isOpen={isNameFilterModalOpen}
        onClose={() => setIsNameFilterModalOpen(false)}
        onConfirm={(name) => {
          onConfirmSaveFilter(name);
          setIsNameFilterModalOpen(false);
        }}
        isLoading={isCreatingFilter}
      />

      <PaperViewerModal
        paper={viewerPaper}
        isOpen={!!viewerPaper}
        onClose={() => setViewerPaper(null)}
        onApplyMetadataSuggestion={onApplyMetadataSuggestion}
        isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
      />

      <ReviewProcessRail
        isOpen={isReviewRailOpen}
        onClose={() => setIsReviewRailOpen(false)}
        processSnapshots={processSnapshots}
        selectedCount={selectedPaperIds.length}
        filteredCount={totalCount}
        savedFilterOptions={savedFilters.map((f) => ({ id: f.id, name: f.name }))}
        selectedSavedFilterId={selectedSavedFilterId}
        selectedSavedFilterMatchedCount={selectedSavedFilterMatchedCount}
        selectedProcessId={null} // Controlled by modal or state if needed
        insertResult={insertResult}
        onSelectProcess={() => {}} // Integration logic if rail can select
        onSelectSavedFilter={() => {}}
        onCreateSavedFilterFromCurrent={onOpenSaveModal}
        onAddToSelectedProcess={() => setIsAddToProcessBySelectionOpen(true)}
        onAddAllFilteredToSelectedProcess={() => setIsAddToProcessByFilterOpen(true)}
        onNavigateToProcess={onNavigateToProcess}
        isAdding={isAdding}
      />

      <ImportRISModal
        identificationProcessId={projectId}
        isOpen={isImportModalOpen}
        mode="quick-import"
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleImportSubmit}
        isUploading={isImporting}
        sourceLabel="Search Source"
        sourcePlaceholder="Unspecified source"
        sourceRequiredInQuickImport={false}
        showStrategySelectorInQuickImport={false}
        sourceOptions={[
          ...(metadata?.searchSources ?? []).map((source) => ({
            label: source.name,
            value: source.id,
          })),
        ]}
      />
    </div>
  );
}
