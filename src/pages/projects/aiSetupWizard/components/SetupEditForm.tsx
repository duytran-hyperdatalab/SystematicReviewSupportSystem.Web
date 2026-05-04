import type { EditableResearchQuestion, PicoCForm, ScopeForm } from "../types";
import { FieldLabel } from "./Common";

interface SetupEditFormProps {
  topic: string;
  language: string;
  scopeForm: ScopeForm;
  picocForm: PicoCForm;
  editResearchQuestions: EditableResearchQuestion[];
  editNewRQInput: string;
  isSavingSetup: boolean;
  onTopicChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onScopeChange: (field: keyof ScopeForm, value: string) => void;
  onPicocChange: (field: keyof PicoCForm, value: string) => void;
  onEditRQTextChange: (index: number, value: string) => void;
  onDeleteEditRQ: (index: number) => void;
  onEditNewRQInputChange: (value: string) => void;
  onAddEditRQ: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function SetupEditForm({
  topic,
  language,
  scopeForm,
  picocForm,
  editResearchQuestions,
  editNewRQInput,
  isSavingSetup,
  onTopicChange,
  onLanguageChange,
  onScopeChange,
  onPicocChange,
  onEditRQTextChange,
  onDeleteEditRQ,
  onEditNewRQInputChange,
  onAddEditRQ,
  onCancel,
  onSave,
}: SetupEditFormProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Edit Setup</h2>
          <p className="text-sm text-slate-600">Update objective, PICO-C and research questions.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <FieldLabel title="Research Topic" />
        <textarea
          rows={3}
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <FieldLabel title="Output Language" />
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 sm:w-64"
        >
          <option value="English">English</option>
          <option value="Vietnamese">Vietnamese</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <FieldLabel title="Objective" />
          <textarea
            rows={3}
            value={scopeForm.objectives}
            onChange={(e) => onScopeChange("objectives", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <FieldLabel title="Domain" />
          <textarea
            rows={3}
            value={scopeForm.domain}
            onChange={(e) => onScopeChange("domain", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(
          [
            ["population", "Population (P)"],
            ["intervention", "Intervention (I)"],
            ["comparator", "Comparator (C)"],
            ["outcome", "Outcome (O)"],
            ["context", "Context (C)"],
          ] as const
        ).map(([key, label]) => (
          <div
            key={key}
            className={[
              "rounded-2xl border border-slate-200 bg-white p-5",
              key === "context" ? "sm:col-span-2" : "",
            ].join(" ")}
          >
            <FieldLabel title={label} />
            <textarea
              rows={3}
              value={picocForm[key]}
              onChange={(e) => onPicocChange(key, e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <FieldLabel title="Research Questions" />
        <div className="space-y-3">
          {editResearchQuestions.map((rq, index) => (
            <div key={`${rq.id ?? "new"}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {rq.id ? `Existing RQ ID: ${rq.id}` : "New RQ"}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteEditRQ(index)}
                  className="text-xs font-medium text-slate-500 transition hover:text-slate-700"
                >
                  Delete
                </button>
              </div>
              <textarea
                rows={3}
                value={rq.questionText}
                onChange={(e) => onEditRQTextChange(index, e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3">
            <textarea
              rows={2}
              value={editNewRQInput}
              onChange={(e) => onEditNewRQInputChange(e.target.value)}
              placeholder="Type a new research question"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={onAddEditRQ}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Add Research Question
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSavingSetup}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSavingSetup ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}
