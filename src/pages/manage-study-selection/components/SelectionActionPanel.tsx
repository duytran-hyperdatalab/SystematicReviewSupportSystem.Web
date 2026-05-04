import React, { useState } from 'react';
import { Cpu, Layout, Target } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Tabs from '../../../components/ui/Tabs';
import { CriteriaTab } from './CriteriaTab';
import { ActionTab } from './StuSePanelTab';
import { AIAnalysisTab } from './AIAnalysisTab';

export const SelectionActionPanel: React.FC = () => {
  const { projectId, screeningProcessId } = useParams<{ projectId: string; screeningProcessId: string }>();
  const [activeTab, setActiveTab] = useState('criteria');

  const tabItems = [
    { id: 'criteria', label: 'Criteria', icon: Target },
    { id: 'panel', label: 'Panel', icon: Layout },
    { id: 'ai', label: 'AI Analysis', icon: Cpu },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">
      <div className="flex-1 flex flex-col p-3 overflow-hidden">
        <Tabs
          items={tabItems}
          activeTabId={activeTab}
          onTabChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0 gap-3"
          listClassName="w-full flex-nowrap overflow-x-auto no-scrollbar bg-slate-50/50 p-1 rounded-xl"
          itemClassName="flex-1 justify-center px-3 py-2 text-[11px] rounded-lg min-w-fit"
          contentClassName="flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto h-full custom-scrollbar pr-1">
            {activeTab === 'criteria' && (
              <CriteriaTab
                projectId={projectId}
                screeningProcessId={screeningProcessId}
              />
            )}

            {activeTab === 'panel' && <ActionTab />}

            {activeTab === 'ai' && <AIAnalysisTab />}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

