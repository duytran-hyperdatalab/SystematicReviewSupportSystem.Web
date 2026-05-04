import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "../../../../../components/ui/Table";
import Button from "../../../../../components/ui/Button";
import LoadingSpinner from "../../../../../components/ui/LoadingSpinner";
import { useStudySelectionChecklistTemplate } from "../../../../../hooks/useStudySelectionChecklistTemplate";
import { RiEyeLine, RiCheckboxCircleLine, RiHistoryLine, RiAddLine } from "react-icons/ri";
import { ChecklistTemplateDetailModal } from "./ChecklistTemplateDetailModal";
import { DocumentAuthoringModal } from "../../../../../components/ui/document-editor/DocumentAuthoringModal";
import { toastSuccess, toastError } from "../../../../../utils/toast";
import type { CreateStudySelectionChecklistTemplateRequest } from "../../../../../types/studySelectionChecklistTemplate";

interface ChecklistTemplateVersionsProps {
  projectId: string;
}

export const ChecklistTemplateVersions: React.FC<ChecklistTemplateVersionsProps> = ({ 
  projectId 
}) => {
  const { screeningProcessId } = useParams<{ screeningProcessId: string }>();
  const { 
    templates, 
    isLoading, 
    error,
    createTemplate,
    isCreating,
    activateTemplate,
    isActivating
  } = useStudySelectionChecklistTemplate(projectId);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleViewDetail = (id: string) => {
    setSelectedTemplateId(id);
    setIsDetailModalOpen(true);
  };

  const handleActivateTemplate = async (templateId: string) => {
    try {
      const response = await activateTemplate(templateId);
      if (response.isSuccess) {
        toastSuccess("Success", "Template activated successfully!");
      } else {
        toastError("Error", response.message || "Failed to activate template");
      }
    } catch (err: any) {
      toastError("Error", err.message || "An unexpected error occurred");
    }
  };

  const handleCreateTemplate = async (data: CreateStudySelectionChecklistTemplateRequest | null) => {
    if (!data) {
      toastError("Creation Failed", "Please provide at least some information for the template.");
      return;
    }

    try {
      const response = await createTemplate(data);
      if (response.isSuccess) {
        toastSuccess("Success", "Template created successfully!");
        setIsCreateModalOpen(false);
      } else {
        toastError("Error", response.message || "Failed to create template");
      }
    } catch (err: any) {
      toastError("Error", err.message || "An unexpected error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="text-slate-400 font-medium mt-4">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <RiHistoryLine size={24} />
            </div>
            Template Versions
          </h3>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Manage your study selection checklist templates and versions
          </p>
        </div>

        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-2xl px-6 py-3 font-bold shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
        >
          <RiAddLine className="mr-2" size={20} />
          Create Template
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent cursor-default">
              <TableHead>Version</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow className="hover:bg-transparent cursor-default">
                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                  No templates found
                </TableCell>
              </TableRow>
            ) : (
              templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">
                      v{t.version}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-slate-700">{t.name}</TableCell>
                  <TableCell className="text-slate-500 max-w-xs truncate">
                    {t.description || "No description"}
                  </TableCell>
                  <TableCell>
                    {t.isActive ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <RiCheckboxCircleLine size={14} />
                        Active
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-600 hover:text-indigo-600"
                        onClick={() => handleViewDetail(t.id)}
                      >
                        <RiEyeLine className="mr-1.5" />
                        View Detail
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"
                        disabled={t.isActive || isActivating}
                        onClick={() => handleActivateTemplate(t.id)}
                      >
                        {t.isActive ? "Active" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ChecklistTemplateDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        projectId={projectId}
        templateId={selectedTemplateId}
      />

      <DocumentAuthoringModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTemplate}
        isSubmitting={isCreating}
        title="Create Template"
        description="Design your document structure with real-time preview."
        submitText="Create Template"
        screeningProcessId={screeningProcessId}
        allowImportCriterias={true}
      />
    </div>
  );
};
