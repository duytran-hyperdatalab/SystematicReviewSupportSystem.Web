import React, { useState } from "react";
import ProjectSetupSection from "./ProjectSetupSection";
import BusinessJustificationSection from "./BusinessJustificationSection";
import type { Project } from "../../../types/project";
import { FiChevronDown, FiChevronUp, FiSettings, FiBriefcase } from "react-icons/fi";

interface OverviewTabContentProps {
  project: Project;
  projectId: string;
  isLeader: boolean;
  isProjectActive: boolean;
  isProjectSetupReady: boolean;
  reviewNeeds: any[];
  documents: any[];
  isUpdatingDates: boolean;
  handleSaveProjectDates: (payload: { id: string; startDate: string | null; endDate: string | null }) => Promise<void>;
  setIsNeedModalOpen: (open: boolean) => void;
  setIsDocModalOpen: (open: boolean) => void;
  onSetupSaved: () => void;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = (props) => {
  const [isSetupExpanded, setIsSetupExpanded] = useState(true);
  const [isBJExpanded, setIsBJExpanded] = useState(false);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Project Setup Section */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <button
          onClick={() => setIsSetupExpanded(!isSetupExpanded)}
          className="w-full flex items-center justify-between p-6 text-left bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <FiSettings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Project Setup</h2>
              <p className="text-sm text-slate-500">Research scope, PICO-C and Questions</p>
            </div>
          </div>
          <div className="text-slate-400">
            {isSetupExpanded ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
          </div>
        </button>

        <div
          className={`transition-all duration-500 ease-in-out ${isSetupExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
        >
          <div className="p-6 border-t border-slate-100">
            <ProjectSetupSection
              projectId={props.projectId}
              isProjectSetupReady={props.isProjectSetupReady}
              onSetupSaved={props.onSetupSaved}
              embedded={true}
            />
          </div>
        </div>
      </section>

      {/* Business Justification Section */}
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <button
          onClick={() => setIsBJExpanded(!isBJExpanded)}
          className="w-full flex items-center justify-between p-6 text-left bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
              <FiBriefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Business Justification</h2>
              <p className="text-sm text-slate-500">Governance, Review Needs and Documents</p>
            </div>
          </div>
          <div className="text-slate-400">
            {isBJExpanded ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
          </div>
        </button>

        <div
          className={`transition-all duration-500 ease-in-out ${isBJExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
        >
          <div className="p-6 border-t border-slate-100">
            <BusinessJustificationSection
              project={props.project}
              projectId={props.projectId}
              isLeader={props.isLeader}
              isProjectActive={props.isProjectActive}
              reviewNeeds={props.reviewNeeds}
              documents={props.documents}
              isUpdatingDates={props.isUpdatingDates}
              handleSaveProjectDates={props.handleSaveProjectDates}
              setIsNeedModalOpen={props.setIsNeedModalOpen}
              setIsDocModalOpen={props.setIsDocModalOpen}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTabContent;
