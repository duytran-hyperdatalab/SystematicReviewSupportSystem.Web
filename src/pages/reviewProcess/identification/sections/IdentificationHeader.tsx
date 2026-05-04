// Page Header: Breadcrumb, title, status badge, and action buttons

import { FiDatabase, FiCheck, FiRefreshCw, FiFileText } from "react-icons/fi";
import Button from "../../../../components/ui/Button";
import type { PhaseStatus } from "../types";

interface IdentificationHeaderProps {
  phaseStatus: PhaseStatus;
  listLoading: boolean;
  statsLoading: boolean;
  onNavigateToProject: () => void;
  onBack: () => void;
  onRefreshData: () => void;
  onCompletePhase: () => void;
  onStartPhase: () => void;
  onReopenPhase: () => void;
}

export default function IdentificationHeader({
  phaseStatus,
  listLoading,
  statsLoading,
  onNavigateToProject,
  onBack,
  onRefreshData,
  onCompletePhase,
  onStartPhase,
  onReopenPhase,
}: IdentificationHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <button onClick={onNavigateToProject} className="hover:text-gray-900 transition-colors">
            Project
          </button>
          <span>›</span>
          <button onClick={onBack} className="hover:text-gray-900 transition-colors">
            Review Process
          </button>
          <span>›</span>
          <span className="font-medium text-gray-900">Identification Phase</span>
        </nav>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FiDatabase className="w-7 h-7 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Identification Phase</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${phaseStatus === "in-progress"
                    ? "bg-blue-100 text-blue-700"
                    : phaseStatus === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
              >
                {phaseStatus === "in-progress" && (
                  <>
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    In Progress
                  </>
                )}
                {phaseStatus === "completed" && (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Completed
                  </>
                )}
                {phaseStatus === "not-started" && "Not Started"}
              </span>
            </div>

            <p className="text-gray-600 mb-4">
              Identify and import relevant records from multiple sources
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={onRefreshData}
              disabled={listLoading || statsLoading}
            >
              <FiRefreshCw
                className={`w-4 h-4 ${listLoading || statsLoading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </Button>
            {phaseStatus === "not-started" && (
              <Button className="flex items-center gap-2" onClick={onStartPhase}>
                <FiFileText className="w-4 h-4" />
                Start Phase
              </Button>
            )}
            {phaseStatus === "in-progress" && (
              <Button className="flex items-center gap-2" onClick={onCompletePhase}>
                <FiCheck className="w-4 h-4" />
                Complete Phase
              </Button>
            )}
            {phaseStatus === "completed" && (
              <Button
                variant="secondary"
                className="flex items-center gap-2"
                onClick={onReopenPhase}
              >
                <FiRefreshCw className="w-4 h-4" />
                Reopen Phase
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
