import React, { useState, useEffect } from "react";
import { useProject, useProjectMutations } from "../../../hooks/useProjects";
import type { CreateProjectRequest, Project } from "../../../types/project";
import FormField from "../../ui/FormField";
import FormTextarea from "../../ui/FormTextarea";
import LoadingSpinner from "../../ui/LoadingSpinner";
import Modal from "../../ui/Modal";
import { toastSuccess, toastError } from "../../../utils/toast";
import { cn } from "../../../utils/cn";
import { FiPlus, FiSave, FiInfo, FiLayers, FiFileText } from "react-icons/fi";

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId?: string;
    onSuccess?: (project: Project) => void;
}

export default function ProjectFormModal({ isOpen, onClose, projectId, onSuccess }: ProjectFormModalProps) {
    const isEditMode = Boolean(projectId);

    // Data fetching
    const { project, isLoading: isInitialLoading } = useProject(projectId);

    // Mutations
    const {
        createProject, isCreating,
        updateProject, isUpdating
    } = useProjectMutations();

    const [formData, setFormData] = useState({
        code: "",
        title: "",
        domain: "",
        description: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form data when project is loaded
    useEffect(() => {
        const timer = window.setTimeout(() => {
        if (project && isOpen) {
            setFormData({
                code: project.code,
                title: project.title,
                domain: project.domain,
                description: project.description || "",
            });
        } else if (!isEditMode && isOpen) {
            // Clear form when opening for creation
            setFormData({
                code: "",
                title: "",
                domain: "",
                description: "",
            });
            setErrors({});
        }
        }, 0);

        return () => {
            window.clearTimeout(timer);
        };
    }, [project, isOpen, isEditMode]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "A compelling title is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (isEditMode && projectId) {
                const result = await updateProject({
                    id: projectId,
                    data: { id: projectId, ...formData }
                });
                if (result.isSuccess) {
                    toastSuccess("Project Updated", "The repository metadata has been successfully updated.");
                    onSuccess?.(result.data);
                    onClose();
                }
            } else {
                const result = await createProject(formData as CreateProjectRequest);
                if (result.isSuccess) {
                    toastSuccess("Project Created", "New research workspace has been initialized successfully.");
                    onSuccess?.(result.data);
                    onClose();
                }
            }
        } catch (err: unknown) {
            console.error("Project submission error:", err);
            const maybeErr = err as { response?: { data?: { message?: string } }; message?: string };
            const errorMessage = maybeErr.response?.data?.message || maybeErr.message || "An unexpected error occurred during project submission.";
            toastError("Submission Failed", errorMessage);
        }
    };

    const isSubmitting = isEditMode ? isUpdating : isCreating;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? "Project Settings" : "New Systematic Review"}
            description={isEditMode ? "Update your workspace parameters and metadata." : "Launch a new research workspace with standardized protocols."}
            size="md"
        >
            {isInitialLoading && isEditMode ? (
                <div className="flex flex-col justify-center items-center py-20 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Initializing Workspace</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {isEditMode && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                        <FiInfo size={12} className="text-indigo-400" />
                                        Repository Code
                                    </div>
                                    <FormField
                                        id="code"
                                        label="Project Code"
                                        name="code"
                                        value={formData.code}
                                        readOnly
                                        containerClassName="space-y-1.5"
                                        className="bg-slate-100 border-slate-200 rounded-[1.25rem] py-4 font-black text-indigo-600 cursor-not-allowed shadow-inner"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <FiFileText size={12} className="text-indigo-400" />
                                    Identity
                                </div>
                                <FormField
                                    id="title"
                                    label="Research Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    errorMessage={errors.title}
                                    placeholder="e.g., Impact of Generative AI in Code Automation"
                                    containerClassName="space-y-1.5"
                                    className="bg-slate-50 border-slate-100 focus:bg-white rounded-[1.25rem] py-4 font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <FiInfo size={12} className="text-indigo-400" />
                                Context & Scope
                            </div>
                            <FormTextarea
                                id="description"
                                label="Executive Summary"
                                name="description"
                                value={formData.description || ""}
                                onChange={handleChange}
                                placeholder="Briefly outline the research objectives and significance..."
                                rows={5}
                                containerClassName="space-y-1.5"
                                className="bg-slate-50 border-slate-100 focus:bg-white rounded-[1.25rem] p-4 font-medium text-slate-700 italic leading-relaxed placeholder:text-slate-300 transition-all"
                            />
                        </div>
                    </div>



                    {!isEditMode && (
                        <div className="p-5 bg-indigo-50/50 border border-indigo-100/50 rounded-[1.5rem] flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                <FiLayers size={18} />
                            </div>
                            <div className="space-y-1 mt-0.5">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Standard Workflow</p>
                                <p className="text-xs text-indigo-900 font-bold leading-tight">
                                    Project starts in <span className="text-indigo-600">Draft</span> mode.
                                </p>
                                <p className="text-[10px] text-indigo-700/60 font-medium">
                                    You can refine parameters before activating the full review pipeline.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={cn(
                                "flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white text-[11px] font-black rounded-[1.25rem] hover:bg-indigo-700 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest",
                                isSubmitting && "animate-pulse"
                            )}
                        >
                            {isSubmitting ? (
                                "Processing..."
                            ) : (
                                <>
                                    {isEditMode ? <FiSave size={18} /> : <FiPlus size={18} />}
                                    {isEditMode ? "Save Changes" : "Launch Workspace"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
}
