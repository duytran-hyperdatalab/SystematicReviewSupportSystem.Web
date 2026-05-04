import React from "react";
import { Search, Filter } from "lucide-react";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import { AssignmentFilterStatus, ResolutionFilterStatus } from "../../../types/studySelection";

interface PaperFiltersProps {
  onSearchChange: (value: string) => void;
  onYearChange?: (value: number | undefined) => void;
  onSearchSourceChange?: (value: string) => void;
  onStageChange?: (value: string) => void;
  onAssignmentStatusChange?: (value: number) => void;
  onDecisionStatusChange?: (value: number) => void;
  showStageFilter?: boolean;
}

const PaperFilters: React.FC<PaperFiltersProps> = ({
  onSearchChange,
  onYearChange,
  onStageChange,
  onAssignmentStatusChange,
  onDecisionStatusChange,
  showStageFilter = true,
}) => {
  return (
    <div className="bg-white p-4 border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <Input
            placeholder="Search papers by title, author, keyword..."
            className="pl-10 w-full"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {showStageFilter && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                className="min-w-[180px]"
                options={[
                  { label: "All Stages", value: "all" },
                  { label: "Title/Abstract Screening", value: "title-abstract" },
                  { label: "Full-Text Screening", value: "full-text" },
                ]}
                defaultValue="all"
                onChange={(e) => onStageChange?.(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Year</span>
            <Input
              type="number"
              placeholder="YYYY"
              className="w-[110px]"
              onChange={(e) => {
                const value = e.target.value.trim();
                const parsedYear = value ? parseInt(value, 10) : undefined;
                if (!value || (parsedYear && parsedYear >= 1900 && parsedYear < 2100)) {
                  onYearChange?.(parsedYear);
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Source</span>

          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Assignment</span>
            <Select
              className="min-w-[150px]"
              options={[
                { label: "All", value: AssignmentFilterStatus.All.toString() },
                {
                  label: "Assigned",
                  value: AssignmentFilterStatus.Assigned.toString(),
                },
                {
                  label: "Unassigned",
                  value: AssignmentFilterStatus.Unassigned.toString(),
                },
              ]}
              defaultValue={AssignmentFilterStatus.All.toString()}
              onChange={(e) => onAssignmentStatusChange?.(parseInt(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Resolution</span>
            <Select
              className="min-w-[150px]"
              options={[
                { label: "All", value: ResolutionFilterStatus.All.toString() },
                {
                  label: "Not Decided",
                  value: ResolutionFilterStatus.NotDecided.toString(),
                },
                {
                  label: "Include",
                  value: ResolutionFilterStatus.Include.toString(),
                },
                {
                  label: "Exclude",
                  value: ResolutionFilterStatus.Exclude.toString(),
                },
              ]}
              defaultValue={ResolutionFilterStatus.All.toString()}
              onChange={(e) => onDecisionStatusChange?.(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperFilters;
