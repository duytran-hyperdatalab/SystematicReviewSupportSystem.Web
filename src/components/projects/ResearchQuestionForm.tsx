import React from "react";
import Button from "../ui/Button";
import FormTextarea from "../ui/FormTextarea";
import FormSelect from "../ui/FormSelect";

interface QuestionType {
  question_type_id: string;
  name: string;
}

interface ResearchQuestionFormProps {
  questionTypes: QuestionType[];
  onSubmit: (data: {
    question_type_id: string;
    question_text: string;
    rationale: string;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ResearchQuestionForm: React.FC<ResearchQuestionFormProps> = ({
  questionTypes,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit({
      question_type_id: formData.get("question_type_id") as string,
      question_text: formData.get("question_text") as string,
      rationale: formData.get("rationale") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Question Type Selection */}
        <div className="space-y-2">
          <FormSelect
            id="question_type_id"
            name="question_type_id"
            label="Research Question Type"
            helperText="Categorizing your question helps in selecting the appropriate methodology and data sources."
            options={questionTypes.map((qt) => ({
              value: qt.question_type_id,
              label: qt.name,
            }))}
            required
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>

        {/* Question Text Field */}
        <div className="space-y-2">
          <FormTextarea
            id="question_text"
            name="question_text"
            label="Research Question"
            helperText="State the primary question your review seeks to answer. Ensure it is focused and clear."
            placeholder="e.g., What is the long-term impact of mindfulness-based cognitive therapy on relapse rates in adults with recurrent depression?"
            rows={4}
            required
            className="bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-lg"
          />
        </div>

        {/* Rationale Field */}
        <div className="space-y-2">
          <FormTextarea
            id="rationale"
            name="rationale"
            label="Scientific Rationale"
            helperText="Explain why this question is significant and how answering it will contribute to the current body of knowledge."
            placeholder="e.g., Despite the popularity of MBCT, its long-term efficacy (beyond 12 months) remains under-studied compared to traditional therapy..."
            rows={4}
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
          Add Question
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

export default ResearchQuestionForm;
