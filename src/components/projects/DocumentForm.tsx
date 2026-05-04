import React from "react";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import FormTextarea from "../ui/FormTextarea";

interface DocumentFormProps {
  onSubmit: (data: {
    sponsor: string;
    scope: string;
    budget: number;
    document_url: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      sponsor: formData.get("sponsor") as string,
      scope: formData.get("scope") as string,
      budget: parseFloat(formData.get("budget") as string),
      document_url: formData.get("document_url") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Sponsor Field */}
        <div className="space-y-2">
          <FormField
            id="sponsor"
            name="sponsor"
            label="Sponsoring Organization"
            helperText="The institution or body funding or commissioning the systematic review (e.g., NIH, WHO, Ministry of Health)."
            placeholder="e.g., World Health Organization"
            required
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>

        {/* Scope Field */}
        <div className="space-y-2">
          <FormTextarea
            id="scope"
            name="scope"
            label="Scope of Document"
            helperText="Describe the boundaries and requirements defined in this document (e.g., geographic focus, target population, specific interventions)."
            placeholder="e.g., This document outlines the requirements for a review of childhood obesity interventions in Southeast Asia..."
            rows={4}
            required
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>

        {/* Budget Field */}
        <div className="space-y-2">
          <FormField
            id="budget"
            name="budget"
            label="Allocated Budget (USD)"
            type="number"
            step="0.01"
            helperText="The financial resources allocated specifically for this review's synthesis and administrative costs."
            placeholder="e.g., 25000.00"
            required
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>

        {/* URL Field */}
        <div className="space-y-2">
          <FormField
            id="document_url"
            name="document_url"
            label="External Document Link"
            type="url"
            helperText="Direct link to the full text of the commissioning document or contract for reference."
            placeholder="https://example.com/docs/commissioning-brief.pdf"
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
        <Button
          type="submit"
          isLoading={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-none rounded-lg h-12"
        >
          Add Document
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="px-6 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-none rounded-lg h-12"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;
