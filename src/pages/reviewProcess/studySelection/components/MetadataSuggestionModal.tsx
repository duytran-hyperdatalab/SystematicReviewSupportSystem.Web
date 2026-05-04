import { useMemo, useState, useEffect, useCallback } from "react";
import { FiCheckSquare, FiSave, FiSquare, FiMinusSquare, FiAlertCircle } from "react-icons/fi";
import Modal from "../../../../components/ui/Modal";
import type { ExtractionSuggestionResponse } from "../../../../types/paper";
import { cn } from "../../../../utils/cn";

interface MetadataSuggestionModalProps {
  isOpen: boolean;
  isApplying: boolean;
  currentMetadata: {
    title?: string | null;
    authors?: string | null;
    abstract?: string | null;
    doi?: string | null;
    journal?: string | null;
    volume?: string | null;
    issue?: string | null;
    pages?: string | null;
    keywords?: string | null;
    year?: string | null;
    publishedDate?: string | null;
    issn?: string | null;
    eissn?: string | null;
    language?: string | null;
    md5?: string | null;
    publisher?: string | null;
  };
  suggestion: ExtractionSuggestionResponse;
  onApply: (selectedFields: string[]) => Promise<void>;
  onClose: () => void;
  onApplied?: (selectedFields: string[]) => void;
}

interface SuggestionFieldConfig {
  key: keyof ExtractionSuggestionResponse;
  apiFieldName: string;
  label: string;
}

const SUGGESTION_FIELD_CONFIG: SuggestionFieldConfig[] = [
  { key: "title", apiFieldName: "Title", label: "Title" },
  { key: "authors", apiFieldName: "Authors", label: "Authors" },
  { key: "abstract", apiFieldName: "Abstract", label: "Abstract" },
  { key: "doi", apiFieldName: "DOI", label: "DOI" },
  { key: "journal", apiFieldName: "Journal", label: "Journal" },
  { key: "volume", apiFieldName: "Volume", label: "Volume" },
  { key: "issue", apiFieldName: "Issue", label: "Issue" },
  { key: "pages", apiFieldName: "Pages", label: "Pages" },
  { key: "keywords", apiFieldName: "Keywords", label: "Keywords" },
  { key: "year", apiFieldName: "Year", label: "Year" },
  { key: "publishedDate", apiFieldName: "Published Date", label: "Published Date" },
  { key: "issn", apiFieldName: "ISSN", label: "ISSN" },
  { key: "eissn", apiFieldName: "EISSN", label: "EISSN" },
  { key: "language", apiFieldName: "Language", label: "Language" },
  { key: "md5", apiFieldName: "Md5", label: "Md5" },
  { key: "publisher", apiFieldName: "Publisher", label: "Publisher" },
];

/**
 * Normalizes values for comparison:
 * - Trims whitespace
 * - Collapses multiple spaces into one
 * - Normalizes comma spacing (comma followed by exactly one space)
 */
function normalizeValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim().replace(/\s+/g, " ").replace(/,\s*/g, ", ");
}

export default function MetadataSuggestionModal({
  isOpen,
  isApplying,
  currentMetadata,
  suggestion,
  onApply,
  onClose,
  onApplied,
}: MetadataSuggestionModalProps) {
  // 1. Process rows and determine status
  const rows = useMemo(() => {
    return SUGGESTION_FIELD_CONFIG.map((field) => {
      const currentValue = normalizeValue(
        currentMetadata[field.key as keyof typeof currentMetadata] as string,
      );
      const suggestedValue = normalizeValue(suggestion[field.key] as string);

      const isChanged = currentValue !== suggestedValue && suggestedValue.length > 0;
      const isSmartDefault =
        isChanged && (suggestion.suggestedFields?.includes(field.apiFieldName) ?? false);

      return {
        ...field,
        currentValue,
        suggestedValue,
        isChanged,
        isSmartDefault,
      };
    }).filter((row) => row.suggestedValue.length > 0);
  }, [currentMetadata, suggestion]);

  // 2. Local state for selection
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // 3. Sync state whenever rows change (Alignment with Backend Logic)
  useEffect(() => {
    if (isOpen) {
      const defaults = rows.filter((row) => row.isSmartDefault).map((row) => row.apiFieldName);
      setSelectedFields(defaults);
    }
  }, [rows, isOpen]);

  const selectableRows = useMemo(() => rows.filter((r) => r.isChanged), [rows]);

  const handleToggle = useCallback((fieldName: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldName) ? prev.filter((f) => f !== fieldName) : [...prev, fieldName],
    );
  }, []);

  const handleSelectAll = () => {
    setSelectedFields(selectableRows.map((r) => r.apiFieldName));
  };

  const handleClearAll = () => {
    setSelectedFields([]);
  };

  const handleApply = async () => {
    if (selectedFields.length === 0 || isApplying) return;

    try {
      await onApply(selectedFields);
      onApplied?.(selectedFields);
      onClose();
    } catch (error) {
      console.error("Failed to apply metadata:", error);
    }
  };

  const allSelected = selectableRows.length > 0 && selectedFields.length === selectableRows.length;
  const noneSelected = selectedFields.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Metadata Suggestions"
      description="Review extracted metadata and choose which fields to apply."
      size="xl"
      closeOnEsc={!isApplying}
      closeOnOutsideClick={!isApplying}
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-blue-800">
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="leading-relaxed">
            Suggested values are extracted via GROBID AI. Fields marked with
            <span className="mx-1 font-bold text-indigo-600 italic">"Suggested"</span>
            represent values that differ from your current metadata or fill in missing gaps.
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
              <FiMinusSquare className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500">
              No usable metadata suggestions found in the PDF.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selection Controls */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Bulk Actions
                </span>
                <div className="h-px w-8 bg-slate-100" />
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={allSelected || isApplying}
                  className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 transition-colors hover:text-indigo-800 disabled:text-slate-300"
                >
                  Select All
                </button>
                <span className="text-slate-200">|</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={noneSelected || isApplying}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-700 disabled:text-slate-300"
                >
                  Clear All
                </button>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {selectedFields.length} of {selectableRows.length} Selected
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                      Field Name
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                      Current Metadata
                    </th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                      AI Suggestion
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((row) => {
                    const isChecked = selectedFields.includes(row.apiFieldName);
                    const isSelectable = row.isChanged;
                    const isRecommended = row.isSmartDefault;

                    return (
                      <tr
                        key={row.apiFieldName}
                        className={cn(
                          "group transition-colors",
                          !isSelectable ? "bg-slate-50/30" : "hover:bg-slate-50",
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-800">{row.label}</span>
                            {!isSelectable && (
                              <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                Unchanged
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {row.currentValue || (
                              <span className="italic text-slate-300">Empty</span>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={cn(
                                "text-xs leading-relaxed font-medium line-clamp-3",
                                isSelectable ? "text-slate-900" : "text-slate-400",
                              )}
                            >
                              {row.suggestedValue}
                            </span>
                            {isRecommended && (
                              <div className="inline-flex w-fit items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tight text-emerald-600 ring-1 ring-emerald-200">
                                <FiCheckSquare className="h-2.5 w-2.5" />
                                Recommended
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              disabled={!isSelectable || isApplying}
                              onClick={() => handleToggle(row.apiFieldName)}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all",
                                !isSelectable
                                  ? "cursor-not-allowed opacity-20"
                                  : isChecked
                                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
                              )}
                            >
                              {isChecked ? (
                                <FiCheckSquare className="h-4 w-4" />
                              ) : (
                                <FiSquare className="h-4 w-4" />
                              )}
                              <span className="text-[10px] font-black uppercase tracking-widest">
                                {isChecked ? "Applied" : "Apply"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={selectedFields.length === 0 || isApplying || rows.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-indigo-600 hover:shadow-indigo-600/30 active:scale-95 disabled:scale-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {isApplying ? (
              <>
                <FiSave className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                Apply {selectedFields.length} Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
