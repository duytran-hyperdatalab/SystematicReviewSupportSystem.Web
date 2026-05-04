// Utility functions specific to the Identification Phase Workspace

import type { ConfidenceLevel, DiffSegment } from "../../../types/deduplication";
import { SIMILARITY_THRESHOLDS } from "./constants";

/**
 * Returns a Tailwind background color class based on similarity score
 */
export const getSimilarityColor = (score: number): string => {
  if (score >= 95) return "bg-red-500";
  if (score >= 85) return "bg-orange-500";
  return "bg-yellow-500";
};

/**
 * Returns a Tailwind text color class based on similarity score
 */
export const getSimilarityTextColor = (score: number): string => {
  if (score >= 95) return "text-red-600";
  if (score >= 85) return "text-orange-600";
  return "text-yellow-600";
};

/**
 * Return confidence level based on similarity score
 */
export const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score >= SIMILARITY_THRESHOLDS.HIGH) return "high";
  if (score >= SIMILARITY_THRESHOLDS.MEDIUM) return "medium";
  return "low";
};

/**
 * Compute a simple word-level diff between two strings.
 * Returns an array of segments indicating same/added/removed.
 */
export const computeWordDiff = (textA: string, textB: string): DiffSegment[] => {
  const wordsA = textA.split(/\s+/).filter(Boolean);
  const wordsB = textB.split(/\s+/).filter(Boolean);

  // Simple LCS-based diff
  const m = wordsA.length;
  const n = wordsB.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (wordsA[i - 1].toLowerCase() === wordsB[j - 1].toLowerCase()) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build diff
  const segments: DiffSegment[] = [];
  let i = m;
  let j = n;

  const rawSegments: DiffSegment[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1].toLowerCase() === wordsB[j - 1].toLowerCase()) {
      rawSegments.unshift({ text: wordsA[i - 1], type: "same" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawSegments.unshift({ text: wordsB[j - 1], type: "added" });
      j--;
    } else {
      rawSegments.unshift({ text: wordsA[i - 1], type: "removed" });
      i--;
    }
  }

  // Merge consecutive segments of the same type
  for (const seg of rawSegments) {
    const last = segments[segments.length - 1];
    if (last && last.type === seg.type) {
      last.text += " " + seg.text;
    } else {
      segments.push({ ...seg });
    }
  }

  return segments;
};

/**
 * Estimate remaining time based on resolution pace.
 * Returns human-readable string like "~5 min" or "~1 hr 20 min"
 */
export const estimateRemainingTime = (
  resolvedCount: number,
  totalCount: number,
  startTime: number | null,
): string | null => {
  if (!startTime || resolvedCount === 0) return null;

  const elapsed = Date.now() - startTime;
  const avgPerPair = elapsed / resolvedCount;
  const remaining = totalCount - resolvedCount;
  const estimatedMs = remaining * avgPerPair;

  const minutes = Math.round(estimatedMs / 60_000);
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `~${minutes} min`;

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `~${hrs} hr ${mins} min` : `~${hrs} hr`;
};

/**
 * Check if two field values differ meaningfully (ignoring case & punctuation)
 */
export const fieldsAreDifferent = (a: string | undefined, b: string | undefined): boolean => {
  if (!a && !b) return false;
  if (!a || !b) return true;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalize(a) !== normalize(b);
};
