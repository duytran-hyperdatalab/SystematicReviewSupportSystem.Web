import React, { useState } from "react";
import { FiSettings, FiTag, FiDatabase, FiLock } from "react-icons/fi";
import Tabs, { type TabItem } from "../../components/ui/Tabs";
import ProjectExclusionCodeTab from "../../components/admin/settings/ProjectExclusionCodeTab";

const SystemSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState("exclusion-codes");

    const settingsTabs: TabItem[] = [
        { id: "exclusion-codes", label: "Project Exclusion Codes", icon: FiTag },
        { id: "example", label: "Example", icon: FiDatabase }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case "exclusion-codes":
                return <ProjectExclusionCodeTab />;
            case "example":
                return (
                    <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                            <FiDatabase size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900">Example</h4>
                            <p className="text-slate-500 max-w-sm">New setting will be updated soon.</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                            <FiLock size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black text-slate-900">Module Locked</h4>
                            <p className="text-slate-500 max-w-sm">This settings module is currently being calibrated for the next system update.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* 💎 Page Header 💎 */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <FiSettings size={20} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h3>
                    </div>
                    <p className="text-slate-500 text-sm font-medium ml-13">Configure global parameters, taxonomies, and system-wide behavior.</p>
                </div>
            </div>

            {/* 🗂️ Settings Tabs 🗂️ */}
            <Tabs
                items={settingsTabs}
                activeTabId={activeTab}
                onTabChange={setActiveTab}
                contentClassName="mt-2"
            >
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    {renderTabContent()}
                </div>
            </Tabs>
        </div>
    );
};

export default SystemSettings;
