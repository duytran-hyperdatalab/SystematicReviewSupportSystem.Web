import { Layers3, Pencil, Tags, Trash2 } from "lucide-react";
import type { SynthesisThemeDto, ThemeEvidenceDto } from "../../../../types/synthesisExecution";

interface SynthesisThemeCardProps {
  theme: SynthesisThemeDto;
  disabled?: boolean;
  onEditTheme?: (theme: SynthesisThemeDto) => void;
  onDeleteTheme?: (theme: SynthesisThemeDto) => void;
  onUnlinkEvidence?: (evidence: ThemeEvidenceDto) => void;
  unlinkingEvidenceId?: string | null;
}

export default function SynthesisThemeCard({
  theme,
  disabled = false,
  onEditTheme,
  onDeleteTheme,
  onUnlinkEvidence,
  unlinkingEvidenceId = null,
}: SynthesisThemeCardProps) {
  const canManageTheme = Boolean(onEditTheme || onDeleteTheme);

  return (
    <article className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md ${disabled ? "opacity-80" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-gray-900">{theme.name}</h4>
          </div>
          {theme.description ? (
            <p className="text-sm leading-6 text-gray-600">{theme.description}</p>
          ) : (
            <p className="text-sm italic text-gray-400">No description provided.</p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 text-right">
          {canManageTheme ? (
            <div className="flex items-center gap-2">
              {onEditTheme ? (
                <button
                  type="button"
                  onClick={() => onEditTheme(theme)}
                  disabled={disabled}
                  className="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Edit theme"
                  title="Edit theme"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : null}
              {onDeleteTheme ? (
                <button
                  type="button"
                  onClick={() => onDeleteTheme(theme)}
                  disabled={disabled}
                  className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 p-1.5 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Delete theme"
                  title="Delete theme"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            {theme.colorCode ?? "No color"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700">
            <Tags className="h-3.5 w-3.5" />
            {theme.evidences.length} evidences
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {theme.evidences.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            No linked evidence yet.
          </p>
        ) : (
          theme.evidences.map((evidence) => (
            <div key={evidence.id} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    {evidence.paperTitle}
                  </p>
                  {evidence.fieldName ? (
                    <p className="mt-1 text-xs font-medium text-gray-500">Field: {evidence.fieldName}</p>
                  ) : null}
                </div>
                {onUnlinkEvidence ? (
                  <button
                    type="button"
                    onClick={() => onUnlinkEvidence(evidence)}
                    disabled={disabled || unlinkingEvidenceId === evidence.id}
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {unlinkingEvidenceId === evidence.id ? "Unlinking..." : "Unlink"}
                  </button>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-gray-700">{evidence.displayValue}</p>
              {evidence.notes ? <p className="mt-2 text-xs text-gray-500">{evidence.notes}</p> : null}
            </div>
          ))
        )}
      </div>
    </article>
  );
}