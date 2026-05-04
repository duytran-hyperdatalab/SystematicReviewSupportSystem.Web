import { FiArrowRight, FiCheck, FiFileText, FiLock, FiTarget } from "react-icons/fi";
import type { ResearchQuestion } from "../../../../../types/coreAndGovernance";
import type { WizardSection } from "../../../../../types/templateWizard";

interface Step1_OverviewProps {
  sections: WizardSection[];
  completedSections: string[];
  onSetupSection: (sectionId: string) => void;
  isViewOnly?: boolean;
  researchQuestions?: ResearchQuestion[];
  isGuidedGenerationLoading?: boolean;
  guidedGenerationError?: string | null;
}

export default function Step1_Overview({
  sections,
  completedSections,
  onSetupSection,
  isViewOnly = false,
  researchQuestions = [],
  isGuidedGenerationLoading = false,
  guidedGenerationError = null,
}: Step1_OverviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RQ-Driven Template Builder</h1>
        <p className="text-lg text-gray-600">
          Sections are auto-generated from PICOC context and Research Questions.
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-2">
          <FiLock className="w-4 h-4" />
          Locked Section Structure
        </div>
        <p className="text-sm text-slate-600">
          Section names cannot be changed. Project leaders add and refine fields inside each section
          to capture evidence needed for SLR synthesis.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
            Research Questions: {researchQuestions.length}
          </span>
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
            Sections: {sections.length}
          </span>
          {isGuidedGenerationLoading && (
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
              Initializing sections...
            </span>
          )}
        </div>
      </div>

      {guidedGenerationError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {guidedGenerationError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => {
          const isCompleted = completedSections.includes(section.id);

          return (
            <div
              key={section.id}
              className={`relative rounded-xl border-2 p-6 transition-all ${
                isCompleted
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
            >
              {isCompleted && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white rounded-full p-1">
                  <FiCheck className="w-5 h-5" />
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    section.isPicoc ? "bg-sky-100 text-sky-700" : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {section.isPicoc ? (
                    <FiFileText className="w-5 h-5" />
                  ) : (
                    <FiTarget className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">{section.name}</h3>
                    {section.isPicoc ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-sky-100 text-sky-700 font-medium">
                        Context
                      </span>
                    ) : section.linkedResearchQuestionId ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium">
                        RQ Linked
                      </span>
                    ) : section.isLegacy ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-medium">
                        Legacy
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.isPicoc
                      ? "Capture PICOC definitions and study metadata."
                      : section.linkedResearchQuestionId
                      ? "Capture data that answers this Research Question."
                      : "Legacy section fallback."}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSetupSection(section.id)}
                disabled={isViewOnly}
                className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                  isCompleted
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isCompleted ? "Edit Fields" : "Add Fields"}
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-900">
          Completed: <strong>{completedSections.length} of {sections.length}</strong> sections.
          Continue to Preview & Publish when ready.
        </p>
      </div>
    </div>
  );
}
