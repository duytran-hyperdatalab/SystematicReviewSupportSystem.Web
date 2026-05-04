import React, { useState } from "react";
import Modal from "../ui/Modal";
import FormField from "../ui/FormField";
import FormTextarea from "../ui/FormTextarea";
import Button from "../ui/Button";
import type { CreateReviewProcessRequest } from "../../types/reviewProcess";

interface CreateProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReviewProcessRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateProcessModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateProcessModalProps) {
  const [formData, setFormData] = useState<CreateReviewProcessRequest>({
    name: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    // Reset form on success
    setFormData({ name: "", notes: "" });
  };

  const handleCancel = () => {
    setFormData({ name: "", notes: "" });
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Create Review Process">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          id="name"
          label="Process Name"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="e.g., Identification Phase"
          required
        />

        <FormTextarea
          id="notes"
          label="Notes (Optional)"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Additional notes or details for this phase"
          rows={5}
        />

        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Process"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
