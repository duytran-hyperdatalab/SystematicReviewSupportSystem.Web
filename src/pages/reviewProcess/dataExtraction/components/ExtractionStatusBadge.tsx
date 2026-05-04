import { cn } from "../../../../utils/cn";
import type { ExtractionPaperStatus } from "../types";

const EXTRACTION_STATUS_LABELS: Record<ExtractionPaperStatus, string> = {
  todo: "Not Started",
  "in-progress": "In Progress",
  "awaiting-consensus": "Awaiting Consensus",
  completed: "Completed",
};

const EXTRACTION_STATUS_STYLES: Record<ExtractionPaperStatus, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  "in-progress": "bg-blue-50 text-blue-700 border-blue-200",
  "awaiting-consensus": "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

interface ExtractionStatusBadgeProps {
  status: ExtractionPaperStatus;
  className?: string;
}

export default function ExtractionStatusBadge({
  status,
  className,
}: ExtractionStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        EXTRACTION_STATUS_STYLES[status],
        className
      )}
    >
      {EXTRACTION_STATUS_LABELS[status]}
    </span>
  );
}
