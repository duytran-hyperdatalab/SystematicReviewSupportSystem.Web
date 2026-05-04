import { useState, useCallback, useMemo, useEffect } from "react";
import { ProjectRole } from "../../types/project";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useProject, useProjectMutations } from "../../hooks/useProjects";
import { useReviewProcessesByProject } from "../../hooks/useReviewProcesses";
import { useReviewNeeds, useDocuments } from "../../hooks/useProjectGovernance";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ProjectHeader from "../../components/projects/detail/ProjectHeader";
import StepProgressNav from "../../components/projects/detail/StepProgressNav";
import type { WorkflowStep, StepStatus } from "../../components/projects/detail/StepProgressNav";
import ActivateProjectStep from "../../components/projects/detail/ActivateProjectStep";
import ProjectDrawers from "../../components/projects/detail/ProjectDrawers";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProjectMembersModal from "../../components/admin/slr-projects/ProjectMembersModal";
import { aiProjectSetupService } from "../../services/aiProjectSetupService";
import OverviewTabContent from "../../components/projects/detail/OverviewTabContent";
import ProjectSetupSection from "../../components/projects/detail/ProjectSetupSection";
import BusinessJustificationSection from "../../components/projects/detail/BusinessJustificationSection";
import PaperPoolTab from "../../components/paperPool/PaperPoolTab";

type WorkflowStepKey = "business-justification" | "project-setup" | "activate-project";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Project data & mutations ─────────────────────────────────────────────
  const {
    project,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useProject(id);

  const {
    activateProject,
    isActivating: activateLoading,
    updateProjectDates,
    isUpdatingDates,
  } = useProjectMutations();

  const { processes } = useReviewProcessesByProject(id);

  const { needs: reviewNeeds, addNeed, isSubmitting: isNeedSubmitting } = useReviewNeeds(id);
  const { documents, addDocument, isSubmitting: isDocSubmitting } = useDocuments(id);

  const [isProjectSetupReady, setIsProjectSetupReady] = useState(false);

  const isLeader = useMemo(() => {
    if (!project) return false;
    return project.isLeader === true || project.role === ProjectRole.Leader;
  }, [project]);

  const isProjectActive = project?.statusText === "Active" || project?.statusText === "Completed";

  // ── Current step & workflow steps ────────────────────────────────────────
  const selectedStep = (searchParams.get("step") as WorkflowStepKey) || "project-setup";
  const setSelectedStep = (step: WorkflowStepKey) => {
    setSearchParams((prev) => {
      prev.set("step", step);
      return prev;
    }, { replace: true });
  };

  const checkProjectSetupReady = useCallback(async () => {
    if (!id) {
      setIsProjectSetupReady(false);
      return;
    }

    try {
      const response = await aiProjectSetupService.getSetupDetails(id);
      if (!response.isSuccess || !response.data) {
        setIsProjectSetupReady(false);
        return;
      }

      const data = response.data;
      const hasSetup =
        data.researchTopic.trim().length > 0 ||
        data.researchObjective.trim().length > 0 ||
        data.domain.trim().length > 0 ||
        data.picoc.population.trim().length > 0 ||
        data.picoc.intervention.trim().length > 0 ||
        data.picoc.comparator.trim().length > 0 ||
        data.picoc.outcome.trim().length > 0 ||
        data.picoc.context.trim().length > 0 ||
        data.researchQuestions.length > 0;

      setIsProjectSetupReady(hasSetup);
    } catch {
      setIsProjectSetupReady(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void checkProjectSetupReady();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [checkProjectSetupReady]);

  const workflowSteps: WorkflowStep[] = useMemo(() => {
    const getStatus = (stepKey: WorkflowStepKey): StepStatus => {
      if (isProjectActive) return "completed";

      if (stepKey === "project-setup") {
        return isProjectSetupReady ? "completed" : "current";
      }

      if (stepKey === "business-justification") {
        if (!isProjectSetupReady) return "locked";
        const hasContent = reviewNeeds.length > 0 || documents.length > 0;
        return hasContent ? "completed" : "current";
      }

      if (stepKey === "activate-project") {
        return isProjectSetupReady ? "current" : "locked";
      }

      return "locked";
    };

    return [
      { key: "project-setup", label: "Project Setup", status: getStatus("project-setup") },
      {
        key: "business-justification",
        label: "Business Justification",
        status: getStatus("business-justification"),
      },
      { key: "activate-project", label: "Activate Project", status: getStatus("activate-project") },
    ];
  }, [isProjectActive, isProjectSetupReady, reviewNeeds.length, documents.length]);

  // ── Step click handler ───────────────────────────────────────────────────
  const handleStepClick = (key: string) => {
    const step = workflowSteps.find((s) => s.key === key);
    if (!step || step.status === "locked") return;
    setSelectedStep(key as WorkflowStepKey);
  };

  // ── Modal states ─────────────────────────────────────────────────────────
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isObjModalOpen, setIsObjModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isPICOCModalOpen, setIsPICOCModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const activeMainSection = (searchParams.get("tab") as "overview" | "paper-pool") || "overview";
  const setActiveMainSection = (tab: "overview" | "paper-pool") => {
    setSearchParams((prev) => {
      prev.set("tab", tab);
      return prev;
    }, { replace: true });
  };

  // ── Status transition handlers ───────────────────────────────────────────
  const handleActivate = async () => {
    if (!id) return;
    try {
      await activateProject(id);
      await refetchProject();
    } catch {
      // Error handled by mutation
    }
  };

  // Review Process handlers — mutations auto-invalidate queries (no loadProcesses needed)

  // ── Governance submission handlers ───────────────────────────────────────
  const handleAddNeedSubmit = useCallback(
    async (data: { description: string; justification: string; identified_by: string }) => {
      if (!id) return;
      try {
        await addNeed({ project_id: id, ...data });
        setIsNeedModalOpen(false);
      } catch (err) {
        console.error(err);
      }
    },
    [id, addNeed],
  );

  const handleAddDocumentSubmit = useCallback(
    async (data: { sponsor: string; scope: string; budget: number; document_url: string }) => {
      if (!id) return;
      try {
        await addDocument({ project_id: id, ...data });
        setIsDocModalOpen(false);
      } catch (err) {
        console.error(err);
      }
    },
    [id, addDocument],
  );

  const handleAddObjectiveSubmit = useCallback(async () => {
    setIsObjModalOpen(false);
  }, []);

  const handleAddQuestionSubmit = useCallback(async () => {
    setIsQuestionModalOpen(false);
  }, []);

  const handleAddPICOCSubmit = useCallback(async () => {
    setIsPICOCModalOpen(false);
  }, []);

  const handleSaveProjectDates = useCallback(
    async (payload: { id: string; startDate: string | null; endDate: string | null }) => {
      if (!id) return;
      await updateProjectDates({ id, data: payload });
      await refetchProject();
    },
    [id, refetchProject, updateProjectDates],
  );

  // ── Render guards ────────────────────────────────────────────────────────
  if (projectLoading && !project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <p className="text-center text-red-500">{projectError}</p>
          <div className="text-center mt-4">
            <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500 mb-6">Project not found (ID: {id || "none"})</p>
          <button
            onClick={() => navigate("/projects")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Project List
          </button>
        </div>
      </div>
    );
  }

  // ── Activation checklist ─────────────────────────────────────────────────
  const activationChecklist = [
    { label: "Project setup defined (Required)", completed: isProjectSetupReady, required: true },
    {
      label: "Review needs identified (Optional)",
      completed: reviewNeeds.length > 0,
      required: false,
    },
    {
      label: "Commissioning documents added (Optional)",
      completed: documents.length > 0,
      required: false,
    },
    {
      label: "Project dates set (Optional)",
      completed: Boolean(project.startDate),
      required: false,
    },
  ];

  // ── Render workspace based on selected step ──────────────────────────────
  const renderWorkspace = () => {
    // ── Active / Completed / Archived → show Project Overview ──────────
    if (isProjectActive) {
      return (
        <div>
          {/* Review Processes Section */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveMainSection("overview")}
                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeMainSection === "overview"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveMainSection("paper-pool")}
                className={`pb-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${
                  activeMainSection === "paper-pool"
                    ? "text-blue-600 border-blue-600"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                Workspace
              </button>
            </nav>
          </div>

          {activeMainSection === "overview" ? (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <OverviewTabContent
                project={project}
                projectId={id || ""}
                isLeader={isLeader}
                isProjectActive={isProjectActive}
                isProjectSetupReady={isProjectSetupReady}
                reviewNeeds={reviewNeeds}
                documents={documents}
                isUpdatingDates={isUpdatingDates}
                handleSaveProjectDates={handleSaveProjectDates}
                setIsNeedModalOpen={setIsNeedModalOpen}
                setIsDocModalOpen={setIsDocModalOpen}
                onSetupSaved={() => void checkProjectSetupReady()}
              />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <PaperPoolTab projectId={id || ""} reviewProcesses={processes} />
            </div>
          )}
        </div>
      );
    }

    // ── Draft project workflow steps ───────────────────────────────────
    switch (selectedStep) {
      case "business-justification":
        return (
          <BusinessJustificationSection
            project={project}
            projectId={id || ""}
            isLeader={isLeader}
            isProjectActive={isProjectActive}
            reviewNeeds={reviewNeeds}
            documents={documents}
            isUpdatingDates={isUpdatingDates}
            handleSaveProjectDates={handleSaveProjectDates}
            setIsNeedModalOpen={setIsNeedModalOpen}
            setIsDocModalOpen={setIsDocModalOpen}
            onSkip={() => setSelectedStep("activate-project")}
          />
        );

      case "project-setup":
        return (
          <ProjectSetupSection
            projectId={id || ""}
            isProjectSetupReady={isProjectSetupReady}
            onSetupSaved={() => {
              setIsProjectSetupReady(true);
              setSelectedStep("business-justification");
            }}
            embedded={true}
          />
        );

      case "activate-project":
        return (
          <ActivateProjectStep
            projectId={id || ""}
            isActive={false}
            checklist={activationChecklist}
            onActivate={handleActivate}
            isActivating={activateLoading}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Top Area: Project Header + Settings ───────────────────────────── */}
      <ProjectHeader
        project={project}
        onBack={() => navigate("/projects")}
        onEdit={() => navigate(`/projects/${id}/edit`)}
        onSettings={() => navigate(`/projects/${id}/settings`)}
      />

      {/* ── Middle Area: Step Progress Navigation ─────────────────────────── */}
      {project.statusText === "Draft" && (
        <StepProgressNav steps={workflowSteps} onStepClick={handleStepClick} />
      )}

      {/* All-steps-complete banner for active projects */}
      {isProjectActive && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Project Setup Complete</p>
            <p className="text-xs text-emerald-600">
              All preparation steps have been completed. The project is now in{" "}
              <span className="font-bold">{project.statusText}</span> status.
            </p>
          </div>
        </div>
      )}

      {/* ── Bottom Area: Stage Workspace ──────────────────────────────────── */}
      {renderWorkspace()}

      {/* ── Drawers & Modals ─────────────────────────────────────────────── */}
      <ProjectDrawers
        isNeedModalOpen={isNeedModalOpen}
        onCloseNeed={() => setIsNeedModalOpen(false)}
        isDocModalOpen={isDocModalOpen}
        onCloseDoc={() => setIsDocModalOpen(false)}
        isObjModalOpen={isObjModalOpen}
        onCloseObj={() => setIsObjModalOpen(false)}
        isQuestionModalOpen={isQuestionModalOpen}
        onCloseQuestion={() => setIsQuestionModalOpen(false)}
        isPICOCModalOpen={isPICOCModalOpen}
        onClosePICOC={() => setIsPICOCModalOpen(false)}
        isSubmitting={isNeedSubmitting || isDocSubmitting}
        questionTypes={[]}
        onAddNeed={handleAddNeedSubmit}
        onAddDocument={handleAddDocumentSubmit}
        onAddObjective={handleAddObjectiveSubmit}
        onAddQuestion={handleAddQuestionSubmit}
        onAddPICOC={handleAddPICOCSubmit}
      />

      <ProjectMembersModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        projectId={id}
        projectName={project.title}
        hideLeaderRole={true}
      />
    </div>
  );
}
