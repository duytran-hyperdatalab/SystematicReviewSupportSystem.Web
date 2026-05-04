import type { Step } from "../types";

export function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3l1.7 4.6L18.3 9l-4.6 1.4L12 15l-1.7-4.6L5.7 9l4.6-1.4L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 14l.9 2.1L8 17l-2.1.9L5 20l-.9-2.1L2 17l2.1-.9L5 14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepBadge({
  step,
  currentStep,
  label,
  complete,
}: {
  step: number;
  currentStep: Step;
  label: string;
  complete: boolean;
}) {
  const isActive = currentStep === step;

  return (
    <div className="flex items-center gap-3">
      <div
        className={[
          "h-9 w-9 rounded-full border text-sm font-semibold flex items-center justify-center transition-all",
          complete
            ? "bg-indigo-600 border-indigo-600 text-white"
            : isActive
              ? "bg-indigo-50 border-indigo-400 text-indigo-700"
              : "bg-white border-slate-300 text-slate-500",
        ].join(" ")}
      >
        {complete ? "✓" : step}
      </div>
      <div>
        <p
          className={[
            "text-sm font-medium",
            isActive || complete ? "text-slate-900" : "text-slate-500",
          ].join(" ")}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function AISkeleton({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-8">
      <div className="mb-5 flex items-center gap-3 text-indigo-700">
        <SparkleIcon className="h-5 w-5" />
        <p className="text-sm font-semibold tracking-wide">AI Assistant</p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 w-2 animate-ping rounded-full bg-indigo-500" />
        <p className="text-sm text-slate-700">{title}</p>
      </div>

      <div className="space-y-3">
        <div className="h-4 w-11/12 animate-pulse rounded bg-white/80" />
        <div className="h-4 w-10/12 animate-pulse rounded bg-white/80" />
        <div className="h-4 w-8/12 animate-pulse rounded bg-white/80" />
      </div>
    </div>
  );
}

export function FieldLabel({ title, ai = false }: { title: string; ai?: boolean }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <label className="text-sm font-semibold text-slate-700">{title}</label>
      {ai && (
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          <SparkleIcon className="h-3.5 w-3.5" />
          AI Suggested
        </span>
      )}
    </div>
  );
}
