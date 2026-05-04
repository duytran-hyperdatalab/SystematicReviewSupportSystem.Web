import React, { useState, useMemo } from "react";
import {
    FiEye,
    FiUsers,
    FiEdit3,
    FiMoreVertical,
    FiChevronLeft,
    FiChevronRight,
    FiSearch,
    FiDownload,
    FiInfo,
    FiPlus,
    FiX
} from "react-icons/fi";

import { FaRegTrashAlt } from "react-icons/fa";
import { SiTask } from "react-icons/si";
import { cn } from "../../utils/cn";
import ActionButton from "../../components/admin/slr-projects/ActionButton";
import Tooltip from "../../components/ui/Tooltip";
import Select from "../../components/ui/Select";
import ProjectFormModal from "../../components/admin/slr-projects/ProjectFormModal";
import ProjectMembersModal from "../../components/admin/slr-projects/ProjectMembersModal";
import { useProjects, useProjectMutations } from "../../hooks/useProjects";
import type { ProjectStatus } from "../../types/project";
import { formatDate } from "../../utils/dateFormat";
import toast from "react-hot-toast";

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
    const styles = {
        Draft: "bg-amber-50 text-amber-700 border-amber-100",
        Active: "bg-emerald-50 text-emerald-700 border-emerald-100",
        Completed: "bg-indigo-50 text-indigo-700 border-indigo-100",
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold border",
            styles[status]
        )}>
            {status}
        </span>
    );
};

const SLRProjectManagement: React.FC = () => {
    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | undefined>();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | undefined>();
    const [viewingProject, setViewingProject] = useState<{ id: string; title: string } | undefined>();

    // Hooks
    const {
        projects,
        data: paginatedData,
        isLoading,
        isError,
        error,
        refetch // Added refetch to update data after form submission
    } = useProjects({
        pageNumber,
        pageSize,
        status: statusFilter
    });

    const {
        deleteProject
    } = useProjectMutations();

    // Local filtering for speed as per user request
    const filteredProjects = useMemo(() => {
        if (!searchTerm) return projects;
        const lowSearch = searchTerm.toLowerCase();
        return projects.filter(p =>
            p.title.toLowerCase().includes(lowSearch) ||
            (p.domain && p.domain.toLowerCase().includes(lowSearch))
        );
    }, [projects, searchTerm]);

    // Derived
    const totalCount = paginatedData?.totalCount || 0;
    const totalPages = paginatedData?.totalPages || 0;
    const itemsStart = (pageNumber - 1) * pageSize + 1;
    const itemsEnd = Math.min(pageNumber * pageSize, totalCount);

    // Handlers


    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this project?")) return;
        try {
            await deleteProject(id);
            toast.success("Project deleted successfully");
        } catch (err) {
            // Error toast handled in hook
        }
    };

    const displayDate = (dateStr?: string | null) => {
        if (!dateStr) return "N/A";
        return formatDate(dateStr);
    };

    const handleFormSuccess = () => {
        setIsFormModalOpen(false);
        setEditingProjectId(undefined);
        refetch(); // Refresh project list after successful form submission
    };

    const handleCreateProjectClick = () => {
        setEditingProjectId(undefined); // Ensure no project is being edited
        setIsFormModalOpen(true);
    };

    const handleEditProjectClick = (projectId: string) => {
        setEditingProjectId(projectId);
        setIsFormModalOpen(true);
    };

    const handleMembersClick = (projectId: string, title: string) => {
        setViewingProject({ id: projectId, title });
        setIsMembersModalOpen(true);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">SLR Projects</h3>
                    <p className="text-slate-500 text-sm font-medium">Manage and monitor systematic literature review workflows across the system.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-full sm:w-64 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                            >
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                    <Tooltip content="Filter project list by status" position="bottom">
                        <Select
                            className="w-40"
                            value={statusFilter || ""}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as ProjectStatus || undefined);
                                setPageNumber(1);
                            }}
                            options={[
                                { value: "", label: "All Statuses" },
                                { value: "Draft", label: "Draft" },
                                { value: "Active", label: "Active" },
                                { value: "Completed", label: "Completed" },
                            ]}
                        />
                    </Tooltip>
                    <Tooltip content="Download project report as CSV" position="bottom">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-emerald-400 text-emerald-500 text-sm font-bold rounded-xl hover:bg-emerald-50 transition-all active:scale-95 shadow-sm cursor-pointer">
                            <FiDownload size={16} />
                            Export
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Create Project Action Row */}
            <div className="flex justify-end">
                <Tooltip content="Launch a new Systematic Literature Review project" position="left">
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all active:scale-95 group cursor-pointer"
                        onClick={handleCreateProjectClick}
                    >
                        <FiPlus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        Create New Project
                    </button>
                </Tooltip>
            </div>

            {/* Error State */}
            {isError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium mb-6">
                    {error || "An error occurred while fetching projects. Please try again."}
                </div>
            )}

            {/* Table Container */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <Tooltip content="The unique identifier or project code for this workspace.">
                                        <div className="flex items-center gap-1.5 cursor-help uppercase">
                                            Code
                                            <FiInfo size={12} className="text-slate-300" />
                                        </div>
                                    </Tooltip>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <Tooltip content="Refers to the project title, domain classification, and brief summary of the systematic literature review.">
                                        <div className="flex items-center gap-1.5 cursor-help uppercase">
                                            Description
                                            <FiInfo size={12} className="text-slate-300" />
                                        </div>
                                    </Tooltip>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <Tooltip content="The project leader responsible for overseeing the research workspace.">
                                        <div className="flex items-center gap-1.5 cursor-help uppercase">
                                            Leader
                                            <FiInfo size={12} className="text-slate-300" />
                                        </div>
                                    </Tooltip>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                    <Tooltip content="The scheduled start and expected completion dates for this research project.">
                                        <div className="flex items-center gap-1.5 cursor-help uppercase">
                                            Timeline
                                            <FiInfo size={12} className="text-slate-300" />
                                        </div>
                                    </Tooltip>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                                    <Tooltip content="Total number of steps in the Systematic Literature Review workflow">
                                        <div className="flex items-center justify-center gap-1.5 cursor-help">
                                            Total Processes
                                            <FiInfo size={12} className="text-slate-300" />
                                        </div>
                                    </Tooltip>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">
                                    <Tooltip content="Number of review steps successfully finalized">
                                        <div className="flex items-center justify-center gap-1.5 cursor-help">
                                            Processes Done
                                            <FiInfo size={12} className="text-slate-300" />
                                        </div>
                                    </Tooltip>
                                </th>
                                <th className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(pageSize).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={8} className="px-6 py-8">
                                            <div className="h-12 bg-slate-50 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => (
                                    <tr key={project.id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wider border border-slate-200">
                                                {project.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 max-w-sm">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Tooltip content={project.title}>
                                                        <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors cursor-help">
                                                            {project.title}
                                                        </h4>
                                                    </Tooltip>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{project.domain}</span>

                                                    {project.description && (
                                                        <Tooltip content={project.description}>
                                                            <span className="line-clamp-1 font-medium italic text-slate-300 normal-case cursor-help text-[10px]">
                                                                {project.description}
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {project.leader ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm border border-indigo-100/50">
                                                        {project.leader.fullName.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-700 leading-tight">{project.leader.fullName}</span>
                                                        <span className="text-[10px] font-medium text-slate-400">{project.leader.email}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-300 italic uppercase tracking-widest">No Leader</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge status={project.statusText} />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1 whitespace-nowrap">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">From</span>
                                                    <span className="text-xs font-bold text-slate-600">{displayDate(project.startDate)}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">To</span>
                                                    <span className="text-xs font-bold text-slate-600">{displayDate(project.endDate)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                {project.totalProcesses ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                                                {project.completedProcesses ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 lg:opacity-100 transition-opacity">
                                                <ActionButton icon={FiEye} label="View Detail" />
                                                <ActionButton
                                                    icon={FiUsers}
                                                    label="Members"
                                                    onClick={() => handleMembersClick(project.id, project.title)}
                                                />
                                                <ActionButton icon={FiEdit3} label="Edit Info" onClick={() => handleEditProjectClick(project.id)} />
                                                <div className="w-px h-4 bg-slate-200 mx-1" />

                                                <ActionButton
                                                    icon={FaRegTrashAlt}
                                                    label="Delete"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(project.id)}
                                                />

                                                <div className="lg:hidden ml-1">
                                                    <ActionButton icon={FiMoreVertical} label="More" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr key="no-projects">
                                    <td colSpan={8} className="px-6 py-28 text-center bg-slate-50/20">
                                        <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="relative mx-auto w-24 h-24">
                                                <div className="absolute inset-0 bg-indigo-100 rounded-[2rem] rotate-12 opacity-50 transition-transform group-hover:rotate-45" />
                                                <div className="relative w-full h-full bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-300 shadow-sm">
                                                    <SiTask size={42} className="text-indigo-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <h5 className="text-xl font-black text-slate-900 tracking-tight">No research workspaces found</h5>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                                                    We couldn't find any projects matching your current filters. <br className="hidden sm:block" />
                                                    Try adjusting your search criteria or create a fresh workspace.
                                                </p>
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => { setSearchTerm(""); setStatusFilter(undefined); }}
                                                    className="px-6 py-2 text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest active:scale-95"
                                                >
                                                    Clear All Filters
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-slate-900">{totalCount > 0 ? itemsStart : 0}-{itemsEnd}</span> of <span className="text-slate-900">{totalCount}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Per page:</span>
                            <Select
                                className="w-20 py-1.5"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPageNumber(1);
                                }}
                                options={[
                                    { value: "10", label: "10" },
                                    { value: "20", label: "20" },
                                    { value: "50", label: "50" },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tooltip content="Previous Page">
                            <button
                                className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-30 disabled:pointer-events-none"
                                disabled={pageNumber === 1 || isLoading}
                                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                            >
                                <FiChevronLeft size={18} />
                            </button>
                        </Tooltip>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                // Simple sliding window for pagination if many pages
                                let pageToShow = i + 1;
                                if (totalPages > 5 && pageNumber > 3) {
                                    pageToShow = Math.min(pageNumber - 2 + i, totalPages - 4 + i);
                                }

                                return (
                                    <button
                                        key={pageToShow}
                                        onClick={() => setPageNumber(pageToShow)}
                                        className={cn(
                                            "w-9 h-9 text-xs font-black rounded-xl transition-all shadow-sm border",
                                            pageNumber === pageToShow
                                                ? "bg-indigo-600 text-white shadow-indigo-100 border-indigo-600"
                                                : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                                        )}
                                    >
                                        {pageToShow}
                                    </button>
                                );
                            })}
                        </div>

                        <Tooltip content="Next Page">
                            <button
                                className="p-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                                disabled={pageNumber === totalPages || totalPages === 0 || isLoading}
                                onClick={() => setPageNumber(prev => Math.min(totalPages, prev + 1))}
                            >
                                <FiChevronRight size={18} />
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Mobile Card Layout Hint */}
            <div className="lg:hidden space-y-4 pt-4">
                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-[0.2em]">End of Table View</p>
            </div>

            {/* Project Form Modal */}
            <ProjectFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                projectId={editingProjectId}
                onSuccess={handleFormSuccess}
            />

            {/* Project Members Modal */}
            <ProjectMembersModal
                isOpen={isMembersModalOpen}
                onClose={() => {
                    setIsMembersModalOpen(false);
                    setViewingProject(undefined);
                }}
                projectId={viewingProject?.id}
                projectName={viewingProject?.title}
            />
        </div>
    );
};

export default SLRProjectManagement;
