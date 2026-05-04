import React, { useState } from "react";
import { FiLink, FiLoader } from "react-icons/fi";

import toast from "react-hot-toast";
import { useExtractReferences } from "../../hooks/useSnowballCandidates";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { cn } from "../../utils/cn";

interface ReferenceExtractionButtonProps {
  paperId: string;
  hasPdf: boolean;
  variant?: "panel" | "icon";
  className?: string;
  onSuccess?: () => void;
}

const ReferenceExtractionButton: React.FC<ReferenceExtractionButtonProps> = ({
  paperId,
  hasPdf,
  variant = "panel",
  className,
  onSuccess,
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const extractReferencesMutation = useExtractReferences();

  const handleExtract = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click in table
    try {
      await extractReferencesMutation.mutateAsync(paperId);
      toast.success("References extracted successfully. Candidates added to the Snowballing pool.");
      setIsConfirmModalOpen(false);
      setSuccess(true);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to extract references. Please try again.");
      setIsConfirmModalOpen(false);
    }
  };

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPdf) {
      toast.error("No PDF available for extraction.");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const renderModal = () => (
    <Modal
      isOpen={isConfirmModalOpen}
      onClose={() => setIsConfirmModalOpen(false)}
      title="Extract References"
      size="md"
    >
      <div className="space-y-6">
        <p className="text-slate-600 leading-relaxed">
          This will analyze the full-text PDF and extract references using GROBID.
          <br />
          <br />
          Detected references will be added to the Snowballing Candidate Pool.
          <br />
          Do you want to continue?
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="secondary"
            onClick={() => setIsConfirmModalOpen(false)}
            disabled={extractReferencesMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExtract}
            disabled={extractReferencesMutation.isPending}
            className="flex items-center gap-2"
          >
            {extractReferencesMutation.isPending ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              "Extract"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );

  if (variant === "icon") {
    return (
      <>
        <button
          onClick={handleOpenModal}
          disabled={!hasPdf || extractReferencesMutation.isPending || success}
          className={cn(
            "p-2 rounded-lg transition-all border border-transparent whitespace-nowrap",
            success
              ? "text-emerald-500 bg-emerald-50 border-emerald-100 cursor-default"
              : "text-slate-400 hover:text-primary hover:bg-white hover:border-slate-200",
            !hasPdf && "opacity-30 cursor-not-allowed",
            extractReferencesMutation.isPending && "animate-pulse",
            className,
          )}
          title={
            success ? "Extraction Complete" : hasPdf ? "Extract References" : "No PDF available"
          }
        >
          {extractReferencesMutation.isPending ? (
            <FiLoader className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <FiLink className={cn("w-4 h-4", success && "text-emerald-500")} />
          )}
        </button>
        {renderModal()}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
        {success ? (
          <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 flex items-center gap-2">
            Extraction Complete
          </div>
        ) : (
          <Button
            onClick={handleOpenModal}
            disabled={extractReferencesMutation.isPending || !hasPdf}
            className={cn(
              "w-full sm:w-auto flex items-center justify-center gap-2 whitespace-nowrap",
              className,
            )}
          >
            {extractReferencesMutation.isPending ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Extracting references...
              </>
            ) : (
              <>
                <FiLink className="w-4 h-4" />
                Extract References
              </>
            )}
          </Button>
        )}
      </div>
      {renderModal()}
    </>
  );
};

export default ReferenceExtractionButton;
