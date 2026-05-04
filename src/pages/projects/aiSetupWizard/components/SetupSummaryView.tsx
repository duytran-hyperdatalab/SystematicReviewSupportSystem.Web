import type { EditableResearchQuestion, PicoCForm, ScopeForm } from "../types";
import { SparkleIcon } from "./Common";

interface SetupSummaryViewProps {
  topic: string;
  language: string;
  scopeForm: ScopeForm;
  picocForm: PicoCForm;
  researchQuestions: EditableResearchQuestion[];
  onEdit: () => void;
}

export default function SetupSummaryView({
  topic,
  language,
  scopeForm,
  picocForm,
  researchQuestions,
  onEdit,
}: SetupSummaryViewProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Setup Summary</h2>
          <p className="text-sm text-slate-600">
            Project setup already exists. You can review or edit it.
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Edit Setup
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Research Topic
        </p>
        <p className="text-sm text-slate-800">{topic || "-"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Output Language
        </p>
        <p className="text-sm text-slate-800">{language || "English"}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Scope</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-500">Objective</p>
            <p className="text-sm text-slate-800">{scopeForm.objectives || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Domain</p>
            <p className="text-sm text-slate-800">{scopeForm.domain || "-"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">PICO-C</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-500">Population (P)</p>
            <p className="text-sm text-slate-800">{picocForm.population || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Intervention (I)</p>
            <p className="text-sm text-slate-800">{picocForm.intervention || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Comparator (C)</p>
            <p className="text-sm text-slate-800">{picocForm.comparator || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Outcome (O)</p>
            <p className="text-sm text-slate-800">{picocForm.outcome || "-"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-slate-500">Context (C)</p>
            <p className="text-sm text-slate-800">{picocForm.context || "-"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100/70 px-3 py-1 text-xs font-semibold text-indigo-700">
          <SparkleIcon className="h-3.5 w-3.5" />
          Research Questions
        </div>

        <div className="space-y-2">
          {researchQuestions.length === 0 && (
            <p className="text-sm text-slate-600">No research questions added yet.</p>
          )}

          {researchQuestions.map((rq, index) => (
            <div
              key={`${rq.id ?? "new"}-${index}`}
              className="rounded-lg border border-indigo-100 bg-white/80 p-3"
            >
              <p className="text-xs font-semibold text-indigo-700">RQ {index + 1}</p>
              <p className="text-sm text-slate-800">{rq.questionText}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
