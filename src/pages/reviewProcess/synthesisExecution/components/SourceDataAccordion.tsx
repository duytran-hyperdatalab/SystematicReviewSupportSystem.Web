import { ChevronDown, Link2, Tag } from "lucide-react";
import type { SourceDataGroupDto, SourceDataValueDto, SynthesisThemeDto } from "../../../../types/synthesisExecution";

interface SourceDataAccordionProps {
  groups: SourceDataGroupDto[];
  themes: SynthesisThemeDto[];
  expandedGroupId: string | null;
  selectedThemeByValueId: Record<string, string>;
  disabled?: boolean;
  linkingValueId?: string | null;
  onToggleGroup: (groupId: string) => void;
  onSelectThemeForValue: (valueId: string, themeId: string) => void;
  onLinkValueToTheme: (themeId: string, value: SourceDataValueDto) => void;
}

function SourceDataValueRow({
  value,
  themes,
  selectedThemeId,
  disabled = false,
  isLinking = false,
  onSelectTheme,
  onLink,
}: {
  value: SourceDataValueDto;
  themes: SynthesisThemeDto[];
  selectedThemeId: string;
  disabled?: boolean;
  isLinking?: boolean;
  onSelectTheme: (themeId: string) => void;
  onLink: () => void;
}) {
  const hasThemes = themes.length > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-blue-600" />
            <p className="text-xs font-semibold text-gray-900">{value.paperTitle}</p>
          </div>
          <p className="text-xs leading-5 text-gray-600">{value.displayValue}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <select
            value={selectedThemeId}
            onChange={(event) => onSelectTheme(event.target.value)}
            disabled={disabled || !hasThemes}
            className="min-w-40 rounded-lg border border-transparent bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 outline-none transition hover:border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">Choose theme</option>
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onLink}
            disabled={disabled || !selectedThemeId || !hasThemes}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            title="Link selected theme"
            aria-label="Link selected theme"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
          {isLinking ? <span className="text-[11px] font-medium text-blue-600">Linking...</span> : null}
        </div>
      </div>
    </div>
  );
}

export default function SourceDataAccordion({
  groups,
  themes,
  expandedGroupId,
  selectedThemeByValueId,
  disabled = false,
  linkingValueId,
  onToggleGroup,
  onSelectThemeForValue,
  onLinkValueToTheme,
}: SourceDataAccordionProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
        <p className="text-sm font-medium text-gray-600">No raw extracted data was returned for this synthesis process.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const isOpen = expandedGroupId === group.fieldId;

        return (
          <div key={group.fieldId} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => onToggleGroup(group.fieldId)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">{group.fieldName}</p>
                <p className="text-xs text-gray-500">{group.values.length} extracted items</p>
              </div>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div className="space-y-3 border-t border-gray-100 bg-gray-50/60 p-4">
                {group.values.map((value) => (
                  <SourceDataValueRow
                    key={value.extractedDataValueId}
                    value={value}
                    themes={themes}
                    selectedThemeId={selectedThemeByValueId[value.extractedDataValueId] ?? ""}
                    disabled={disabled}
                    isLinking={linkingValueId === value.extractedDataValueId}
                    onSelectTheme={(themeId) => onSelectThemeForValue(value.extractedDataValueId, themeId)}
                    onLink={() => {
                      const themeId = selectedThemeByValueId[value.extractedDataValueId] ?? "";
                      if (!themeId) {
                        return;
                      }

                      onLinkValueToTheme(themeId, value);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}