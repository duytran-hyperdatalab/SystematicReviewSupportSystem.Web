import React, { useState } from "react";
import Button from "../../ui/Button";
import ReviewNeedsTab from "./ReviewNeedsTab";
import DocumentsTab from "./DocumentsTab";
import ProjectTimetableTab from "./ProjectTimetableTab";
import type { Project } from "../../../types/project";

interface BusinessJustificationSectionProps {
  project: Project;
  projectId: string;
  isLeader: boolean;
  isProjectActive: boolean;
  reviewNeeds: any[];
  documents: any[];
  isUpdatingDates: boolean;
  handleSaveProjectDates: (payload: { id: string; startDate: string | null; endDate: string | null }) => Promise<void>;
  setIsNeedModalOpen: (open: boolean) => void;
  setIsDocModalOpen: (open: boolean) => void;
  onSkip?: () => void;
}

const BusinessJustificationSection: React.FC<BusinessJustificationSectionProps> = ({
  project,
  projectId,
  isLeader,
  isProjectActive,
  reviewNeeds,
  documents,
  isUpdatingDates,
  handleSaveProjectDates,
  setIsNeedModalOpen,
  setIsDocModalOpen,
  onSkip,
}) => {
  const [activeTab, setActiveTab] = useState<"needs" | "documents" | "dates">("needs");

  const bjTabs = [
    { key: "needs", label: "Review Needs", count: reviewNeeds.length },
    { key: "documents", label: "Documents", count: documents.length },
    {
      key: "dates",
      label: "Project Dates",
      count: project.startDate && project.endDate ? 1 : 0
    },
  ] as const;

  return (
    <div>
      {!isProjectActive && onSkip && (
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-indigo-600 flex items-center gap-2 group text-sm font-medium"
            onClick={onSkip}
          >
            Skip and go to Activation
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {bjTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                pb-2
                text-sm font-medium
                transition-colors
                ${activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {tab.label}
              <span className="ml-1 text-xs text-gray-400">({tab.count})</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === "needs" && (
          <ReviewNeedsTab
            reviewNeeds={reviewNeeds}
            onAdd={() => setIsNeedModalOpen(true)}
            isLeader={isLeader}
          />
        )}
        {activeTab === "documents" && (
          <DocumentsTab
            documents={documents}
            onAdd={() => setIsDocModalOpen(true)}
            isLeader={isLeader}
          />
        )}
        {activeTab === "dates" && projectId && (
          <ProjectTimetableTab
            key={`${project.startDate ?? ""}-${project.endDate ?? ""}`}
            projectId={projectId}
            startDate={project.startDate}
            endDate={project.endDate}
            isLeader={Boolean(project.isLeader)}
            isSaving={isUpdatingDates}
            onSave={handleSaveProjectDates}
          />
        )}
      </div>
    </div>
  );
};

export default BusinessJustificationSection;
