import { useState, type FC } from "react";
import Modal from "../../ui/Modal";
import PaperViewer from "../../shared/paper/PaperViewer";
import MetadataSuggestionModal from "../../../pages/reviewProcess/studySelection/components/MetadataSuggestionModal";
import type { PaperResponse } from "../../../types/paper";
import type {
  ScreeningPaper,
  ScreeningStatus,
  ScreeningDecision,
} from "../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import type { UploadPdfOptions } from "../../../pages/reviewProcess/studySelection/uploadTypes";
import type { PaperWithDecisionsResponse } from "../../../types/studySelection";
import { PaperPhase } from "../../../types/studySelection";

import { usePaperDetails } from "../../../hooks/useStudySelection";
import { Loader2, Sparkles } from "lucide-react";

interface PaperViewerModalProps {
  paper: PaperResponse | null;
  studySelectionProcessId?: string;
  isOpen: boolean;
  onClose: () => void;
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
  onRetryExtraction?: (paperId: string) => Promise<void>;
  isRetryingExtraction?: boolean;
  onResolveConflict?: (paperId: string, decision: ScreeningDecision, notes?: string) => void;
  isResolving?: boolean;
  isSubmitting?: boolean;
  phase?: PaperPhase;
}

/**
 * A simple adapter to satisfy PaperViewer's ScreeningPaper requirement.
 * We primarily need basic metadata; decisions and screeningStatus are less critical in the leader "View Details" mode.
 */
function adaptPaperToScreening(paper: PaperResponse | null): ScreeningPaper | null {
  if (!paper) return null;

  // Attempt to map selectionStatusText to ScreeningStatus
  let status: ScreeningStatus = "pending";
  const st = paper.selectionStatusText?.toLowerCase();
  if (st === "included") status = "included";
  else if (st === "excluded") status = "excluded";
  else if (st === "conflict" || st === "conflicted") status = "conflicted";

  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors ?? null,
    doi: paper.doi ?? null,
    publicationYear:
      typeof paper.publicationYear === "number"
        ? paper.publicationYear
        : paper.publicationYear
          ? parseInt(paper.publicationYear, 10)
          : null,
    publicationDate: paper.publicationDate ?? null,
    abstract: paper.abstract ?? null,
    journal: paper.journal ?? null,
    source: paper.source ?? null,
    keywords: paper.keywords ?? null,
    publicationType: paper.publicationType ?? null,
    volume: paper.volume ?? null,
    issue: paper.issue ?? null,
    pages: paper.pages ?? null,
    publisher: paper.publisher ?? null,
    language: paper.language ?? null,
    url: paper.url ?? null,
    pdfUrl: paper.pdfUrl ?? null,
    pdfFileName: (paper as any).pdfFileName ?? null,
    conferenceName: paper.conferenceName ?? null,
    conferenceLocation: paper.conferenceLocation ?? null,
    journalIssn: paper.journalIssn ?? null,
    journalEIssn: (paper as any).journalEIssn ?? null,
    md5: (paper as any).md5 ?? null,
    referenceCount: (paper as any).referenceCount ?? 0,
    citationCount: (paper as any).citationCount ?? 0,

    // Screening-specific (mocking/adapting)
    screeningStatus: status,
    finalDecision: null,
    finalDecisionText: null,
    decisions: (paper.assignedReviewers ?? []).map((r) => ({
      id: `${r.id}-${paper.id}`,
      reviewerId: r.id,
      reviewerName: r.name,
      decision: "included", // Mocking - not used with hideActions=true
      reason: null,
      exclusionReasonCode: null,
      exclusionReasonName: null,
      decidedAt: new Date().toISOString(),
    })),
    extraction: null,
    metadataSources: null,
    extractionResult: null,
    extractionSuggestion: null,
    resolution: null,
  };
}

const PaperViewerModal: FC<PaperViewerModalProps> = ({
  paper,
  studySelectionProcessId,
  isOpen,
  onClose,
  onUploadPdf,
  isUploadingPdf,
  onApplyMetadataSuggestion,
  isApplyingMetadataSuggestion,
  onRetryExtraction,
  isRetryingExtraction,
  isSubmitting,
  phase = PaperPhase.TitleAbstract,
}) => {
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  // Use the details hook to fetch full metadata when modal is open
  const { paper: detailedPaper, isLoading } = usePaperDetails(
    studySelectionProcessId,
    isOpen ? paper?.id : undefined,
  );

  const adaptedPaper = detailedPaper || adaptPaperToScreening(paper);
  const suggestion = detailedPaper?.extractionSuggestion;

  const handleApplySuggestion = async (selectedFields: string[]) => {
    if (!onApplyMetadataSuggestion || !suggestion || !paper) return;
    try {
      await onApplyMetadataSuggestion(paper.id, suggestion.sourceMetadataId, selectedFields);
      setIsSuggestionModalOpen(false);
    } catch (error) {
      console.error("Failed to apply metadata suggestion:", error);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Paper Details"
        description={paper?.title || "Viewing detailed information"}
        size="xl"
      >
        <div className="relative -mx-8 -mb-8 -mt-2 w-[calc(100%+4rem)] overflow-hidden rounded-b-3xl">
          {/* Suggestion Alert Bar */}
          {suggestion && (
            <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50 px-6 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <p className="text-xs font-semibold text-indigo-900">
                  GROBID has extracted new metadata suggestions for this paper.
                </p>
              </div>
              <button
                onClick={() => setIsSuggestionModalOpen(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
              >
                View & Apply Changes
              </button>
            </div>
          )}

          <div className="h-[80vh] overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                  <p className="text-sm font-medium text-gray-500">Fetching full details...</p>
                </div>
              </div>
            )}

            <PaperViewer
              paper={adaptedPaper}
              onUploadPdf={onUploadPdf}
              isUploadingPdf={isUploadingPdf}
              onApplyMetadataSuggestion={onApplyMetadataSuggestion}
              isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
              onRetryExtraction={onRetryExtraction}
              isRetryingExtraction={isRetryingExtraction}
              isSubmitting={isSubmitting}
              isLeaderView={true}
              onInclude={function (): void {
                throw new Error("Function not implemented.");
              }}
              onExclude={function (): void {
                throw new Error("Function not implemented.");
              }}
              phase={phase}
            />
          </div>
        </div>
      </Modal>

      {/* Shared Suggestion Modal */}
      {suggestion && paper && (
        <MetadataSuggestionModal
          isOpen={isSuggestionModalOpen}
          isApplying={isApplyingMetadataSuggestion || false}
          currentMetadata={{
            title: paper.title,
            authors: paper.authors ?? "",
            abstract: (paper as any).abstract ?? "",
            doi: paper.doi ?? "",
            journal: paper.journal ?? "",
            volume: (paper as any).volume ?? "",
            issue: (paper as any).issue ?? "",
            pages: (paper as any).pages ?? "",
            keywords: (paper as any).keywords ?? "",
            year: paper.publicationYear?.toString(),
            publishedDate: paper.publicationDate ?? "",
            issn: (paper as any).journalIssn ?? "",
            eissn: (paper as any).journalEIssn ?? "",
            language: (paper as any).language ?? "",
            md5: (paper as any).md5 ?? "",
            publisher: (paper as any).publisher ?? "",
          }}
          suggestion={suggestion}
          onApply={handleApplySuggestion}
          onClose={() => setIsSuggestionModalOpen(false)}
        />
      )}
    </>
  );
};

export default PaperViewerModal;
