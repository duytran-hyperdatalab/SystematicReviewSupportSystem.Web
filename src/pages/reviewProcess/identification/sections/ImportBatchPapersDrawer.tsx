// Drawer to view papers from a specific import batch

import { FiFileText, FiDatabase, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import Drawer from "../../../../components/ui/Drawer";
import Button from "../../../../components/ui/Button";
import type { PaperResponse } from "../../../../types/paper";

interface ImportBatchPapersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  papers: PaperResponse[];
  papersLoading: boolean;
  papersError: string | null;
  onRetry: () => void;
}

export default function ImportBatchPapersDrawer({
  isOpen,
  onClose,
  papers,
  papersLoading,
  papersError,
  onRetry,
}: ImportBatchPapersDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FiFileText className="w-5 h-5 text-blue-600" />
          <span>Import Batch Papers</span>
          {!papersLoading && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {papers.length} papers
            </span>
          )}
        </div>
      }
      maxWidth="max-w-3xl"
      side="right"
    >
      {papersLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <span className="ml-3 text-gray-600">Loading papers...</span>
        </div>
      ) : papersError ? (
        <div className="flex flex-col items-center py-12 px-4">
          <FiAlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-red-600 text-sm mb-4">{papersError}</p>
          <Button variant="secondary" onClick={onRetry}>
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : papers.length === 0 ? (
        <div className="flex flex-col items-center py-12 px-4">
          <FiFileText className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">No papers found in this import batch.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {papers.map((paper) => (
            <div key={paper.id} className="py-4 px-2 hover:bg-gray-50 transition-colors rounded-lg">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{paper.title}</h4>
              <p className="text-xs text-gray-600 mb-1">{paper.authors || "Unknown authors"}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {paper.publicationYear && (
                  <span className="font-medium">{paper.publicationYear}</span>
                )}
                {paper.journal && <span>{paper.journal}</span>}
                {paper.doi && (
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    DOI: {paper.doi}
                  </a>
                )}
                {paper.source && (
                  <span className="inline-flex items-center gap-1">
                    <FiDatabase className="w-3 h-3" />
                    {paper.source}
                  </span>
                )}
                {paper.selectionStatusText && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium ${paper.selectionStatusText === "Included"
                        ? "bg-green-100 text-green-700"
                        : paper.selectionStatusText === "Excluded"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {paper.selectionStatusText}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
