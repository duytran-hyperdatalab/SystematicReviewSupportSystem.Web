import React from "react";
import { Modal } from "../../../../../components/ui/Modal";
import { PreviewDocument } from "../../../../../components/ui/document-editor/PreviewDocument";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";
import { useStudySelectionTemplateDetail } from "../../../../../hooks/useStudySelectionChecklistTemplate";

interface ChecklistTemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  templateId: string | null;
}

export const ChecklistTemplateDetailModal: React.FC<ChecklistTemplateDetailModalProps> = ({
  isOpen,
  onClose,
  projectId,
  templateId,
}) => {
  const { data, isLoading, error } = useStudySelectionTemplateDetail(
    projectId,
    templateId || undefined
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Template Preview"
      description="Review the structure and criteria of the selected checklist version."
      size="xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="text-slate-400 font-medium mt-4">Fetching template details...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-red-50 rounded-[2rem] border border-red-100">
          <p className="text-red-500 font-medium">Failed to load template details.</p>
        </div>
      ) : data?.data ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <PreviewDocument template={data.data} />
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 font-medium">
          No data available for this template.
        </div>
      )}
    </Modal>
  );
};
