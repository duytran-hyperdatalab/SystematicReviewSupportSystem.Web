import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useStudySelectionChecklistTemplate } from "../../../hooks/useStudySelectionChecklistTemplate";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";
import Button from "../../../components/ui/Button";

import { RiFileList3Line, RiAddLine } from "react-icons/ri";
import { DocumentAuthoringModal } from "../../../components/ui/document-editor/DocumentAuthoringModal";
import { toastSuccess, toastError } from "../../../utils/toast";
import type { CreateStudySelectionChecklistTemplateRequest } from "../../../types/studySelectionChecklistTemplate";
import { ChecklistTemplateVersions } from "./components/checklist-template/ChecklistTemplateVersions";

const StudySelectionChecklistTemplatePage: React.FC = () => {
  const { projectId, screeningProcessId } = useParams<{
    projectId: string;
    screeningProcessId: string;
  }>();
  const {
    templates,
    isLoading,
    error,
    createTemplate,
    isCreating,
  } = useStudySelectionChecklistTemplate(projectId);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateTemplate = async (data: CreateStudySelectionChecklistTemplateRequest | null) => {
    if (!data) {
      toastError("Creation Failed", "Please provide at least some information for the template.");
      return;
    }

    try {
      const response = await createTemplate(data);
      if (response.isSuccess) {
        toastSuccess("Success", "Template created successfully!");
        setIsModalOpen(false);
      } else {
        toastError("Error", response.message || "Failed to create template");
      }
    } catch (err: any) {
      toastError("Error", err.message || "An unexpected error occurred");
    }
  };

  if (isLoading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && templates.length === 0) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {templates.length > 0 ? (
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100/80 p-10 shadow-xl shadow-slate-200/20 relative overflow-hidden transition-all duration-500 min-h-[700px]">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <ChecklistTemplateVersions
                projectId={projectId!}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100/80 p-20 shadow-sm shadow-indigo-100/10 relative overflow-hidden text-center flex flex-col items-center">
          {/* Subtle Decorative Background Element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border-2 border-dashed border-slate-200 relative group transition-all hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-400">
            <RiFileList3Line size={48} />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center text-slate-400 group-hover:border-indigo-50 group-hover:text-indigo-500 shadow-sm transition-all">
              <RiAddLine size={18} />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Initialize Eligibility Framework
          </h2>
          <p className="text-slate-500 mb-12 font-medium leading-relaxed text-lg">
            Every robust systematic review starts with clear, pre-defined eligibility criteria. Your checklist template will serve as the single source of truth for all study screening decisions.
          </p>
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
            className="rounded-[2rem] px-12 py-7 h-auto text-xl font-black shadow-2xl shadow-indigo-300 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <RiAddLine className="mr-2" size={28} />
            Create Master Template
          </Button>
        </div>
      )}

      <DocumentAuthoringModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTemplate}
        isSubmitting={isCreating}
        title="Create Template"
        description="Design your document structure with real-time preview."
        submitText="Create Template"
        template={templates[0] || null}
        screeningProcessId={screeningProcessId}
        allowImportCriterias={true}
      />
    </div>
  );
};


export default StudySelectionChecklistTemplatePage;
