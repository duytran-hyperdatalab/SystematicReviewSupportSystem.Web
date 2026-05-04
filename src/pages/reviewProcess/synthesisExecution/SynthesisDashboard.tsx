import { ArrowRight, BarChart3, CheckCircle2, LayoutDashboard, Lightbulb, PencilLine, Sparkles, Tags } from "lucide-react";
import Button from "../../../components/ui/Button";
import type { SynthesisWorkspaceDto } from "../../../types/synthesisExecution";

interface SynthesisDashboardProps {
  workspace: SynthesisWorkspaceDto;
  finalizedFindingCount: number;
  evidenceCount: number;
  canCompletePhase: boolean;
  isCompleting?: boolean;
  isReadOnly?: boolean;
  onNavigateToThematic: () => void;
  onNavigateToDescriptiveCharts: () => void;
  onNavigateToRqReporting: () => void;
  onCompletePhase: () => void;
}

function statusLabel(status: SynthesisWorkspaceDto["process"]["status"]): string {
  if (status === "InProgress") {
    return "In Progress";
  }

  if (status === "Completed") {
    return "Completed";
  }

  return "Not Started";
}

function SummaryTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
  accentClassName,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  accentClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accentClassName}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="inline-flex rounded-2xl bg-gray-50 p-3 text-gray-900">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-gray-500" />
      </div>
      <p className="mt-4 max-w-md text-sm leading-6 text-gray-600">{description}</p>
    </button>
  );
}

export default function SynthesisDashboard({
  workspace,
  finalizedFindingCount,
  evidenceCount,
  canCompletePhase,
  isCompleting = false,
  isReadOnly = false,
  onNavigateToThematic,
  onNavigateToDescriptiveCharts,
  onNavigateToRqReporting,
  onCompletePhase,
}: SynthesisDashboardProps) {
  const completedAt = workspace.process.completedAt
    ? new Date(workspace.process.completedAt).toLocaleString()
    : "Not completed yet";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Synthesis Phase</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">Overview Dashboard</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                Monitor thematic analysis and research question reporting from one place. Use the shortcuts below to move between coding and narrative drafting.
              </p>
            </div>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
              {statusLabel(workspace.process.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile label="Themes" value={workspace.themes.length} icon={<Tags className="h-4 w-4" />} />
            <SummaryTile
              label="RQ Findings"
              value={`${finalizedFindingCount}/${workspace.findings.length}`}
              icon={<PencilLine className="h-4 w-4" />}
            />
            <SummaryTile label="Linked Evidence" value={evidenceCount} icon={<Sparkles className="h-4 w-4" />} />
            <SummaryTile label="Completed At" value={completedAt} icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>

          {workspace.process.status === "InProgress" && canCompletePhase && !isReadOnly ? (
            <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">All research question findings are finalized.</p>
                  <p className="mt-1 text-sm text-emerald-700">You can complete the synthesis phase and lock the workspace.</p>
                </div>
                <Button variant="success" isLoading={isCompleting} onClick={onCompletePhase} className="shadow-md shadow-emerald-200">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Synthesis Phase
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Phase Status</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>Started: {workspace.process.startedAt ? new Date(workspace.process.startedAt).toLocaleString() : "Not started yet"}</p>
            <p>Completed: {completedAt}</p>
            <p>Read-only mode: {isReadOnly ? "Yes" : "No"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ActionCard
          title="Thematic Analysis"
          description="Organize raw extracted data into themes, attach evidence, and refine the conceptual model for your synthesis narrative."
          icon={<Tags className="h-6 w-6 text-blue-600" />}
          onClick={onNavigateToThematic}
          accentClassName="hover:border-blue-200 hover:bg-blue-50/40"
        />
        <ActionCard
          title="Descriptive Charts"
          description="Visualize categorical and demographic data extracted from the included studies using auto-generated charts."
          icon={<BarChart3 className="h-6 w-6 text-indigo-600" />}
          onClick={onNavigateToDescriptiveCharts}
          accentClassName="hover:border-indigo-200 hover:bg-indigo-50/40"
        />
        <ActionCard
          title="RQ Reporting"
          description="Draft and finalize the narrative answer for each research question, then lock the findings when the wording is ready."
          icon={<PencilLine className="h-6 w-6 text-emerald-600" />}
          onClick={onNavigateToRqReporting}
          accentClassName="hover:border-emerald-200 hover:bg-emerald-50/40"
        />
      </section>

      {workspace.themes.length === 0 || workspace.findings.length === 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {workspace.themes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-5">
              <div className="flex items-start gap-3">
                <Tags className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">No themes created yet</p>
                  <p className="mt-1 text-sm text-blue-700">Start thematic analysis and create your first coding theme.</p>
                </div>
              </div>
            </div>
          ) : null}

          {workspace.findings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">No RQ findings available</p>
                  <p className="mt-1 text-sm text-amber-700">Start synthesis to generate drafting slots for research question findings.</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}