import { useCallback, useEffect, useMemo } from "react";
import { useTemplateWizard } from "../../../../hooks/useTemplateWizard";
import { usePlanningData } from "../../../../hooks/usePlanningData";
import type { ExtractionTemplateDto } from "../../../../types/dataExtraction";
import type { ExtractionTemplateResponseDto } from "../../../../types/dataExtraction";
import type { DataItemDefinitionExtended } from "../../../../types/dataExtraction";
import type { WizardSection, WizardStep } from "../../../../types/templateWizard";
import Step1_Overview from "./steps/Step1_Overview";
import Step2_FlatSetup from "./steps/Step2_FlatSetup";
import Step3_MatrixSetup from "./steps/Step3_MatrixSetup";
import Step4_Preview from "./steps/Step4_Preview";

interface TemplateWizardProps {
  dataExtractionProcessId?: string;
  protocolId?: string;
  projectId?: string;
  onComplete: (template: ExtractionTemplateResponseDto) => void;
  isViewOnly?: boolean;
  existingTemplate?: ExtractionTemplateDto | ExtractionTemplateResponseDto | null;
}

export default function TemplateWizard({
  dataExtractionProcessId,
  protocolId,
  projectId,
  onComplete,
  isViewOnly = false,
  existingTemplate = null,
}: TemplateWizardProps) {
  const resolvedProcessId = dataExtractionProcessId || protocolId || "";

  const {
    state,
    goToStep,
    initializeSectionsForNewTemplate,
    startSectionSetup,
    updateSectionData,
    updateMatrixData,
    getCompletedTemplate,
    resetWizard,
  } = useTemplateWizard({ dataExtractionProcessId: resolvedProcessId, existingTemplate });

  const {
    researchQuestions,
    isLoading: isPlanningLoading,
    error: planningError,
  } = usePlanningData({
    projectId,
    dataExtractionProcessId: resolvedProcessId || undefined,
  });

  useEffect(() => {
    if (!isPlanningLoading && !planningError && researchQuestions.length > 0) {
      initializeSectionsForNewTemplate(researchQuestions);
    }
  }, [
    initializeSectionsForNewTemplate,
    isPlanningLoading,
    planningError,
    researchQuestions,
  ]);

  const currentSection = useMemo(
    () => state.sections.find((s: WizardSection) => s.id === state.sectionInProgress),
    [state.sectionInProgress, state.sections]
  );

  const currentSectionItems = useMemo(
    () =>
      state.sectionInProgress
        ? state.sectionData.get(state.sectionInProgress) ?? []
        : [],
    [state.sectionInProgress, state.sectionData]
  );

  const currentMatrixData = useMemo(
    () =>
      state.sectionInProgress
        ? state.matrixData.get(state.sectionInProgress)
        : undefined,
    [state.sectionInProgress, state.matrixData]
  );

  const handleCompleteFlatSetup = useCallback(
    (items: DataItemDefinitionExtended[]) => {
      if (state.sectionInProgress) {
        updateSectionData(state.sectionInProgress, items);
      }
      goToStep(1);
    },
    [state.sectionInProgress, updateSectionData, goToStep]
  );

  const handleCompleteMatrixSetup = useCallback(
    (rows: string[], columns: string[]) => {
      if (state.sectionInProgress) {
        updateMatrixData(state.sectionInProgress, { rows, columns });
      }
      goToStep(1);
    },
    [state.sectionInProgress, updateMatrixData, goToStep]
  );

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Step1_Overview
            sections={state.sections}
            completedSections={Array.from(state.sectionData.keys()).concat(
              Array.from(state.matrixData.keys())
            )}
            onSetupSection={startSectionSetup}
            isViewOnly={isViewOnly}
            researchQuestions={researchQuestions}
            isGuidedGenerationLoading={isPlanningLoading}
            guidedGenerationError={planningError}
          />
        );

      case 2:
        return (
          <Step2_FlatSetup
            section={currentSection}
            initialItems={currentSectionItems}
            onComplete={handleCompleteFlatSetup}
            onBack={() => goToStep(1)}
            researchQuestions={researchQuestions}
          />
        );

      case 3:
        return (
          <Step3_MatrixSetup
            section={currentSection}
            initialRows={currentMatrixData?.rows}
            initialColumns={currentMatrixData?.columns}
            onComplete={handleCompleteMatrixSetup}
            onBack={() => goToStep(1)}
            researchQuestions={researchQuestions}
          />
        );

      case 4:
        return (
          <Step4_Preview
            state={state}
            getCompletedTemplate={getCompletedTemplate}
            onPublish={(savedTemplate: ExtractionTemplateResponseDto) => {
              onComplete(savedTemplate);
              resetWizard();
            }}
            onBack={() => goToStep(1)}
            isViewOnly={isViewOnly}
            researchQuestions={researchQuestions}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Progress Indicator */}
      <div className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[1, 4].map((step) => (
                <button
                  key={step}
                  onClick={() => goToStep(step as WizardStep)}
                  disabled={step > 1 && state.sections.length === 0}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      state.currentStep === step
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {/* Step {step} */}
                  {step === 1
                    ? "Overview": "Preview & Publish"}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600">
              {state.sectionInProgress && (
                <span>
                  Working on:{" "}
                  <strong>{currentSection?.name || "Loading..."}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStep()}
      </div>
    </div>
  );
}