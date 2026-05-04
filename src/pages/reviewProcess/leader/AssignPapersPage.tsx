import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import TitleAbstractAssignmentTable from "../../../components/reviewProcess/leader/TitleAbstractAssignmentTable";
import FullTextAssignmentTable from "../../../components/reviewProcess/leader/FullTextAssignmentTable";
import gsap from "gsap";
import { Layout, FileText } from "lucide-react";

const AssignPapersPage: React.FC = () => {
  const { screeningProcessId } = useParams<{
    projectId: string;
    processId: string;
    screeningProcessId: string;
  }>();

  const [activeTab, setActiveTab] = useState<"title-abstract" | "full-text">("title-abstract");
  const [selectionMode, setSelectionMode] = useState<"quick" | "assignment">("assignment");

  // ---- Page entrance animation ----
  useEffect(() => {
    gsap.from(".page-content", {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
  }, []);

  // ---- Handlers ----
  const handleTabChange = (tab: "title-abstract" | "full-text") => {
    setActiveTab(tab);
  };

  const handleModeChange = (mode: "quick" | "assignment") => {
    setSelectionMode(mode);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden page-content">
      <div className="flex-1 overflow-auto flex py-8 px-6 justify-center no-scrollbar">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Selection Mode
            </h2>
            {selectionMode === "quick" && (
              <p className="text-xs text-slate-400 animate-in fade-in slide-in-from-left-2 duration-300">
                * Note: <span className="font-semibold text-blue-600">Quick Decision</span> is
                available for any paper that does not yet have a final decision and is not yet
                assigned to any reviewer.
              </p>
            )}
            {selectionMode === "assignment" && (
              <p className="text-xs text-slate-400 animate-in fade-in slide-in-from-left-2 duration-300">
                * Note: You can only{" "}
                <span className="font-semibold text-blue-600">Assign Reviewer</span> to papers that
                do not have a final decision.
              </p>
            )}
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm self-start">
            <button
              onClick={() => handleModeChange("assignment")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectionMode === "assignment"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              Assign Reviewer
            </button>
            <button
              onClick={() => handleModeChange("quick")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectionMode === "quick"
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              Quick Decision
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1 min-h-[500px]">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-50">
              <div className="flex px-4 sm:px-6">
                <button
                  onClick={() => handleTabChange("title-abstract")}
                  className={`px-8 py-5 text-sm font-bold border-b-2 transition-all ${activeTab === "title-abstract"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      className={`w-4 h-4 ${activeTab === "title-abstract" ? "text-blue-600" : "text-gray-400"}`}
                    />
                    TITLE/ABSTRACT SCREENING
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange("full-text")}
                  className={`px-8 py-5 text-sm font-bold border-b-2 transition-all ${activeTab === "full-text"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Layout
                      className={`w-4 h-4 ${activeTab === "full-text" ? "text-blue-600" : "text-gray-400"}`}
                    />
                    FULL-TEXT SCREENING
                  </div>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col">
              {activeTab === "title-abstract" ? (
                <TitleAbstractAssignmentTable
                  studySelectionProcessId={screeningProcessId ?? ""}
                  selectionMode={selectionMode}
                />
              ) : (
                <FullTextAssignmentTable
                  studySelectionProcessId={screeningProcessId ?? ""}
                  selectionMode={selectionMode}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignPapersPage;
