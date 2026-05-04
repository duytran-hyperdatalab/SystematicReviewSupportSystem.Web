// Tab navigation bar for the Identification Phase Workspace

import { FiSearch, FiGrid, FiDatabase } from "react-icons/fi";
import type { TabType } from "../types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchExecutionCount: number;
  uniquePapersCount: number;
  hasUniquePapers: boolean;
}

export default function TabNavigation({
  activeTab,
  onTabChange,
  searchExecutionCount,
  uniquePapersCount,
  hasUniquePapers,
}: TabNavigationProps) {
  const tabClass = (tab: TabType) =>
    `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? "border-blue-600 text-blue-600 bg-white"
        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <div className="border-b border-gray-200 bg-gray-50">
      <nav className="flex">
        {/* Search Strategies */}
        <button onClick={() => onTabChange("strategies")} className={tabClass("strategies")}>
          <FiSearch className="w-4 h-4" />
          Search Strategies
          <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            {searchExecutionCount}
          </span>
        </button>

        {/* Papers Library */}
        <button onClick={() => onTabChange("library")} className={tabClass("library")}>
          <FiGrid className="w-4 h-4" />
          Papers Library
          <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
            {hasUniquePapers ? uniquePapersCount.toLocaleString() : "--"}
          </span>
        </button>

        {/* Build Dataset */}
        <button onClick={() => onTabChange("dataset")} className={tabClass("dataset")}>
          <FiDatabase className="w-4 h-4" />
          Build Dataset
        </button>
      </nav>
    </div>
  );
}
