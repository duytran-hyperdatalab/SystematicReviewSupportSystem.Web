// Duplicate Pairs Queue Panel — left sidebar with filtering, sorting, search

import { useMemo, useState, useCallback } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";
import type {
  DuplicatePair,
  DuplicateFilterType,
  DuplicateSortType,
} from "../../../types/deduplication";
import {
  getSimilarityColor,
  getSimilarityTextColor,
  getConfidenceLevel,
} from "../../../pages/reviewProcess/identification/utils";
import {
  CONFIDENCE_LABELS,
  SIMILARITY_THRESHOLDS,
} from "../../../pages/reviewProcess/identification/constants";

interface DuplicateQueuePanelProps {
  duplicatePairs: DuplicatePair[];
  selectedPair: DuplicatePair | null;
  onSelectPair: (pair: DuplicatePair) => void;
}

export default function DuplicateQueuePanel({
  duplicatePairs,
  selectedPair,
  onSelectPair,
}: DuplicateQueuePanelProps) {
  const [filter, setFilter] = useState<DuplicateFilterType>("all");
  const [sort, setSort] = useState<DuplicateSortType>("similarity-desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Memoized filter + sort + search
  const filteredPairs = useMemo(() => {
    let result = [...duplicatePairs];

    // Apply filter
    switch (filter) {
      case "unresolved":
        result = result.filter((p) => p.status === "pending");
        break;
      case "resolved":
        result = result.filter((p) => p.status === "resolved");
        break;
      case "high-confidence":
        result = result.filter((p) => p.similarityScore >= SIMILARITY_THRESHOLDS.HIGH);
        break;
    }

    // Apply search (searches in both paper titles)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.originalPaper.title.toLowerCase().includes(q) ||
          p.duplicatePaper.title.toLowerCase().includes(q),
      );
    }

    // Apply sort
    switch (sort) {
      case "similarity-desc":
        result.sort((a, b) => b.similarityScore - a.similarityScore);
        break;
      case "similarity-asc":
        result.sort((a, b) => a.similarityScore - b.similarityScore);
        break;
      case "newest":
        // Use pair id as proxy for order since we don't have timestamps
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return result;
  }, [duplicatePairs, filter, sort, searchQuery]);

  const filterCounts = useMemo(() => {
    const unresolved = duplicatePairs.filter((p) => p.status === "pending").length;
    const resolved = duplicatePairs.filter((p) => p.status === "resolved").length;
    const highConf = duplicatePairs.filter(
      (p) => p.similarityScore >= SIMILARITY_THRESHOLDS.HIGH,
    ).length;
    return { all: duplicatePairs.length, unresolved, resolved, highConf };
  }, [duplicatePairs]);

  const handleFilterChange = useCallback((newFilter: DuplicateFilterType) => {
    setFilter(newFilter);
  }, []);

  const FILTER_BUTTONS: { key: DuplicateFilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: filterCounts.all },
    { key: "unresolved", label: "Pending", count: filterCounts.unresolved },
    { key: "resolved", label: "Done", count: filterCounts.resolved },
    { key: "high-confidence", label: "High", count: filterCounts.highConf },
  ];

  return (
    <div className="lg:col-span-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          Duplicate Pairs
          <span className="ml-2 text-sm font-normal text-gray-500">({filteredPairs.length})</span>
        </h3>
        <button
          onClick={() => setShowFilters((prev) => !prev)}
          className={`p-1.5 rounded-lg transition-colors ${
            showFilters
              ? "bg-blue-100 text-blue-600"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          }`}
          title="Toggle filters"
        >
          <FiFilter className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by paper title..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
        />
      </div>

      {/* Filter & Sort controls */}
      {showFilters && (
        <div className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          {/* Filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {FILTER_BUTTONS.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === key
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {label}
                <span className="ml-1 opacity-70">{count}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as DuplicateSortType)}
            className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="similarity-desc">Highest similarity first</option>
            <option value="similarity-asc">Lowest similarity first</option>
            <option value="newest">Newest first</option>
          </select>
        </div>
      )}

      {/* Pairs list */}
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {filteredPairs.length > 0 ? (
          filteredPairs.map((pair) => {
            const isSelected = selectedPair?.id === pair.id;
            const isResolved = pair.status === "resolved";
            const confidence = getConfidenceLevel(pair.similarityScore);
            const confidenceInfo = CONFIDENCE_LABELS[confidence];

            return (
              <button
                key={pair.id}
                onClick={() => onSelectPair(pair)}
                className={`w-full text-left p-3.5 rounded-lg border-2 transition-all group ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : isResolved
                      ? "border-gray-100 bg-gray-50 hover:border-gray-200"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {/* Top row: score + confidence + status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-14 h-1.5 rounded-full ${getSimilarityColor(pair.similarityScore)}`}
                    />
                    <span
                      className={`text-xs font-bold ${getSimilarityTextColor(pair.similarityScore)}`}
                    >
                      {pair.similarityScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                      {pair.methodText}
                    </span>
                  </div>
                  {isResolved ? (
                    pair.resolvedDecision === "cancel" ? (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                        Duplicate Removed
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        Not Duplicate
                      </span>
                    )
                  ) : (
                    <span className={`text-xs font-medium ${confidenceInfo.color}`}>
                      {confidenceInfo.label}
                    </span>
                  )}
                </div>

                {/* Paper title (Original) */}
                <p
                  className={`text-sm font-medium line-clamp-2 mb-1.5 ${
                    isResolved ? "text-gray-500" : "text-gray-900"
                  }`}
                >
                  {pair.originalPaper.title}
                </p>

                {/* Source badges */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {pair.originalPaper.source}
                  </span>
                  <span className="text-gray-400">vs</span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                    {pair.duplicatePaper.source}
                  </span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No pairs match your filters</p>
            <button
              onClick={() => {
                setFilter("all");
                setSearchQuery("");
              }}
              className="text-xs text-blue-600 hover:text-blue-700 mt-1"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
