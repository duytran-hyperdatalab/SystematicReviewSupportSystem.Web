import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlus, FiCheckCircle, FiClock, FiChevronRight, FiTrash2 } from "react-icons/fi";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import { cn } from "../../utils/cn";
import { ChecklistType, type ReviewChecklist } from "../../types/checklist";
import type { ChecklistTemplateSummaryDto } from "../../types/checklistApi";

interface ChecklistDashboardPageProps {
  projectId: string;
  checklists?: ReviewChecklist[];
  templates?: ChecklistTemplateSummaryDto[];
  isLoading?: boolean;
  onCreateChecklist?: (templateId: string) => Promise<void>;
}

const ChecklistDashboardPage: React.FC<ChecklistDashboardPageProps> = ({
  projectId: propsProjectId,
  checklists: propChecklists = [],
  templates = [],
  isLoading = false,
  onCreateChecklist,
}) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const projectId = propsProjectId || paramProjectId;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChecklist = async (templateId: string) => {
    if (!onCreateChecklist) return;

    try {
      setIsCreating(true);
      await onCreateChecklist(templateId);
      setShowCreateModal(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-linear-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">PRISMA 2020 Checklists</h1>
            <p className="text-gray-600">
              Manage systematic review reporting checklists for this project
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            New Checklist
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : propChecklists.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
            <FiCheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No checklists yet</h3>
            <p className="text-gray-600 mb-4">Create your first PRISMA checklist to get started</p>
            <Button onClick={() => setShowCreateModal(true)}>Create First Checklist</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {propChecklists.map((checklist) => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onOpen={() => navigate(`/projects/${projectId}/checklists/${checklist.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateChecklistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        templates={templates}
        onSelectTemplate={handleCreateChecklist}
        isLoading={isCreating}
      />
    </div>
  );
};

interface ChecklistCardProps {
  checklist: ReviewChecklist;
  onOpen: () => void;
}

const ChecklistCard: React.FC<ChecklistCardProps> = ({ checklist, onOpen }) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const isComplete = checklist.completionPercentage === 100;

  return (
    <div
      className={cn(
        "border rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer group",
        isComplete
          ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
          : "bg-white border-gray-200 hover:border-indigo-300",
      )}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
            {checklist.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Based on {checklist.templateName} ({checklist.typeName})
          </p>
        </div>
        <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors shrink-0" />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span
            className={cn("text-sm font-bold", isComplete ? "text-emerald-600" : "text-indigo-600")}
          >
            {checklist.completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all",
              isComplete
                ? "bg-linear-to-r from-emerald-400 to-emerald-600"
                : "bg-linear-to-r from-indigo-400 to-indigo-600",
            )}
            style={{ width: `${checklist.completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {checklist.completedItems} of {checklist.totalItems} items completed
        </p>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <FiClock className="w-4 h-4" />
            <span>{formatDate(checklist.updatedAt)}</span>
          </div>
          {isComplete && (
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <FiCheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </div>
          )}
        </div>
        <button
          className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete checklist"
        >
          <FiTrash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
        </button>
      </div>
    </div>
  );
};

interface CreateChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ChecklistTemplateSummaryDto[];
  onSelectTemplate: (templateId: string) => Promise<void>;
  isLoading?: boolean;
}

const CreateChecklistModal: React.FC<CreateChecklistModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSelectTemplate,
  isLoading = false,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleSelect = async (templateId: string) => {
    setSelectedTemplateId(templateId);
    await onSelectTemplate(templateId);
    setSelectedTemplateId(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Checklist" size="lg">
      <div className="space-y-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template.id)}
            disabled={isLoading}
            className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {template.itemCount} items • {template.version}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-1 rounded",
                    template.isSystem
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-emerald-100 text-emerald-700",
                  )}
                >
                  {template.isSystem ? "System" : "Custom"}
                </span>
                <p
                  className={cn(
                    "text-xs font-semibold px-2 py-1 rounded",
                    template.type === ChecklistType.FULL
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-emerald-100 text-emerald-700",
                  )}
                >
                  {template.typeName}
                </p>
                {selectedTemplateId === template.id && isLoading && (
                  <div className="mt-2 flex justify-end">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
        {templates.length === 0 && (
          <div className="p-4 text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
            No templates are available.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ChecklistDashboardPage;
