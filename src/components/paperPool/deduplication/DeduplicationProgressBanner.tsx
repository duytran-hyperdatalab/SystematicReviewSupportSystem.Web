// Enhanced Deduplication Progress Banner with metrics, ETA, and animated progress

import { useMemo } from "react";
import { FiClock, FiTrendingUp } from "react-icons/fi";
import { estimateRemainingTime } from "../../../pages/reviewProcess/identification/utils";
import { SIMILARITY_THRESHOLDS } from "../../../pages/reviewProcess/identification/constants";
import type { DuplicatePair } from "../../../types/deduplication";

interface DeduplicationProgressBannerProps {
  duplicatePairs: DuplicatePair[];
  pendingCount: number;
  resolvedCount: number;
  /** Timestamp when user started resolving (first resolution in this session) */
  sessionStartTime: number | null;
  /** Number resolved in this session (for ETA calculation) */
  sessionResolvedCount: number;
}

export default function DeduplicationProgressBanner({
  duplicatePairs,
  pendingCount,
  resolvedCount,
  sessionStartTime,
  sessionResolvedCount,
}: DeduplicationProgressBannerProps) {
  const total = duplicatePairs.length;
  const progressPercent = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const stats = useMemo(() => {
    const highConfidence = duplicatePairs.filter(
      (p) => p.status === "pending" && p.similarityScore >= SIMILARITY_THRESHOLDS.HIGH,
    ).length;

    const eta = estimateRemainingTime(sessionResolvedCount, total, sessionStartTime);

    return { highConfidence, eta };
  }, [duplicatePairs, sessionResolvedCount, total, sessionStartTime]);

  return (
    <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-center ">
        {/* Metrics row */}
        <div className="flex items-center  gap-8">
          <MetricBlock value={total} label="Total pairs" />
          <Divider />
          <MetricBlock
            value={resolvedCount}
            label="Resolved"
            className="text-green-600"
            emoji="✓"
          />
          <MetricBlock
            value={pendingCount}
            label="Pending"
            className="text-orange-600"
            emoji="⏳"
          />
          <Divider />

          {/* Progress bar */}
          <div>
            <div className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
              <FiTrendingUp className="w-3.5 h-3.5" />
              Progress
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-linear-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-600">{progressPercent}% complete</span>
              {stats.eta && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {stats.eta} remaining
                </span>
              )}
            </div>
          </div>
        </div>

        {/* <Button
          size="lg"
          className="flex items-center gap-2 shadow-md"
          onClick={onRunDeduplication}
        >
          <FiRefreshCw className="w-5 h-5" />
          Run Deduplication
        </Button> */}
      </div>

      {/* Contextual tips */}
      {pendingCount > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-200 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">💡 Tip:</span> Use keyboard shortcuts{" "}
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
              1
            </kbd>{" "}
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
              2
            </kbd>{" "}
            for faster review.{" "}
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">
              N
            </kbd>{" "}
            jumps to next unresolved pair.
          </p>
          {stats.highConfidence > 0 && (
            <span className="text-xs text-red-600 font-medium bg-red-50 px-2.5 py-1 rounded-full">
              {stats.highConfidence} high-confidence pending
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function MetricBlock({
  value,
  label,
  className = "text-gray-900",
  emoji,
}: {
  value: number;
  label: string;
  className?: string;
  emoji?: string;
}) {
  return (
    <div>
      <div className={`text-3xl font-bold ${className}`}>{value}</div>
      <div className="text-sm text-gray-600">
        {emoji && <span className="mr-1">{emoji}</span>}
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-12 w-px bg-gray-300" />;
}
