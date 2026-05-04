// Searches (Strategy Documentation) Tab Content

import {
  FiSearch,
  FiFileText,
  FiDatabase,
  FiCopy,
  FiCheck,
  FiEye,
  FiRefreshCw,
  FiDownload,
  FiMoreVertical,
} from "react-icons/fi";
import Button from "../../../../components/ui/Button";

import type { SearchExecutionResponse } from "../../../../types/searchExecution";
import { SearchExecutionType } from "../../../../types/identification";
import { formatRelativeTime } from "../../../../utils/dateFormat";
import EmptyState from "../../../../components/ui/EmptyState";

interface SearchesTabContentProps {
  searchExecutions: SearchExecutionResponse[];
}

export default function SearchesTabContent({ searchExecutions }: SearchesTabContentProps) {
  return (
    <div>
      {/* Info Banner */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <FiFileText className="w-5 h-5 text-gray-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Search Strategy Documentation</h4>
            <p className="text-sm text-gray-600">
              This section is for documenting your literature search strategies for audit and
              reporting purposes. Records are imported via RIS files in the Import Batches tab.
            </p>
          </div>
        </div>
      </div>

      {/* Minimal Toolbar - Documentation Focus */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter documented searches..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[300px]"
            />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
            <option>All Databases</option>
            <option>PubMed</option>
            <option>IEEE Xplore</option>
            <option>ACM Digital Library</option>
          </select>
        </div>
        <Button variant="secondary" size="sm" className="flex items-center gap-2">
          <FiFileText className="w-4 h-4" />
          Document Search Strategy
        </Button>
      </div>

      {searchExecutions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Source</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Query Summary
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Executed Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Results</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Type</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {searchExecutions.map((search) => (
                <tr
                  key={search.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FiDatabase className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">{search.searchSource}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="max-w-md">
                      <p
                        className="text-sm text-gray-700 truncate"
                        title={search.searchQuery || ""}
                      >
                        {search.searchQuery}
                      </p>
                      <button className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1">
                        <FiCopy className="w-3 h-3" />
                        Copy query
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {formatRelativeTime(search.executedAt)}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-lg font-semibold text-green-600">
                      {search.resultCount}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700`}
                    >
                      <FiCheck className="w-3 h-3" />
                      {search.type === SearchExecutionType.DatabaseSearch
                        ? "Database Search"
                        : "Manual Import"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <FiRefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <FiMoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<FiFileText className="w-16 h-16 text-gray-300" />}
          title="No Search Strategy Documented Yet"
          description="Document your literature search strategies here for audit and reporting purposes. This is primarily for tracking metadata, not executing live searches."
          actionLabel="Document Search Strategy"
          onAction={() => console.log("Add search strategy")}
        />
      )}
    </div>
  );
}
