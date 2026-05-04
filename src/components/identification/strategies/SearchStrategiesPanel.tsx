// Search Strategies Panel - PRIMARY ENTRY PATH (with nested ImportBatch)
import { useState } from "react";
import {
  FiPlus,
  FiDatabase,
  FiUpload,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiFile,
  FiX,
} from "react-icons/fi";
import Button from "../../ui/Button";
import type { SearchExecution, ImportBatch } from "../../../types/identification";

interface SearchStrategiesPanelProps {
  identificationProcessId: string;
  strategies: SearchExecution[];
  importBatches: ImportBatch[]; // All import batches for filtering
  isLoading: boolean;
  onCreateStrategy: () => void;
  onImportToStrategy: (strategyId: string) => void;
  onEditStrategy: (strategyId: string) => void;
  onDeleteStrategy: (strategyId: string) => void;
  onViewImportPapers: (importBatchId: string) => void;
  onDeleteImportBatch?: (importBatchId: string) => void;
  canEdit: boolean;
}


export default function SearchStrategiesPanel({
  strategies,
  importBatches,
  isLoading,
  onCreateStrategy,
  onImportToStrategy,
  onEditStrategy,
  onDeleteStrategy,
  onViewImportPapers,
  onDeleteImportBatch,
  canEdit,
}: SearchStrategiesPanelProps) {

  const [expandedStrategyIds, setExpandedStrategyIds] = useState<Set<string>>(new Set());

  const toggleExpand = (strategyId: string) => {
    setExpandedStrategyIds((prev) => {
      const next = new Set(prev);
      if (next.has(strategyId)) {
        next.delete(strategyId);
      } else {
        next.add(strategyId);
      }
      return next;
    });
  };

  const getImportBatchesForStrategy = (strategyId: string) => {
    return importBatches.filter((batch) => batch.searchExecutionId === strategyId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Primary CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Search Strategies</h2>
          <p className="text-sm text-gray-600 mt-1">
            Define search strategies and import papers into them
          </p>
        </div>
        <Button
          onClick={onCreateStrategy}
          className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md flex items-center gap-2"
          size="lg"
          disabled={!canEdit}
        >
          <FiPlus className="w-5 h-5" />
          Create Search Strategy
          {canEdit && (
            <span className="ml-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-semibold">
              Recommended
            </span>
          )}
        </Button>

      </div>

      {/* Strategies Accordion List */}
      {strategies.length > 0 ? (
        <div className="space-y-4">
          {strategies.map((strategy) => {
            const strategyBatches = getImportBatchesForStrategy(strategy.id);
            const isExpanded = expandedStrategyIds.has(strategy.id);
            const hasImports = strategyBatches.length > 0;

            return (
              <div
                key={strategy.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                {/* SearchExecution Header (Always Visible) */}
                <div className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    {/* Left: Expand Toggle + Strategy Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleExpand(strategy.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <FiChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <FiChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                      </button>

                      <div className="flex-1">
                        <span className="text-xs text-slate-400 font-bold">ID: {strategy.id}</span>
                        <div className="flex items-center gap-3 mb-1">
                          <FiDatabase className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-gray-900">{strategy.searchSource}</h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {formatDate(strategy.executedAt)}
                          </span>
                          {strategy.resultCount > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              {strategy.resultCount.toLocaleString()} results
                            </span>
                          )}
                        </div>

                        {/* Query Display */}
                        <div className="text-sm text-gray-600">
                          {strategy.searchQuery ? (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-700">Query:</span>
                              <span className="flex-1 truncate" title={strategy.searchQuery}>
                                {strategy.searchQuery}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Query not specified</span>
                          )}
                        </div>

                        {/* Import Batch Count Badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <FiFileText className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {strategy.importBatchCount}{" "}
                            {strategy.importBatchCount === 1 ? "Import Batch" : "Import Batches"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onImportToStrategy(strategy.id)}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                        disabled={!canEdit}
                      >
                        <FiUpload className="w-4 h-4" />
                        Import RIS
                      </Button>
                      <button
                        onClick={() => onEditStrategy(strategy.id)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit Strategy"
                        disabled={!canEdit}
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStrategy(strategy.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Strategy"
                        disabled={hasImports || !canEdit}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Nested ImportBatch List (Expandable) */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {hasImports ? (
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Import Batches ({strategy.importBatchCount})
                        </h4>
                        <div className="space-y-2">
                          {strategyBatches.map((batch) => (
                            <div
                              key={batch.id}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <FiFile className="w-4 h-4 text-blue-600" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 text-sm">
                                        {batch.fileName}
                                      </span>
                                      {batch.fileType && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                          {batch.fileType.toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                                      <span>{batch.totalRecords.toLocaleString()} records</span>
                                      <span>
                                        Imported: {formatDate(batch.importedAt)} at{" "}
                                        {formatTime(batch.importedAt)}
                                      </span>
                                      <span>By: {batch.importedBy}</span>
                                    </div>
                                  </div>
                                </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() => onViewImportPapers(batch.id)}
                                      variant="secondary"
                                      size="sm"
                                      className="flex items-center gap-1"
                                    >
                                      <FiEye className="w-3 h-3" />
                                      View Papers
                                    </Button>
                                    {onDeleteImportBatch && (
                                      <button
                                        onClick={() => onDeleteImportBatch(batch.id)}
                                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete Import Batch"
                                        disabled={!canEdit}
                                      >
                                        <FiX className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <FiUpload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-3">No imports yet</p>
                        <Button
                          onClick={() => onImportToStrategy(strategy.id)}
                          size="sm"
                          variant="secondary"
                          className="flex items-center gap-2 mx-auto"
                        >
                          <FiUpload className="w-4 h-4" />
                          Import RIS to this strategy
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyStrategiesState onCreateStrategy={onCreateStrategy} canEdit={canEdit} />

      )}
    </div>
  );
}

// Empty State Component
function EmptyStrategiesState({
  onCreateStrategy,
  canEdit,
}: {
  onCreateStrategy: () => void;
  canEdit: boolean;
}) {

  return (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12">
      <div className="text-center max-w-lg mx-auto">
        <FiDatabase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Create Your First Search Strategy
        </h3>
        <p className="text-gray-600 mb-6">
          Search strategies document your literature search process. Define your sources and queries
          before importing papers to maintain a clear audit trail for your systematic review.
        </p>
        <Button
          onClick={onCreateStrategy}
          size="lg"
          className="bg-linear-to-r from-blue-600 to-blue-700"
          disabled={!canEdit}
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Create Search Strategy
        </Button>

        <p className="text-sm text-gray-500 mt-4">
          Or use{" "}
          <a href="#quick-import" className="text-blue-600 hover:underline">
            Quick Import
          </a>{" "}
          below to import papers without a predefined strategy
        </p>
      </div>
    </div>
  );
}
