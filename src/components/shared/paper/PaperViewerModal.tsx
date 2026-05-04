import { useState } from "react";
import Modal from "../../ui/Modal";
import PaperViewer from "./PaperViewer";
import MetadataSuggestionModal from "../../../pages/reviewProcess/studySelection/components/MetadataSuggestionModal";
import type { PaperPoolItem } from "../../paperPool/types";
import type { ScreeningPaper } from "../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import { usePaperDetails } from "../../../hooks/usePaperDetails";
import type { PaperDetailsResponse } from "../../../types/paper";
import { Loader2, Sparkles } from "lucide-react";

interface PaperViewerModalProps {
  paper: PaperPoolItem | null;
  isOpen: boolean;
  onClose: () => void;
  /**
   * Optional callback to apply metadata suggestions.
   * If not provided, suggestions will still be visible but cannot be applied.
   */
  onApplyMetadataSuggestion?: (
    paperId: string,
    sourceMetadataId: string,
    fields: string[],
  ) => Promise<void>;
  isApplyingMetadataSuggestion?: boolean;
}

/**
 * Adapter to convert a PaperPoolItem (list data) to the ScreeningPaper format
 * required by the PaperViewer component.
 */
function adaptPaperPoolItemToScreening(paper: PaperPoolItem | null): ScreeningPaper | null {
  if (!paper) return null;
  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors || null,
    doi: paper.doi || null,
    publicationYear: paper.year,
    publicationDate: null,
    abstract: paper.abstract || null,
    journal: null,
    source: paper.source || null,
    keywords: paper.keywords?.join(", ") || null,
    publicationType: null,
    volume: null,
    issue: null,
    pages: null,
    publisher: null,
    language: null,
    url: null,
    pdfUrl: null,
    pdfFileName: null,
    conferenceName: null,
    conferenceLocation: null,
    journalIssn: null,
    journalEIssn: null,
    md5: null,
    referenceCount: 0,
    citationCount: 0,
    screeningStatus: "pending",
    finalDecision: null,
    finalDecisionText: null,
    decisions: [],
    extraction: null,
    metadataSources: null,
    extractionResult: null,
    extractionSuggestion: null,
    resolution: null,
  };
}

/**
 * Adapter to convert full PaperDetailsResponse (detailed data) to the 
 * ScreeningPaper format required by the PaperViewer component.
 */
function adaptPaperDetailsToScreening(paper: PaperDetailsResponse | null): ScreeningPaper | null {
  if (!paper) return null;
  return {
    id: paper.id,
    title: paper.title,
    authors: paper.authors || null,
    doi: paper.doi || null,
    publicationYear:
      paper.publicationYearInt || (paper.publicationYear ? parseInt(paper.publicationYear) : null),
    publicationDate: paper.publicationDate || null,
    abstract: paper.abstract || null,
    journal: paper.journal || null,
    source: paper.source || null,
    keywords: paper.keywords || null,
    publicationType: paper.publicationType || null,
    volume: paper.volume || null,
    issue: paper.issue || null,
    pages: paper.pages || null,
    publisher: paper.publisher || null,
    language: paper.language || null,
    url: paper.url || null,
    pdfUrl: paper.pdfUrl || null,
    pdfFileName: null,
    conferenceName: paper.conferenceName || null,
    conferenceLocation: paper.conferenceLocation || null,
    journalIssn: paper.journalIssn || null,
    journalEIssn: paper.journalEIssn || null,
    md5: paper.md5 || null,
    referenceCount: 0,
    citationCount: 0,
    screeningStatus: "pending",
    finalDecision: null,
    finalDecisionText: null,
    decisions: [],
    extraction: null,
    metadataSources: null,
    extractionResult: null,
    extractionSuggestion: paper.extractionSuggestion
      ? {
          ...paper.extractionSuggestion,
          year: paper.extractionSuggestion.year ?? null,
        }
      : null,
    resolution: null,
  };
}

/**
 * A comprehensive Paper Viewer Modal.
 * Reuses the rich PaperViewer component while fetching full metadata.
 */
export default function PaperViewerModal({
  paper,
  isOpen,
  onClose,
  onApplyMetadataSuggestion,
  isApplyingMetadataSuggestion,
}: PaperViewerModalProps) {
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  // Use the details hook to fetch full metadata when modal is open
  const { data: detailedPaper, isLoading } = usePaperDetails(isOpen ? paper?.id : undefined);

  // Use detailed data if available, otherwise fall back to the list item data
  const adaptedPaper = detailedPaper
    ? adaptPaperDetailsToScreening(detailedPaper)
    : adaptPaperPoolItemToScreening(paper);

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
        <div className="relative -mx-8 -mb-8 -mt-2 w-[calc(100%+4rem)] overflow-hidden rounded-b-[2rem]">
          {/* Suggestion Alert Bar */}
          {suggestion && (
            <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50 px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">
                  AI Metadata Suggestions Available
                </p>
              </div>
              <button
                onClick={() => setIsSuggestionModalOpen(true)}
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-700 active:scale-95"
              >
                View & Apply
              </button>
            </div>
          )}

          <div className="h-[80vh] overflow-hidden bg-slate-50">
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-white shadow-2xl flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Synchronizing Metadata...</p>
                </div>
              </div>
            )}

            <PaperViewer 
              paper={adaptedPaper} 
              isLeaderView={true} 
              hideActions={true} 
            />
          </div>
        </div>
      </Modal>

      {/* Shared Suggestion Modal */}
      {suggestion && detailedPaper && (
        <MetadataSuggestionModal
          isOpen={isSuggestionModalOpen}
          isApplying={isApplyingMetadataSuggestion || false}
          currentMetadata={{
            title: detailedPaper.title,
            authors: detailedPaper.authors ?? "",
            abstract: detailedPaper.abstract ?? "",
            doi: detailedPaper.doi ?? "",
            journal: detailedPaper.journal ?? "",
            volume: detailedPaper.volume ?? "",
            issue: detailedPaper.issue ?? "",
            pages: detailedPaper.pages ?? "",
            keywords: detailedPaper.keywords ?? "",
            year: detailedPaper.publicationYear?.toString(),
            publishedDate: detailedPaper.publicationDate ?? "",
            issn: detailedPaper.journalIssn ?? "",
            eissn: detailedPaper.journalEIssn ?? "",
            language: detailedPaper.language ?? "",
            md5: detailedPaper.md5 ?? "",
            publisher:detailedPaper.publisher
          }}
          suggestion={{
            ...suggestion,
            year: suggestion.year ?? null,
          } as any}
          onApply={handleApplySuggestion}
          onClose={() => setIsSuggestionModalOpen(false)}
        />
      )}
    </>
  );
}
