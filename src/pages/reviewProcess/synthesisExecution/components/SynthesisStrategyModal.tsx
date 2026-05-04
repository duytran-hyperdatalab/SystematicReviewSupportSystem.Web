import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckSquare, Layers3, Sparkles, Target } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import LoadingSpinner from "../../../../components/ui/LoadingSpinner";
import { QUERY_KEYS } from "../../../../constants/queryKeys";
import { getErrorMessage } from "../../../../utils/errorUtils";
import synthesisExecutionService from "../../../../services/synthesisExecutionService";
import { useProjectResearchQuestions } from "../../../../hooks/useProjects";
import type {
  DataSynthesisStrategyDto,
  UpsertSynthesisStrategyRequest,
} from "../../../../types/synthesisExecution";
import type { SynthesisType } from "../../../../types/synthesis";

interface SynthesisStrategyModalProps {
  isOpen: boolean;
  projectId: string;
  synthesisProcessId: string;
  onClose: () => void;
  onStartSynthesis?: () => Promise<void>;
  startAfterSave?: boolean;
}

interface SynthesisStrategyFormState {
  synthesisStrategyId: string | null;
  synthesisType: SynthesisType | "";
  description: string;
  targetResearchQuestionSelectionIds: string[];
  dataGroupingPlan: string;
  sensitivityAnalysisPlan: string;
}

interface SelectableResearchQuestion {
  selectionId: string;
  backendId: string;
  questionText: string;
}

function hasValue(value: string | null | undefined): value is string {
  return Boolean(value && value.trim());
}

const SYNTHESIS_TYPE_OPTIONS: Array<{ value: SynthesisType; label: string; description: string }> = [
  {
    value: "DescriptiveStatistics",
    label: "Descriptive Statistics",
    description: "Summarize study-level numeric and categorical patterns.",
  },
  {
    value: "NarrativeThematic",
    label: "Narrative / Thematic Analysis",
    description: "Cluster findings into themes and write narrative interpretations.",
  },
  {
    value: "CrossTabulation",
    label: "Cross-tabulation",
    description: "Compare outcomes across study characteristics or groups.",
  },
  {
    value: "QuantitativeMetaAnalysis",
    label: "Quantitative Meta-analysis",
    description: "Pool quantitative outcomes where effect measures are compatible.",
  },
];

function buildInitialFormState(strategy: DataSynthesisStrategyDto | null): SynthesisStrategyFormState {
  return {
    synthesisStrategyId: strategy?.synthesisStrategyId ?? null,
    synthesisType: strategy?.synthesisType ?? "",
    description: strategy?.description ?? "",
    targetResearchQuestionSelectionIds: [],
    dataGroupingPlan: strategy?.dataGroupingPlan ?? "",
    sensitivityAnalysisPlan: strategy?.sensitivityAnalysisPlan ?? "",
  };
}

function ResearchQuestionList({
  researchQuestions,
  selectedIds,
  onToggle,
}: {
  researchQuestions: SelectableResearchQuestion[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  if (researchQuestions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-800">
        No research questions were found for this project yet. Create at least one question before defining a synthesis strategy.
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {researchQuestions.map((question) => {
        const isSelected = selectedIds.includes(question.selectionId);

        return (
          <button
            key={question.selectionId}
            type="button"
            onClick={() => onToggle(question.selectionId)}
            className={`flex h-full flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
              isSelected
                ? "border-blue-300 bg-blue-50 shadow-sm shadow-blue-100"
                : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold ${
                  isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {isSelected ? <CheckSquare className="h-4 w-4" /> : <Target className="h-4 w-4" />}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Research Question</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{question.questionText}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function SynthesisStrategyModal({
  isOpen,
  projectId,
  synthesisProcessId,
  onClose,
  onStartSynthesis,
  startAfterSave = true,
}: SynthesisStrategyModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<SynthesisStrategyFormState>(buildInitialFormState(null));

  const researchQuestionsQuery = useProjectResearchQuestions(projectId);
  const strategiesQuery = useQuery({
    queryKey: QUERY_KEYS.synthesisExecution.strategies(synthesisProcessId),
    queryFn: () => synthesisExecutionService.getSynthesisStrategiesByProcessId(synthesisProcessId),
    enabled: isOpen && Boolean(synthesisProcessId),
    staleTime: 60 * 1000,
  });

  const activeStrategy = useMemo(() => strategiesQuery.data?.[0] ?? null, [strategiesQuery.data]);
  const researchQuestions = useMemo<SelectableResearchQuestion[]>(
    () =>
      researchQuestionsQuery.researchQuestions.map((question, index) => ({
        selectionId: question.id?.trim() || `research-question-${index}`,
        backendId: question.id,
        questionText: question.questionText,
      })),
    [researchQuestionsQuery.researchQuestions],
  );
  const isLoading = researchQuestionsQuery.isLoading || strategiesQuery.isLoading;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormState({
      ...buildInitialFormState(activeStrategy),
      targetResearchQuestionSelectionIds: activeStrategy
        ? researchQuestions
            .filter((question) => activeStrategy.targetResearchQuestionIds.includes(question.backendId))
            .map((question) => question.selectionId)
        : [],
    });
  }, [activeStrategy, isOpen, researchQuestions]);

  const upsertStrategyMutation = useMutation({
    mutationFn: (request: UpsertSynthesisStrategyRequest) => synthesisExecutionService.upsertSynthesisStrategy(request),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.synthesisExecution.strategies(synthesisProcessId),
      });
    },
  });

  const handleToggleResearchQuestion = (questionId: string) => {
    setFormState((current) => {
      const exists = current.targetResearchQuestionSelectionIds.includes(questionId);

      return {
        ...current,
        targetResearchQuestionSelectionIds: exists
          ? current.targetResearchQuestionSelectionIds.filter((id) => id !== questionId)
          : [...current.targetResearchQuestionSelectionIds, questionId],
      };
    });
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    setFormState(buildInitialFormState(activeStrategy));
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.synthesisType) {
      toast.error("Please select a synthesis type.");
      return;
    }

    if (!formState.description.trim()) {
      toast.error("Please enter a synthesis description.");
      return;
    }

    if (formState.targetResearchQuestionSelectionIds.length === 0) {
      toast.error("Please select at least one research question.");
      return;
    }

    const targetResearchQuestionIds = researchQuestions
      .filter((question) => formState.targetResearchQuestionSelectionIds.includes(question.selectionId))
      .map((question) => question.backendId)
      .filter(hasValue);

    if (targetResearchQuestionIds.length === 0) {
      toast.error("Selected research questions are invalid. Please refresh and select again.");
      return;
    }

    setIsSubmitting(true);

    try {
      await upsertStrategyMutation.mutateAsync({
        synthesisStrategyId: formState.synthesisStrategyId,
        synthesisProcessId,
        synthesisType: formState.synthesisType,
        description: formState.description.trim(),
        targetResearchQuestionIds,
        dataGroupingPlan: formState.dataGroupingPlan.trim() || null,
        sensitivityAnalysisPlan: formState.sensitivityAnalysisPlan.trim() || null,
      });

      if (startAfterSave && onStartSynthesis) {
        await onStartSynthesis();
        toast.success("Synthesis strategy saved and synthesis started.");
      } else {
        toast.success("Synthesis strategy saved successfully.");
      }
      setFormState(buildInitialFormState(null));
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save synthesis strategy"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Define Synthesis Strategy"
      description="Save the leader's synthesis plan before the workspace is started."
      size="xl"
      closeOnOutsideClick={!isSubmitting}
      closeOnEsc={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-white p-3 text-blue-600 shadow-sm ring-1 ring-blue-100">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">Planning step</p>
              <h3 className="mt-1 text-xl font-semibold text-slate-900">Prepare the synthesis plan before starting</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Define the synthesis approach, choose the research questions this strategy will answer, and document how evidence will be grouped and stress-tested.
              </p>
            </div>
          </div>

          {activeStrategy ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              An existing strategy was found and will be updated when you save.
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-gray-200 bg-gray-50">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-blue-600" />
                <h4 className="text-base font-semibold text-gray-900">Synthesis Type</h4>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {SYNTHESIS_TYPE_OPTIONS.map((option) => {
                  const isSelected = formState.synthesisType === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormState((current) => ({ ...current, synthesisType: option.value }))}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-blue-300 bg-blue-50 shadow-sm shadow-blue-100"
                          : "border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-600">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h4 className="text-base font-semibold text-gray-900">Target Research Questions</h4>
                </div>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  {formState.targetResearchQuestionSelectionIds.length} selected
                </span>
              </div>
              <ResearchQuestionList
                researchQuestions={researchQuestions}
                selectedIds={formState.targetResearchQuestionSelectionIds}
                onToggle={handleToggleResearchQuestion}
              />
            </section>

            <section className="space-y-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h4 className="text-base font-semibold text-gray-900">Strategy Details</h4>
              </div>

              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Description</span>
                  <textarea
                    value={formState.description}
                    onChange={(event) => setFormState((current) => ({ ...current, description: event.target.value }))}
                    rows={4}
                    maxLength={2000}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Summarize the synthesis objective and the scope of the planned analysis."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Data Grouping Plan</span>
                  <textarea
                    value={formState.dataGroupingPlan}
                    onChange={(event) => setFormState((current) => ({ ...current, dataGroupingPlan: event.target.value }))}
                    rows={4}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Describe how extracted data should be grouped across studies."
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Sensitivity Analysis Plan</span>
                  <textarea
                    value={formState.sensitivityAnalysisPlan}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, sensitivityAnalysisPlan: event.target.value }))
                    }
                    rows={4}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Describe how robustness checks or alternative groupings should be handled."
                  />
                </label>
              </div>
            </section>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isLoading || researchQuestions.length === 0}>
            {startAfterSave ? "Save & Start Synthesis" : "Save Strategy"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}