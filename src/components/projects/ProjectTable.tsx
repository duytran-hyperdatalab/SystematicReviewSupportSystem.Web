import React, { useState } from "react";
import { FiChevronUp, FiChevronDown, FiCheckSquare } from "react-icons/fi";
import type { Project } from "../../types/project";
import { cn } from "../../utils/cn";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/Table";

interface ProjectTableProps {
  projects: Project[];
  onView: (id: string) => void;
  onChecklistClick?: (projectId: string) => void;
}

type SortField = "title" | "domain" | "status" | "createdAt" | "modifiedAt";
type SortOrder = "asc" | "desc";

const renderSortIndicator = (
  activeField: SortField,
  sortField: SortField,
  sortOrder: SortOrder,
) => {
  if (sortField !== activeField) {
    return (
      <div className="w-4 h-4 opacity-0 group-hover:opacity-30 flex flex-col items-center justify-center ml-1">
        <FiChevronUp size={10} />
        <FiChevronDown size={10} />
      </div>
    );
  }

  return (
    <span className="ml-1 text-blue-600">
      {sortOrder === "asc" ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
    </span>
  );
};

const ProjectTable: React.FC<ProjectTableProps> = ({ projects, onView, onChecklistClick }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const toggleSelectAll = () => {
    if (selectedIds.size === projects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(projects.map((p) => p.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent cursor-default">
          <TableHead className="w-12">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={selectedIds.size === projects.length && projects.length > 0}
              onChange={toggleSelectAll}
            />
          </TableHead>
          <TableHead className="cursor-pointer group" onClick={() => handleSort("title")}>
            <div className="flex items-center">
              Code
            </div>
          </TableHead>
          <TableHead className="cursor-pointer group" onClick={() => handleSort("title")}>
            <div className="flex items-center">
              Name {renderSortIndicator("title", sortField, sortOrder)}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer group" onClick={() => handleSort("domain")}>
            <div className="flex items-center">
              Domain {renderSortIndicator("domain", sortField, sortOrder)}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer group" onClick={() => handleSort("status")}>
            <div className="flex items-center">
              Status {renderSortIndicator("status", sortField, sortOrder)}
            </div>
          </TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Leader</TableHead>
          <TableHead className="cursor-pointer group" onClick={() => handleSort("createdAt")}>
            <div className="flex items-center">
              Created {renderSortIndicator("createdAt", sortField, sortOrder)}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer group" onClick={() => handleSort("modifiedAt")}>
            <div className="flex items-center">
              Modified {renderSortIndicator("modifiedAt", sortField, sortOrder)}
            </div>
          </TableHead>
          <TableHead className="text-center">Checklist</TableHead>
          <TableHead className="text-right">View</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id} onClick={() => onView(project.id)}>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={selectedIds.has(project.id)}
                onChange={() => toggleSelectRow(project.id)}
              />
            </TableCell>
            <TableCell className="font-bold text-indigo-600">
              {project.code}
            </TableCell>
            <TableCell className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.title}
            </TableCell>
            <TableCell className="text-gray-500">{project.domain}</TableCell>
            <TableCell className="text-gray-500">
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 font-medium text-gray-700">
                {project.statusText}
              </span>
            </TableCell>
            <TableCell className="text-gray-600 font-medium">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold",
                  project.roleText === "Leader"
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-slate-50 text-slate-600",
                )}
              >
                {project.roleText || "Member"}
              </span>
            </TableCell>
            <TableCell className="text-gray-600 font-medium whitespace-nowrap">
              {project.leader ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                    {project.leader.fullName.charAt(0)}
                  </div>
                  <span className="text-sm">{project.leader.fullName}</span>
                </div>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </TableCell>
            <TableCell className="text-gray-500 text-sm whitespace-nowrap">
              {new Date(project.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-gray-500 text-sm whitespace-nowrap">
              {new Date(project.modifiedAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
              {onChecklistClick && (
                <button
                  onClick={() => onChecklistClick(project.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                  title="View checklists"
                >
                  <FiCheckSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Checklist</span>
                </button>
              )}
            </TableCell>
            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
              <button
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                onClick={() => onView(project.id)}
              >
                View
              </button>
            </TableCell>
          </TableRow>
        ))}
        {projects.length === 0 && (
          <TableRow className="hover:bg-transparent cursor-default">
            <TableCell colSpan={12} className="p-12 text-center text-gray-400 font-medium">
              You don't have any projects or haven't joined any projects.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ProjectTable;
