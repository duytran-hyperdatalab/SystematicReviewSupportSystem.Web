import React, { useState } from 'react';
import { Database, FileText, Settings, ArrowRight } from 'lucide-react';
import { DataSetModal } from './StuSeDataSetModal';
import { ChecklistTemplateModal } from './StuSeChecklistTemplateModal';
import { ProcessSettingsModal } from './StuSeSettingsModal';
import { ReviewerProgressModal } from './StuSeReviewerProgressModal';
import { UserCheck } from 'lucide-react';

export const ActionTab: React.FC = () => {
  const [isDataSetOpen, setIsDataSetOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  const actions = [
    {
      title: "Dataset Management",
      description: "Build and manage the final dataset of included papers for the next phase.",
      icon: Database,
      color: "blue",
      onClick: () => setIsDataSetOpen(true)
    },
    {
      title: "Checklist Template",
      description: "Define the eligibility criteria and checklist structure for reviewers.",
      icon: FileText,
      color: "indigo",
      onClick: () => setIsChecklistOpen(true)
    },
    {
      title: "Screening Settings",
      description: "Configure exclusion codes and other process-specific parameters.",
      icon: Settings,
      color: "slate",
      onClick: () => setIsSettingsOpen(true)
    },
    {
      title: "Reviewer Progress",
      description: "Monitor reviewer workloads and real-time screening completion status.",
      icon: UserCheck,
      color: "emerald",
      onClick: () => setIsProgressOpen(true)
    }
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Action Strategies */}
        <div className="grid gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="group relative flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl text-left transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 active:scale-[0.98]"
            >
              <div className={`shrink-0 w-12 h-12 rounded-xl bg-${action.color}-50 flex items-center justify-center transition-colors group-hover:bg-${action.color}-100`}>
                <action.icon className={`w-6 h-6 text-${action.color}-500`} />
              </div>

              <div className="flex-1 pr-8">
                <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </div>
            </button>
          ))}
        </div>

        {/* Helper Note */}
        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest leading-relaxed">
            These actions are primary for leaders to setup and maintain the review integrity
          </p>
        </div>
      </div>

      {/* Modals */}
      <DataSetModal
        isOpen={isDataSetOpen}
        onClose={() => setIsDataSetOpen(false)}
      />
      <ChecklistTemplateModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />
      <ProcessSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ReviewerProgressModal
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
      />
    </div>
  );
};
