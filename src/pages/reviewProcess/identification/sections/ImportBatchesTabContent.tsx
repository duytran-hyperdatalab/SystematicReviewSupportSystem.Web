// Import Batches Tab Content

import {
  FiUpload,
  FiRefreshCw,
  FiAlertCircle,
  FiFileText,
  FiDatabase,
  FiCheck,
  FiEye,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";
import Button from "../../../../components/ui/Button";
import type { ImportBatch } from "../../../../types/identification";
import { formatRelativeTime } from "../../../../utils/dateFormat";

interface ImportBatchesTabContentProps {
  importBatches: ImportBatch[];
  importBatchesLoading: boolean;
  importBatchesError: string | null;
  isDragging: boolean;
  onRetry: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export default function ImportBatchesTabContent({
  importBatches,
  importBatchesLoading,
  importBatchesError,
  isDragging,
  onRetry,
  onDragOver,
  onDragLeave,
  onDrop,
}: ImportBatchesTabContentProps) {
  if (importBatchesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading import batches...</p>
        </div>
      </div>
    );
  }

  if (importBatchesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-1">Failed to load import batches</h3>
          <p className="text-sm text-red-700">{importBatchesError}</p>
          <button
            onClick={onRetry}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <FiRefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Upload Zone or Filter Bar */}
      {importBatches.length === 0 ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 mb-6 transition-all ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="text-center">
            <FiUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload RIS File to Begin</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Import bibliographic records from PubMed, IEEE Xplore, ACM Digital Library, and other
              databases. Drag and drop your RIS file here, or click to browse.
            </p>
            <Button size="lg" className="text-base px-8">
              <FiUpload className="w-5 h-5 mr-2" />
              Select RIS File
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Supported formats: <span className="font-medium">.ris, .bib, .csv, .xml</span>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option>All Sources</option>
              <option>PubMed</option>
              <option>IEEE Xplore</option>
              <option>ACM Digital Library</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option>All Statuses</option>
              <option>Completed</option>
              <option>Processing</option>
              <option>Failed</option>
            </select>
          </div>
        </div>
      )}

      {/* Import Batches Table */}
      {importBatches.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  File Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Source Database
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Imported By
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                  Import Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Records</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {importBatches.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{batch.fileName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <FiDatabase className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{batch.source}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {batch.importedBy || "System"}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {formatRelativeTime(batch.importedAt)}
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {batch.totalRecords.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Total records</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <FiCheck className="w-3 h-3" />
                        Completed
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Download"
                      >
                        <FiDownload className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
