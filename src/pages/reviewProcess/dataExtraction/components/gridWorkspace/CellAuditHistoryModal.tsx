import { Clock3, Loader2, UserCircle2 } from "lucide-react";
import Modal from "../../../../../components/ui/Modal";
import { getErrorMessage } from "../../../../../utils/errorUtils";
import { useCellAuditLogs } from "../../hooks/useCellAuditLogs";

interface CellAuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractionProcessId?: string;
  paperId: string | null;
  fieldId: string | null;
  matrixColumnId: string | null;
  matrixRowIndex: number | null;
  fieldLabel: string;
}

function formatHistoryTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatCellText(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim();
  return normalized || "(empty)";
}

export default function CellAuditHistoryModal({
  isOpen,
  onClose,
  extractionProcessId,
  paperId,
  fieldId,
  matrixColumnId,
  matrixRowIndex,
  fieldLabel,
}: CellAuditHistoryModalProps) {
  const auditLogsQuery = useCellAuditLogs({
    extractionProcessId,
    paperId,
    fieldId,
    matrixColumnId,
    matrixRowIndex,
    isOpen,
  });

  const logs = auditLogsQuery.data ?? [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cell History"
      description={`Audit trail for ${fieldLabel || "selected field"}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Field
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{fieldLabel || "Unknown"}</p>
        </div>

        {auditLogsQuery.isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-slate-600">Loading history...</span>
          </div>
        ) : null}

        {auditLogsQuery.error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getErrorMessage(auditLogsQuery.error, "Unable to load cell history.")}
          </div>
        ) : null}

        {!auditLogsQuery.isLoading && !auditLogsQuery.error && logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center">
            <Clock3 className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600">
              No manual edits have been made to this cell.
            </p>
          </div>
        ) : null}

        {!auditLogsQuery.isLoading && !auditLogsQuery.error && logs.length > 0 ? (
          <ol className="space-y-3">
            {logs.map((log, index) => {
              const isLatest = index === 0;

              return (
                <li
                  key={log.id}
                  className="relative rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <UserCircle2 className="h-5 w-5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {log.userName || "Unknown user"}
                        </p>
                        <p className="text-xs text-slate-500">{formatHistoryTime(log.createdAt)}</p>
                      </div>
                    </div>

                    {isLatest ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        Latest
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                    <span className="mr-2 inline-block text-red-500 line-through decoration-red-400">
                      {formatCellText(log.oldValue)}
                    </span>
                    <span className="mr-2 text-slate-400">-&gt;</span>
                    <span className="font-semibold text-green-600">
                      {formatCellText(log.newValue)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    </Modal>
  );
}
