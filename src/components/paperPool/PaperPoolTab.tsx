import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";
import { QUERY_KEYS } from "../../constants/queryKeys";
import type { ReviewProcess } from "../../types/reviewProcess";
import { useDebounce } from "../../hooks/useDebounce";
import { paperImportService } from "../../services/paperImportService";
import {
  useAddPapersFromFilterSetting,
  useAddSelectedPapers,
  useReviewProcessSnapshots,
  useReviewProcessMutations,
} from "../../hooks/useReviewProcesses";
import {
  usePaperPool,
  usePaperPoolFilterSettingDetail,
  usePaperPoolFilterSettings,
  usePaperPoolMetadata,
  useSavedFilterPreviewCount,
} from "../../hooks/usePaperPool";
import { usePaperActions } from "../../hooks/usePaperActions";

import PaperRepositoryPage from "./PaperRepositoryPage";
import DeduplicationPage from "./DeduplicationPage";
import SearchSourcePage from "./SearchSourcePage";
import SnowballingCandidatesPage from "./snowballing/SnowballingCandidatesPage";
import HeroNav from "./HeroNav";
import CreateProcessModal from "../reviewProcess/CreateProcessModal";
import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE } from "./constants";
import type {
  FilterSettingRequest,
  PaperPoolApiResponse,
  PaperPoolFilters,
  PaperPoolFilterSetting,
  PaperPoolItem,
  PaperPoolQueryParams,
  ProcessSnapshot,
  SelectionInsertResult,
} from "./types";

interface PaperPoolTabProps {
  projectId: string;
  reviewProcesses: ReviewProcess[];
}

function parseKeywords(keywords?: string) {
  if (!keywords) return [];
  return keywords
    .split(/[;,|]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function mapPaperFromApi(paper: PaperPoolApiResponse): PaperPoolItem {
  const parsedYear =
    paper.publicationYearInt ??
    (paper.publicationYear ? Number.parseInt(paper.publicationYear, 10) : null);

  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors?.trim() || "Unknown authors",
    year: Number.isNaN(parsedYear) ? null : parsedYear,
    doi: paper.doi || null,
    source: paper.source?.trim() || "Unknown source",
    searchSourceId: paper.searchSourceId || "all",
    importBatchId: "N/A",
    hasFullText: Boolean(paper.fullTextAvailable),
    abstract: paper.abstract?.trim() || "No abstract available.",
    keywords: parseKeywords(paper.keywords),
    pdfUrl: paper.pdfUrl || null,
    fullTextRetrievalStatus: paper.fullTextRetrievalStatus ?? null,
    fullTextRetrievalStatusText: paper.fullTextRetrievalStatusText || null,
  };
}

function mapFiltersForRequest(filters: PaperPoolFilters): FilterSettingRequest["filters"] {
  return {
    keyword: filters.keyword || undefined,
    yearFrom: filters.yearFrom ?? undefined,
    yearTo: filters.yearTo ?? undefined,
    searchSourceId: filters.searchSourceId,
    importBatchId: filters.importBatchId,
    doiState: filters.doiState,
    fullTextState: filters.fullTextState,
    onlyUnused: filters.onlyUnused,
    recentlyImported: filters.recentlyImported,
  };
}

function buildPaperQuery(
  searchText: string,
  filters: PaperPoolFilters,
  pageNumber: number,
  pageSize: number,
): PaperPoolQueryParams {
  return {
    searchText: searchText || undefined,
    keyword: filters.keyword || undefined,
    yearFrom: filters.yearFrom ?? undefined,
    yearTo: filters.yearTo ?? undefined,
    searchSourceId: filters.searchSourceId,
    importBatchId: filters.importBatchId,
    doiState: filters.doiState,
    fullTextState: filters.fullTextState,
    onlyUnused: filters.onlyUnused,
    recentlyImported: filters.recentlyImported,
    pageNumber,
    pageSize,
  };
}

function mapReviewProcessesToSnapshots(reviewProcesses: ReviewProcess[]): ProcessSnapshot[] {
  return reviewProcesses.map((process) => {
    const progressPercent =
      process.statusText === "Completed"
        ? 100
        : process.statusText === "InProgress"
          ? Math.max(15, Math.min(95, Math.round((((process.currentPhase ?? 0) + 1) / 7) * 100)))
          : 0;

    return {
      processId: process.id || process.processId || "",
      processName: process.name?.trim() || process.processName?.trim() || "Untitled review process",
      statusText: process.statusText,
      progressPercent,
      existingPaperIds: [],
      totalPapers: process.totalPapersImported ?? 0,
      totalIncludedPapers: process.totalIncludedPapers ?? 0,
      totalExcludedPapers: process.totalExcludedPapers ?? 0,
    };
  });
}

export default function PaperPoolTab({ projectId, reviewProcesses }: PaperPoolTabProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("subtab") as "library" | "deduplication" | "sources" | "snowballing") || "library";
  const setActiveTab = (tab: "library" | "deduplication" | "sources" | "snowballing") => {
    setSearchParams((prev) => {
      prev.set("subtab", tab);
      return prev;
    }, { replace: true });
  };
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [viewerPaper, setViewerPaper] = useState<PaperPoolItem | null>(null);
  const [insertResult, setInsertResult] = useState<SelectionInsertResult | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSavedFilterId, setSelectedSavedFilterId] = useState<string | null>(null);
  const [detailFilterId, setDetailFilterId] = useState<string | null>(null);
  const [processSnapshots, setProcessSnapshots] = useState<ProcessSnapshot[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isManageFiltersOpen, setIsManageFiltersOpen] = useState(false);
  const [isNameFilterModalOpen, setIsNameFilterModalOpen] = useState(false);
  const [isAddToProcessBySelectionOpen, setIsAddToProcessBySelectionOpen] = useState(false);
  const [isAddToProcessByFilterOpen, setIsAddToProcessByFilterOpen] = useState(false);
  const [isFilterPanelCollapsed, setIsFilterPanelCollapsed] = useState(false);
  const [isCreateProcessModalOpen, setIsCreateProcessModalOpen] = useState(false);

  const {
    uploadPaperPdf,
    isUploadingPdf,
    applyMetadataSuggestion,
    isApplyingMetadataSuggestion,
    markPaperAsNotRetrieved,
    isMarkingAsNotRetrieved,
  } = usePaperActions();

  const debouncedSearch = useDebounce(searchText.trim(), 250);
  const isYearRangeValid =
    filters.yearFrom === null || filters.yearTo === null || filters.yearFrom <= filters.yearTo;

  // --- Hooks ---
  const activePaperQuery = useMemo(
    () => buildPaperQuery(debouncedSearch, filters, pageNumber, pageSize),
    [debouncedSearch, filters, pageNumber, pageSize],
  );

  const {
    papersPage,
    isLoading: isLoadingPapers,
    isFetching: isFetchingPapers,
  } = usePaperPool(projectId, activePaperQuery, { enabled: isYearRangeValid });

  const { metadata } = usePaperPoolMetadata(projectId);

  const {
    savedFilters,
    createFilterSetting,
    deleteFilterSetting,
    isCreating: isCreatingFilter,
    isDeleting: isDeletingFilter,
  } = usePaperPoolFilterSettings(projectId);

  const { filterDetail: detailFilter, isLoading: isLoadingDetailFilter } =
    usePaperPoolFilterSettingDetail(projectId, detailFilterId);

  const { snapshots: reviewProcessSnapshotsFromApi } = useReviewProcessSnapshots(projectId);
  const { addSelectedPapers } = useAddSelectedPapers();
  const { addPapersFromFilterSetting } = useAddPapersFromFilterSetting();
  const { createReviewProcess, isCreating: isCreatingProcess } = useReviewProcessMutations();

  const selectedSavedFilter = useMemo(
    () => savedFilters.find((setting) => setting.id === selectedSavedFilterId) ?? null,
    [savedFilters, selectedSavedFilterId],
  );

  const selectedSavedFilterQuery = useMemo(
    () =>
      selectedSavedFilter
        ? buildPaperQuery(selectedSavedFilter.searchText || "", selectedSavedFilter.filters, 1, 1)
        : null,
    [selectedSavedFilter],
  );

  const { totalCount: selectedSavedFilterMatchedCount } = useSavedFilterPreviewCount(
    projectId,
    selectedSavedFilterId,
    selectedSavedFilterQuery,
  );

  // --- Mapped Data ---
  const papers = useMemo(() => (papersPage?.items ?? []).map(mapPaperFromApi), [papersPage?.items]);
  const totalCount = papersPage?.totalCount ?? 0;
  const totalPages = papersPage?.totalPages ?? 1;

  // --- Effects ---
  useEffect(() => {
    if (reviewProcessSnapshotsFromApi.length > 0) {
      setProcessSnapshots(
        reviewProcessSnapshotsFromApi.map(
          (snapshot): ProcessSnapshot => ({
            processId: snapshot.processId || snapshot.id || "",
            processName: snapshot.processName || snapshot.name || "Untitled process",
            statusText: snapshot.statusText as ProcessSnapshot["statusText"],
            progressPercent: snapshot.progressPercent ?? 0,
            existingPaperIds: [],
            totalPapers: snapshot.totalPapersImported ?? 0,
            totalIncludedPapers: snapshot.totalIncludedPapers ?? 0,
            totalExcludedPapers: snapshot.totalExcludedPapers ?? 0,
          }),
        ),
      );
    } else if (reviewProcesses.length > 0) {
      setProcessSnapshots(mapReviewProcessesToSnapshots(reviewProcesses));
    }
  }, [reviewProcessSnapshotsFromApi, reviewProcesses]);

  useEffect(() => {
    if (!papersPage) return;
    if (papersPage.pageNumber !== pageNumber) setPageNumber(papersPage.pageNumber);
    if (papersPage.pageSize !== pageSize) setPageSize(papersPage.pageSize);
  }, [pageNumber, pageSize, papersPage]);

  // --- Handlers ---
  const handleNavigateToProcess = (processId: string) => {
    navigate(`/projects/${projectId}/processes/${processId}`);
  };

  const persistFilterSetting = async (filterName: string) => {
    const payload: FilterSettingRequest = {
      name: filterName,
      searchText: searchText.trim() || undefined,
      filters: mapFiltersForRequest(filters),
    };
    const created = await createFilterSetting(payload);
    setSelectedSavedFilterId(created.id);
    toast.success("Saved filter created");
    return created;
  };

  const handleSaveCurrentAsFilter = async (name: string) => {
    await persistFilterSetting(name);
  };

  const handleSaveDetailAsNew = async (draft: PaperPoolFilterSetting) => {
    const payload: FilterSettingRequest = {
      name: draft.name,
      searchText: (draft.searchText ?? "").trim() || undefined,
      filters: mapFiltersForRequest(draft.filters),
    };
    const created = await createFilterSetting(payload);
    setSelectedSavedFilterId(created.id);
    toast.success("Saved filter created");
    setIsManageFiltersOpen(false);
  };

  const handleApplySavedFilter = (setting: PaperPoolFilterSetting) => {
    setSelectedSavedFilterId(setting.id);
    setSearchText(setting.searchText || "");
    setFilters({
      ...DEFAULT_FILTERS,
      ...setting.filters,
      keyword: setting.filters.keyword || "",
      yearFrom: setting.filters.yearFrom ?? null,
      yearTo: setting.filters.yearTo ?? null,
    });
    setPageNumber(1);
  };

  const handleDeleteSavedFilter = async (settingId: string) => {
    if (!window.confirm("Delete this saved filter?")) return;
    await deleteFilterSetting(settingId);
    setSelectedSavedFilterId((prev) => (prev === settingId ? null : prev));
    toast.success("Saved filter deleted");
  };

  const handleAddSelectedToProcess = async (processId: string) => {
    if (selectedPaperIds.length === 0) return;
    setIsAdding(true);
    setInsertResult(null);
    try {
      const result = await addSelectedPapers({
        reviewProcessId: processId,
        data: { paperIds: selectedPaperIds },
      });
      setInsertResult({
        inserted: result.inserted,
        skippedAsDuplicate: result.skippedAsDuplicate,
      });
      setSelectedPaperIds([]);
      // Update local progress snapshot if possible
      if (result.reviewProcessSnapshot) {
        setProcessSnapshots((prev) =>
          prev.map((p) =>
            p.processId === processId
              ? { ...p, progressPercent: result.reviewProcessSnapshot.progressPercent }
              : p,
          ),
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add papers");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddFromFilterToProcess = async (processId: string, filterId: string) => {
    setIsAdding(true);
    setInsertResult(null);
    try {
      const result = await addPapersFromFilterSetting({
        processId,
        data: { filterSettingId: filterId },
      });
      setInsertResult({
        inserted: result.inserted,
        skippedAsDuplicate: result.skippedAsDuplicate,
      });
      if (result.processSnapshot) {
        setProcessSnapshots((prev) =>
          prev.map((p) =>
            p.processId === processId
              ? { ...p, progressPercent: result.processSnapshot.progressPercent }
              : p,
          ),
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add papers from filter");
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateProcess = async (data: any) => {
    try {
      await createReviewProcess({ projectId, data });
      setIsCreateProcessModalOpen(false);
      toast.success("Review process created successfully");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleImportSubmit = async (file: File, searchSourceId?: string) => {
    try {
      setIsImporting(true);
      const result = await paperImportService.importRisFile({
        file,
        projectId,
        searchSourceId: searchSourceId || undefined,
      });

      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.paperPool.papers(projectId).slice(0, 3),
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paperPool.metadata(projectId) });

      if (result.data) {
        const { importedRecords, duplicateRecords, updatedRecords, skippedRecords } = result.data;
        toast.success(
          `${result.message} (Imported: ${importedRecords}, Duplicates: ${duplicateRecords}, Updated: ${updatedRecords}, Skipped: ${skippedRecords})`,
        );
      } else {
        toast.success(result.message || "RIS file imported successfully.");
      }
      setIsImportModalOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import RIS file.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <HeroNav activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "library" ? (
        <>
          <PaperRepositoryPage
            projectId={projectId}
            papers={papers}
            totalCount={totalCount}
            totalPages={totalPages}
            isLoadingPapers={isLoadingPapers}
            isFetchingPapers={isFetchingPapers}
            searchText={searchText}
            setSearchText={(val) => {
              setSearchText(val);
              setPageNumber(1);
            }}
            filters={filters}
            setFilters={(f) => {
              setFilters(f);
              setPageNumber(1);
            }}
            onResetFilters={() => {
              setFilters(DEFAULT_FILTERS);
              setPageNumber(1);
            }}
            isFilterPanelCollapsed={isFilterPanelCollapsed}
            setIsFilterPanelCollapsed={setIsFilterPanelCollapsed}
            selectedPaperIds={selectedPaperIds}
            setSelectedPaperIds={setSelectedPaperIds}
            savedFilters={savedFilters}
            selectedSavedFilterId={selectedSavedFilterId}
            onApplySavedFilter={handleApplySavedFilter}
            onSelectSavedFilter={setSelectedSavedFilterId}
            onDeleteSavedFilter={handleDeleteSavedFilter}
            onSaveCurrentAsFilter={handleSaveCurrentAsFilter}
            onSaveDetailAsNew={handleSaveDetailAsNew}
            processSnapshots={processSnapshots}
            onAddSelectedToProcess={handleAddSelectedToProcess}
            onAddFromFilterToProcess={handleAddFromFilterToProcess}
            isAdding={isAdding}
            insertResult={insertResult}
            setInsertResult={setInsertResult}
            selectedSavedFilterMatchedCount={selectedSavedFilterMatchedCount}
            viewerPaper={viewerPaper}
            setViewerPaper={setViewerPaper}
            isManageFiltersOpen={isManageFiltersOpen}
            setIsManageFiltersOpen={setIsManageFiltersOpen}
            isNameFilterModalOpen={isNameFilterModalOpen}
            setIsNameFilterModalOpen={setIsNameFilterModalOpen}
            isAddToProcessBySelectionOpen={isAddToProcessBySelectionOpen}
            setIsAddToProcessBySelectionOpen={setIsAddToProcessBySelectionOpen}
            isAddToProcessByFilterOpen={isAddToProcessByFilterOpen}
            setIsAddToProcessByFilterOpen={setIsAddToProcessByFilterOpen}
            isImportModalOpen={isImportModalOpen}
            setIsImportModalOpen={setIsImportModalOpen}
            isImporting={isImporting}
            handleImportSubmit={handleImportSubmit}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            pageSize={pageSize}
            setPageSize={setPageSize}
            detailFilter={detailFilter}
            isLoadingDetailFilter={isLoadingDetailFilter}
            onViewFilterDetail={setDetailFilterId}
            isCreatingFilter={isCreatingFilter}
            isDeletingFilter={isDeletingFilter}
            metadata={metadata ?? null}
            onGoToDeduplication={() => setActiveTab("deduplication")}
            onNavigateToProcess={handleNavigateToProcess}
            pendingDuplicatesCount={0}
            onConfirmSaveFilter={handleSaveCurrentAsFilter}
            onOpenSaveModal={() => setIsNameFilterModalOpen(true)}
            // PDF Actions
            onUploadPdf={uploadPaperPdf}
            isUploadingPdf={isUploadingPdf}
            onApplyMetadataSuggestion={applyMetadataSuggestion}
            isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
            onMarkAsNotRetrieved={markPaperAsNotRetrieved}
            isMarkingAsNotRetrieved={isMarkingAsNotRetrieved}
            onOpenCreateProcessModal={() => setIsCreateProcessModalOpen(true)}
          />

          <CreateProcessModal
            isOpen={isCreateProcessModalOpen}
            onClose={() => setIsCreateProcessModalOpen(false)}
            onSubmit={handleCreateProcess}
            isLoading={isCreatingProcess}
          />
        </>
      ) : activeTab === "snowballing" ? (
        <SnowballingCandidatesPage projectId={projectId} />
      ) : activeTab === "deduplication" ? (
        <DeduplicationPage projectId={projectId} />
      ) : (
        <SearchSourcePage projectId={projectId} />
      )}
    </div>
  );
}
