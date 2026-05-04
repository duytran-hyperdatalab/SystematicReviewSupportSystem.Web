import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { FiCheck, FiX, FiClipboard, FiMaximize2, FiExternalLink } from "react-icons/fi";
import { studySelectionChecklistSubmissionService } from "../../../../../services/studySelectionChecklistSubmissionService";
import { PreviewDocument } from "../../../../../components/ui/document-editor/PreviewDocument";
import ConfirmModal from "../../../../../components/ui/ConfirmModal";
import Modal from "../../../../../components/ui/Modal";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";
import type { RootState } from "../../../../../redux/store";
import type { ScreeningPaper } from "../types";
import type {
  StudySelectionChecklistSubmissionSection,
  CreateStudySelectionChecklistSubmissionRequest
} from "../../../../../types/studySelectionChecklistSubmission";
import { cn } from "../../../../../utils/cn";
import { toastSuccess, toastError } from "../../../../../utils/toast";

interface SelectionChecklistProps {
  paper: ScreeningPaper | null;
  processId: string;
  onClose: () => void;
  phase?: number;
}

export default function SelectionChecklist({ paper, processId, onClose, phase = 0 }: SelectionChecklistProps) {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [sections, setSections] = useState<StudySelectionChecklistSubmissionSection[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["selection-checklist-context", processId, paper?.id, currentUser?.id, phase],
    queryFn: () =>
      studySelectionChecklistSubmissionService.getContext({
        processId,
        paperId: paper!.id,
        reviewerId: currentUser!.id,
        phase,
      }),
    enabled: !!paper && !!currentUser && !!processId,
  });

  const submitMutation = useMutation({
    mutationFn: (request: CreateStudySelectionChecklistSubmissionRequest) =>
      studySelectionChecklistSubmissionService.submit(request),
    onSuccess: (response) => {
      if (response.isSuccess) {
        toastSuccess("Checklist Submitted", "The paper selection checklist has been successfully logged.");
        queryClient.invalidateQueries({
          queryKey: ["selection-checklist-context", processId, paper?.id, currentUser?.id, phase]
        });
        setIsConfirmModalOpen(false);
        setIsModalOpen(false);
      } else {
        toastError("Submission Failed", response.message || "Could not save checklist submission.");
      }
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.message || "An error occurred while submitting the checklist.";
      toastError("Error", errorMsg);
    }
  });

  // Reset auto-open flag when paper changes
  useEffect(() => {
    setHasAutoOpened(false);
  }, [paper?.id]);

  // Auto-open modal ONLY ONCE per paper
  useEffect(() => {
    if (data?.data && !hasAutoOpened) {
      setIsModalOpen(true);
      setHasAutoOpened(true);
      setSections(data.data.sections); // Initialize state
    }
  }, [data, hasAutoOpened]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onClose(); // Navigate back to AI tab
  };

  if (!paper) {
    return (
      <div className="flex flex-col h-full bg-white border-l border-gray-200">
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <FiClipboard className="w-8 h-8 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">Select a paper to view the checklist</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white border-l border-gray-200">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 border border-dashed border-slate-200">
          <FiClipboard className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-2">
          {error ? "Service Unavailable" : "No Checklist Found"}
        </h3>
        <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
          {error 
            ? "There was an error loading the checklist context. Please try again later."
            : "Wait for the leader to activate a checklist template for this screening phase."}
        </p>
      </div>
    );
  }

  const submission = data.data;

  // Map submission context to DocumentDraft structure for PreviewDocument
  const mappedDraft = {
    title: submission.name,
    paragraphs: submission.description ? [{ id: "desc", text: submission.description, order: 0 }] : [],
    sections: sections, // Use local state for interactivity
  };

  const toggleSection = (sectionId: string) => {
    if (!submission.isFromTemplate) return;
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, isChecked: !s.isChecked } : s
    ));
  };

  const toggleItem = (itemId: string) => {
    if (!submission.isFromTemplate) return;
    setSections(prev => prev.map(s => ({
      ...s,
      items: s.items.map(i => i.id === itemId ? { ...i, isChecked: !i.isChecked } : i)
    })));
  };

  const handleConfirm = () => {
    if (!paper || !currentUser || !data?.data) return;

    const finalSubmission: CreateStudySelectionChecklistSubmissionRequest = {
      studySelectionProcessId: processId,
      paperId: paper.id,
      reviewerId: currentUser.id,
      phase,
      checklistTemplateId: data.data.checklistTemplateId,
      sectionAnswers: sections.map(s => ({
        sectionId: s.id,
        isChecked: s.isChecked
      })),
      itemAnswers: sections.flatMap(s => s.items.map(i => ({
        itemId: i.id,
        isChecked: i.isChecked
      })))
    };

    submitMutation.mutate(finalSubmission);
  };

  const renderStatusIndicator = (isChecked: boolean, onToggle: () => void) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      disabled={!submission.isFromTemplate}
      className={cn(
        "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 shadow-sm",
        submission.isFromTemplate ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default opacity-80",
        isChecked
          ? "bg-emerald-500 border-emerald-200 text-white fill-white"
          : "bg-rose-500 border-rose-200 text-white fill-white"
      )}
    >
      {isChecked ? <FiCheck className="w-4.5 h-4.5 stroke-[3]" /> : <FiX className="w-4 h-4 stroke-[3]" />}
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 border-l border-gray-200 overflow-hidden">
      {/* Sidebar Placeholder / Header */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
          <FiClipboard className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800">Checklist Ready</h3>
          <p className="text-xs text-slate-500 max-w-[200px]">
            The screening checklist for "{paper.title.slice(0, 40)}..." is available.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm"
        >
          <FiMaximize2 className="w-4 h-4" />
          Expand Checklist
        </button>
      </div>

      {/* Main Checklist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Study Selection Checklist Submission"
        description="Verify if this paper meets all the protocol requirements defined in the review protocol."
        size="xl"
      >
        <div className="flex flex-col gap-6">
          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <PreviewDocument
              draft={mappedDraft as any}
              renderSectionTitle={(section) => renderStatusIndicator(section.isChecked, () => toggleSection(section.id))}
              renderItem={(item) => renderStatusIndicator(item.isChecked, () => toggleItem(item.id))}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">

            {submission.isFromTemplate && (
              <>
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={() => setIsConfirmModalOpen(true)}
                  disabled={submitMutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 disabled:bg-slate-400 active:scale-[0.98] transition-all shadow-lg shadow-slate-200"
                >
                  <FiExternalLink className="w-4 h-4" />
                  {submitMutation.isPending ? "Submitting..." : "Accept Submission"}
                </button>
              </>

            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirm}
        isLoading={submitMutation.isPending}
        title="Confirm Checklist Submission"
        message="By confirming, you acknowledge that you have reviewed the checklist and accept the results. This action will be logged."
        confirmText="Yes, Accept"
        cancelText="Cancel"
      />
    </div>
  );
}
