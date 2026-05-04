import React from "react";
import { cn } from "../../utils/cn";

interface CompletionProgressProps {
  completed: number;
  total: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Displays completion progress with an animated bar
 */
const CompletionProgress: React.FC<CompletionProgressProps> = ({
  completed,
  total,
  className,
  showLabel = true,
  size = "md",
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isComplete = percentage === 100;

  const heightClasses = {
    sm: "h-1.5",
    md: "h-3",
    lg: "h-4",
  };

  const labelClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={cn("font-medium text-gray-700", labelClasses[size])}>Completion</span>
          <span
            className={cn(
              "font-semibold",
              labelClasses[size],
              isComplete ? "text-emerald-600" : "text-indigo-600",
            )}
          >
            {percentage}% ({completed}/{total})
          </span>
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", heightClasses[size])}>
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            isComplete
              ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
              : "bg-gradient-to-r from-indigo-400 to-indigo-600",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {size === "lg" && (
        <div className="mt-3 text-sm text-gray-600">
          <p>
            {completed} of {total} items completed
            {total - completed > 0 ? ` • ${total - completed} remaining` : " ✓"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompletionProgress;
