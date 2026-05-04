import type { PicoCForm, ScopeForm, Step } from "../types";
import { AISkeleton, FieldLabel, SparkleIcon, StepBadge } from "./Common";

interface SetupWizardFlowProps {
  currentStep: Step;
  completionMap: Record<number, boolean>;
  isAnalyzingIdea: boolean;
  isGeneratingPicoc: boolean;
  isGeneratingRQ: boolean;
  isSavingSetup: boolean;
  topic: string;
  language: string;
  scopeForm: ScopeForm;
  picocForm: PicoCForm;
  rqOptions: string[];
  selectedRqIndexes: number[];
  customRQInput: string;
  customRQs: string[];
  finalizedWizardRQs: string[];
  isStep2Valid: boolean;
  isStep3Valid: boolean;
  onSetCurrentStep: (step: Step) => void;
  onTopicChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onScopeChange: (field: keyof ScopeForm, value: string) => void;
  onPicocChange: (field: keyof PicoCForm, value: string) => void;
  onCustomRQInputChange: (value: string) => void;
  onAnalyzeIdea: () => void;
  onGeneratePicoc: () => void;
  onGenerateRQ: () => void;
  onToggleSuggestedRQ: (index: number) => void;
  onAddCustomRQ: () => void;
  onRemoveCustomRQ: (index: number) => void;
  onConfirmAndReview: () => void;
  onSaveWizardSetup: () => void;
}

export default function SetupWizardFlow({
  currentStep,
  completionMap,
  isAnalyzingIdea,
  isGeneratingPicoc,
  isGeneratingRQ,
  isSavingSetup,
  topic,
  language,
  scopeForm,
  picocForm,
  rqOptions,
  selectedRqIndexes,
  customRQInput,
  customRQs,
  finalizedWizardRQs,
  isStep2Valid,
  isStep3Valid,
  onSetCurrentStep,
  onTopicChange,
  onLanguageChange,
  onScopeChange,
  onPicocChange,
  onCustomRQInputChange,
  onAnalyzeIdea,
  onGeneratePicoc,
  onGenerateRQ,
  onToggleSuggestedRQ,
  onAddCustomRQ,
  onRemoveCustomRQ,
  onConfirmAndReview,
  onSaveWizardSetup,
}: SetupWizardFlowProps) {
  return (
    <>
      <div className="mb-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <StepBadge step={1} currentStep={currentStep} label="The Spark" complete={completionMap[1]} />
        <StepBadge step={2} currentStep={currentStep} label="Scope Definition" complete={completionMap[2]} />
        <StepBadge step={3} currentStep={currentStep} label="PICO-C Breakdown" complete={completionMap[3]} />
        <StepBadge step={4} currentStep={currentStep} label="RQ Formulation" complete={completionMap[4]} />
        <StepBadge step={5} currentStep={currentStep} label="Summary" complete={completionMap[5]} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {isAnalyzingIdea && <AISkeleton title="Analyzing your topic and drafting objectives + domain..." />}

        {!isAnalyzingIdea && currentStep === 1 && (
          <section>
            <h2 className="mb-1 text-xl font-bold text-slate-900">Step 1: The Spark</h2>
            <p className="mb-6 text-sm text-slate-600">
              Provide your initial thought. The AI will extract foundational scope signals.
            </p>

            <FieldLabel title="Research Topic / Raw Idea" />
            <textarea
              rows={7}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="Describe your idea..."
              value={topic}
              onChange={(e) => onTopicChange(e.target.value)}
            />

            <div className="mt-4">
              <FieldLabel title="Output Language" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-64"
              >
                <option value="English">English</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                AI will generate objectives, PICO-C, and research questions in this language.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onAnalyzeIdea}
                disabled={!topic.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparkleIcon className="h-4 w-4" />
                Analyze with AI
              </button>
            </div>
          </section>
        )}

        {!isGeneratingPicoc && currentStep === 2 && (
          <section>
            <h2 className="mb-1 text-xl font-bold text-slate-900">Step 2: Scope Definition</h2>
            <p className="mb-6 text-sm text-slate-600">
              Confirm your objective and domain so AI can produce better PICO-C suggestions.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-4">
                <FieldLabel title="Objectives (Goal)" ai />
                <textarea
                  rows={3}
                  value={scopeForm.objectives}
                  onChange={(e) => onScopeChange("objectives", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-4">
                <FieldLabel title="Domain" ai />
                <textarea
                  rows={3}
                  value={scopeForm.domain}
                  onChange={(e) => onScopeChange("domain", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => onSetCurrentStep(1)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onGeneratePicoc}
                disabled={!isStep2Valid}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparkleIcon className="h-4 w-4" />
                Generate PICO-C Suggestions
              </button>
            </div>
          </section>
        )}

        {isGeneratingPicoc && (
          <AISkeleton title="Generating PICO-C suggestions from topic, objective, and domain..." />
        )}

        {!isGeneratingRQ && currentStep === 3 && (
          <section>
            <h2 className="mb-1 text-xl font-bold text-slate-900">Step 3: PICO-C Breakdown</h2>
            <p className="mb-6 text-sm text-slate-600">
              Review AI-suggested fields. Accept, refine, or clear each element before generating
              research questions.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["population", "Population (P)", 3, "Đối tượng nghiên cứu (con người, nhóm, vấn đề)."],
                  ["intervention", "Intervention (I)", 3, "Biện pháp, kỹ thuật hoặc công cụ đang được nghiên cứu."],
                  ["comparator", "Comparator (C)", 3, "Phương pháp so sánh (can thiệp khác, giả dược, hoặc không làm gì)."],
                  ["outcome", "Outcome (O)", 3, "Kết quả mong muốn hoặc cần đo lường."],
                  ["context", "Context (C)", 3, "Bối cảnh, môi trường hoặc phạm vi nghiên cứu (ví dụ: bối cảnh công ty, lĩnh vực xã hội)."],
                ] as const
              ).map(([key, label, rows, description]) => (
                <div
                  key={key}
                  className={[
                    "rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-4",
                    key === "context" ? "sm:col-span-2" : "",
                  ].join(" ")}
                >
                  <FieldLabel title={label} ai />
                  <p className="mb-2 text-xs text-slate-500 italic leading-relaxed">{description}</p>
                  <textarea
                    rows={rows}
                    value={picocForm[key]}
                    onChange={(e) => onPicocChange(key, e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => onPicocChange(key, "")}
                      className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => onSetCurrentStep(2)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onGenerateRQ}
                disabled={!isStep3Valid}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparkleIcon className="h-4 w-4" />
                Generate Research Questions
              </button>
            </div>
          </section>
        )}

        {isGeneratingRQ && <AISkeleton title="Generating candidate research questions..." />}

        {!isGeneratingRQ && currentStep === 4 && (
          <section>
            <h2 className="mb-1 text-xl font-bold text-slate-900">Step 4: Research Question Formulation</h2>
            <p className="mb-6 text-sm text-slate-600">
              Select suggested options and/or add custom research questions.
            </p>

            <div className="grid gap-4">
              {rqOptions.length === 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  AI did not return suggestions. Please add custom research questions manually.
                </div>
              )}

              {rqOptions.map((option, index) => {
                const selected = selectedRqIndexes.includes(index);
                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() => onToggleSuggestedRQ(index)}
                    className={[
                      "w-full rounded-2xl border p-4 text-left transition",
                      selected
                        ? "border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    ].join(" ")}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                        Option {String.fromCharCode(65 + index)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700">
                        <SparkleIcon className="h-3.5 w-3.5" />
                        AI Suggested
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{option}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <FieldLabel title="Custom RQ (Optional, multiple allowed)" />
              <div className="space-y-3">
                <textarea
                  rows={3}
                  value={customRQInput}
                  onChange={(e) => onCustomRQInputChange(e.target.value)}
                  placeholder="Write a custom research question, then click Add"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onAddCustomRQ}
                    disabled={!customRQInput.trim()}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add Custom RQ
                  </button>
                </div>

                {customRQs.length > 0 && (
                  <div className="space-y-2">
                    {customRQs.map((rq, index) => (
                      <div
                        key={`${rq}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <p className="text-sm text-slate-700">{rq}</p>
                        <button
                          type="button"
                          onClick={() => onRemoveCustomRQ(index)}
                          className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-slate-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => onSetCurrentStep(3)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onConfirmAndReview}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Confirm & Review
              </button>
            </div>
          </section>
        )}

        {currentStep === 5 && (
          <section>
            <h2 className="mb-1 text-xl font-bold text-slate-900">Step 5: Summary & Finalization</h2>
            <p className="mb-6 text-sm text-slate-600">Review setup details before saving them to this project.</p>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Finalized Topic</p>
                <p className="text-sm leading-relaxed text-slate-800">{topic}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Scope Definition</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Objectives</p>
                    <p className="text-sm text-slate-800">{scopeForm.objectives}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Domain</p>
                    <p className="text-sm text-slate-800">{scopeForm.domain}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">PICO-C Structure</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Population (P)</p>
                    <p className="text-sm text-slate-800">{picocForm.population}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Intervention (I)</p>
                    <p className="text-sm text-slate-800">{picocForm.intervention}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Comparator (C)</p>
                    <p className="text-sm text-slate-800">{picocForm.comparator}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Outcome (O)</p>
                    <p className="text-sm text-slate-800">{picocForm.outcome}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-slate-500">Context (C)</p>
                    <p className="text-sm text-slate-800">{picocForm.context}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100/70 px-3 py-1 text-xs font-semibold text-indigo-700">
                  <SparkleIcon className="h-3.5 w-3.5" />
                  Final Research Questions
                </div>
                <div className="space-y-2">
                  {finalizedWizardRQs.length === 0 && (
                    <p className="text-sm text-slate-700">No research questions added yet.</p>
                  )}
                  {finalizedWizardRQs.map((rq, index) => (
                    <div key={`${rq}-${index}`} className="rounded-lg border border-indigo-100 bg-white/70 p-3">
                      <p className="text-xs font-semibold text-indigo-700">RQ {index + 1}</p>
                      <p className="text-sm leading-relaxed text-slate-800">{rq}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <button
                type="button"
                onClick={() => onSetCurrentStep(4)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onSaveWizardSetup}
                disabled={isSavingSetup}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingSetup ? "Saving..." : "Save Details"}
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
