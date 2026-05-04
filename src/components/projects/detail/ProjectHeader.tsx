import React from "react";
import Card from "../../ui/Card";
import type { Project } from "../../../types/project";
import { FiSettings, FiEdit3, FiArrowLeft, FiGlobe, FiCalendar, FiActivity } from "react-icons/fi";

interface ProjectHeaderProps {
  project: Project;
  onBack: () => void;
  onEdit: () => void;
  onSettings?: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project, onBack, onEdit, onSettings }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
        >
          <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Projects
        </button>
      </div>

      <Card className="p-0 overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Top Section: Identity & Actions */}
        <div className="p-6 lg:p-8 border-b border-slate-100 bg-white">
          <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-black rounded uppercase tracking-[0.15em] shadow-sm">
            {project.code}
          </span>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  {project.title}
                </h1>
              </div>

              {project.description && (
                <p className="text-slate-500 text-base lg:text-lg leading-relaxed max-w-2xl font-medium">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-start">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200 hover:border-slate-300"
              >
                <FiEdit3 className="w-4 h-4" />
                Edit
              </button>
              {onSettings && (
                <button
                  title="Project settings"
                  onClick={onSettings}
                  className="p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm"
                >
                  <FiSettings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Metadata Grid */}
        <div className="bg-slate-50/50 p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Domain */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <FiGlobe className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Domain</span>
              </div>
              <p className="text-sm font-bold text-slate-900">{project.domain}</p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <FiActivity className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
              </div>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm ring-1 ring-inset ${
                    project.statusText === "Active"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                      : project.statusText === "Completed"
                        ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                        : "bg-amber-50 text-amber-700 ring-amber-600/20"
                  }`}
                >
                  {project.statusText}
                </span>
              </div>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-400">
                <FiCalendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Created at</span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {new Date(project.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <div className="flex items-center gap-2 text-slate-400">
                <FiCalendar className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Modified at
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">
                {new Date(project.modifiedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            {/* Leader Info */}
            <div className="space-y-2 lg:border-l lg:border-slate-200 lg:pl-8">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                Project Leader
              </span>
              {project.leader ? (
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-200">
                    {getInitials(project.leader.fullName)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {project.leader.fullName}
                    </p>
                    <p className="text-xs font-medium text-slate-500 truncate">
                      {project.leader.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-bold text-slate-400 italic">No leader assigned</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProjectHeader;
