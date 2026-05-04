// PRISMA Summary Cards: Records Imported, Duplicates, After Deduplication

import { FiDatabase, FiFilter, FiCheck, FiRefreshCw, FiSearch } from "react-icons/fi";
import type { TabType } from "../types";
import type { PrismaStatistics } from "../../../../types/identification";

interface PrismaSummaryCardsProps {
  prismaStats: PrismaStatistics;
  statsLoading: boolean;
  onTabChange: (tab: TabType) => void;
}

export default function PrismaSummaryCards({
  prismaStats,
  statsLoading,
  onTabChange,
}: PrismaSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Records Imported */}
      <button
        onClick={() => onTabChange("imports")}
        className="bg-linear-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6 text-left hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <FiDatabase className="w-6 h-6 text-indigo-600" />
          {statsLoading && <FiRefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {statsLoading ? (
            <span className="text-gray-400">--</span>
          ) : (
            prismaStats.totalRecordsImported.toLocaleString()
          )}
        </div>
        <div className="text-sm text-gray-700 font-medium">Records Imported</div>
        <div className="text-xs text-gray-600 mt-1">From all batches</div>
      </button>

      {/* Pending Selections */}
      <button
        onClick={() => onTabChange("library")}
        className="bg-linear-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 text-left hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <FiSearch className="w-6 h-6 text-yellow-600" />
          {prismaStats.pendingSelectionCount > 0 && (
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {prismaStats.pendingSelectionCount}
        </div>
        <div className="text-sm text-gray-700 font-medium">Pending Selections</div>
        <div className="text-xs text-gray-600 mt-1">Ready for select</div>
      </button>

      {/* After Deduplication - Key Success Metric */}
      <button
        onClick={() => onTabChange("dataset")}
        className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6 text-left hover:shadow-lg transition-shadow shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <FiFilter className="w-6 h-6 text-green-600" />
          <FiCheck className="w-5 h-5 text-green-600" />
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {statsLoading ? (
            <span className="text-gray-400">--</span>
          ) : (
            prismaStats.uniqueRecords.toLocaleString()
          )}
        </div>
        <div className="text-sm text-green-800 font-semibold">After Deduplication</div>
        <div className="text-xs text-green-700 mt-1">Records using for screening phase</div>
      </button>
    </div>
  );
}
