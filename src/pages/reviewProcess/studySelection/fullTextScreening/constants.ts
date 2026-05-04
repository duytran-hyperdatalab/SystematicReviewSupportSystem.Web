import type { StatusFilter, MatchStatus } from "./types";
import { PaperSortBy } from "../../../../types/studySelection";

// ============================================
// Status Colors & Labels
// ============================================

export const STATUS_CONFIG = {
  pending: {
    label: "Not Screened",
    color: "gray",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "bg-emerald-400",
  },
  included: {
    label: "Included",
    color: "green",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  excluded: {
    label: "Excluded",
    color: "red",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  conflicted: {
    label: "Conflicted",
    color: "amber",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
} as const;

// ============================================
// Sort Options
// ============================================

export const SORT_OPTIONS: { label: string; value: PaperSortBy }[] = [
  { label: "AI Relevance Score", value: PaperSortBy.RelevanceDesc },
  { label: "Title A–Z", value: PaperSortBy.TitleAsc },
  { label: "Title Z–A", value: PaperSortBy.TitleDesc },
  { label: "Year (Newest)", value: PaperSortBy.YearNewest },
  { label: "Year (Oldest)", value: PaperSortBy.YearOldest },
];

// ============================================
// Filter Options
// ============================================

export const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All Papers", value: "all" },
  { label: "Not Screened", value: "pending" },
  { label: "Included", value: "included" },
  { label: "Excluded", value: "excluded" },
  { label: "Conflicted", value: "conflicted" },
];

import { ExclusionReasonCode } from "../../../../types/studySelection";

export const EXCLUDE_REASONS = [
  { label: "Wrong study type", value: ExclusionReasonCode.NotResearchPaper },
  { label: "Not empirical research", value: ExclusionReasonCode.NotEmpiricalStudy },
  { label: "Methodology insufficient", value: ExclusionReasonCode.Other },
  { label: "Outcome not relevant", value: ExclusionReasonCode.NotRelevantToTopic },
  { label: "Dataset not appropriate", value: ExclusionReasonCode.Other },
  { label: "Wrong population", value: ExclusionReasonCode.NotRelevantPopulation },
  { label: "Wrong intervention", value: ExclusionReasonCode.NotRelevantIntervention },
  { label: "Not within time range", value: ExclusionReasonCode.OutsideTimeRange },
  { label: "Language mismatch", value: ExclusionReasonCode.UnsupportedLanguage },
  { label: "Duplicate study", value: ExclusionReasonCode.DuplicateStudy },
  { label: "Full text unavailable", value: ExclusionReasonCode.Other },
  { label: "Other", value: ExclusionReasonCode.Other },
] as const;

// ============================================
// Paper Sections (for PDF navigation)
// ============================================

export const PAPER_SECTIONS = [
  { id: "introduction", label: "Introduction" },
  { id: "methodology", label: "Methodology" },
  { id: "population", label: "Population / Dataset" },
  { id: "experiment", label: "Experiment / Study Design" },
  { id: "results", label: "Results" },
  { id: "conclusion", label: "Conclusion" },
] as const;

// ============================================
// AI Match Status Config
// ============================================

export const MATCH_STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; icon: string; color: string; bg: string }
> = {
  match: { label: "Match", icon: "check", color: "text-green-600", bg: "bg-green-50" },
  partial_match: {
    label: "Partial Match",
    icon: "alert-circle",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  not_match: { label: "Not Match", icon: "x", color: "text-red-600", bg: "bg-red-50" },
  unknown: { label: "Unknown", icon: "help", color: "text-gray-500", bg: "bg-gray-50" },
} as const;

// ============================================
// PICOC Labels
// ============================================

export const PICOC_LABELS: Record<string, string> = {
  population: "Population",
  intervention: "Intervention",
  comparison: "Comparison",
  outcome: "Outcome",
  context: "Context",
} as const;

// ============================================
// Keyboard Shortcuts
// ============================================

export const SCREENING_SHORTCUTS = {
  INCLUDE: "1",
  EXCLUDE: "2",
  NEXT_PAPER: "ArrowDown",
  PREV_PAPER: "ArrowUp",
} as const;
