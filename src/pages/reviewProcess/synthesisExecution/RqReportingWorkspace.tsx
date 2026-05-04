import { useMemo, useState } from "react";
import { BookOpen, BookOpenText, CheckCircle2, FileText, LayoutList, PencilLine } from "lucide-react";
import Button from "../../../components/ui/Button";
import type {
  FindingStatus,
  ResearchQuestionFindingDto,
  SaveFindingRequest,
  SynthesisThemeDto,
  SynthesisWorkspaceDto,
} from "../../../types/synthesisExecution";

interface RqReportingWorkspaceProps {
  workspace: SynthesisWorkspaceDto;
  themes: SynthesisThemeDto[];
  isReadOnly?: boolean;
  isSavingFinding?: boolean;
  onSaveFinding: (findingId: string, request: SaveFindingRequest) => Promise<void>;
  onViewStrategyGuidelines: () => void;
}

function statusChipClassName(status: FindingStatus): string {
  if (status === "Finalized") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function FindingEditor({
  finding,
  isReadOnly,
  isSavingFinding,
  onSaveFinding,
  onViewStrategyGuidelines,
}: {
  finding: ResearchQuestionFindingDto;
  isReadOnly: boolean;
  isSavingFinding: boolean;
  onSaveFinding: (findingId: string, request: SaveFindingRequest) => Promise<void>;
  onViewStrategyGuidelines: () => void;
}) {
  const [draftAnswerText, setDraftAnswerText] = useState(finding.answerText);
  const [draftStatus, setDraftStatus] = useState<FindingStatus>(finding.status);

  const handleSave = async () => {
    await onSaveFinding(finding.id, {
      answerText: draftAnswerText,
      status: draftStatus,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">RQ Reporting Workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">{finding.questionText}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onViewStrategyGuidelines} className="text-gray-600 hover:text-gray-900">
              <BookOpen className="mr-2 h-4 w-4" />
              View Strategy Guidelines
            </Button>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${statusChipClassName(draftStatus)}`}>
              <CheckCircle2 className="h-4 w-4" />
              {draftStatus}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Draft the narrative finding, then finalize it when the answer is ready for synthesis reporting.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="rq-answer">
          Answer Text
        </label>
        <textarea
          id="rq-answer"
          value={draftAnswerText}
          onChange={(event) => setDraftAnswerText(event.target.value)}
          disabled={isReadOnly}
          className="min-h-[500px] w-full rounded-2xl bg-white px-8 py-8 text-base leading-relaxed text-gray-900 shadow-inner ring-1 ring-gray-200 outline-none transition focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
          placeholder="Write the narrative answer to the research question here..."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">Status</p>
          <p className="mt-1 text-sm text-gray-500">Switch between draft and finalized before saving.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDraftStatus("Draft")}
            disabled={isReadOnly}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              draftStatus === "Draft"
                ? "border-amber-300 bg-amber-100 text-amber-800"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Draft
          </button>
          <button
            type="button"
            onClick={() => setDraftStatus("Finalized")}
            disabled={isReadOnly}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              draftStatus === "Finalized"
                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Finalized
          </button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button onClick={handleSave} isLoading={isSavingFinding} disabled={isReadOnly}>
          <PencilLine className="mr-2 h-4 w-4" />
          Save Finding
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Created: {new Date(finding.createdAt).toLocaleString()}
          </span>
          <span>Modified: {new Date(finding.modifiedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function RqReportingWorkspace({
  workspace,
  themes,
  isReadOnly = false,
  isSavingFinding = false,
  onSaveFinding,
  onViewStrategyGuidelines,
}: RqReportingWorkspaceProps) {
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);

  const activeFinding = useMemo(() => {
    if (workspace.findings.length === 0) {
      return null;
    }

    return workspace.findings.find((finding) => finding.id === activeFindingId) ?? workspace.findings[0] ?? null;
  }, [activeFindingId, workspace.findings]);

  if (workspace.findings.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <LayoutList className="h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">No research questions were returned for this synthesis process.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[300px_1fr_320px] xl:grid-cols-[290px_1fr]">
      <aside className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <LayoutList className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Research Questions</h2>
        </div>

        <div className="space-y-3">
          {workspace.findings.map((finding) => (
            <button
              key={finding.id}
              type="button"
              onClick={() => setActiveFindingId(finding.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                activeFinding?.id === finding.id
                  ? "border-blue-200 bg-blue-50/60 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2">{finding.questionText}</p>
                  <p className="mt-1 text-xs text-gray-500">RQ #{finding.researchQuestionId}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${statusChipClassName(finding.status)}`}>
                  {finding.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        {activeFinding ? (
          <FindingEditor
            key={activeFinding.id}
            finding={activeFinding}
            isReadOnly={isReadOnly}
            isSavingFinding={isSavingFinding}
            onSaveFinding={onSaveFinding}
            onViewStrategyGuidelines={onViewStrategyGuidelines}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-gray-600">Select a research question to begin drafting its finding.</p>
          </div>
        )}
      </section>

      <aside className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2 2xl:col-span-1">
        <div className="mb-4 flex items-center gap-2">
          <BookOpenText className="h-5 w-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">Theme Reference</h3>
        </div>

        {themes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
            <p className="text-sm text-gray-500">No themes available yet. Create themes in Thematic Analysis.</p>
          </div>
        ) : (
          <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
            {themes.map((theme) => (
              <div key={theme.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.colorCode ?? "#94a3b8" }} />
                  <p className="text-sm font-semibold text-gray-900">{theme.name}</p>
                </div>
                <p className="mt-1 text-xs leading-5 text-gray-600">{theme.description || "No description provided."}</p>
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}