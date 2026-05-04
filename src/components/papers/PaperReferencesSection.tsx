import React from "react";
import { FiBookOpen, FiArrowRight } from "react-icons/fi";
import { Network } from "lucide-react";
import type { PaperResponse } from "../../types/paper";

interface PaperReferencesSectionProps {
  paper: PaperResponse;
}

const PaperReferencesSection: React.FC<PaperReferencesSectionProps> = ({ paper }) => {
  // TODO: Use actual extracted references count from API query
  const extractedReferencesCount = 35;
  const isFullTextAvailable = paper.fullTextAvailable || paper.pdfUrl;

  if (!isFullTextAvailable) {
    return null;
  }

  return (
    <section className="mb-6">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <FiBookOpen className="text-blue-500" />
        Extracted References
      </h3>

      <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Backward Snowballing</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {extractedReferencesCount > 0
              ? `${extractedReferencesCount} references have been extracted from this paper.`
              : "No references have been extracted yet from the full-text PDF."}
          </p>
        </div>

        <div className="flex shrink-0 gap-2 w-full sm:w-auto">
          {extractedReferencesCount > 0 ? (
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">
              View Candidates
              <FiArrowRight />
            </button>
          ) : (
            <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 text-sm font-semibold rounded-lg hover:bg-blue-50 hover:border-blue-300 transition shadow-sm">
              Extract References
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PaperReferencesSection;
