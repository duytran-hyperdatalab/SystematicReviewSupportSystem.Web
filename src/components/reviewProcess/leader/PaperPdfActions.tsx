import React, { useState } from "react";
import { FiPaperclip, FiFileText, FiDownload, FiTrash2 } from "react-icons/fi";
import { useSignalRSubscription } from "../../../hooks/useSignalR";
import toast from "react-hot-toast";
import type { MetadataExtractedPayload } from "../../../types/signalr";
import UploadFullTextPdfModal from "../../../pages/reviewProcess/studySelection/components/UploadFullTextPdfModal";
import MetadataSuggestionModal from "../../../pages/reviewProcess/studySelection/components/MetadataSuggestionModal";
import type { PaperDetailsResponse } from "../../../types/paper";
import type { UploadPdfOptions } from "../../../pages/reviewProcess/studySelection/uploadTypes";
import {
  FullTextRetrievalStatus,
  type PaperWithDecisionsResponse,
} from "../../../types/studySelection";
import { cn } from "../../../utils/cn";
import { Modal } from "../../ui/Modal";
import { usePaperDetails } from "../../../hooks/usePaperDetails";

interface PaperPdfActionsProps {
  paper: PaperDetailsResponse;
  onUploadPdf?: (
    paperId: string,
    file: File,
    options?: UploadPdfOptions,
  ) => Promise<PaperWithDecisionsResponse>;
  isUploadingPdf?: boolean;
  onApplyMetadataSuggestion?: (
    paperId: string,
    sourceMetadataId: string,
    fields: string[],
  ) => Promise<void>;
  isApplyingMetadataSuggestion?: boolean;
  onMarkAsNotRetrieved?: (paperId: string) => Promise<void>;
  isMarkingAsNotRetrieved?: boolean;
  pdfRequired?: boolean;
  studySelectionProcessId?: string;
}

const PaperPdfActions: React.FC<PaperPdfActionsProps> = ({
  paper,
  onUploadPdf,
  isUploadingPdf,
  onApplyMetadataSuggestion,
  isApplyingMetadataSuggestion,
  onMarkAsNotRetrieved,
  isMarkingAsNotRetrieved,
  pdfRequired = false,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConfirmNotRetrievedOpen, setIsConfirmNotRetrievedOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<any | null>(null);
  const [hasReceivedSignalRUpdate, setHasReceivedSignalRUpdate] = useState(false);

  const { data: refreshedPaper } = usePaperDetails(
    activeSuggestion || isUploadModalOpen || hasReceivedSignalRUpdate ? paper.id : undefined,
  );
  const displayPaper = refreshedPaper || paper;
  const isAlreadyNotRetrieved =
    paper.fullTextRetrievalStatus === FullTextRetrievalStatus.NotRetrieved;
  const isMarkNotRetrievedDisabled =
    !onMarkAsNotRetrieved || isMarkingAsNotRetrieved || isAlreadyNotRetrieved;

  useSignalRSubscription("OnMetadataExtracted", (payload: MetadataExtractedPayload) => {
    console.log(`[SignalR] Received OnMetadataExtracted for paper: ${payload.paperId}`);
    if (payload.paperId === paper.id) {
      // Immediately trigger detail fetch to ensure comparison is accurate when modal opens
      setHasReceivedSignalRUpdate(true);
      toast(
        (t) => (
          <div className="flex flex-col gap-1 min-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider text-[10px]">
                AI Assistant
              </p>
            </div>
            <div className="mt-1">
              <p className="text-sm font-bold text-slate-800 leading-tight">Metadata extracted</p>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Completed for:{" "}
                <span className="text-slate-700 font-medium italic">"{paper.title}"</span>
              </p>
            </div>
            <button
              onClick={() => {
                setActiveSuggestion(payload.suggestion);
                toast.dismiss(t.id);
              }}
              className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition-all shadow-md active:scale-[0.98]"
            >
              Review & Apply Suggestions
            </button>
          </div>
        ),
        {
          duration: 12000,
          position: "bottom-right",
          style: {
            borderRadius: "24px",
            background: "#fff",
            padding: "20px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          },
        },
      );
    }
  });

  const handleUploadSubmit = async (file: File, options: UploadPdfOptions) => {
    if (!onUploadPdf) return;
    try {
      await onUploadPdf(paper.id, file, options);
      setIsUploadModalOpen(false);
      // Logic for showing suggestions is now handled by SignalR listener
    } catch (error) {
      console.error("Failed to upload PDF:", error);
    }
  };

  const handleApplySuggestion = async (selectedFields: string[]) => {
    if (!onApplyMetadataSuggestion || !activeSuggestion) return;
    try {
      await onApplyMetadataSuggestion(paper.id, activeSuggestion.sourceMetadataId, selectedFields);
      setActiveSuggestion(null);
    } catch (error) {
      console.error("Failed to apply metadata:", error);
    }
  };

  const handleMarkAsNotRetrieved = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMarkNotRetrievedDisabled) return;
    setIsConfirmNotRetrievedOpen(true);
  };

  const handleConfirmMarkAsNotRetrieved = async () => {
    if (!onMarkAsNotRetrieved) return;

    try {
      await onMarkAsNotRetrieved(paper.id);
      setIsConfirmNotRetrievedOpen(false);
      toast.success("Paper marked as not retrieved");
    } catch (error) {
      console.error("Failed to mark paper as not retrieved:", error);
      toast.error("Failed to mark paper as not retrieved");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsUploadModalOpen(true);
        }}
        disabled={!onUploadPdf || isUploadingPdf}
        className={cn(
          "p-1.5 rounded-lg transition-colors border",
          !paper.pdfUrl
            ? "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 hover:text-amber-700 shadow-sm"
            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-transparent hover:border-blue-100",
          (!onUploadPdf || isUploadingPdf) && "opacity-50 cursor-not-allowed",
        )}
        title={
          !paper.pdfUrl && pdfRequired
            ? "PDF Missing - Upload required before assignment"
            : "Attach PDF"
        }
      >
        <FiPaperclip className={cn("w-4 h-4", isUploadingPdf && "animate-spin")} />
      </button>

      {paper.pdfUrl && (
        <>
          <a
            href={paper.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="Open PDF"
          >
            <FiFileText className="w-4 h-4" />
          </a>
          <a
            href={paper.pdfUrl}
            {...((paper as any).pdfFileName ? { download: (paper as any).pdfFileName } : {})}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="Download PDF"
          >
            <FiDownload className="w-4 h-4" />
          </a>
        </>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={handleMarkAsNotRetrieved}
          disabled={isMarkNotRetrievedDisabled}
          className={cn(
            "p-1.5 rounded-lg transition-colors border",
            isAlreadyNotRetrieved
              ? "text-slate-400 bg-slate-100 border-slate-200"
              : "text-gray-500 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-100",
            isMarkNotRetrievedDisabled && "opacity-50 cursor-not-allowed",
          )}
          title={
            isAlreadyNotRetrieved
              ? "Paper is already marked as not retrieved"
              : "Mark paper as not retrieved"
          }
        >
          <FiTrash2 className={cn("w-4 h-4", isMarkingAsNotRetrieved && "animate-spin")} />
        </button>

        {isAlreadyNotRetrieved && (
          <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Marked as Not Retrieved
          </span>
        )}
      </div>

      {isUploadModalOpen && (
        <UploadFullTextPdfModal
          isOpen={isUploadModalOpen}
          isUploading={isUploadingPdf || false}
          paper={{
            title: paper.title,
            authors: paper.authors ?? "",
            doi: paper.doi ?? "",
            abstract: paper.abstract ?? "",
            journal: paper.journal ?? "",
          }}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleUploadSubmit}
        />
      )}

      {activeSuggestion && (
        <MetadataSuggestionModal
          isOpen={!!activeSuggestion}
          isApplying={isApplyingMetadataSuggestion || false}
          currentMetadata={{
            title: displayPaper.title,
            authors: displayPaper.authors ?? "",
            abstract: displayPaper.abstract ?? "",
            doi: displayPaper.doi ?? "",
            journal: displayPaper.journal ?? "",
            volume: displayPaper.volume ?? "",
            issue: displayPaper.issue ?? "",
            pages: displayPaper.pages ?? "",
            keywords: displayPaper.keywords ?? "",
            year: displayPaper.publicationYear,
            issn: displayPaper.journalIssn ?? "",
            eissn: displayPaper.journalEIssn ?? "",
            language: displayPaper.language ?? "",
            md5: displayPaper.md5 ?? "",
            publisher: displayPaper.publisher ?? "",
          }}
          suggestion={activeSuggestion}
          onApply={handleApplySuggestion}
          onClose={() => setActiveSuggestion(null)}
        />
      )}

      <Modal
        isOpen={isConfirmNotRetrievedOpen}
        onClose={() => setIsConfirmNotRetrievedOpen(false)}
        title="Mark as Not Retrieved"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to mark this paper as not retrieved?
          </p>
          <p className="text-xs text-slate-500">
            Title: <span className="font-medium text-slate-700">{paper.title}</span>
          </p>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmNotRetrievedOpen(false)}
              disabled={isMarkingAsNotRetrieved}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmMarkAsNotRetrieved}
              disabled={!onMarkAsNotRetrieved || isMarkingAsNotRetrieved}
              className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {isMarkingAsNotRetrieved ? "Processing..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaperPdfActions;
