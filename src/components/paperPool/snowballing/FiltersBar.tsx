import React from "react";
import { Search } from "lucide-react";

interface FiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  year: string;
  onYearChange: (value: string) => void;
  years: string[];
}

const FiltersBar: React.FC<FiltersBarProps> = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  year,
  onYearChange,
  years,
}) => {
  return (
    <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-20">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center max-w-7xl mx-auto">
        <div className="relative flex-1 w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search title, authors, or origin paper..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="flex-1 md:flex-initial pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="0">Detected</option>
            <option value="1">Matched</option>
            <option value="2">Rejected</option>
            <option value="3">Suggested</option>
          </select>

          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            className="flex-1 md:flex-initial pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="all">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
