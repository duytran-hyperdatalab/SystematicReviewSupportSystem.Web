import { useState } from "react";
import Modal from "../../../../components/ui/Modal";
import { Loader2 } from "lucide-react";

interface QAAutoResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { score?: number | null; percentage?: number | null }) => void;
  isSubmitting: boolean;
  totalCriteria: number;
}

export function QAAutoResolveModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  totalCriteria,
}: QAAutoResolveModalProps) {
  const [resolutionType, setResolutionType] = useState<"score" | "percentage">("percentage");
  const [value, setValue] = useState<string>("70");

  const handleTypeChange = (type: "score" | "percentage") => {
    setResolutionType(type);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const max = type === "percentage" ? 100 : totalCriteria;
      if (num > max) {
        setValue(max.toString());
      }
    }
  };

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) return;
    
    if (resolutionType === "score") {
      onConfirm({ score: numValue, percentage: null });
    } else {
      onConfirm({ score: null, percentage: numValue });
    }
  };

  const getHelperText = () => {
    const numValue = parseFloat(value) || 0;
    if (resolutionType === "percentage") {
      const requiredPoints = (numValue / 100) * totalCriteria;
      return (
        <span>
          Required score to pass: <strong className="text-indigo-600">{requiredPoints.toFixed(1)} out of {totalCriteria}</strong> points ({numValue}%).
        </span>
      );
    } else {
      const requiredPercentage = totalCriteria > 0 ? ((numValue / totalCriteria) * 100) : 0;
      return (
        <span>
          Equivalent percentage: <strong className="text-indigo-600">{requiredPercentage.toFixed(1)}%</strong> of total criteria.
        </span>
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Auto Resolve Quality Assessment"
      size="md"
    >
      <div className="space-y-6 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolution Method
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                checked={resolutionType === "percentage"}
                onChange={() => handleTypeChange("percentage")}
              />
              <span className="text-sm text-gray-600">By Percentage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                className="text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                checked={resolutionType === "score"}
                onChange={() => handleTypeChange("score")}
              />
              <span className="text-sm text-gray-600">By Minimum Score</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {resolutionType === "percentage" ? "Required Percentage (%)" : "Required Score"}
          </label>
          <input
            type="number"
            step={resolutionType === "percentage" ? "1" : "0.5"}
            min="0"
            max={resolutionType === "percentage" ? 100 : totalCriteria}
            value={value}
            onChange={(e) => {
              let val = e.target.value;
              if (val !== "") {
                const num = parseFloat(val);
                const max = resolutionType === "percentage" ? 100 : totalCriteria;
                if (num > max) val = max.toString();
                if (num < 0) val = "0";
              }
              setValue(val);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 outline-none"
            required
            autoFocus
          />
          <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800">
              <span className="block font-medium mb-1">Scoring Rules:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li><strong>Yes</strong> = 1 point</li>
                <li><strong>Unclear</strong> = 0.5 points</li>
                <li><strong>No</strong> = 0 points</li>
              </ul>
              <p className="mt-2 text-blue-700">Total maximum score across all criteria is <strong>{totalCriteria}</strong>.</p>
            </div>
            
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md text-xs text-indigo-900">
              {getHelperText()}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 w-full mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Resolving...
            </>
          ) : (
            "Auto Resolve"
          )}
        </button>
      </div>
    </Modal>
  );
}
