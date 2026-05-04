import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { FiCopy, FiCheck } from "react-icons/fi";

import type { SampleAnswerData } from "../../types/checklist";

interface SampleAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SampleAnswerData | null;
}

/**
 * Modal displaying sample/example answers for checklist items from PRISMA guidelines
 */
const SampleAnswerModal: React.FC<SampleAnswerModalProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (data?.sampleAnswer) {
      navigator.clipboard.writeText(data.sampleAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sample Answer: Item ${data.itemNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Item Topic */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-600">Topic</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{data.topic}</p>
        </div>

        {/* Sample Answer */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Sample Answer</h3>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
              title="Copy sample answer"
            >
              {copied ? (
                <>
                  <FiCheck className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Copied</span>
                </>
              ) : (
                <>
                  <FiCopy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
              {data.sampleAnswer}
            </p>
          </div>
        </div>

        {/* Explanation (optional) */}
        {data.explanation && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Why this is a good answer</h3>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-900">{data.explanation}</p>
            </div>
          </div>
        )}

        {/* Hint about usage */}
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="text-xs text-amber-900">
            💡 This is a <strong>sample answer</strong> to guide you. Your own answer should reflect
            your specific study characteristics and be tailored to your research context.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close
          </Button>
          <Button onClick={handleCopy} size="sm" className="inline-flex items-center gap-2">
            <FiCopy className="w-4 h-4" />
            Copy to Clipboard
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SampleAnswerModal;
