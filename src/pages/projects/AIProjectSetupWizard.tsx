import { useParams } from "react-router";
import type { AIProjectSetupWizardProps } from "./aiSetupWizard/types";
import { AISkeleton, SparkleIcon } from "./aiSetupWizard/components/Common";
import SetupEditForm from "./aiSetupWizard/components/SetupEditForm";
import SetupSummaryView from "./aiSetupWizard/components/SetupSummaryView";
import SetupWizardFlow from "./aiSetupWizard/components/SetupWizardFlow";
import { useAIProjectSetupState } from "./aiSetupWizard/hooks/useAIProjectSetupState";

export default function AIProjectSetupWizard({
  embedded = false,
  projectId,
  onSetupSaved,
}: AIProjectSetupWizardProps) {
  const { id: routeProjectId } = useParams<{ id: string }>();
  const resolvedProjectId = projectId ?? routeProjectId ?? "";

  const state = useAIProjectSetupState(resolvedProjectId, onSetupSaved);

  if (state.isLoadingSetup) {
    return (
      <div
        className={[
          embedded
            ? "bg-transparent"
            : "min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0e7ff_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4 py-8",
        ].join(" ")}
      >
        <div className="mx-auto max-w-6xl">
          <AISkeleton title="Loading existing setup details..." />
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        embedded
          ? "bg-transparent"
          : "min-h-screen bg-[radial-gradient(circle_at_top_right,_#e0e7ff_0%,_#f8fafc_45%,_#f1f5f9_100%)] px-4 py-8",
      ].join(" ")}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-indigo-100 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center gap-3 text-indigo-700">
            <SparkleIcon className="h-6 w-6" />
            <p className="text-sm font-semibold uppercase tracking-wider">AI-Assisted Wizard</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Project Setup Wizard for PRISMA SLR
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
            Transform your raw research idea into structured PICO-C elements and finalized
            research questions with guided AI support.
          </p>
        </div>

        {state.viewMode === "wizard" && (
          <SetupWizardFlow
            currentStep={state.currentStep}
            completionMap={state.completionMap}
            isAnalyzingIdea={state.isAnalyzingIdea}
            isGeneratingPicoc={state.isGeneratingPicoc}
            isGeneratingRQ={state.isGeneratingRQ}
            isSavingSetup={state.isSavingSetup}
            topic={state.topic}
            language={state.language}
            scopeForm={state.scopeForm}
            picocForm={state.picocForm}
            rqOptions={state.rqOptions}
            selectedRqIndexes={state.selectedRqIndexes}
            customRQInput={state.customRQInput}
            customRQs={state.customRQs}
            finalizedWizardRQs={state.finalizedWizardRQs}
            isStep2Valid={state.isStep2Valid}
            isStep3Valid={state.isStep3Valid}
            onSetCurrentStep={state.setCurrentStep}
            onTopicChange={state.setTopic}
            onLanguageChange={state.setLanguage}
            onScopeChange={(field, value) =>
              state.setScopeForm((prev) => ({
                ...prev,
                [field]: value,
              }))
            }
            onPicocChange={(field, value) =>
              state.setPicocForm((prev) => ({
                ...prev,
                [field]: value,
              }))
            }
            onCustomRQInputChange={state.setCustomRQInput}
            onAnalyzeIdea={() => void state.handleAnalyzeIdea()}
            onGeneratePicoc={() => void state.handleGeneratePicoc()}
            onGenerateRQ={() => void state.handleGenerateRQ()}
            onToggleSuggestedRQ={state.handleToggleSuggestedRQ}
            onAddCustomRQ={state.handleAddCustomRQ}
            onRemoveCustomRQ={state.handleRemoveCustomRQ}
            onConfirmAndReview={state.handleConfirmAndReview}
            onSaveWizardSetup={() => void state.handleSaveWizardSetup()}
          />
        )}

        {state.viewMode === "summary" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SetupSummaryView
              topic={state.topic}
              language={state.language}
              scopeForm={state.scopeForm}
              picocForm={state.picocForm}
              researchQuestions={state.editResearchQuestions}
              onEdit={state.handleEnterEditMode}
            />
          </div>
        )}

        {state.viewMode === "edit" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SetupEditForm
              topic={state.topic}
              language={state.language}
              scopeForm={state.scopeForm}
              picocForm={state.picocForm}
              editResearchQuestions={state.editResearchQuestions}
              editNewRQInput={state.editNewRQInput}
              isSavingSetup={state.isSavingSetup}
              onTopicChange={state.setTopic}
              onLanguageChange={state.setLanguage}
              onScopeChange={(field, value) =>
                state.setScopeForm((prev) => ({
                  ...prev,
                  [field]: value,
                }))
              }
              onPicocChange={(field, value) =>
                state.setPicocForm((prev) => ({
                  ...prev,
                  [field]: value,
                }))
              }
              onEditRQTextChange={state.handleEditRQTextChange}
              onDeleteEditRQ={state.handleDeleteEditRQ}
              onEditNewRQInputChange={state.setEditNewRQInput}
              onAddEditRQ={state.handleAddEditRQ}
              onCancel={state.handleCancelEditMode}
              onSave={() => void state.handleSaveSetup(state.editResearchQuestions)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
