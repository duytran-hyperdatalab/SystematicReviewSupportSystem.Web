// Create Search Execution Modal
import { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import type { CreateSearchExecutionRequest } from "../../../types/identification";
import FormField from "../../ui/FormField";

interface CreateSearchExecutionModalProps {
  identificationProcessId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSearchExecutionRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export default function CreateSearchExecutionModal({
  identificationProcessId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateSearchExecutionModalProps) {
  const [formData, setFormData] = useState({
    searchSource: "",
    searchQuery: "",
    executedAt: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.searchSource) {
      newErrors.searchSource = "Search source is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        identificationProcessId,
        searchSourceId: formData.searchSource, // For now, passing name as ID since protocols are removed
        searchQuery: formData.searchQuery.trim(),
        type: 0, // DatabaseSearch
        notes: formData.notes.trim(),
      });

      // Reset form
      setFormData({
        searchSource: "",
        searchQuery: "",
        executedAt: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Failed to create search strategy:", error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        searchSource: "",
        searchQuery: "",
        executedAt: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Search Strategy" size="xl">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-2 text-sm text-blue-800">
          <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Best Practice</p>
            <p className="text-xs text-blue-700 mt-1">
              Create your search strategy first, then import RIS files. This maintains a clear audit
              trail and helps organize your systematic review.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Search Source */}
        <FormField
          id="searchSource"
          label="Search Source"
          placeholder="e.g., IEEE Xplore, PubMed, etc."
          value={formData.searchSource}
          onChange={(e) => {
            setFormData({ ...formData, searchSource: e.target.value });
            setErrors({ ...errors, searchSource: "" });
          }}
          errorMessage={errors.searchSource}
          required
          disabled={isSubmitting}
        />

        {/* Search Query */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Query <span className="text-xs text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            value={formData.searchQuery}
            onChange={(e) => setFormData({ ...formData, searchQuery: e.target.value })}
            placeholder='e.g., ("machine learning" OR "deep learning") AND "healthcare"'
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the exact query used in the database. This field is optional but recommended for
            documentation.
          </p>
        </div>

        {/* Executed Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Executed Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.executedAt}
              onChange={(e) => setFormData({ ...formData, executedAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes <span className="text-xs text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any additional information about this search strategy..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Strategy"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
