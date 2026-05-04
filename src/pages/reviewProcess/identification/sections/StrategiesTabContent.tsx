// Strategies Tab Content: Error state, SearchStrategiesPanel, QuickImportCard

import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import SearchStrategiesPanel from "../../../../components/identification/strategies/SearchStrategiesPanel";
import type { SearchExecutionResponse } from "../../../../types/searchExecution";
import type { ImportBatch } from "../../../../types/identification";

interface StrategiesTabContentProps {
  identificationPhaseId: string;
  searchExecutions: SearchExecutionResponse[];
  importBatches: ImportBatch[];
  listLoading: boolean;
  listError: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onRetry: () => void;
  onCreateStrategy: () => void;
  onImportToStrategy: (strategyId: string) => void;
  onEditStrategy: (id: string) => void;
  onDeleteStrategy: (strategyId: string) => Promise<void>;
  onViewImportPapers: (importBatchId: string) => void;
  onDeleteImportBatch: (importBatchId: string) => Promise<void>;
  onQuickImport: (file: File, source: string, strategyId?: string) => Promise<void>;
  canEdit: boolean;
}

export default function StrategiesTabContent({
  identificationPhaseId,
  searchExecutions,
  importBatches,
  listLoading,
  listError,
  onRetry,
  onCreateStrategy,
  onImportToStrategy,
  onEditStrategy,
  onDeleteStrategy,
  onViewImportPapers,
  onDeleteImportBatch,
  canEdit,
}: StrategiesTabContentProps) {

  return (
    <div className="space-y-8">
      {/* Error State */}
      {listError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 mb-1">
              Failed to load search strategies
            </h3>
            <p className="text-sm text-red-700">{listError}</p>
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <FiRefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* PRIMARY: Search Strategies Panel with nested ImportBatch */}
      <SearchStrategiesPanel
        identificationProcessId={identificationPhaseId}
        strategies={searchExecutions}
        importBatches={importBatches}
        isLoading={listLoading}
        onCreateStrategy={onCreateStrategy}
        onImportToStrategy={onImportToStrategy}
        onEditStrategy={onEditStrategy}
        onDeleteStrategy={onDeleteStrategy}
        onViewImportPapers={onViewImportPapers}
        onDeleteImportBatch={onDeleteImportBatch}
        canEdit={canEdit}
      />


      {/* SECONDARY: Quick Import Card */}
      {/* <QuickImportCard
        identificationProcessId={identificationPhaseId}
        availableStrategies={searchExecutions}
        onImport={onQuickImport}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      /> */}
    </div>
  );
}
