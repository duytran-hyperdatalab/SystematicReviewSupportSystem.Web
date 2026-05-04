// Reusable Empty State component for the Identification Phase Workspace

import Button from "./Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel?: string;
  helperText?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  helperText,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-3">
        <Button onClick={onAction}>{actionLabel}</Button>
        {secondaryLabel && (
          <Button variant="secondary" onClick={() => console.log("Secondary action")}>
            {secondaryLabel}
          </Button>
        )}
      </div>
      {helperText && <p className="text-sm text-gray-500 mt-4">{helperText}</p>}
    </div>
  );
}
