import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BarChart3, Layers3, NotebookText } from "lucide-react";
import Button from "../../../components/ui/Button";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import { useSynthesisWorkspace } from "./hooks/useSynthesisWorkspace";
import DescriptiveChartsWorkspace from "./DescriptiveChartsWorkspace";
import SynthesisDashboard from "./SynthesisDashboard";
import ThematicWorkspace from "./ThematicWorkspace";
import RqReportingWorkspace from "./RqReportingWorkspace";
import SynthesisStrategyModal from "./components/SynthesisStrategyModal";
import StrategyGuidelinesModal from "./components/StrategyGuidelinesModal";
import SynthesisWorkspaceErrorBoundary from "./components/SynthesisWorkspaceErrorBoundary";

type SynthesisSectionKey = "overview" | "descriptive-charts" | "thematic-analysis" | "rq-reporting";

const SECTION_LABELS: Record<SynthesisSectionKey, string> = {
  overview: "Overview",
  "descriptive-charts": "Descriptive Charts",
  "thematic-analysis": "Thematic Analysis",
  "rq-reporting": "RQ Reporting",
};

function resolveSection(pathname: string): SynthesisSectionKey {
  if (pathname.includes("rq-reporting")) {
    return "rq-reporting";
  }

  if (pathname.includes("descriptive-charts")) {
    return "descriptive-charts";
  }

  if (pathname.includes("thematic-analysis")) {
    return "thematic-analysis";
  }

  return "overview";
}

export default function SynthesisPhaseWorkspace() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, processId } = useParams<{ projectId: string; processId: string }>();
  const workspace = useSynthesisWorkspace();
  const [isStrategyGuidelinesOpen, setIsStrategyGuidelinesOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const synthesisBasePath = `/projects/${projectId}/processes/${processId}/synthesis`;

  const activeSection = resolveSection(location.pathname);
  const phaseIsStarted = workspace.processStatus && workspace.processStatus !== "NotStarted";

  useEffect(() => {
    if (phaseIsStarted && activeSection === "overview" && !location.pathname.endsWith("overview")) {
      navigate(`${synthesisBasePath}/overview`, { replace: true });
    }
  }, [activeSection, location.pathname, navigate, phaseIsStarted, synthesisBasePath]);

  const handleBack = () => {
    if (!projectId || !processId) {
      navigate("/projects");
      return;
    }

    navigate(`/projects/${projectId}/processes/${processId}`);
  };

  const handleStart = async () => {
    await workspace.startSynthesis();
  };

  const isReadOnly = workspace.processStatus === "Completed";
  const canCompletePhase = workspace.allFindingsFinalized;

  const tabs = useMemo(
    () => [
      {
        key: "overview" as const,
        label: SECTION_LABELS.overview,
        icon: Layers3,
      },
      {
        key: "descriptive-charts" as const,
        label: SECTION_LABELS["descriptive-charts"],
        icon: BarChart3,
      },
      {
        key: "thematic-analysis" as const,
        label: SECTION_LABELS["thematic-analysis"],
        icon: NotebookText,
      },
      {
        key: "rq-reporting" as const,
        label: SECTION_LABELS["rq-reporting"],
        icon: NotebookText,
      },
    ],
    [],
  );

  if (workspace.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (workspace.error || !workspace.workspace) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">Synthesis Workspace Error</h2>
          <p className="mt-2 text-sm text-red-700">{workspace.error || "Unable to load synthesis workspace."}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => workspace.refetchWorkspace()}>
              Retry
            </Button>
            <Button variant="secondary" onClick={handleBack}>
              Back to Process
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (workspace.processStatus === "NotStarted") {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Layers3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Synthesis Phase</p>
              <h1 className="text-2xl font-semibold text-gray-900">Start the synthesis workspace</h1>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <p className="text-sm leading-6 text-gray-600">
              The synthesis phase is not started yet. Once activated, the workspace will unlock thematic analysis and research question reporting.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={() => setIsStrategyModalOpen(true)} isLoading={workspace.isStarting}>
              Start Synthesis Phase
            </Button>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Process
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Synthesis Phase Workspace</p>
            <h1 className="mt-1 text-lg font-semibold text-gray-900">{SECTION_LABELS[activeSection]}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
              {workspace.processStatus}
            </span>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Process
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="grid gap-2 md:grid-cols-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => navigate(`${synthesisBasePath}/${tab.key}`)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <SynthesisWorkspaceErrorBoundary>
          {activeSection === "thematic-analysis" ? (
            <ThematicWorkspace
              workspace={workspace.workspace}
              sourceDataGroups={workspace.sourceDataGroups}
              isReadOnly={isReadOnly}
              isCreatingTheme={workspace.isCreatingTheme}
              isUpdatingTheme={workspace.isUpdatingTheme}
              isDeletingTheme={workspace.isDeletingTheme}
              isLinkingEvidence={workspace.isLinkingEvidence}
              isUnlinkingEvidence={workspace.isUnlinkingEvidence}
              onCreateTheme={workspace.createTheme}
              onUpdateTheme={workspace.updateTheme}
              onDeleteTheme={workspace.deleteTheme}
              onLinkEvidence={workspace.linkEvidence}
              onUnlinkEvidence={workspace.unlinkEvidence}
              onViewStrategyGuidelines={() => setIsStrategyGuidelinesOpen(true)}
            />
          ) : activeSection === "descriptive-charts" ? (
            <DescriptiveChartsWorkspace sourceDataGroups={workspace.sourceDataGroups} />
          ) : activeSection === "rq-reporting" ? (
            <RqReportingWorkspace
              workspace={workspace.workspace}
              themes={workspace.themes}
              isReadOnly={isReadOnly}
              isSavingFinding={workspace.isSavingFinding}
              onSaveFinding={workspace.saveFinding}
              onViewStrategyGuidelines={() => setIsStrategyGuidelinesOpen(true)}
            />
          ) : (
            <SynthesisDashboard
              workspace={workspace.workspace}
              finalizedFindingCount={workspace.finalizedFindingCount}
              evidenceCount={workspace.evidenceCount}
              canCompletePhase={canCompletePhase}
              isCompleting={workspace.isCompleting}
              isReadOnly={isReadOnly}
              onNavigateToThematic={() => navigate(`${synthesisBasePath}/thematic-analysis`)}
              onNavigateToDescriptiveCharts={() => navigate(`${synthesisBasePath}/descriptive-charts`)}
              onNavigateToRqReporting={() => navigate(`${synthesisBasePath}/rq-reporting`)}
              onCompletePhase={workspace.completeSynthesis}
            />
          )}
        </SynthesisWorkspaceErrorBoundary>
      </main>

      {workspace.workspace?.process.id ? (
        <StrategyGuidelinesModal
          isOpen={isStrategyGuidelinesOpen}
          onClose={() => setIsStrategyGuidelinesOpen(false)}
          synthesisProcessId={workspace.workspace.process.id}
        />
      ) : null}

      {projectId && workspace.workspace?.process.id && isStrategyModalOpen ? (
        <SynthesisStrategyModal
          isOpen={isStrategyModalOpen}
          projectId={projectId}
          synthesisProcessId={workspace.workspace.process.id}
          onClose={() => setIsStrategyModalOpen(false)}
          onStartSynthesis={handleStart}
        />
      ) : null}
    </div>
  );
}