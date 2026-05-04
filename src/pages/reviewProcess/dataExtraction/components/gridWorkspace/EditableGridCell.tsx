import { useCallback, useMemo, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { History, Loader2, Pencil } from "lucide-react";
import type {
  ExtractionGridCellDto,
  ExtractionGridColumnMetaDto,
} from "../../../../../types/dataExtraction";
import CellAuditHistoryModal from "./CellAuditHistoryModal";

interface EditableGridCellProps {
  extractionProcessId?: string;
  cell: ExtractionGridCellDto;
  columnMeta: ExtractionGridColumnMetaDto;
  rowHeight: number;
  isSaving: boolean;
  onSave: (
    nextValue: string,
    isNotReported: boolean,
    cell: ExtractionGridCellDto
  ) => Promise<void>;
}

function formatCellValue(value: string | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export default function EditableGridCell({
  extractionProcessId,
  cell,
  columnMeta,
  rowHeight,
  isSaving,
  onSave,
}: EditableGridCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(formatCellValue(cell.value));
  const [isNotReported, setIsNotReported] = useState(Boolean(cell.isNotReported));
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const isEditable = useMemo(
    () => Boolean(cell.paperId && cell.fieldId),
    [cell.fieldId, cell.paperId]
  );
  const normalizedFieldType = useMemo(
    () => (columnMeta.fieldType || "Text").trim().toLowerCase(),
    [columnMeta.fieldType]
  );

  const beginEdit = useCallback(() => {
    if (!isEditable || isSaving) {
      return;
    }

    setDraftValue(formatCellValue(cell.value));
    setIsNotReported(Boolean(cell.isNotReported));
    setIsEditing(true);
  }, [cell.isNotReported, cell.value, isEditable, isSaving]);

  const commitChanges = useCallback(async () => {
    if (!isEditing || !isEditable || isSaving) {
      setIsEditing(false);
      return;
    }

    const currentValue = formatCellValue(cell.value);
    const currentIsNotReported = Boolean(cell.isNotReported);

    if (draftValue === currentValue && isNotReported === currentIsNotReported) {
      setIsEditing(false);
      return;
    }

    try {
      await onSave(draftValue, isNotReported, cell);
      setIsEditing(false);
    } catch {
      // Keep editor open so the user can retry or cancel after a failed save.
    }
  }, [cell, draftValue, isEditable, isEditing, isNotReported, isSaving, onSave]);

  const commitWithOverride = useCallback(
    async (nextDraftValue: string, nextIsNotReported: boolean) => {
      if (!isEditable || isSaving) {
        return;
      }

      const currentValue = formatCellValue(cell.value);
      const currentIsNotReported = Boolean(cell.isNotReported);

      if (
        nextDraftValue === currentValue &&
        nextIsNotReported === currentIsNotReported
      ) {
        setIsEditing(false);
        return;
      }

      try {
        await onSave(nextDraftValue, nextIsNotReported, cell);
        setIsEditing(false);
      } catch {
        // Keep editor open so the user can retry or cancel after a failed save.
      }
    },
    [cell, isEditable, isSaving, onSave]
  );

  const cancelChanges = useCallback(() => {
    setDraftValue(formatCellValue(cell.value));
    setIsNotReported(Boolean(cell.isNotReported));
    setIsEditing(false);
  }, [cell.isNotReported, cell.value]);

  const handleKeyDown = useCallback(
    async (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelChanges();
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        await commitChanges();
      }
    },
    [cancelChanges, commitChanges]
  );

  const displayedValue = formatCellValue(cell.value);
  const canViewHistory = Boolean(extractionProcessId && cell.paperId && cell.fieldId);

  const handleEditorBlur = useCallback(
    (
      event: FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const nextFocused = event.relatedTarget;

      if (
        nextFocused instanceof Node &&
        editorContainerRef.current?.contains(nextFocused)
      ) {
        return;
      }

      void commitChanges();
    },
    [commitChanges]
  );

  const normalizeBooleanValue = (value: string): string => {
    const normalizedValue = value.trim().toLowerCase();
    if (normalizedValue === "yes" || normalizedValue === "true") {
      return "true";
    }

    if (normalizedValue === "no" || normalizedValue === "false") {
      return "false";
    }

    return "";
  };

  const renderEditor = () => {
    const textEditorRows = rowHeight >= 96 ? 3 : rowHeight >= 72 ? 2 : 1;

    switch (normalizedFieldType) {
      case "integer":
      case "decimal":
        return (
          <input
            autoFocus
            type="number"
            disabled={isNotReported}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={handleEditorBlur}
            onKeyDown={(event) => {
              void handleKeyDown(event as unknown as KeyboardEvent<HTMLTextAreaElement>);
            }}
            className="h-8 w-full rounded-md border border-blue-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none ring-blue-200 focus:ring-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          />
        );

      case "boolean":
        return (
          <select
            autoFocus
            disabled={isNotReported}
            value={normalizeBooleanValue(draftValue)}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={handleEditorBlur}
            className="h-8 w-full rounded-md border border-blue-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none ring-blue-200 focus:ring-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">-</option>
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        );

      case "singleselect":
        return (
          <select
            autoFocus
            disabled={isNotReported}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={handleEditorBlur}
            className="h-8 w-full rounded-md border border-blue-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none ring-blue-200 focus:ring-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">-</option>
            {columnMeta.options.map((option) => (
              <option key={option.optionId || option.value} value={option.value}>
                {option.value}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <input
            autoFocus
            type="text"
            disabled={isNotReported}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={handleEditorBlur}
            onKeyDown={(event) => {
              void handleKeyDown(event as unknown as KeyboardEvent<HTMLTextAreaElement>);
            }}
            placeholder="Comma-separated values"
            className="h-8 w-full rounded-md border border-blue-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none ring-blue-200 focus:ring-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          />
        );

      case "text":
      default:
        return (
          <textarea
            autoFocus
            disabled={isNotReported}
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            onBlur={handleEditorBlur}
            onKeyDown={(event) => {
              void handleKeyDown(event);
            }}
            rows={textEditorRows}
            className="w-full resize-none rounded-md border border-blue-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none ring-blue-200 focus:ring-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
          />
        );
    }
  };

  return (
    <div
      className="group relative h-full min-h-9 px-1 py-1 text-sm text-slate-700"
      title={displayedValue || "-"}
      onDoubleClick={beginEdit}
    >
      {isEditing ? (
        <div
          ref={editorContainerRef}
          className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 p-1"
        >
          <label className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={isNotReported}
              onMouseDown={(event) => {
                event.stopPropagation();
              }}
              onChange={(event) => {
                const nextIsNotReported = event.target.checked;
                const nextDraftValue = nextIsNotReported ? "" : draftValue;

                setIsNotReported(nextIsNotReported);
                if (nextIsNotReported) {
                  setDraftValue("");
                }

                void commitWithOverride(nextDraftValue, nextIsNotReported);
              }}
              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-700 focus:ring-slate-400"
            />
            NR
          </label>

          <div className="min-w-0 flex-1">{renderEditor()}</div>

          <button
            type="button"
            onClick={cancelChanges}
            className="shrink-0 rounded px-1.5 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Esc
          </button>
          </div>
      ) : (
        <div className="flex min-h-6 items-start justify-between gap-2">
          {cell.isNotReported ? (
            <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              NR
            </span>
          ) : (
            <span className="whitespace-pre-wrap break-words leading-5">
              {displayedValue || "-"}
            </span>
          )}

          <span className="flex items-center gap-1">
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
            ) : null}

            {canViewHistory ? (
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="invisible rounded p-0.5 text-slate-400 transition group-hover:visible hover:bg-slate-100 hover:text-slate-700"
                aria-label="View cell history"
              >
                <History className="h-3.5 w-3.5" />
              </button>
            ) : null}

            {isEditable ? (
              <button
                type="button"
                onClick={beginEdit}
                className="invisible rounded p-0.5 text-slate-400 transition group-hover:visible hover:bg-slate-100 hover:text-slate-700"
                aria-label="Edit cell"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </span>
        </div>
      )}

      {isHistoryOpen ? (
        <CellAuditHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          extractionProcessId={extractionProcessId}
          paperId={cell.paperId}
          fieldId={cell.fieldId}
          matrixColumnId={cell.matrixColumnId}
          matrixRowIndex={cell.matrixRowIndex}
          fieldLabel={columnMeta.headerName}
        />
      ) : null}
    </div>
  );
}
