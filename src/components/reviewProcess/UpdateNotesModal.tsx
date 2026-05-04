import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import FormTextarea from "../ui/FormTextarea";
import Button from "../ui/Button";
import type { ReviewProcess } from "../../types/reviewProcess";

interface UpdateNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, notes: string) => Promise<void>;
  process: ReviewProcess | null;
  isLoading?: boolean;
}

export default function UpdateNotesModal({
  isOpen,
  onClose,
  onSubmit,
  process,
  isLoading = false,
}: UpdateNotesModalProps) {
  const [notes, setNotes] = useState("");

  // Reset notes when modal opens with a new process
  useEffect(() => {
    if (isOpen && process) {
      setNotes(process.notes || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard against null process or missing ID
    const targetId = process?.id || process?.processId;
    if (!targetId) return;
    await onSubmit(targetId, notes);
  };

  const handleCancel = () => {
    setNotes(process?.notes || "");
    onClose();
  };

  if (!process) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Update Process Notes">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{process.name || "Unnamed Process"}</h3>
        <p className="text-sm text-gray-600">Phase: {process.currentPhaseText}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormTextarea
          id="notes"
          label="Notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add progress notes, findings, or important observations..."
          rows={6}
          required
        />

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
