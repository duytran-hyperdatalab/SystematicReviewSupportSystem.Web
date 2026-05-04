import React from "react";
import Button from "../ui/Button";
import FormField from "../ui/FormField";
import FormTextarea from "../ui/FormTextarea";

interface ReviewNeedFormProps {
  onSubmit: (data: {
    description: string;
    justification: string;
    identified_by: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReviewNeedForm: React.FC<ReviewNeedFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      description: formData.get("description") as string,
      justification: formData.get("justification") as string,
      identified_by: formData.get("identified_by") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Description Field */}
        <div className="space-y-2">
          <FormTextarea
            id="description"
            name="description"
            label="Problem Description"
            helperText="Clearly state the specific gap in knowledge or policy problem that warrants this systematic review."
            placeholder="e.g., Lack of consensus on the effectiveness of remote patient monitoring for chronic heart failure..."
            rows={4}
            required
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>

        {/* Justification Field */}
        <div className="space-y-2">
          <FormTextarea
            id="justification"
            name="justification"
            label="Justification"
            helperText="Explain why a systematic review is the appropriate method to address this need (e.g., conflicting primary studies, high volume of data)."
            placeholder="e.g., Existing reviews are outdated (pre-2020) and do not account for recent large-scale clinical trials..."
            rows={4}
            required
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>

        {/* Identified By Field */}
        <div className="space-y-2">
          <FormField
            id="identified_by"
            name="identified_by"
            label="Identified By"
            helperText="Name of the stakeholder or researcher who identified this review need."
            placeholder="e.g., Clinical Guidelines Committee"
            required
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
          Add Review Need
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

export default ReviewNeedForm;
