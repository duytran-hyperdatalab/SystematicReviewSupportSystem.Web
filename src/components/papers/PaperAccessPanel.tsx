import React, { memo, useState } from "react";
import {
  FiExternalLink,
  FiFileText,
  FiLock,
  FiUnlock,
  FiDatabase,
  FiClock,
  FiUser,
  FiUpload,
  FiEye,
} from "react-icons/fi";
import type { PaperResponse } from "../../types/paper";
import UploadFullTextPdfModal from "../../pages/reviewProcess/studySelection/components/UploadFullTextPdfModal";

interface PaperAccessPanelProps {
  paper: PaperResponse;
  onUploadPdf?: (paperId: string, file: File, options: Record<string, unknown>) => Promise<void>;
  isUploadingPdf?: boolean;
  onPreviewPdf?: (pdfUrl: string) => void;
}

/**
 * Access & Full Text panel + Import Provenance section.
 * Displays access type, full-text availability, PDF link,
 * and import audit metadata (source, importedAt, importedBy, createdAt).
 */
const PaperAccessPanel: React.FC<PaperAccessPanelProps> = ({
  paper,
  onUploadPdf,
  isUploadingPdf = false,
  onPreviewPdf,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [internalIsUploading, setInternalIsUploading] = useState(false);

  const isUploading = isUploadingPdf || internalIsUploading;
  const hasAccessInfo = paper.fullTextAvailable != null || paper.accessTypeText || paper.pdfUrl;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleUploadSubmit = async (file: File, options: Record<string, unknown>) => {
    if (onUploadPdf) {
      try {
        await onUploadPdf(paper.id, file, options);
        setIsUploadModalOpen(false);
      } catch (error) {
        console.error("Failed to upload PDF", error);
      }
      return;
    }

    // Fallback if no handler provided
    setInternalIsUploading(true);
    try {
      console.log("Upload paper", paper.id, file, options);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setInternalIsUploading(false);
      setIsUploadModalOpen(false);
    }
  };

  return (
    <>
      {/* Access & Full Text Section */}
      {hasAccessInfo && (
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FiFileText className="w-3.5 h-3.5" />
            Access & Full Text
          </h3>
          <div className="bg-gray-50/60 rounded-lg border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Full text availability */}
              {paper.fullTextAvailable != null && (
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      paper.fullTextAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {paper.fullTextAvailable ? (
                      <FiUnlock className="w-3 h-3" />
                    ) : (
                      <FiLock className="w-3 h-3" />
                    )}
                    {paper.fullTextAvailable ? "Full Text Available" : "No Full Text"}
                  </span>
                  {!paper.fullTextAvailable && (
                    <>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-all ml-2"
                        title="Upload PDF"
                      >
                        <FiUpload className="w-3.5 h-3.5" />
                        Upload PDF
                      </button>
                      {isUploadModalOpen && (
                        <UploadFullTextPdfModal
                          isOpen={isUploadModalOpen}
                          onClose={() => setIsUploadModalOpen(false)}
                          // @ts-expect-error Types mismatch due to strict any vs exact UploadPdfOptions
                          onSubmit={handleUploadSubmit}
                          isUploading={isUploading}
                          paper={{
                            title: paper.title,
                            authors: paper.authors ?? null,
                            doi: paper.doi ?? null,
                            abstract: paper.abstract ?? null,
                            journal: paper.journal ?? null,
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Access type */}
              {paper.accessTypeText && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  {paper.accessTypeText}
                </span>
              )}

              {/* PDF link */}
              {paper.pdfUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <FiExternalLink className="w-3 h-3" />
                    Open PDF
                  </a>
                  {onPreviewPdf && (
                    <button
                      onClick={() => onPreviewPdf(paper.pdfUrl!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                      title="Preview PDF"
                    >
                      <FiEye className="w-3 h-3" />
                      Preview
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Import Provenance Section */}
      <section className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FiDatabase className="w-3.5 h-3.5" />
          Import Provenance
        </h3>
        <div className="bg-slate-50/60 rounded-lg border border-slate-100 px-4 py-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {paper.source && (
              <div className="flex items-center gap-2">
                <FiDatabase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wider">
                    Source
                  </p>
                  <p className="text-xs text-gray-700">{paper.source}</p>
                </div>
              </div>
            )}

            {paper.importedAt && (
              <div className="flex items-center gap-2">
                <FiClock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wider">
                    Imported At
                  </p>
                  <p className="text-xs text-gray-700">{formatDate(paper.importedAt)}</p>
                </div>
              </div>
            )}

            {paper.importedBy && (
              <div className="flex items-center gap-2">
                <FiUser className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wider">
                    Imported By
                  </p>
                  <p className="text-xs text-gray-700">{paper.importedBy}</p>
                </div>
              </div>
            )}

            {paper.createdAt && (
              <div className="flex items-center gap-2">
                <FiClock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase text-gray-400 font-medium tracking-wider">
                    Created At
                  </p>
                  <p className="text-xs text-gray-700">{formatDate(paper.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default memo(PaperAccessPanel);
