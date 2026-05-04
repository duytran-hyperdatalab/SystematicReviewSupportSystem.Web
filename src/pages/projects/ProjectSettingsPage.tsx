import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useProject } from "../../hooks/useProjects";
import { useProjectMutations } from "../../hooks/useProjects";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import ProjectMembersModal from "../../components/admin/slr-projects/ProjectMembersModal";
import { FiExternalLink, FiSettings, FiUsers, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

export default function ProjectSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { project, refetch } = useProject(id);
  const { completeProject, isCompleting } = useProjectMutations();

  const [activeTab, setActiveTab] = useState<"general" | "members">("general");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const handleComplete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure all review processes are completed?")) return;
    try {
      await completeProject(id);
      await refetch();
      navigate(`/projects/${id}`);
    } catch (err) {
      // handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-12 max-w-6xl animate-in fade-in duration-700">
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <button
              onClick={() => navigate(`/projects/${id}`)}
              className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium mb-2"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              Back to Project
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500">Configure and manage your project preferences</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 shrink-0">
            <nav className="flex lg:flex-col gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "general"
                    ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 font-medium"
                }`}
              >
                <FiSettings
                  className={`${activeTab === "general" ? "text-indigo-600" : "text-slate-400"}`}
                />
                General
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "members"
                    ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 font-medium"
                }`}
              >
                <FiUsers
                  className={`${activeTab === "members" ? "text-indigo-600" : "text-slate-400"}`}
                />
                Members
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-6">
            {activeTab === "general" ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {/* General Settings Card */}
                <Card className="p-0 border-slate-200 overflow-hidden rounded-3xl shadow-sm">
                  <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900">Project Status Actions</h2>
                    <p className="text-slate-500 text-sm mt-1">
                      Lifecycle management for your systematic review
                    </p>
                  </div>

                  <div className="p-8 space-y-10">
                    {/* Complete Project */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider mb-2">
                          <FiCheckCircle />
                          Finalization
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Project</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                          Mark all review processes as finished. This signals that the systematic
                          review has reached its formal conclusion.
                        </p>
                      </div>
                      <Button
                        size="lg"
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100 min-w-[180px]"
                        onClick={handleComplete}
                        disabled={isCompleting}
                      >
                        {isCompleting ? "Processing..." : "Mark as Completed"}
                      </Button>
                    </div>

                    <hr className="border-slate-100" />
                  </div>
                </Card>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <Card className="p-8 border-slate-200 rounded-3xl shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                      <FiUsers size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Manage Members</h2>
                      <p className="text-slate-500 text-sm mt-1">
                        Control access and assign roles to your research team
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      Add researchers, screeners, and reviewers to your project. Define their
                      permission levels to ensure data integrity and workflow efficiency.
                    </p>
                    <Button
                      variant="primary"
                      className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 px-8"
                      onClick={() => setIsMemberModalOpen(true)}
                    >
                      Open Member Manager
                      <FiExternalLink className="ml-2" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </main>
        </div>

        <ProjectMembersModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          projectId={id}
          projectName={project?.title ?? ""}
          hideLeaderRole={true}
        />
      </div>
    </div>
  );
}
