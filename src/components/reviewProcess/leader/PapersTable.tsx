import React, { useState } from "react";
import { Modal } from "../../ui/Modal";

import { Eye } from "lucide-react";
import Button from "../../ui/Button";
import PaperViewerModal from "./PaperViewerModal";
import type { PaperResponse } from "../../../types/paper";
import type { ScreeningDecision } from "../../../pages/reviewProcess/studySelection/titleAbstractScreening/types";
import type { UploadPdfOptions } from "../../../pages/reviewProcess/studySelection/uploadTypes";
import type { PaperWithDecisionsResponse, PaperPhase } from "../../../types/studySelection";
import PaperPdfActions from "./PaperPdfActions";
import { useReviewerDecisions } from "../../../hooks/useStudySelection";
import { Loader2, Check, X } from "lucide-react";
import { useReviewerSubmission } from "../../../hooks/useStudySelectionChecklistSubmission";
import { PreviewDocument } from "../../ui/document-editor/PreviewDocument";

interface PaperRowProps {
  paper: PaperResponse;
  isSelected: boolean;
  onSelect: (id: string) => void;
  // Functionality props for Detail Modal
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
  onRetryExtraction?: (paperId: string) => Promise<void>;
  isRetryingExtraction?: boolean;
  onResolveConflict?: (paperId: string, decision: ScreeningDecision, notes?: string) => void;
  isResolving?: boolean;
  isSubmitting?: boolean;
  studySelectionProcessId?: string;
  showPdfActions?: boolean;
  pdfRequired?: boolean;
  selectionMode?: "quick" | "assignment";
  phase?: PaperPhase;
}

export const PaperRow: React.FC<PaperRowProps> = ({
  paper,
  isSelected,
  onSelect,
  onUploadPdf,
  isUploadingPdf,
  onApplyMetadataSuggestion,
  isApplyingMetadataSuggestion,
  onMarkAsNotRetrieved,
  isMarkingAsNotRetrieved,
  onRetryExtraction,
  isRetryingExtraction,
  onResolveConflict,
  isResolving,
  isSubmitting,
  studySelectionProcessId,
  showPdfActions = false,
  pdfRequired = false,
  selectionMode = "assignment",
  phase = 0,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [submissionParams, setSubmissionParams] = useState<{
    processId: string;
    paperId: string;
    reviewerId: string;
    phase: number;
  } | null>(null);

  const { data: submissionResponse, isLoading: isLoadingSubmission } =
    useReviewerSubmission(submissionParams);

  const submission = submissionResponse?.data;

  const { data: reviewerDecisions, isLoading: isLoadingReviewers } = useReviewerDecisions(
    studySelectionProcessId,
    paper.id,
    phase,
  );

  const reviewers = paper.assignedReviewers || [];

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors group cursor-default ${paper.assignmentStatusText === "Assigned" ? "bg-gray-50/50" : ""}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          disabled={
            !!(
              paper.assignmentStatusText === "Assigned" ||
              (paper.decidedStatus && paper.decidedStatus !== "None") ||
              (selectionMode === "assignment" && pdfRequired && !paper.pdfUrl)
            )
          }
          onChange={() => onSelect(paper.id)}
          title={
            paper.decidedStatus && paper.decidedStatus !== "None"
              ? "This paper already has a final decision"
              : paper.assignmentStatusText === "Assigned"
                ? "This paper is already assigned"
                : selectionMode === "assignment" && pdfRequired && !paper.pdfUrl
                  ? "PDF is required for assignment in Full-Text phase"
                  : "Select paper"
          }
          className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
            !!(
              paper.assignmentStatusText === "Assigned" ||
              (paper.decidedStatus && paper.decidedStatus !== "None") ||
              (selectionMode === "assignment" && pdfRequired && !paper.pdfUrl)
            )
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        />
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 max-w-md">
          {paper.title}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">{paper.authors}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-blue-500 hover:underline cursor-pointer">
        {paper.doi}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {paper.publicationYear || paper.publicationYearInt || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{paper.source}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full border ${
            paper.assignmentStatusText === "Assigned"
              ? "bg-blue-50 text-blue-700 border-blue-100"
              : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {paper.assignmentStatusText || "Unassigned"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {paper.decidedStatus && paper.decidedStatus !== "None" ? (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full border ${
              paper.decidedStatus.toLowerCase() === "include"
                ? "bg-green-50 text-green-700 border-green-100"
                : paper.decidedStatus.toLowerCase() === "exclude"
                  ? "bg-red-50 text-red-700 border-red-100"
                  : "bg-gray-50 text-gray-700 border-gray-100"
            }`}
          >
            {paper.decidedStatus}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">None</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          {showPdfActions && (
            <div className="flex items-center border-r border-gray-200 pr-3 mr-1">
              <PaperPdfActions
                paper={paper}
                onUploadPdf={onUploadPdf}
                isUploadingPdf={isUploadingPdf}
                onApplyMetadataSuggestion={onApplyMetadataSuggestion}
                isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
                onMarkAsNotRetrieved={onMarkAsNotRetrieved}
                isMarkingAsNotRetrieved={isMarkingAsNotRetrieved}
                pdfRequired={pdfRequired}
                studySelectionProcessId={studySelectionProcessId}
              />
            </div>
          )}

          <button
            onClick={() => setIsDetailDrawerOpen(true)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <div className="flex items-center">
            {reviewers.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="px-3 py-1.5 text-[11px] font-bold rounded-xl bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95 flex items-center gap-2 group whitespace-nowrap"
              >
                <div className="flex -space-x-2 mr-1">
                  {reviewers.slice(0, 2).map((reviewer, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[8px] text-slate-500 font-bold group-hover:bg-indigo-400 group-hover:text-white transition-colors"
                    >
                      {reviewer.name?.charAt(0) || "?"}
                    </div>
                  ))}
                </div>
                View ({reviewers.length})
              </button>
            ) : (
              <span className="text-xs text-gray-400 italic">—</span>
            )}
          </div>
        </div>

        {/* Modal for viewing all reviewers */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Assigned Reviewers"
          description={paper.title}
          size="sm"
        >
          <div className="grid grid-cols-1 gap-3">
            {isLoadingReviewers ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : reviewerDecisions && reviewerDecisions.length > 0 ? (
              reviewerDecisions.map((rd, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-indigo-100 hover:bg-white transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {rd.reviewerName?.charAt(0) || "?"}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {rd.reviewerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rd.decision ? (
                        <span
                          className={`px-2 py-1 text-[10px] font-bold rounded-lg border ${
                            rd.decision.decisionText?.toLowerCase() === "include"
                              ? "bg-green-50 text-green-700 border-green-100"
                              : rd.decision.decisionText?.toLowerCase() === "exclude"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-gray-50 text-gray-700 border-gray-100"
                          }`}
                        >
                          {rd.decision.decisionText}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 italic bg-slate-100/50 px-2 py-1 rounded-lg">
                          Pending
                        </span>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="!px-3 !py-1 !text-[10px] !rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 transition-colors h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (studySelectionProcessId) {
                            setSubmissionParams({
                              processId: studySelectionProcessId,
                              paperId: paper.id,
                              reviewerId: rd.reviewerId || (rd as any).id,
                              phase: phase,
                            });
                            setIsSubmissionModalOpen(true);
                          }
                        }}
                      >
                        View Submission
                      </Button>
                    </div>
                  </div>

                  {rd.decision?.decisionText === "Exclude" &&
                    (rd.decision.exclusionReasonName || rd.decision.reason) && (
                      <div className="pl-11 pr-2 pb-1 space-y-1.5 animate-in fade-in slide-in-from-left-1 duration-200">
                        {rd.decision.exclusionReasonName && (
                          <div className="text-[11px] text-red-600 font-bold bg-red-50/50 px-2 py-0.5 rounded border border-red-100/50 w-fit">
                            {rd.decision.exclusionReasonName}
                          </div>
                        )}
                        {rd.decision.reason && (
                          <div className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed bg-slate-100/30 p-1.5 rounded-lg border border-slate-200/50">
                            "{rd.decision.reason}"
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm italic">
                No reviewers assigned
              </div>
            )}
          </div>
        </Modal>

        {/* Submission Details Modal */}
        <Modal
          isOpen={isSubmissionModalOpen}
          onClose={() => {
            setIsSubmissionModalOpen(false);
            setSubmissionParams(null);
          }}
          title="Reviewer Submission"
          description={`Submission by ${reviewerDecisions?.find((rd) => rd.reviewerId === submissionParams?.reviewerId)?.reviewerName || "Reviewer"}`}
          size="xl"
        >
          {isLoadingSubmission ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-slate-400 animate-pulse font-medium">Loading submission data...</p>
            </div>
          ) : submission ? (
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <PreviewDocument
                template={submission as any}
                renderItem={(item) => (
                  <div className="flex items-center">
                    {item.isChecked ? (
                      <div className="w-5 h-5 rounded-md bg-green-100 border border-green-200 flex items-center justify-center text-green-600 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400 shadow-sm">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                )}
                renderSectionTitle={(section) => (
                  <div className="flex items-center">
                    {section.isChecked ? (
                      <div className="w-6 h-6 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-sm">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                        <X className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="italic">No submission data available for this reviewer.</p>
            </div>
          )}
        </Modal>

        {/* Paper Details Modal Wrapper */}
        <PaperViewerModal
          paper={paper}
          isOpen={isDetailDrawerOpen}
          onClose={() => setIsDetailDrawerOpen(false)}
          onUploadPdf={onUploadPdf}
          isUploadingPdf={isUploadingPdf}
          onApplyMetadataSuggestion={onApplyMetadataSuggestion}
          isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
          onRetryExtraction={onRetryExtraction}
          isRetryingExtraction={isRetryingExtraction}
          onResolveConflict={onResolveConflict}
          isResolving={isResolving}
          isSubmitting={isSubmitting}
          studySelectionProcessId={studySelectionProcessId}
        />
      </td>
    </tr>
  );
};

interface PapersTableProps {
  papers: PaperResponse[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string) => void;
  // Functionality props for Detail Modal
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
  onRetryExtraction?: (paperId: string) => Promise<void>;
  isRetryingExtraction?: boolean;
  onResolveConflict?: (paperId: string, decision: ScreeningDecision, notes?: string) => void;
  isResolving?: boolean;
  isSubmitting?: boolean;
  studySelectionProcessId?: string;
  showPdfActions?: boolean;
  pdfRequired?: boolean;
  selectionMode?: "quick" | "assignment";
  phase?: PaperPhase;
}
const PapersTable: React.FC<PapersTableProps> = ({
  papers,
  selectedIds,
  onSelectAll,
  onSelectRow,
  onUploadPdf,
  isUploadingPdf,
  onApplyMetadataSuggestion,
  isApplyingMetadataSuggestion,
  onMarkAsNotRetrieved,
  isMarkingAsNotRetrieved,
  onRetryExtraction,
  isRetryingExtraction,
  onResolveConflict,
  isResolving,
  isSubmitting,
  studySelectionProcessId,
  showPdfActions = false,
  pdfRequired = false,
  selectionMode = "assignment",
  phase = 0,
}) => {
  const selectablePapers = papers.filter((p) => {
    const isUnresolved = p.decidedStatus === "None" || !p.decidedStatus;
    const isUnassigned = p.assignmentStatusText !== "Assigned";
    if (selectionMode === "quick") {
      return isUnresolved && isUnassigned;
    }
    const isPdfOk = !pdfRequired || !!p.pdfUrl;
    return isUnassigned && isUnresolved && isPdfOk;
  });
  const allSelected =
    selectablePapers.length > 0 && selectablePapers.every((p) => selectedIds.has(p.id));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Title
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Authors
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              DOI
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Year
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Source
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Assignment
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Decision
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions & Reviewers
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {papers.map((paper) => (
            <PaperRow
              key={paper.id}
              paper={paper as any}
              isSelected={selectedIds.has(paper.id)}
              onSelect={onSelectRow}
              onUploadPdf={onUploadPdf}
              isUploadingPdf={isUploadingPdf}
              onApplyMetadataSuggestion={onApplyMetadataSuggestion}
              isApplyingMetadataSuggestion={isApplyingMetadataSuggestion}
              onMarkAsNotRetrieved={onMarkAsNotRetrieved}
              isMarkingAsNotRetrieved={isMarkingAsNotRetrieved}
              onRetryExtraction={onRetryExtraction}
              isRetryingExtraction={isRetryingExtraction}
              onResolveConflict={onResolveConflict}
              isResolving={isResolving}
              isSubmitting={isSubmitting}
              studySelectionProcessId={studySelectionProcessId}
              showPdfActions={showPdfActions}
              pdfRequired={pdfRequired}
              selectionMode={selectionMode}
              phase={phase}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PapersTable;
