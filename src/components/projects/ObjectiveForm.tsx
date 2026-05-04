import React from "react";
import Button from "../ui/Button";
import FormTextarea from "../ui/FormTextarea";

interface ObjectiveFormProps {
  onSubmit: (data: { objective_statement: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ObjectiveForm: React.FC<ObjectiveFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      objective_statement: formData.get("objective_statement") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Objective Statement Field */}
        <div className="space-y-2">
          <FormTextarea
            id="objective_statement"
            name="objective_statement"
            label="Objective Statement"
            helperText="Define a clear, concise, and measurable objective for this systematic review. Use the SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)."
            placeholder="e.g., To evaluate the comparative effectiveness of metformin versus lifestyle interventions in reducing HbA1c levels in adults with pre-diabetes over a 12-month period..."
            rows={5}
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
          Add Objective
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

export default ObjectiveForm;
