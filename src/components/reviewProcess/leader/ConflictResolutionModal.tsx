import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";

import Modal from "../../ui/Modal";
import ReviewerDecisionsSection from "./ReviewerDecisionsSection";
import ResolutionFormPanel from "./ResolutionFormPanel";
import ThirdReviewerAssignment from "./ThirdReviewerAssignment";
import { useConflictDetail, useResolveConflict } from "../../../hooks/useStudySelection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { ScreeningDecisionType, PaperPhase } from "../../../types/studySelection";
import { useReviewerSubmission } from "../../../hooks/useStudySelectionChecklistSubmission";
import { PreviewDocument } from "../../ui/document-editor/PreviewDocument";
import { Check, X, Loader2 } from "lucide-react";

// --- Types ---
export interface ReviewerDecision {
  id: string;
  reviewerId: string;
  reviewerName: string;
  decision: "Include" | "Exclude";
  exclusionReason?: string;
}

export interface PaperDetail {
  id: string;
  title: string;
  doi: string;
  authors: string;
  year: number;
  source: string;
  abstract: string;
  fullText: string;
  metadata: {
    journal: string;
    keywords: string[];
    publisher: string;
    language: string;
  };
  phase: "Title/Abstract" | "Full-Text";
  decisions: ReviewerDecision[];
  resolution?: {
    finalDecision: "Include" | "Exclude";
    resolutionNotes: string;
    resolverName: string;
  };
  isFinishReview: boolean;
  assignedReviewerIds: string[];
  metadataSources?: any;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string | null;
  processId: string | undefined;
  phase: number;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  paperId,
  processId,
  phase,
}) => {
  const [_activeTab, setActiveTab] = useState<"abstract" | "full-text" | "metadata">("abstract");
  const [resolution, setResolution] = useState<"Include" | "Exclude" | null>(null);
  const [exclusionReason, setExclusionReason] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isAssigningThirdReviewer, setIsAssigningThirdReviewer] = useState(false);
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

  const { data: detailData, isLoading } = useConflictDetail(processId, paperId || undefined, phase);
  const resolveMutation = useResolveConflict();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const paper = useMemo<PaperDetail | null>(() => {
    if (!detailData) return null;

    // A reviewer is pending if they are in assignedMembers but haven't submitted a decision yet.
    const assignedIds = detailData.assignedMembers?.map((r) => r.reviewerId) || [];
    const decisionIds = detailData.decisions?.map((d) => d.reviewerId) || [];
    const hasPendingReviewer = assignedIds.some((id) => !decisionIds.includes(id));

    return {
      id: detailData.paperId,
      title: detailData.title,
      doi: detailData.doi || "",
      authors: detailData.authors || "",
      year: Number(detailData.publicationYear) || 0,
      source: detailData.source || "",
      phase: (phase === 0 ? "Title/Abstract" : "Full-Text") as "Title/Abstract" | "Full-Text",
      abstract: detailData.abstract || "",
      fullText: detailData.pdfUrl || "",
      metadata: {
        journal: detailData.journal || "",
        keywords: detailData.keywords?.split(";") || [],
        publisher: detailData.publisher || "",
        language: detailData.language || "",
      },
      metadataSources: detailData.metadataSources,
      decisions: (detailData.decisions || []).map((d) => ({
        id: d.id,
        reviewerId: d.reviewerId,
        reviewerName: d.reviewerName,
        decision: d.decisionText as "Include" | "Exclude",
        exclusionReason: d.reason || undefined,
      })),
      resolution: detailData.resolution
        ? {
            finalDecision: detailData.resolution.finalDecisionText as "Include" | "Exclude",
            resolutionNotes: detailData.resolution.resolutionNotes || "",
            resolverName: detailData.resolution.resolverName || "",
          }
        : undefined,
      isFinishReview: detailData.isFinishReview && !hasPendingReviewer,
      assignedReviewerIds: Array.from(new Set([...assignedIds, ...decisionIds])),
    };
  }, [detailData, phase]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("abstract");
      setResolution(null);
      setExclusionReason("");
      setResolutionNotes("");
      setIsAssigningThirdReviewer(false);
    }
  }, [isOpen]);

  const handleResolve = async () => {
    if (!processId || !paperId || !resolution || !currentUser) {
      toast.error("Missing required information for resolution");
      return;
    }

    try {
      await resolveMutation.mutateAsync({
        processId,
        paperId,
        request: {
          finalDecision:
            resolution === "Include"
              ? ScreeningDecisionType.Include
              : ScreeningDecisionType.Exclude,
          phase: phase as PaperPhase,
          resolvedBy: currentUser.id,
          resolutionNotes: resolutionNotes || null,
          exclusionReasonId: resolution === "Exclude" ? exclusionReason : null,
        },
      });

      toast.success(`Conflict resolved as ${resolution}`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to resolve conflict");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conflict Resolution"
      description={
        paper ? `Resolving conflict for Paper ID: ${paper.id}` : "Loading paper details..."
      }
      size="md"
    >
      <div className="flex flex-col -m-8 bg-white overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                Fetching details...
              </p>
            </div>
          </div>
        ) : !paper ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <p className="text-sm font-bold text-gray-400">No data found.</p>
          </div>
        ) : (
          <main className="flex flex-1 overflow-hidden">
            <div className="flex flex-col w-full relative overflow-hidden h-full">
              <ReviewerDecisionsSection
                decisions={paper.decisions}
                includeCount={paper.decisions.filter((d) => d.decision === "Include").length}
                excludeCount={paper.decisions.filter((d) => d.decision === "Exclude").length}
                onViewSubmission={(reviewerId) => {
                  if (processId && paperId) {
                    setSubmissionParams({
                      processId,
                      paperId,
                      reviewerId,
                      phase,
                    });
                    setIsSubmissionModalOpen(true);
                  }
                }}
              />

              <ResolutionFormPanel
                resolution={resolution}
                setResolution={setResolution}
                exclusionReason={exclusionReason}
                setExclusionReason={setExclusionReason}
                resolutionNotes={resolutionNotes}
                setResolutionNotes={setResolutionNotes}
                onResolve={handleResolve}
                isFinishReview={paper.isFinishReview}
                onAssignThirdReviewer={() => setIsAssigningThirdReviewer(true)}
                processId={processId}
              />

              {isAssigningThirdReviewer && (
                <ThirdReviewerAssignment
                  paperId={paperId || ""}
                  studySelectionProcessId={processId || ""}
                  phase={phase}
                  existingReviewersId={paper.assignedReviewerIds}
                  onCancel={() => setIsAssigningThirdReviewer(false)}
                  onAssignmentComplete={() => {
                    setIsAssigningThirdReviewer(false);
                  }}
                />
              )}
            </div>
          </main>
        )}
      </div>
      <Modal
        isOpen={isSubmissionModalOpen}
        onClose={() => {
          setIsSubmissionModalOpen(false);
          setSubmissionParams(null);
        }}
        title="Reviewer Submission"
        description={`Submission by ${paper?.decisions.find((d) => d.reviewerId === submissionParams?.reviewerId)?.reviewerName || "Reviewer"}`}
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
    </Modal>
  );
};

export default ConflictResolutionModal;
