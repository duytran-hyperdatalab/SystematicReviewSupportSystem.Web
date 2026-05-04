import React, { useState } from "react";
import Tabs, { type TabItem } from "../../../../components/ui/Tabs";
import { FiList } from "react-icons/fi";
import ProcessExclusionCodeTab from "../../../../components/reviewProcess/leader/settings/ProcessExclusionCodeTab";

const ProcessSettingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("exclusion-code");

  const tabItems: TabItem[] = [
    {
      id: "exclusion-code",
      label: "Exclusion code",
      icon: FiList,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Tabs
        items={tabItems}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden min-h-[500px]">
          {activeTab === "exclusion-code" && <ProcessExclusionCodeTab />}
        </div>
      </Tabs>
    </div>
  );
};

export default ProcessSettingPage;
