import { useState, useRef, useEffect, forwardRef } from "react";
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiList,
  FiShare2,
} from "react-icons/fi";
import type { ScreeningPaper, PaperFilters, PaginationInfo, StatusFilter } from "../types";
import type { PaperSortBy } from "../../../../../types/studySelection";
import { STATUS_CONFIG, SORT_OPTIONS, STATUS_FILTER_OPTIONS } from "../constants";
import { cn } from "../../../../../utils/cn";

interface PaperQueueProps {
  papers: ScreeningPaper[];
  selectedPaperId: string | null;
  pagination: PaginationInfo;
  filters: PaperFilters;
  onSelectPaper: (paperId: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: PaperSortBy) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function PaperQueue({
  papers,
  selectedPaperId,
  pagination,
  filters,
  onSelectPaper,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onPageChange,
  onPageSizeChange,
}: PaperQueueProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedPaperId]);

  const currentSort = SORT_OPTIONS.find((o) => o.value === filters.sortBy);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Paper Queue</h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            {pagination.totalCount}
          </span>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by title, author, year..."
            value={filters.search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none transition-colors"
          />
        </div>

        {/* Sort & Filter Row */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600 truncate">{currentSort?.label ?? "Sort"}</span>
              <FiChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
            </button>
            {showSortDropdown && (
              <DropdownMenu
                items={SORT_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                onSelect={(val) => {
                  onSortChange(val);
                  setShowSortDropdown(false);
                }}
                onClose={() => setShowSortDropdown(false)}
              />
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-gray-600 truncate">
                {STATUS_FILTER_OPTIONS.find((f) => f.value === filters.status)?.label ?? "Filter"}
              </span>
              <FiChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
            </button>
            {showFilterDropdown && (
              <DropdownMenu
                items={STATUS_FILTER_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
                onSelect={(val) => {
                  onStatusFilterChange(val as StatusFilter);
                  setShowFilterDropdown(false);
                }}
                onClose={() => setShowFilterDropdown(false)}
              />
            )}
          </div>
        </div>

      </div>

      {/* Paper List */}
      <div className="flex-1 overflow-y-auto">
        {papers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <FiSearch className="w-8 h-8 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-900">No papers found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[180px] mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {(filters.search || filters.status !== "all") && (
              <button
                onClick={() => {
                  onSearchChange("");
                  onStatusFilterChange("all");
                }}
                className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          papers.map((paper) => (
            <PaperListItem
              key={paper.id}
              ref={paper.id === selectedPaperId ? selectedRef : undefined}
              paper={paper}
              isSelected={paper.id === selectedPaperId}
              onClick={() => onSelectPaper(paper.id)}
            />
          ))
        )}
      </div>

        <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPreviousPage}
              onClick={() => onPageChange(pagination.pageNumber - 1)}
              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">
              Page {pagination.pageNumber} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange(pagination.pageNumber + 1)}
              className="p-1.5 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Show</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-[10px] bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all font-medium cursor-pointer"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
    </div>
  );
}

// ============================================
// Paper List Item
// ============================================

interface PaperListItemProps {
  paper: ScreeningPaper;
  isSelected: boolean;
  onClick: () => void;
}

const PaperListItem = forwardRef<HTMLDivElement, PaperListItemProps>(
  ({ paper, isSelected, onClick }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") onClick();
        }}
        className={cn(
          "px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors",
          isSelected
            ? "bg-blue-50 border-l-2 border-l-blue-500"
            : "hover:bg-gray-50 border-l-2 border-l-transparent",
        )}
      >
        {/* Status indicator + Title */}
        <div className="flex items-start gap-2">
          <StatusDot status={paper.screeningStatus} />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
              {paper.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {paper.authors ?? "Unknown authors"}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              {paper.publicationYear && (
                <span className="text-[10px] text-gray-400 font-medium">
                  {paper.publicationYear}
                </span>
              )}
              {paper.source && <span className="text-[10px] text-gray-400">· {paper.source}</span>}
              <div className="flex items-center gap-1.5 ml-auto">
                {paper.referenceCount !== undefined && paper.referenceCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-purple-500 bg-purple-50 px-1 rounded">
                    <FiList className="w-2.5 h-2.5" />
                    {paper.referenceCount}
                  </span>
                )}
                {paper.citationCount !== undefined && paper.citationCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1 rounded">
                    <FiShare2 className="w-2.5 h-2.5" />
                    {paper.citationCount}
                  </span>
                )}
              </div>
            </div>

            {/* Reviewer decisions */}
            {paper.decisions.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {paper.decisions.map((d) => (
                  <span
                    key={d.id}
                    className={cn(
                      "inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full",
                      d.decision === "included"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600",
                    )}
                  >
                    {d.decision === "included" ? (
                      <FiCheck className="w-2.5 h-2.5" />
                    ) : (
                      <FiX className="w-2.5 h-2.5" />
                    )}
                    {d.reviewerName}
                  </span>
                ))}
              </div>
            )}

            {/* Conflict badge */}
            {paper.screeningStatus === "conflicted" && (
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600 font-medium">
                <FiAlertTriangle className="w-3 h-3" />
                Conflict — needs resolution
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

PaperListItem.displayName = "PaperListItem";

// ============================================
// Status Dot
// ============================================

function StatusDot({ status }: { status: string }) {
  const dotColors: Record<string, string> = {
    pending: "bg-gray-400",
    included: "bg-green-500",
    excluded: "bg-red-500",
    conflicted: "bg-amber-500",
  };

  return (
    <span
      className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", dotColors[status] ?? "bg-gray-400")}
      title={STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label ?? status}
    />
  );
}

// ============================================
// Dropdown Menu
// ============================================

function DropdownMenu<T>({
  items,
  onSelect,
  onClose,
}: {
  items: { label: string; value: T }[];
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onSelect(item.value)}
          className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
